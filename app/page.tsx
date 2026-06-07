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

const tabs = ["home", "quests", "request", "settings"];

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
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [reportImage, setReportImage] = useState<File | null>(null);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

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
        setMessage(
          `匿名ログインに失敗しました: ${
            error?.message || "ユーザー取得失敗"
          }`
        );
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

    const nextProfile = {
      id: currentUser.id,
      hunter_name: existing?.hunter_name || "テストハンター",
      hr: existing?.hr || 1,
      invite_code: existing?.invite_code || inviteCode,
      partner_id: existing?.partner_id || null,
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert([nextProfile], { onConflict: "id" })
      .select()
      .single();

    if (error) {
      setMessage(`プロフィール作成に失敗しました: ${error.message}`);
      setLoading(false);
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
      .neq("status", "cancelled")
      .order("is_urgent", { ascending: false })
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

  const moveTab = (direction: "left" | "right") => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex === -1) return;

    if (direction === "left") {
      const next = tabs[Math.min(currentIndex + 1, tabs.length - 1)];
      setActiveTab(next);
      setSettingsPage(null);
    }

    if (direction === "right") {
      const prev = tabs[Math.max(currentIndex - 1, 0)];
      setActiveTab(prev);
      setSettingsPage(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (selectedQuest || editingQuest) return;

    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    if (selectedQuest || editingQuest) return;
    if (touchStartX === null || touchStartY === null) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = touchStartX - endX;
    const diffY = touchStartY - endY;

    if (Math.abs(diffX) > 90 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
      if (diffX > 0) moveTab("left");
      if (diffX < 0) moveTab("right");
    }

    setTouchStartX(null);
    setTouchStartY(null);
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
    <main
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen bg-[#07111f] pb-32 text-white"
    >
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
          <QuestBoard.Home
            acceptedQuests={acceptedQuests}
            myRequestQuests={myRequestQuests}
            onReport={(quest: Quest) => {
              setSelectedQuest(quest);
            }}
            onApprove={(quest: Quest) => {
              console.log(quest);
            }}
            onEdit={(quest: Quest) => {
              setEditingQuest(quest);
            }}
            onCancel={(quest: Quest) => {
              console.log(quest);
            }}
          />
        )}

        {activeTab === "quests" && (
          <QuestBoard.Board
            partnerQuests={partnerRecruitingQuests}
            onAccept={(quest: Quest) => {
              console.log(quest);
            }}
          />
        )}

        {activeTab === "request" && (
          <RequestForm
            onCreate={(quest: Quest) => {
              console.log(quest);
            }}
          />
        )}

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
          onSubmit={() => {
            console.log(selectedQuest.id);
          }}
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