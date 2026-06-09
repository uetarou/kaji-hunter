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

type CreateQuestInput = {
  title: string;
  description: string;
  reward: string;
  dueAt: string | null;
  isUrgent: boolean;
};

type AcceptableQuest = Quest | { id: string; title: string };

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

  const [showNameModal, setShowNameModal] = useState(false);
  const [initialHunterName, setInitialHunterName] = useState("");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const myId = user?.id;
  const partnerId = profile?.partner_id;
  const modalOpen = !!selectedQuest || !!editingQuest || showNameModal || isRequestModalOpen;

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  const generateInviteCode = (userId: string) => userId.slice(0, 8).toUpperCase();

  const initAuth = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    let currentUser = sessionData.session?.user ?? null;

    if (!currentUser) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data.user) {
        setMessage(`匿名ログインに失敗しました: ${error?.message || "ユーザー取得失敗"}`);
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

    const isNewUser = !existing;
    const currentHunterName = existing?.hunter_name || "テストハンター";

    const nextProfile = {
      id: currentUser.id,
      hunter_name: currentHunterName,
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
    if (isNewUser || data.hunter_name === "テストハンター") {
      setInitialHunterName("");
      setShowNameModal(true);
    }
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

  useEffect(() => { initAuth(); }, []);
  useEffect(() => { if (user && profile) reloadAll(); }, [user, profile?.id]);

  const visibleQuests = useMemo(() => {
    if (!myId) return [];
    return quests.filter((quest) =>
      quest.created_by === myId ||
      quest.accepted_by === myId ||
      quest.created_by === partnerId ||
      quest.accepted_by === partnerId
    );
  }, [quests, myId, partnerId]);

  const partnerRecruitingQuests = useMemo(
    () => visibleQuests.filter((q) => q.status === "recruiting" && q.created_by === partnerId),
    [visibleQuests, partnerId]
  );

  const acceptedQuests = useMemo(
    () => visibleQuests.filter((q) => q.status === "accepted" && q.accepted_by === myId),
    [visibleQuests, myId]
  );

  const myRequestQuests = useMemo(
    () => visibleQuests.filter((q) => q.created_by === myId && q.accepted_by !== myId && q.status !== "completed"),
    [visibleQuests, myId]
  );

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

  const createNotification = async (
    userId: string | null | undefined,
    type: "quest_created" | "quest_accepted" | "quest_reported" | "quest_approved",
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
    await supabase.from("notifications").insert([{ user_id: userId, title, message, is_read: false }]);
  };

  const saveInitialName = async () => {
    if (!user) return;
    const name = initialHunterName.trim();
    if (!name) {
      setMessage("ハンター名を入力してください。");
      return;
    }
    const nextProfile = {
      id: user.id,
      hunter_name: name,
      hr: profile?.hr || 1,
      invite_code: profile?.invite_code || generateInviteCode(user.id),
      partner_id: profile?.partner_id || null,
    };
    const { data, error } = await supabase
      .from("profiles")
      .upsert([nextProfile], { onConflict: "id" })
      .select()
      .single();
    if (error) {
      setMessage(`ハンター名の保存に失敗しました: ${error.message}`);
      return;
    }
    setProfile(data);
    setShowNameModal(false);
    setMessage("ハンター登録が完了しました。");
    await reloadAll();
  };

  const createQuest = async ({ title, description, reward, dueAt, isUrgent }: CreateQuestInput) => {
    if (!user || !title.trim()) return;
    const { error } = await supabase.from("quests").insert([{
      title,
      description,
      category: "依頼",
      reward,
      due_at: dueAt,
      status: "recruiting",
      is_urgent: isUrgent,
      created_by: user.id,
      accepted_by: null,
      pair_id: partnerId || null,
    }]);
    if (error) {
      setMessage(`クエスト作成に失敗しました: ${error.message}`);
      return;
    }
    if (partnerId) {
      await createNotification(partnerId, "quest_created", isUrgent ? "緊急クエスト" : "新しいクエスト", `${title} が依頼されました。`);
    }
    await reloadAll();
    setActiveTab("home");
    setMessage("クエストを依頼しました。");
  };

  const acceptQuest = async (quest: AcceptableQuest) => {
    if (!user) return;
    if (quest.id.startsWith("daily-")) {
      const { error } = await supabase.from("quests").insert([{
        title: quest.title,
        description: "毎日クエストから受注",
        category: "毎日",
        reward: "日常ポイント",
        status: "accepted",
        is_urgent: false,
        created_by: partnerId || user.id,
        accepted_by: user.id,
        pair_id: partnerId || null,
      }]);
      if (error) {
        setMessage(`デイリー受注に失敗しました: ${error.message}`);
        return;
      }
      await reloadAll();
      setActiveTab("home");
      setMessage("デイリークエストを受注しました。");
      return;
    }

    const realQuest = quest as Quest;
    const { error } = await supabase
      .from("quests")
      .update({ status: "accepted", accepted_by: user.id, updated_at: new Date().toISOString() })
      .eq("id", realQuest.id);
    if (error) {
      setMessage(`受注に失敗しました: ${error.message}`);
      return;
    }
    await createNotification(realQuest.created_by, "quest_accepted", "クエスト受注", `${realQuest.title} が受注されました。`);
    await reloadAll();
    setActiveTab("home");
    setMessage("クエストを受注しました。");
  };

  const completeQuest = async (questId: string) => {
    if (!user || !selectedQuest) return;
    let imageUrl = "";
    if (reportImage) {
      const safeName = reportImage.name.replaceAll(" ", "-");
      const fileName = `${user.id}/${Date.now()}-${safeName}`;
      const { data: uploadData } = await supabase.storage.from("quest-reports").upload(fileName, reportImage);
      if (uploadData) {
        const { data } = supabase.storage.from("quest-reports").getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }
    }
    await supabase.from("quest_reports").insert([{ quest_id: questId, image_url: imageUrl }]);
    await supabase.from("quests").update({ status: "waiting_confirm", updated_at: new Date().toISOString() }).eq("id", questId);
    await createNotification(selectedQuest.created_by, "quest_reported", "完了報告", `${selectedQuest.title} の完了報告が届きました。`);
    setSelectedQuest(null);
    setReportImage(null);
    await reloadAll();
    setMessage("完了報告を送りました。");
  };

  const approveQuest = async (quest: Quest) => {
    await supabase.from("quests").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", quest.id);
    await createNotification(quest.accepted_by, "quest_approved", "達成承認", `${quest.title} が承認されました。`);
    await reloadAll();
    setMessage("クエストを承認しました。");
  };

  const cancelQuest = async (quest: Quest) => {
    const { error } = await supabase.from("quests").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", quest.id);
    if (error) {
      setMessage(`取り下げに失敗しました: ${error.message}`);
      return;
    }
    setQuests((current) => current.filter((q) => q.id !== quest.id));
    setMessage("クエストを取り下げました。");
    await reloadAll();
  };

  const updateQuest = async ({ title, description, reward, dueAt, isUrgent }: CreateQuestInput) => {
    if (!editingQuest) return;
    const { error } = await supabase
      .from("quests")
      .update({ title, description, reward, due_at: dueAt, is_urgent: isUrgent, updated_at: new Date().toISOString() })
      .eq("id", editingQuest.id);
    if (error) {
      setMessage(`変更に失敗しました: ${error.message}`);
      return;
    }
    setEditingQuest(null);
    await reloadAll();
    setMessage("クエスト内容を変更しました。");
  };

  const moveTab = (direction: "left" | "right") => {
    const currentIndex = tabs.indexOf(activeTab);
    if (direction === "left") setActiveTab(tabs[(currentIndex + 1) % tabs.length]);
    if (direction === "right") setActiveTab(tabs[(currentIndex - 1 + tabs.length) % tabs.length]);
    setSettingsPage(null);
    setDragX(0);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (modalOpen) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    if (modalOpen) return;
    if (touchStartX === null || touchStartY === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX;
    const diffY = currentY - touchStartY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 18) {
      setDragX(diffX * 0.35);
    }
    if (window.scrollY <= 0 && diffY > 0 && Math.abs(diffY) > Math.abs(diffX)) {
      setPullDistance(Math.min(diffY * 0.5, 120));
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent<HTMLElement>) => {
    if (modalOpen) return;
    if (touchStartX === null || touchStartY === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartX - endX;
    const diffY = touchStartY - endY;
    if (Math.abs(diffX) > 80 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
      if (diffX > 0) moveTab("left");
      if (diffX < 0) moveTab("right");
    }
    if (pullDistance > 90) {
      setIsRefreshing(true);
      await reloadAll();
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 700);
    } else {
      setPullDistance(0);
    }
    setDragX(0);
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
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen overflow-x-hidden bg-[#07111f] pb-32 text-white"
    >
      <div
        className="fixed left-0 right-0 top-0 z-[70] flex items-center justify-center overflow-hidden bg-[#07111f] text-sm font-bold text-[#d8c08a] transition-all duration-300"
        style={{ height: `${pullDistance}px`, opacity: pullDistance > 20 || isRefreshing ? 1 : 0 }}
      >
        {isRefreshing ? (
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#d8c08a] border-t-transparent" />
            更新中...
          </div>
        ) : (
          "↓ 引っ張って更新"
        )}
      </div>

      <TopBar hunterName={profile?.hunter_name || "テストハンター"} hr={profile?.hr || 1} unreadCount={unreadCount} />

      <div className="transition-transform duration-200" style={{ transform: `translateX(${dragX}px)` }}>
        <div className="mx-auto max-w-md px-4 pt-[125px]">
          {message && (
            <div className="mb-4 rounded-2xl border border-[#c9a86a]/20 bg-[#111827] p-3 text-sm text-[#d8c08a]">
              {message}
            </div>
          )}

          {activeTab === "home" && (
            <QuestBoard.Home
              acceptedQuests={acceptedQuests}
              myRequestQuests={myRequestQuests}
              onReport={(quest: Quest) => setSelectedQuest(quest)}
              onApprove={(quest: Quest) => approveQuest(quest)}
              onEdit={(quest: Quest) => setEditingQuest(quest)}
              onCancel={(quest: Quest) => cancelQuest(quest)}
            />
          )}

          {activeTab === "quests" && (
            <QuestBoard.Board partnerQuests={partnerRecruitingQuests} onAccept={(quest: AcceptableQuest) => acceptQuest(quest)} />
          )}

          {activeTab === "request" && (
            <RequestForm onCreate={(quest: CreateQuestInput) => createQuest(quest)} onModalOpenChange={setIsRequestModalOpen} />
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

      {editingQuest && <EditQuestModal quest={editingQuest} onClose={() => setEditingQuest(null)} onSubmit={updateQuest} />}

      {showNameModal && <InitialNameModal value={initialHunterName} setValue={setInitialHunterName} onSubmit={saveInitialName} />}

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

function EditQuestModal({
  quest,
  onClose,
  onSubmit,
}: {
  quest: Quest;
  onClose: () => void;
  onSubmit: (quest: CreateQuestInput) => void;
}) {
  const [title, setTitle] = useState(quest.title);
  const [description, setDescription] = useState(quest.description || "");
  const [reward, setReward] = useState(quest.reward || "");
  const [isUrgent, setIsUrgent] = useState(quest.is_urgent);
  const initialDate = quest.due_at ? new Date(quest.due_at) : null;
  const [dueDate, setDueDate] = useState(initialDate ? initialDate.toISOString().slice(0, 10) : "");
  const [dueTime, setDueTime] = useState(initialDate ? initialDate.toTimeString().slice(0, 5) : "");

  const submit = () => {
    if (!title.trim()) return;
    const dueAt = dueDate && dueTime ? new Date(`${dueDate}T${dueTime}`).toISOString() : null;
    onSubmit({ title, description, reward, dueAt, isUrgent });
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/75 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-md items-start justify-center">
        <div className="max-h-[calc(100dvh-3rem)] w-full overflow-y-auto rounded-3xl border border-[#c9a86a]/20 bg-[#111827] p-4 shadow-2xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[#d8c08a]">Edit Quest</p>
              <h2 className="font-title text-3xl font-black">依頼内容変更</h2>
            </div>
            <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] text-gray-400">✕</button>
          </div>

          <div className="space-y-3 pb-28">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsUrgent(false)} className={`rounded-2xl border p-3 font-bold ${!isUrgent ? "border-[#6e8fb4] bg-[#355e8d]" : "border-[#c9a86a]/10 bg-[#1f2937]"}`}>通常</button>
              <button onClick={() => setIsUrgent(true)} className={`rounded-2xl border p-3 font-bold ${isUrgent ? "border-red-300/50 bg-red-700" : "border-[#c9a86a]/10 bg-[#1f2937]"}`}>緊急</button>
            </div>
            <InputBlock label="クエスト名"><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-3 text-sm outline-none" /></InputBlock>
            <InputBlock label="依頼内容"><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="h-24 w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-3 text-sm outline-none" /></InputBlock>
            <InputBlock label="希望日"><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-3 text-sm outline-none" /></InputBlock>
            <InputBlock label="希望時間"><input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-3 text-sm outline-none" /></InputBlock>
            <InputBlock label="報酬"><input value={reward} onChange={(e) => setReward(e.target.value)} className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-3 text-sm outline-none" /></InputBlock>
          </div>

          <div className="sticky bottom-0 -mx-4 -mb-4 border-t border-[#c9a86a]/10 bg-[#111827]/95 p-4 backdrop-blur-xl">
            <button onClick={submit} className="w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-4 font-bold text-white shadow-lg">変更を保存する</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InitialNameModal({ value, setValue, onSubmit }: { value: string; setValue: (value: string) => void; onSubmit: () => void }) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#c9a86a]/20 bg-[#111827] p-5 shadow-2xl">
        <p className="text-sm font-bold text-[#d8c08a]">Hunter Entry</p>
        <h2 className="mt-2 font-title text-3xl font-black">ハンター名を登録</h2>
        <p className="mt-3 text-sm leading-6 text-gray-400">最初にアプリで使う名前を入力してください。</p>
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="例：たくやハンター" className="mt-5 w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none" />
        <button onClick={onSubmit} className="mt-5 w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-4 font-bold text-white">冒険を始める</button>
      </div>
    </div>
  );
}

function InputBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <p className="mb-1 text-sm font-bold text-[#d8c08a]">{label}</p>
      {children}
    </label>
  );
}
