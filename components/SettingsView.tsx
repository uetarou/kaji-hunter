"use client";

import { Bell, ChevronLeft, Shield, UserRound, Users } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Notification, NotificationSettings, Profile } from "@/app/page";

export function SettingsView({
  user,
  profile,
  setProfile,
  partnerProfile,
  setPartnerProfile,
  settingsPage,
  setSettingsPage,
  notifications,
  notificationSettings,
  setNotificationSettings,
  reloadAll,
  setMessage,
}: {
  user: User;
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  partnerProfile: Profile | null;
  setPartnerProfile: (profile: Profile | null) => void;
  settingsPage: string | null;
  setSettingsPage: (page: string | null) => void;
  notifications: Notification[];
  notificationSettings: NotificationSettings | null;
  setNotificationSettings: (settings: NotificationSettings | null) => void;
  reloadAll: () => void;
  setMessage: (message: string) => void;
}) {
  const [hunterName, setHunterName] = useState(
    profile?.hunter_name || "テストハンター"
  );
  const [partnerCode, setPartnerCode] = useState("");

  const generateInviteCode = (userId: string) => {
    return `KAJI-${userId.slice(0, 6).toUpperCase()}`;
  };

  const saveProfile = async () => {
    const inviteCode = profile?.invite_code || generateInviteCode(user.id);

    const nextProfile = {
      id: user.id,
      hunter_name: hunterName.trim() || "テストハンター",
      hr: profile?.hr || 1,
      invite_code: inviteCode,
      partner_id: profile?.partner_id || null,
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert([nextProfile], { onConflict: "id" })
      .select()
      .single();

    if (error) {
      setMessage(`プロフィール保存に失敗しました: ${error.message}`);
      return;
    }

    setProfile(data);
    setHunterName(data.hunter_name || "テストハンター");
    setMessage("プロフィールを保存しました。");
    await reloadAll();
  };

  const createInviteCode = async () => {
    const inviteCode = profile?.invite_code || generateInviteCode(user.id);

    const nextProfile = {
      id: user.id,
      hunter_name: profile?.hunter_name || hunterName || "テストハンター",
      hr: profile?.hr || 1,
      invite_code: inviteCode,
      partner_id: profile?.partner_id || null,
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert([nextProfile], { onConflict: "id" })
      .select()
      .single();

    if (error) {
      setMessage(`招待コード作成に失敗しました: ${error.message}`);
      return;
    }

    setProfile(data);
    setMessage("招待コードを作成しました。");
    await reloadAll();
  };

  const connectPartner = async () => {
    const code = partnerCode.trim().toUpperCase();

    if (!code) {
      setMessage("相手の招待コードを入力してください。");
      return;
    }

    if (code === profile?.invite_code) {
      setMessage("自分の招待コードは入力できません。");
      return;
    }

    const { data: partner, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("invite_code", code)
      .maybeSingle();

    if (error || !partner) {
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

    setPartnerProfile(partner);
    setPartnerCode("");
    setMessage("パートナー連携が完了しました。");
    await reloadAll();
  };

  const markAllNotificationsRead = async () => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id);

    if (error) {
      setMessage(`既読処理に失敗しました: ${error.message}`);
      return;
    }

    setMessage("通知をすべて既読にしました。");
    await reloadAll();
  };

  const toggleNotificationSetting = async (
    key:
      | "quest_created"
      | "quest_accepted"
      | "quest_reported"
      | "quest_approved"
  ) => {
    const baseSettings = notificationSettings || {
      user_id: user.id,
      quest_created: true,
      quest_accepted: true,
      quest_reported: true,
      quest_approved: true,
    };

    const updated = {
      ...baseSettings,
      [key]: !baseSettings[key],
    };

    setNotificationSettings(updated);

    const { data, error } = await supabase
      .from("notification_settings")
      .upsert([updated], { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      setMessage(`通知設定の保存に失敗しました: ${error.message}`);
      return;
    }

    setNotificationSettings(data);
    setMessage("通知設定を保存しました。");
    await reloadAll();
  };

  if (settingsPage === "account") {
    return (
      <SettingsPanel title="アカウント" onBack={() => setSettingsPage(null)}>
        <label className="block">
          <p className="mb-2 text-sm font-bold text-[#d8c08a]">ハンター名</p>
          <input
            value={hunterName}
            onChange={(e) => setHunterName(e.target.value)}
            className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
          />
        </label>

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
            {profile?.invite_code || "未作成"}
          </p>

          {!profile?.invite_code && (
            <button
              onClick={createInviteCode}
              className="mt-4 w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-3 font-bold"
            >
              招待コードを作成する
            </button>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4">
          <p className="text-sm text-gray-400">現在のパートナー</p>
          <p className="mt-2 text-xl font-bold">
            {partnerProfile?.hunter_name || "未連携"}
          </p>
        </div>

        <label className="mt-4 block">
          <p className="mb-2 text-sm font-bold text-[#d8c08a]">
            相手の招待コード
          </p>
          <input
            placeholder="例：KAJI-ABC123"
            value={partnerCode}
            onChange={(e) => setPartnerCode(e.target.value)}
            className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 uppercase outline-none"
          />
        </label>

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
              <h3 className="font-bold">{notification.title}</h3>
              <p className="mt-1 text-sm text-gray-400">
                {notification.message}
              </p>
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
        </div>
      </SettingsPanel>
    );
  }

  return (
    <section className="space-y-4">
      <SettingCard
        icon={<UserRound />}
        title="アカウント"
        description="ハンター名の変更"
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
        className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937] px-4 py-2 text-sm font-bold text-[#d8c08a]"
      >
        <ChevronLeft size={18} />
        設定に戻る
      </button>
      <h2 className="font-title text-3xl font-black">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
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

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-[#c9a86a]/10 bg-[#111827] p-7 text-center text-gray-400">
      {text}
    </div>
  );
}