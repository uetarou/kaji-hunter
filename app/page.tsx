"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { QuestBoard } from "@/components/QuestBoard";
import { RequestForm } from "@/components/RequestForm";
import { SettingsView } from "@/components/SettingsView";
import { ReportModal } from "@/components/ReportModal";

export type Quest = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  reward: string | null;
  status: string;
  is_urgent: boolean;
  created_by: string | null;
  accepted_by: string | null;
  due_at: string | null;
};

export type Profile = {
  id: string;
  hunter_name: string | null;
  hr: number | null;
  invite_code: string | null;
  partner_id: string | null;
};

export type Notification = {
  id: string;
  user_id: string | null;
  title: string | null;
  message: string | null;
  is_read: boolean | null;
  created_at: string | null;
};

export type NotificationSettings = {
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

      if (error || !data.user) {
        setMessage("匿名ログインに失敗しました。Supabase設定を確認してください。");
        setLoading(false);
        return;
      }

      currentUser = data.user;
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
      const nextProfile = {
        ...existing,
        hunter_name: existing.hunter_name || "テストハンター",
        hr: existing.hr || 1,
        invite_code: existing.invite_code || inviteCode,
      };

      const { data } = await supabase
        .from("profiles")
        .upsert([nextProfile])
        .select()
        .single();

      setProfile(data || nextProfile);
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
      setMessage("プロフィール作成に失敗しました。");
      return;
    }

    setProfile(data);
  };

  const ensureNotificationSettings = async (userId: string) => {
    const defaultSettings = {
      user_id: userId,
      quest_created: true,
      quest_accepted: true,
      quest_reported: true,
      quest_approved: true,
    };

    const { data } = await supabase
      .from("notification_settings")
      .upsert([defaultSettings], { onConflict: "user_id" })
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

  const partnerRecruitingQuests = useMemo(
    () =>
      visibleQuests.filter(
        (q) => q.status === "recruiting" && q.created_by === partnerId
      ),
    [visibleQuests, partnerId]
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

  const createQuest = async ({
    title,
    description,
    reward,
    dueAt,
    isUrgent,
  }: {
    title: string;
    description: string;
    reward: string;
    dueAt: string | null;
    isUrgent: boolean;
  }) => {
    if (!user || !title.trim()) return;

    await supabase.from("quests").insert([
      {
        title,
        description,
        category: null,
        reward,
        due_at: dueAt,
        status: "recruiting",
        is_urgent: isUrgent,
        created_by: user.id,
        accepted_by: null,
        pair_id: partnerId || null,
      },
    ]);

    if (partnerId) {
      await createNotification(
        partnerId,
        "quest_created",
        isUrgent ? "緊急クエスト" : "新しいクエスト",
        `${title} が依頼されました。`
      );
    }

    await reloadAll();
    setActiveTab("home");
    setMessage("クエストを依頼しました。");
  };

  const acceptQuest = async (quest: Quest | { title: string; id: string }) => {
    if (!user) return;

    if (quest.id.startsWith("daily-")) {
      await supabase.from("quests").insert([
        {
          title: quest.title,
          description: "毎日クエストから受注",
          category: null,
          reward: "日常ポイント",
          status: "accepted",
          is_urgent: false,
          created_by: partnerId || user.id,
          accepted_by: user.id,
          pair_id: partnerId || null,
        },
      ]);

      await reloadAll();
      setActiveTab("home");
      return;
    }

    const realQuest = quest as Quest;

    await supabase
      .from("quests")
      .update({
        status: "accepted",
        accepted_by: user.id,
      })
      .eq("id", realQuest.id);

    await createNotification(
      realQuest.created_by,
      "quest_accepted",
      "クエスト受注",
      `${realQuest.title} が受注されました。`
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
            <QuestBoard.Home
              acceptedQuests={acceptedQuests}
              myRequestQuests={myRequestQuests}
              onReport={(quest) => setSelectedQuest(quest)}
              onApprove={approveQuest}
            />
          </div>
        )}

        {activeTab === "quests" && (
          <QuestBoard.Board
            partnerQuests={partnerRecruitingQuests}
            onAccept={acceptQuest}
          />
        )}

        {activeTab === "request" && <RequestForm onCreate={createQuest} />}

        {activeTab === "settings" && user && (
          <SettingsView
            user={user}
            profile={profile}
            setProfile={setProfile}
            partnerProfile={partnerProfile}
            setPartnerProfile={setPartnerProfile}
            settingsPage={settingsPage}
            setSettingsPage={setSettingsPage}
            notifications={notifications}
            notificationSettings={notificationSettings}
            setNotificationSettings={setNotificationSettings}
            reloadAll={reloadAll}
            setMessage={setMessage}
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
        questCount={partnerRecruitingQuests.length}
        requestCount={myRequestQuests.length}
        unreadCount={unreadCount}
      />
    </main>
  );
}