"use client";

import { useEffect, useMemo, useState } from "react";
import { Home, ScrollText, Settings, Sword } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Quest = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  reward: string | null;
  status: string;
  is_urgent: boolean;
};

export default function Page() {
  const [activeTab, setActiveTab] = useState("home");
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("掃除");
  const [reward, setReward] = useState("");

  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [reportImage, setReportImage] = useState<File | null>(null);

  const fetchQuests = async () => {
    const { data } = await supabase
      .from("quests")
      .select("*")
      .order("created_at", { ascending: false });

    setQuests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  const recruitingQuests = useMemo(
    () => quests.filter((q) => q.status === "recruiting"),
    [quests]
  );

  const acceptedQuests = useMemo(
    () => quests.filter((q) => q.status === "accepted"),
    [quests]
  );

  const waitingQuests = useMemo(
    () => quests.filter((q) => q.status === "waiting_confirm"),
    [quests]
  );

  const createQuest = async () => {
    if (!title.trim()) return;

    await supabase.from("quests").insert([
      {
        title,
        description,
        category,
        reward,
        status: "recruiting",
        is_urgent: false,
        created_by: "11111111-1111-1111-1111-111111111111",
      },
    ]);

    setTitle("");
    setDescription("");
    setReward("");
    await fetchQuests();
    setActiveTab("quests");
  };

  const acceptQuest = async (questId: string) => {
    await supabase.from("quests").update({ status: "accepted" }).eq("id", questId);
    await fetchQuests();
    setActiveTab("home");
  };

  const completeQuest = async (questId: string) => {
    let imageUrl = "";

    if (reportImage) {
      const fileName = `${Date.now()}-${reportImage.name}`;

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

    setSelectedQuest(null);
    setReportImage(null);
    await fetchQuests();
  };

  const approveQuest = async (questId: string) => {
    await supabase.from("quests").update({ status: "completed" }).eq("id", questId);
    await fetchQuests();
  };

  return (
    <main className="min-h-screen bg-[#07111f] text-white pb-36">
      <TopBar />

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
              <SectionTitle title="依頼中クエスト" badge={waitingQuests.length} />

              {waitingQuests.length === 0 && (
                <EmptyCard text="依頼中クエストはありません" />
              )}

              {waitingQuests.map((quest) => (
                <div key={quest.id} className="rounded-3xl border border-[#c9a86a]/20 bg-[#111827] p-4 shadow-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black">{quest.title}</h3>
                      <p className="mt-1 text-sm text-[#d8c08a]">完了確認待ち</p>
                    </div>
                    <span className="rounded-full border border-[#c9a86a]/30 px-3 py-1 text-xs text-[#d8c08a]">
                      依頼中
                    </span>
                  </div>

                  <button
                    onClick={() => approveQuest(quest.id)}
                    className="mt-4 w-full rounded-2xl border border-[#9ec27f] bg-[#6b8e5a] py-3 font-bold text-white shadow-lg"
                  >
                    達成承認
                  </button>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === "quests" && (
          <section className="space-y-4">
            <SectionTitle title="募集中クエスト" badge={recruitingQuests.length} />

            {loading && <EmptyCard text="読み込み中..." />}

            {!loading && recruitingQuests.length === 0 && (
              <EmptyCard text="募集中クエストはありません" />
            )}

            {recruitingQuests.map((quest) => (
              <div key={quest.id} className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-5 shadow-xl">
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
                  onClick={() => acceptQuest(quest.id)}
                  className="mt-5 w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-4 font-bold text-white shadow-lg"
                >
                  クエスト受注
                </button>
              </div>
            ))}
          </section>
        )}

        {activeTab === "request" && (
          <section className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-5 shadow-xl">
            <p className="text-sm text-[#d8c08a]">New Quest</p>
            <h2 className="mt-1 text-3xl font-black">クエスト依頼</h2>

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
          <section className="space-y-4">
            <SettingCard title="アカウント" description="ハンター名・HR・称号" />
            <SettingCard title="パートナー設定" description="招待コード・ギルド連携" />
            <SettingCard title="通知設定" description="クエスト・報告・承認通知" />
            <SettingCard title="利用規約" description="アプリ利用ルール" />
          </section>
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
        setActiveTab={setActiveTab}
        recruitingCount={recruitingQuests.length}
        waitingCount={waitingQuests.length}
      />
    </main>
  );
}

function TopBar() {
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
              <p className="text-sm text-[#d8c08a]">テストハンター</p>
              <div className="h-1 w-1 rounded-full bg-[#d8c08a]" />
              <p className="text-sm font-bold text-slate-100">HR 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
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

function SettingCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-[#c9a86a]/10 bg-[#111827] p-5 shadow-xl">
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
    </div>
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
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  recruitingCount: number;
  waitingCount: number;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#c9a86a]/10 bg-[#08101d]/90 px-3 py-4 backdrop-blur-2xl">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-3">
        <NavButton
          label="ホーム"
          active={activeTab === "home"}
          onClick={() => setActiveTab("home")}
          badge={waitingCount}
          icon={<Home size={22} />}
        />

        <NavButton
          label="クエスト"
          active={activeTab === "quests"}
          onClick={() => setActiveTab("quests")}
          badge={recruitingCount}
          icon={<Sword size={22} />}
        />

        <NavButton
          label="依頼"
          active={activeTab === "request"}
          onClick={() => setActiveTab("request")}
          icon={<ScrollText size={22} />}
        />

        <NavButton
          label="設定"
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          icon={<Settings size={22} />}
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
      className={`relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-3xl border px-2 py-3 backdrop-blur-xl transition-all duration-300 ${
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