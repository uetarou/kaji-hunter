"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Bell,
  Home,
  ScrollText,
  Settings,
  Shield,
  Sword,
  UserRound,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Quest = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  reward: string | null;
  status: string;
  is_urgent: boolean;
  created_by: string | null;
  accepted_by: string | null;
};

type Profile = {
  id: string;
  hunter_name: string | null;
  hr: number | null;
  invite_code: string | null;
  partner_id: string | null;
};

type Notification = {
  id: string;
  user_id: string | null;
  title: string | null;
  message: string | null;
  is_read: boolean | null;
  created_at: string | null;
};

type NotificationSettings = {
  user_id: string;
  quest_created: boolean;
  quest_accepted: boolean;
  quest_reported: boolean;
  quest_approved: boolean;
};

export default function Page() {
  const [activeTab, setActiveTab] = useState("home");
  const [settingsPage, setSettingsPage] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);

  const [quests, setQuests] = useState<Quest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [hunterName, setHunterName] = useState("");
  const [partnerCode, setPartnerCode] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("掃除");
  const [reward, setReward] = useState("");

  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [reportImage, setReportImage] = useState<File | null>(null);

  const myId = user?.id;
  const partnerId = profile?.partner_id;

  const generateInviteCode = (userId: string) => {
    return `KAJI-${userId.slice(0, 6).toUpperCase()}`;
  };

  const initAuth = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    let currentUser = sessionData.session?.user ?? null;

    if (!currentUser) {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        setMessage(
          "匿名ログインに失敗しました。SupabaseのAnonymous Sign-InsをONにしてください。"
        );
        setLoading(false);
        return;
      }

      currentUser = data.user;
    }

    if (!currentUser) {
      setMessage("ユーザー情報を取得できませんでした。");
      setLoading(false);
      return;
    }

    setUser(currentUser);
    await ensureProfile(currentUser);
    await ensureNotificationSettings(currentUser.id);
  };

  const ensureProfile = async (currentUser: User) => {
    const inviteCode = generateInviteCode(currentUser.id);

    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (existing) {
      const fixedProfile = {
        ...existing,
        hunter_name: existing.hunter_name || "テストハンター",
        hr: existing.hr || 1,
        invite_code: existing.invite_code || inviteCode,
      };

      if (!existing.invite_code || !existing.hunter_name || !existing.hr) {
        await supabase
          .from("profiles")
          .update({
            hunter_name: fixedProfile.hunter_name,
            hr: fixedProfile.hr,
            invite_code: fixedProfile.invite_code,
          })
          .eq("id", currentUser.id);
      }

      setProfile(fixedProfile);
      setHunterName(fixedProfile.hunter_name || "テストハンター");
      return;
    }

    const newProfile = {
      id: currentUser.id,
      hunter_name: "テストハンター",
      hr: 1,
      invite_code: inviteCode,
      partner_id: null,
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert([newProfile])
      .select()
      .single();

    if (error) {
      setMessage("プロフィール作成に失敗しました。profilesのRLSを確認してください。");
      return;
    }

    setProfile(data);
    setHunterName(data.hunter_name || "テストハンター");
  };

  const ensureNotificationSettings = async (userId: string) => {
    const defaultSettings = {
      user_id: userId,
      quest_created: true,
      quest_accepted: true,
      quest_reported: true,
      quest_approved: true,
    };

    const { data: existing } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      setNotificationSettings(existing);
      return;
    }

    const { data } = await supabase
      .from("notification_settings")
      .upsert([defaultSettings])
      .select()
      .single();

    setNotificationSettings(data || defaultSettings);
  };

  const fetchPartner = async (partnerProfileId?: string | null) => {
    if (!partnerProfileId) {
      setPartnerProfile(null);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", partnerProfileId)
      .maybeSingle();

    setPartnerProfile(data || null);
  };

  const fetchQuests = async () => {
    const { data } = await supabase
      .from("quests")
      .select("*")
      .order("created_at", { ascending: false });

    setQuests(data || []);
  };

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setNotifications(data || []);
  };

  const fetchNotificationSettings = async (userId: string) => {
    const { data } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) setNotificationSettings(data);
  };

  const reloadAll = async () => {
    if (!user) return;

    const { data: latestProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (latestProfile) {
      setProfile(latestProfile);
      setHunterName(latestProfile.hunter_name || "テストハンター");
      await fetchPartner(latestProfile.partner_id);
    }

    await fetchQuests();
    await fetchNotifications(user.id);
    await fetchNotificationSettings(user.id);
    setLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (user && profile) {
      reloadAll();
    }
  }, [user, profile?.id]);

  const visibleQuests = useMemo(() => {
    if (!myId) return [];

    return quests.filter((quest) => {
      return (
        quest.created_by === myId ||
        quest.accepted_by === myId ||
        quest.created_by === partnerId ||
        quest.accepted_by === partnerId
      );
    });
  }, [quests, myId, partnerId]);

  const recruitingQuests = useMemo(
    () =>
      visibleQuests.filter(
        (q) => q.status === "recruiting" && q.created_by !== myId
      ),
    [visibleQuests, myId]
  );

  const acceptedQuests = useMemo(
    () =>
      visibleQuests.filter(
        (q) => q.status === "accepted" && q.accepted_by === myId
      ),
    [visibleQuests, myId]
  );

  const myRequestQuests = useMemo(
    () =>
      visibleQuests.filter(
        (q) => q.created_by === myId && q.status !== "completed"
      ),
    [visibleQuests, myId]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const createNotification = async (
    userId: string | null | undefined,
    type:
      | "quest_created"
      | "quest_accepted"
      | "quest_reported"
      | "quest_approved",
    title: string,
    message: string
  ) => {
    if (!userId) return;

    const { data: settings } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (settings && settings[type] === false) return;

    await supabase.from("notifications").insert([
      {
        user_id: userId,
        title,
        message,
        is_read: false,
      },
    ]);
  };

  const saveProfile = async () => {
    if (!user) return;

    const inviteCode = profile?.invite_code || generateInviteCode(user.id);

    const { data, error } = await supabase
      .from("profiles")
      .upsert([
        {
          id: user.id,
          hunter_name: hunterName.trim() || "テストハンター",
          hr: profile?.hr || 1,
          invite_code: inviteCode,
          partner_id: profile?.partner_id || null,
        },
      ])
      .select()
      .single();

    if (error) {
      setMessage("プロフィール保存に失敗しました。profilesのRLSを確認してください。");
      return;
    }

    setProfile(data);
    setHunterName(data.hunter_name || "テストハンター");
    setMessage("プロフィールを保存しました。");
  };

  const connectPartner = async () => {
    if (!user || !profile) return;

    const code = partnerCode.trim().toUpperCase();

    if (!code) {
      setMessage("相手の招待コードを入力してください。");
      return;
    }

    if (code === profile.invite_code) {
      setMessage("自分の招待コードは入力できません。");
      return;
    }

    const { data: partner } = await supabase
      .from("profiles")
      .select("*")
      .eq("invite_code", code)
      .maybeSingle();

    if (!partner) {
      setMessage("招待コードが見つかりませんでした。");
      return;
    }

    await supabase
      .from("profiles")
      .update({ partner_id: partner.id })
      .eq("id", user.id);

    await supabase
      .from("profiles")
      .update({ partner_id: user.id })
      .eq("id", partner.id);

    await createNotification(
      partner.id,
      "quest_created",
      "ギルド連携完了",
      `${profile.hunter_name || "相手"} とペアになりました。`
    );

    setPartnerCode("");
    setMessage("パートナー連携が完了しました。");
    await reloadAll();
  };
    const createQuest = async () => {
    if (!user || !title.trim()) return;

    await supabase.from("quests").insert([
      {
        title,
        description,
        category,
        reward,
        status: "recruiting",
        is_urgent: false,
        created_by: user.id,
        accepted_by: null,
        pair_id: partnerId || null,
      },
    ]);

    if (partnerId) {
      await createNotification(
        partnerId,
        "quest_created",
        "新しいクエスト",
        `${title} が依頼されました。`
      );
    }

    setTitle("");
    setDescription("");
    setReward("");
    await reloadAll();
    setActiveTab("quests");
  };

  const acceptQuest = async (quest: Quest) => {
    if (!user) return;

    await supabase
      .from("quests")
      .update({
        status: "accepted",
        accepted_by: user.id,
      })
      .eq("id", quest.id);

    await createNotification(
      quest.created_by,
      "quest_accepted",
      "クエスト受注",
      `${quest.title} が受注されました。`
    );

    await reloadAll();
    setActiveTab("home");
  };

  const completeQuest = async (questId: string) => {
    if (!user || !selectedQuest) return;

    let imageUrl = "";

    if (reportImage) {
      const safeName = reportImage.name.replaceAll(" ", "-");
      const fileName = `${user.id}/${Date.now()}-${safeName}`;

      const { data: uploadData } = await supabase.storage
        .from("quest-reports")
        .upload(fileName, reportImage);

      if (uploadData) {
        const { data } = supabase.storage
          .from("quest-reports")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }
    }

    await supabase.from("quest_reports").insert([
      {
        quest_id: questId,
        image_url: imageUrl,
      },
    ]);

    await supabase
      .from("quests")
      .update({ status: "waiting_confirm" })
      .eq("id", questId);

    await createNotification(
      selectedQuest.created_by,
      "quest_reported",
      "完了報告",
      `${selectedQuest.title} の完了報告が届きました。`
    );

    setSelectedQuest(null);
    setReportImage(null);
    await reloadAll();
  };

  const approveQuest = async (quest: Quest) => {
    await supabase
      .from("quests")
      .update({ status: "completed" })
      .eq("id", quest.id);

    await createNotification(
      quest.accepted_by,
      "quest_approved",
      "達成承認",
      `${quest.title} が承認されました。`
    );

    await reloadAll();
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id);

    await reloadAll();
  };

  const toggleNotificationSetting = async (
    key:
      | "quest_created"
      | "quest_accepted"
      | "quest_reported"
      | "quest_approved"
  ) => {
    if (!user || !notificationSettings) return;

    const updated = {
      ...notificationSettings,
      [key]: !notificationSettings[key],
    };

    setNotificationSettings(updated);

    await supabase
      .from("notification_settings")
      .update({
        [key]: updated[key],
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    await fetchNotificationSettings(user.id);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07111f] text-white">
        <div className="rounded-3xl border border-[#c9a86a]/20 bg-[#111827] p-8 text-center shadow-2xl">
          <p className="font-title text-2xl font-black">Kaji Hunter</p>
          <p className="mt-3 text-sm text-[#d8c08a]">ハンター登録中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white pb-32">
      <TopBar
        hunterName={profile?.hunter_name || "テストハンター"}
        hr={profile?.hr || 1}
        unreadCount={unreadCount}
      />

      {message && (
        <div className="mx-auto max-w-md px-4 pt-4">
          <div className="rounded-2xl border border-[#c9a86a]/20 bg-[#111827] p-3 text-sm text-[#d8c08a]">
            {message}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-md px-4 pt-5">
        {activeTab === "home" && (
          <div className="space-y-6">
            <section className="space-y-3">
              <SectionTitle title="受注中クエスト" badge={acceptedQuests.length} />

              {acceptedQuests.length === 0 && (
                <EmptyCard text="受注中クエストはありません" />
              )}

              {acceptedQuests.map((quest) => (
                <CompactQuestCard
                  key={quest.id}
                  quest={quest}
                  statusText="進行中"
                  actionLabel="報告"
                  onAction={() => setSelectedQuest(quest)}
                />
              ))}
            </section>

            <section className="space-y-3">
              <SectionTitle title="依頼中クエスト" badge={myRequestQuests.length} />

              {myRequestQuests.length === 0 && (
                <EmptyCard text="依頼中クエストはありません" />
              )}

              {myRequestQuests.map((quest) => (
                <CompactQuestCard
                  key={quest.id}
                  quest={quest}
                  statusText={
                    quest.status === "recruiting"
                      ? "募集中"
                      : quest.status === "accepted"
                      ? "進行中"
                      : "完了確認待ち"
                  }
                  actionLabel={
                    quest.status === "waiting_confirm" ? "承認" : "確認"
                  }
                  onAction={() => {
                    if (quest.status === "waiting_confirm") {
                      approveQuest(quest);
                    }
                  }}
                />
              ))}
            </section>
          </div>
        )}

        {activeTab === "quests" && (
          <section className="space-y-4">
            <SectionTitle title="募集中クエスト" badge={recruitingQuests.length} />

            {recruitingQuests.length === 0 && (
              <EmptyCard text="相手からの募集中クエストはありません" />
            )}

            {recruitingQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                buttonLabel="クエスト受注"
                onClick={() => acceptQuest(quest)}
              />
            ))}
          </section>
        )}

        {activeTab === "request" && (
          <section className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-5 shadow-xl">
            <p className="text-sm text-[#d8c08a]">New Quest</p>
            <h2 className="mt-1 font-title text-3xl font-black">クエスト依頼</h2>

            {!partnerId && (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                先に設定からパートナー連携をすると、相手にクエストを共有できます。
              </div>
            )}

            <div className="mt-6 space-y-4">
              <input
                placeholder="例：お風呂掃除"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
              />

              <textarea
                placeholder="内容を書く"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-32 w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
              >
                <option>掃除</option>
                <option>料理</option>
                <option>洗濯</option>
                <option>買い物</option>
              </select>

              <input
                placeholder="報酬：プリン"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
              />

              <button
                onClick={createQuest}
                className="w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-4 font-bold text-white shadow-lg"
              >
                ギルドに依頼する
              </button>
            </div>
          </section>
        )}

        {activeTab === "settings" && (
          <SettingsView
            settingsPage={settingsPage}
            setSettingsPage={setSettingsPage}
            profile={profile}
            partnerProfile={partnerProfile}
            hunterName={hunterName}
            setHunterName={setHunterName}
            partnerCode={partnerCode}
            setPartnerCode={setPartnerCode}
            saveProfile={saveProfile}
            connectPartner={connectPartner}
            notifications={notifications}
            notificationSettings={notificationSettings}
            toggleNotificationSetting={toggleNotificationSetting}
            markAllNotificationsRead={markAllNotificationsRead}
          />
        )}
      </div>

      {selectedQuest && (
        <ReportModal
          quest={selectedQuest}
          reportImage={reportImage}
          setReportImage={setReportImage}
          onClose={() => setSelectedQuest(null)}
          onSubmit={() => completeQuest(selectedQuest.id)}
        />
      )}

      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSettingsPage(null);
        }}
        recruitingCount={recruitingQuests.length}
        waitingCount={myRequestQuests.length}
        unreadCount={unreadCount}
      />
    </main>
  );
}

function TopBar({
  hunterName,
  hr,
  unreadCount,
}: {
  hunterName: string;
  hr: number;
  unreadCount: number;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-[#c9a86a]/30 bg-gradient-to-r from-[#0b1425] via-[#13233d] to-[#0d1a30] shadow-2xl">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c9a86a]/40 bg-[#111827] text-xl text-[#d8c08a] shadow-lg">
            ⚔
          </div>

          <div>
            <h1 className="font-title text-2xl font-black tracking-wide">
              Kaji Hunter
            </h1>

            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm text-[#d8c08a]">{hunterName}</p>
              <div className="h-1 w-1 rounded-full bg-[#d8c08a]" />
              <p className="text-sm font-bold text-slate-100">HR {hr}</p>
            </div>
          </div>
        </div>

        {!!unreadCount && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold">
            {unreadCount}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsView({
  settingsPage,
  setSettingsPage,
  profile,
  partnerProfile,
  hunterName,
  setHunterName,
  partnerCode,
  setPartnerCode,
  saveProfile,
  connectPartner,
  notifications,
  notificationSettings,
  toggleNotificationSetting,
  markAllNotificationsRead,
}: {
  settingsPage: string | null;
  setSettingsPage: (page: string | null) => void;
  profile: Profile | null;
  partnerProfile: Profile | null;
  hunterName: string;
  setHunterName: (value: string) => void;
  partnerCode: string;
  setPartnerCode: (value: string) => void;
  saveProfile: () => void;
  connectPartner: () => void;
  notifications: Notification[];
  notificationSettings: NotificationSettings | null;
  toggleNotificationSetting: (
    key:
      | "quest_created"
      | "quest_accepted"
      | "quest_reported"
      | "quest_approved"
  ) => void;
  markAllNotificationsRead: () => void;
}) {
  if (settingsPage === "account") {
    return (
      <SettingsPanel title="アカウント" onBack={() => setSettingsPage(null)}>
        <label className="text-sm text-[#d8c08a]">ハンター名</label>
        <input
          value={hunterName}
          onChange={(e) => setHunterName(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
        />

        <div className="mt-4 rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4">
          <p className="text-sm text-gray-400">HR</p>
          <p className="mt-1 text-2xl font-black">{profile?.hr || 1}</p>
        </div>

        <button
          onClick={saveProfile}
          className="mt-5 w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-4 font-bold"
        >
          保存する
        </button>
      </SettingsPanel>
    );
  }

  if (settingsPage === "partner") {
    return (
      <SettingsPanel title="パートナー設定" onBack={() => setSettingsPage(null)}>
        <div className="rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4">
          <p className="text-sm text-gray-400">自分の招待コード</p>
          <p className="mt-2 font-title text-2xl font-black text-[#d8c08a]">
            {profile?.invite_code || "作成中"}
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4">
          <p className="text-sm text-gray-400">現在のパートナー</p>
          <p className="mt-2 text-xl font-bold">
            {partnerProfile?.hunter_name || "未連携"}
          </p>
        </div>

        <input
          placeholder="相手の招待コードを入力"
          value={partnerCode}
          onChange={(e) => setPartnerCode(e.target.value)}
          className="mt-4 w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 uppercase outline-none"
        />

        <button
          onClick={connectPartner}
          className="mt-4 w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-4 font-bold"
        >
          ギルド連携する
        </button>
      </SettingsPanel>
    );
  }

  if (settingsPage === "notifications") {
    return (
      <SettingsPanel title="通知設定" onBack={() => setSettingsPage(null)}>
        <div className="space-y-3">
          <NotificationToggle
            title="新しいクエスト"
            description="相手がクエストを依頼した時に通知する"
            enabled={notificationSettings?.quest_created ?? true}
            onClick={() => toggleNotificationSetting("quest_created")}
          />

          <NotificationToggle
            title="クエスト受注"
            description="自分の依頼が受注された時に通知する"
            enabled={notificationSettings?.quest_accepted ?? true}
            onClick={() => toggleNotificationSetting("quest_accepted")}
          />

          <NotificationToggle
            title="完了報告"
            description="相手から完了報告が届いた時に通知する"
            enabled={notificationSettings?.quest_reported ?? true}
            onClick={() => toggleNotificationSetting("quest_reported")}
          />

          <NotificationToggle
            title="達成承認"
            description="自分の報告が承認された時に通知する"
            enabled={notificationSettings?.quest_approved ?? true}
            onClick={() => toggleNotificationSetting("quest_approved")}
          />
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="mt-5 w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937] py-3 text-sm font-bold text-[#d8c08a]"
        >
          すべて既読にする
        </button>

        <div className="mt-5 space-y-3">
          <h3 className="font-title text-xl font-black">通知履歴</h3>

          {notifications.length === 0 && <EmptyCard text="通知はありません" />}

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{notification.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {notification.message}
                  </p>
                </div>

                {!notification.is_read && (
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </SettingsPanel>
    );
  }

  if (settingsPage === "terms") {
    return (
      <SettingsPanel title="利用規約" onBack={() => setSettingsPage(null)}>
        <div className="space-y-3 text-sm leading-7 text-gray-300">
          <p>
            Kaji Hunterは、パートナー間で家事クエストを依頼・受注・報告するためのアプリです。
          </p>
          <p>
            報酬や達成条件は、利用者同士で合意した範囲で楽しく運用してください。
          </p>
          <p>
            現在は開発中のため、重要な情報の保存や正式な契約用途には使用しないでください。
          </p>
        </div>
      </SettingsPanel>
    );
  }

  return (
    <section className="space-y-4">
      <SettingCard
        icon={<UserRound />}
        title="アカウント"
        description="ハンター名・HR・称号"
        onClick={() => setSettingsPage("account")}
      />
      <SettingCard
        icon={<Users />}
        title="パートナー設定"
        description="招待コード・ギルド連携"
        onClick={() => setSettingsPage("partner")}
      />
      <SettingCard
        icon={<Bell />}
        title="通知設定"
        description="通知条件・ON/OFF・履歴"
        onClick={() => setSettingsPage("notifications")}
      />
      <SettingCard
        icon={<Shield />}
        title="利用規約"
        description="アプリ利用ルール"
        onClick={() => setSettingsPage("terms")}
      />
    </section>
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
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 text-left"
    >
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-sm text-gray-400">{description}</p>
      </div>

      <div
        className={`flex h-8 w-16 items-center rounded-full border p-1 ${
          enabled
            ? "justify-end border-[#6e8fb4] bg-[#355e8d]"
            : "justify-start border-gray-600 bg-gray-700"
        }`}
      >
        <div className="h-6 w-6 rounded-full bg-white" />
      </div>
    </button>
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
      <button onClick={onBack} className="mb-4 text-sm text-[#d8c08a]">
        ← 設定に戻る
      </button>
      <h2 className="font-title text-3xl font-black">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SectionTitle({ title, badge }: { title: string; badge?: number }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="font-title text-2xl font-black tracking-tight">{title}</h2>

      {!!badge && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
          {badge}
        </div>
      )}
    </div>
  );
}

function QuestCard({
  quest,
  buttonLabel,
  onClick,
}: {
  quest: Quest;
  buttonLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-5 shadow-xl">
      <div className="flex justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">{quest.title}</h2>
          <p className="mt-3 text-sm text-gray-400">{quest.description}</p>
        </div>

        {quest.is_urgent && (
          <span className="h-fit rounded-full bg-red-500 px-3 py-1 text-xs font-bold">
            緊急
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <div className="rounded-xl border border-[#c9a86a]/10 bg-[#1f2937] px-3 py-2 text-sm">
          {quest.category}
        </div>

        {quest.reward && (
          <div className="rounded-xl border border-[#c9a86a]/10 bg-[#1f2937] px-3 py-2 text-sm">
            報酬: {quest.reward}
          </div>
        )}
      </div>

      <button
        onClick={onClick}
        className="mt-5 w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-4 font-bold text-white shadow-lg"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function CompactQuestCard({
  quest,
  statusText,
  actionLabel,
  onAction,
}: {
  quest: Quest;
  statusText: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-4 shadow-xl">
      <div className="min-w-0">
        <h3 className="truncate text-xl font-black">{quest.title}</h3>
        <p className="mt-1 text-sm text-[#d8c08a]">{statusText}</p>
      </div>

      <button
        onClick={onAction}
        className="shrink-0 rounded-2xl border border-[#6e8fb4] bg-[#355e8d] px-5 py-3 font-bold text-white shadow-lg"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-[#c9a86a]/10 bg-[#111827] p-7 text-center text-gray-400">
      {text}
    </div>
  );
}

function SettingCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-3xl border border-[#c9a86a]/10 bg-[#111827] p-5 text-left shadow-xl"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937] text-[#d8c08a]">
        {icon}
      </div>

      <div>
        <h3 className="text-lg font-black">{title}</h3>
        <p className="mt-1 text-sm text-gray-400">{description}</p>
      </div>
    </button>
  );
}

function ReportModal({
  quest,
  reportImage,
  setReportImage,
  onClose,
  onSubmit,
}: {
  quest: Quest;
  reportImage: File | null;
  setReportImage: (file: File | null) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-md rounded-t-3xl border-t border-[#c9a86a]/20 bg-[#111827] p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-title text-3xl font-black">完了報告</h2>

          <button onClick={onClose} className="text-gray-400">
            ✕
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4">
          <p className="text-sm text-gray-400">クエスト</p>
          <h3 className="mt-1 text-2xl font-bold">{quest.title}</h3>
          <p className="mt-3 text-sm text-gray-400">{quest.description}</p>
        </div>

        <div className="mb-5">
          <label className="mb-2 block font-semibold text-[#d8c08a]">
            完了証拠画像
          </label>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setReportImage(e.target.files?.[0] || null)}
            className="text-sm"
          />

          {reportImage && (
            <p className="mt-2 text-xs text-gray-400">
              選択中：{reportImage.name}
            </p>
          )}
        </div>

        <button
          onClick={onSubmit}
          className="w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-4 font-bold text-white shadow-lg"
        >
          完了報告する
        </button>
      </div>
    </div>
  );
}

function BottomNav({
  activeTab,
  setActiveTab,
  recruitingCount,
  waitingCount,
  unreadCount,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  recruitingCount: number;
  waitingCount: number;
  unreadCount: number;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#c9a86a]/10 bg-[#08101d]/90 px-3 py-3 backdrop-blur-2xl">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        <NavButton
          label="ホーム"
          active={activeTab === "home"}
          onClick={() => setActiveTab("home")}
          badge={waitingCount}
          icon={<Home size={21} />}
        />

        <NavButton
          label="クエスト"
          active={activeTab === "quests"}
          onClick={() => setActiveTab("quests")}
          badge={recruitingCount}
          icon={<Sword size={21} />}
        />

        <NavButton
          label="依頼"
          active={activeTab === "request"}
          onClick={() => setActiveTab("request")}
          icon={<ScrollText size={21} />}
        />

        <NavButton
          label="設定"
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          badge={unreadCount}
          icon={<Settings size={21} />}
        />
      </div>
    </div>
  );
}

function NavButton({
  label,
  active,
  onClick,
  badge,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border px-2 py-3 backdrop-blur-xl transition-all duration-300 ${
        active
          ? "scale-[1.03] border-[#89a9cf] bg-gradient-to-b from-[#446f9f] to-[#28476d] text-white shadow-[0_0_25px_rgba(100,160,255,0.45)]"
          : "border-[#c9a86a]/10 bg-[#111827]/80 text-gray-300"
      }`}
    >
      <div className={active ? "text-white" : "text-[#94a3b8]"}>{icon}</div>

      <span className="text-[11px] font-bold">{label}</span>

      {!!badge && (
        <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
          {badge}
        </div>
      )}
    </button>
  );
}