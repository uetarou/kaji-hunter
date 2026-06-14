"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PushNotificationButton } from "@/components/PushNotificationButton";
import type { NotificationSettings, PartnerRequest, Profile, Quest } from "@/app/page";

export function SettingsView({
  user,
  profile,
  setProfile,
  partnerProfile,
  setPartnerProfile,
  settingsPage,
  setSettingsPage,
  notificationSettings,
  setNotificationSettings,
  reloadAll,
  setMessage,
  quests = [],
}: {
  user: User;
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  partnerProfile: Profile | null;
  setPartnerProfile: (profile: Profile | null) => void;
  settingsPage: string | null;
  setSettingsPage: (page: string | null) => void;
  notificationSettings: NotificationSettings | null;
  setNotificationSettings: (settings: NotificationSettings | null) => void;
  reloadAll: () => void;
  setMessage: (message: string) => void;
  quests?: Quest[];
}) {
  const [hunterName, setHunterName] = useState(profile?.hunter_name || "テストハンター");
  const [partnerCode, setPartnerCode] = useState("");
  const [incomingRequests, setIncomingRequests] = useState<PartnerRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<PartnerRequest[]>([]);

  useEffect(() => {
    setHunterName(profile?.hunter_name || "テストハンター");
  }, [profile?.hunter_name]);

  useEffect(() => {
    if (settingsPage === "partner") fetchPartnerRequests();
  }, [settingsPage, user.id]);

  const generateInviteCode = (userId: string) => userId.slice(0, 8).toUpperCase();

  const createNotification = async (userId: string, title: string, message: string) => {
    await supabase.from("notifications").insert([
      { user_id: userId, title, message, is_read: false },
    ]);

    try {
      await fetch("/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title, message }),
      });
    } catch {}
  };

  const fetchPartnerRequests = async () => {
    const { data: incoming } = await supabase
      .from("partner_requests")
      .select("*, requester:profiles!partner_requests_requester_id_fkey(*)")
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const { data: outgoing } = await supabase
      .from("partner_requests")
      .select("*, receiver:profiles!partner_requests_receiver_id_fkey(*)")
      .eq("requester_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    setIncomingRequests((incoming || []) as PartnerRequest[]);
    setOutgoingRequests((outgoing || []) as PartnerRequest[]);
  };

  const saveHunterName = async () => {
    const name = hunterName.trim();
    if (!name) return;

    const { data, error } = await supabase
      .from("profiles")
      .update({ hunter_name: name })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      setMessage(`保存に失敗しました: ${error.message}`);
      return;
    }

    setProfile(data);
    setMessage("ハンター名を保存しました。");
  };

  const requestPartner = async () => {
    const code = partnerCode.trim().toUpperCase();

    if (!code) {
      setMessage("招待コードを入力してください。");
      return;
    }

    if (code === generateInviteCode(user.id)) {
      setMessage("自分の招待コードは使えません。");
      return;
    }

    const { data: partner, error: partnerError } = await supabase
      .from("profiles")
      .select("*")
      .eq("invite_code", code)
      .maybeSingle();

    if (partnerError || !partner) {
      setMessage("パートナーが見つかりません。");
      return;
    }

    const { error } = await supabase.from("partner_requests").insert([
      {
        requester_id: user.id,
        receiver_id: partner.id,
        status: "pending",
      },
    ]);

    if (error) {
      setMessage(`申請に失敗しました: ${error.message}`);
      return;
    }

    await createNotification(
      partner.id,
      "パートナー申請",
      `${profile?.hunter_name || "相手"} からパートナー申請が届いています。`
    );

    setPartnerCode("");
    await fetchPartnerRequests();
    setMessage("パートナー申請を送りました。");
  };

  const approveRequest = async (request: PartnerRequest) => {
    const requesterId = request.requester_id;

    const { error } = await supabase
      .from("partner_requests")
      .update({ status: "accepted" })
      .eq("id", request.id);

    if (error) {
      setMessage(`承認に失敗しました: ${error.message}`);
      return;
    }

    await supabase.from("profiles").update({ partner_id: requesterId }).eq("id", user.id);
    await supabase.from("profiles").update({ partner_id: user.id }).eq("id", requesterId);

    await createNotification(
      requesterId,
      "パートナー承認",
      `${profile?.hunter_name || "相手"} がパートナー申請を承認しました。`
    );

    await reloadAll();
    await fetchPartnerRequests();
    setMessage("パートナー申請を承認しました。");
  };

  const rejectRequest = async (request: PartnerRequest) => {
    await supabase.from("partner_requests").update({ status: "rejected" }).eq("id", request.id);
    await fetchPartnerRequests();
    setMessage("申請を拒否しました。");
  };

  const cancelRequest = async (request: PartnerRequest) => {
    await supabase.from("partner_requests").update({ status: "cancelled" }).eq("id", request.id);
    await fetchPartnerRequests();
    setMessage("申請を取り消しました。");
  };

  const disconnectPartner = async () => {
    if (!profile?.partner_id) return;

    const oldPartnerId = profile.partner_id;

    await supabase.from("profiles").update({ partner_id: null }).eq("id", user.id);
    await supabase.from("profiles").update({ partner_id: null }).eq("id", oldPartnerId);

    setPartnerProfile(null);
    await reloadAll();
    setMessage("パートナー連携を解除しました。");
  };

  const toggleNotificationSetting = async (key: keyof NotificationSettings) => {
    if (!notificationSettings || key === "user_id") return;

    const next = { ...notificationSettings, [key]: !notificationSettings[key] };

    const { data, error } = await supabase
      .from("notification_settings")
      .upsert([next], { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      setMessage(`通知設定の保存に失敗しました: ${error.message}`);
      return;
    }

    setNotificationSettings(data);
  };

  if (settingsPage === "partner") {
    return (
      <SettingsPanel title="パートナー設定" onBack={() => setSettingsPage(null)}>
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#c9a86a]/10 bg-[#1f2937] p-4">
            <p className="text-sm text-gray-400">自分の招待コード</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="min-w-0 flex-1 rounded-2xl bg-[#111827] p-4 font-title text-xl font-black tracking-wider text-[#d8c08a]">
                {profile?.invite_code || generateInviteCode(user.id)}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(profile?.invite_code || generateInviteCode(user.id))}
                className="shrink-0 whitespace-nowrap rounded-2xl border border-[#6e8fb4] bg-[#355e8d] px-4 py-4 text-sm font-black"
              >
                コピー
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-[#c9a86a]/10 bg-[#1f2937] p-4">
            <p className="text-sm text-gray-400">現在のパートナー</p>
            <p className="mt-3 text-2xl font-black">
              {partnerProfile?.hunter_name || "未連携"}
            </p>
          </div>

          {incomingRequests.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xl font-black text-[#d8c08a]">届いている申請</h3>
              {incomingRequests.map((request) => (
                <div key={request.id} className="rounded-3xl border border-[#c9a86a]/10 bg-[#1f2937] p-4">
                  <p className="text-lg font-black">
                    {request.requester?.hunter_name || "相手"} から申請
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button onClick={() => approveRequest(request)} className="rounded-2xl bg-emerald-800 py-3 font-bold">
                      承認
                    </button>
                    <button onClick={() => rejectRequest(request)} className="rounded-2xl bg-red-900/50 py-3 font-bold text-red-100">
                      拒否
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {outgoingRequests.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xl font-black text-[#d8c08a]">申請中</h3>
              {outgoingRequests.map((request) => (
                <div key={request.id} className="rounded-3xl border border-[#c9a86a]/10 bg-[#1f2937] p-4">
                  <p className="text-lg font-black">
                    {request.receiver?.hunter_name || "相手"} に申請中
                  </p>
                  <button
                    onClick={() => cancelRequest(request)}
                    className="mt-4 w-full rounded-2xl bg-red-900/50 py-3 font-bold text-red-100"
                  >
                    申請を取り消す
                  </button>
                </div>
              ))}
            </section>
          )}

          {!profile?.partner_id && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#d8c08a]">
                パートナー招待コード
              </label>
              <input
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value)}
                placeholder="招待コードを入力"
                className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
              />
              <button
                onClick={requestPartner}
                className="w-full rounded-2xl border border-emerald-300/30 bg-emerald-800 py-4 font-black"
              >
                パートナー申請を送る
              </button>
            </div>
          )}

          {!!profile?.partner_id && (
            <button
              onClick={disconnectPartner}
              className="w-full rounded-2xl border border-red-300/30 bg-red-900/50 py-4 font-bold text-red-100"
            >
              パートナー連携を解除する
            </button>
          )}
        </div>
      </SettingsPanel>
    );
  }

  if (settingsPage === "notifications") {
    return (
      <SettingsPanel title="通知設定" onBack={() => setSettingsPage(null)}>
        <div className="mb-5">
          <PushNotificationButton userId={user.id} setMessage={setMessage} />
        </div>

        <div className="space-y-3">
          <NotificationToggle
            title="新しいクエスト"
            description="相手がクエストを依頼した時"
            enabled={notificationSettings?.quest_created ?? true}
            onClick={() => toggleNotificationSetting("quest_created")}
          />
          <NotificationToggle
            title="クエスト受注"
            description="自分の依頼が受注された時"
            enabled={notificationSettings?.quest_accepted ?? true}
            onClick={() => toggleNotificationSetting("quest_accepted")}
          />
          <NotificationToggle
            title="完了報告"
            description="相手から完了報告が届いた時"
            enabled={notificationSettings?.quest_reported ?? true}
            onClick={() => toggleNotificationSetting("quest_reported")}
          />
          <NotificationToggle
            title="達成承認"
            description="自分の報告が承認された時"
            enabled={notificationSettings?.quest_approved ?? true}
            onClick={() => toggleNotificationSetting("quest_approved")}
          />
        </div>
      </SettingsPanel>
    );
  }

  if (settingsPage === "account") {
    const totalPoints = profile?.total_points ?? 0;
    const currentPoints = profile?.points ?? 0;
    const hunterRank = Math.floor(totalPoints / 200) + 1;
    const rankTheme = getRankTheme(hunterRank);
    const myQuests = quests.filter((quest) => quest.created_by === user.id || quest.accepted_by === user.id);
    const completedQuests = myQuests.filter((quest) => quest.status === "done" || quest.status === "completed");
    const acceptedCompletedQuests = completedQuests.filter((quest) => quest.accepted_by === user.id);
    const requestedQuests = quests.filter((quest) => quest.created_by === user.id);
    const acceptedQuests = quests.filter((quest) => quest.accepted_by === user.id);
    const normalCompleted = acceptedCompletedQuests.filter((quest) => !quest.is_urgent && quest.category !== "毎日");
    const urgentCompleted = acceptedCompletedQuests.filter((quest) => quest.is_urgent);
    const dailyCompleted = acceptedCompletedQuests.filter((quest) => quest.category === "毎日");

    return (
      <SettingsPanel title="ギルドカード" onBack={() => setSettingsPage(null)}>
        <div className={`relative overflow-hidden rounded-[2rem] border bg-gradient-to-br p-4 shadow-2xl ${rankTheme.cardClass}`}>
          <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 20% 15%, rgba(255,255,255,.16), transparent 26%), radial-gradient(circle at 80% 0%, rgba(255,255,255,.10), transparent 24%)" }} />
          <div className="relative flex items-center justify-between border-b border-current/20 pb-3">
            <div>
              <p className="text-xs font-black tracking-[0.35em] opacity-70">GUILD CARD</p>
              <h2 className="font-title text-3xl font-black">狩人記録</h2>
            </div>
            <div className={`rounded-2xl border px-3 py-1 text-xs font-black ${rankTheme.badgeClass}`}>{rankTheme.name}</div>
          </div>

          <div className="relative mt-4 flex items-center gap-4">
            <div className={`grid h-24 w-24 shrink-0 place-items-center rounded-full border-4 bg-black/35 shadow-inner ${rankTheme.ringClass}`}>
              <div className="text-center">
                <p className="text-xs font-black text-[#d8c08a]">HR</p>
                <p className="font-title text-4xl font-black">{hunterRank}</p>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#d8c08a]">ハンター名</p>
              <div className="mt-1 flex items-center gap-2">
                <input
                  value={hunterName}
                  onChange={(e) => setHunterName(e.target.value)}
                  className="min-w-0 flex-1 rounded-2xl border border-[#c9a86a]/20 bg-black/25 px-3 py-3 font-black outline-none"
                />
                <button onClick={saveHunterName} className="rounded-2xl border border-[#c9a86a]/30 bg-[#1f2937]/80 px-3 py-3 text-sm font-black text-[#d8c08a]">保存</button>
              </div>
              <p className="mt-2 text-sm font-bold opacity-80">称号：{rankTheme.title}</p>
            </div>
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-3">
            <GuildStat label="所持ポイント" value={`${currentPoints.toLocaleString()} pt`} />
            <GuildStat label="累計獲得ポイント" value={`${totalPoints.toLocaleString()} pt`} />
          </div>

          <div className="relative mt-4 rounded-3xl border border-[#c9a86a]/15 bg-black/25 p-4">
            <p className="mb-3 text-sm font-black text-[#d8c08a]">クエスト記録</p>
            <div className="space-y-2">
              <GuildRecord label="完了クエスト数" value={`${acceptedCompletedQuests.length} 回`} />
              <GuildRecord label="通常クエスト達成数" value={`${normalCompleted.length} 回`} />
              <GuildRecord label="緊急クエスト達成数" value={`${urgentCompleted.length} 回`} />
              <GuildRecord label="毎日クエスト達成数" value={`${dailyCompleted.length} 回`} />
              <GuildRecord label="依頼した数" value={`${requestedQuests.length} 回`} />
              <GuildRecord label="受注した数" value={`${acceptedQuests.length} 回`} />
              <GuildRecord label="合計獲得pt" value={`${totalPoints.toLocaleString()} pt`} />
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs font-bold text-gray-400">HRが上がるとギルドカードの色と称号が変化します。</p>
      </SettingsPanel>
    );
  }

  if (settingsPage === "terms") {
    return (
      <SettingsPanel title="利用規約" onBack={() => setSettingsPage(null)}>
        <div className="space-y-3 text-sm leading-7 text-gray-300">
          <p>Kaji Hunterは、パートナー間で家事クエストを依頼・受注・報告するためのアプリです。</p>
          <p>報酬や達成条件は、利用者同士で合意した範囲で楽しく運用してください。</p>
        </div>
      </SettingsPanel>
    );
  }

  return (
    <section className="space-y-4">
      <div className="px-1">
        <p className="text-sm font-bold text-[#d8c08a]">Hunter Settings</p>
        <h2 className="mt-1 font-title text-3xl font-black">設定</h2>
      </div>

      <MenuButton title="アカウント" description="ハンター名を変更" onClick={() => setSettingsPage("account")} />
      <MenuButton title="パートナー設定" description="招待コード・申請・解除" onClick={() => setSettingsPage("partner")} />
      <MenuButton title="通知設定" description="スマホ通知・通知種別" onClick={() => setSettingsPage("notifications")} />
      <MenuButton title="利用規約" description="アプリ利用ルール" onClick={() => setSettingsPage("terms")} />
    </section>
  );
}

function SettingsPanel({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-5 shadow-xl">
      <button
        onClick={onBack}
        className="mb-5 rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] px-4 py-3 text-sm font-bold text-[#d8c08a]"
      >
        ‹ 設定に戻る
      </button>

      <h2 className="mb-5 font-title text-3xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function MenuButton({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-3xl border border-[#c9a86a]/10 bg-[#111827] p-5 text-left shadow-xl"
    >
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
    </button>
  );
}


function getRankTheme(hr: number) {
  if (hr >= 100) {
    return {
      name: "LEGEND",
      title: "Legend Hunter",
      cardClass: "from-[#2b1024] via-[#111827] to-[#0b1020] border-[#e879f9]/60 text-[#fce7f3]",
      ringClass: "border-[#e879f9] text-[#f0abfc]",
      badgeClass: "border-[#e879f9]/60 bg-[#701a75]/50 text-[#f0abfc]",
    };
  }
  if (hr >= 50) {
    return {
      name: "PLATINUM",
      title: "Platinum Hunter",
      cardClass: "from-[#082f49] via-[#111827] to-[#0b1020] border-[#7dd3fc]/60 text-[#e0f2fe]",
      ringClass: "border-[#7dd3fc] text-[#bae6fd]",
      badgeClass: "border-[#7dd3fc]/60 bg-[#0c4a6e]/50 text-[#bae6fd]",
    };
  }
  if (hr >= 30) {
    return {
      name: "GOLD",
      title: "Gold Hunter",
      cardClass: "from-[#3f2f05] via-[#111827] to-[#0b1020] border-[#facc15]/60 text-[#fef9c3]",
      ringClass: "border-[#facc15] text-[#fde68a]",
      badgeClass: "border-[#facc15]/60 bg-[#713f12]/50 text-[#fde68a]",
    };
  }
  if (hr >= 10) {
    return {
      name: "SILVER",
      title: "Silver Hunter",
      cardClass: "from-[#374151] via-[#111827] to-[#0b1020] border-[#d1d5db]/60 text-[#f3f4f6]",
      ringClass: "border-[#d1d5db] text-[#e5e7eb]",
      badgeClass: "border-[#d1d5db]/60 bg-[#374151]/70 text-[#f3f4f6]",
    };
  }
  return {
    name: "BRONZE",
    title: "Bronze Hunter",
    cardClass: "from-[#3b2412] via-[#111827] to-[#0b1020] border-[#c47a3b]/60 text-[#ffedd5]",
    ringClass: "border-[#c47a3b] text-[#fdba74]",
    badgeClass: "border-[#c47a3b]/60 bg-[#7c2d12]/40 text-[#fdba74]",
  };
}

function GuildStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#c9a86a]/15 bg-black/25 p-3">
      <p className="text-[11px] font-bold text-[#d8c08a]">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function GuildRecord({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#c9a86a]/10 pb-2 last:border-b-0 last:pb-0">
      <span className="text-sm text-gray-300">{label}</span>
      <span className="font-black text-[#f3d58a]">{value}</span>
    </div>
  );
}

function NotificationToggle({
  title,
  description,
  enabled,
  onClick,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4"
    >
      <div className="text-left">
        <h3 className="text-lg font-black">{title}</h3>
        <p className="mt-1 text-sm text-gray-400">{description}</p>
      </div>

      <div className={`relative h-9 w-16 rounded-full border ${enabled ? "border-[#6e8fb4] bg-[#355e8d]" : "border-gray-600 bg-gray-700"}`}>
        <div className={`absolute top-1 h-7 w-7 rounded-full bg-white transition ${enabled ? "left-8" : "left-1"}`} />
      </div>
    </button>
  );
}
