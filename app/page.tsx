"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("掃除");
  const [reward, setReward] = useState("");

  const [expandedCard, setExpandedCard] = useState(false);

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

  const createQuest = async () => {
    if (!title) return;

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

    fetchQuests();
    setActiveTab("quests");
  };

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
      .update({
        status: "waiting_confirm",
      })
      .eq("id", questId);

    setReportImage(null);

    fetchQuests();
  };

  const approveQuest = async (questId: string) => {
    await supabase
      .from("quests")
      .update({
        status: "completed",
      })
      .eq("id", questId);

    fetchQuests();
  };

  const acceptQuest = async (questId: string) => {
    await supabase
      .from("quests")
      .update({
        status: "accepted",
      })
      .eq("id", questId);

    fetchQuests();
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-white pb-32">
      <div className="max-w-md mx-auto px-4 pt-4">
        {/* Guild Card */}
        <div
          onClick={() => setExpandedCard(!expandedCard)}
          className="bg-gradient-to-br from-[#111827] to-[#1e293b]
          border border-[#334155]
          rounded-3xl
          p-5
          shadow-2xl
          mb-5
          cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-cyan-400 mb-1">
                Kaji Hunter Guild
              </p>

              <h1 className="text-3xl font-bold tracking-wide">
                Kaji Hunter
              </h1>

              <div className="mt-3">
                <p className="text-sm text-gray-400">
                  テストハンター
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">
                    HR 1
                  </span>

                  <span className="text-cyan-400 text-sm">
                    見習いハンター
                  </span>
                </div>
              </div>
            </div>

            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              ⚔
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-[#0f172a] rounded-full h-3 overflow-hidden">
              <div className="bg-cyan-400 h-3 w-[30%]" />
            </div>

            <p className="text-xs text-gray-400 mt-2">
              XP 30 / 100
            </p>
          </div>

          {expandedCard && (
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-[#0f172a] rounded-2xl p-3">
                <p className="text-xs text-gray-400">
                  完了クエスト
                </p>

                <p className="text-xl font-bold mt-1">
                  12
                </p>
              </div>

              <div className="bg-[#0f172a] rounded-2xl p-3">
                <p className="text-xs text-gray-400">
                  連続達成
                </p>

                <p className="text-xl font-bold mt-1">
                  4日
                </p>
              </div>

              <div className="bg-[#0f172a] rounded-2xl p-3 col-span-2">
                <p className="text-xs text-gray-400">
                  称号
                </p>

                <p className="text-lg font-semibold mt-1 text-cyan-300">
                  蒼銀の掃討者
                </p>
              </div>
            </div>
          )}
        </div>

        {/* HOME */}
        {activeTab === "home" && (
          <div className="space-y-4">
            <SectionTitle title="受注中クエスト" badge={acceptedQuests.length} />

            {acceptedQuests.length === 0 && (
              <EmptyCard text="受注中クエストはありません" />
            )}

            {acceptedQuests.map((quest) => (
              <div
                key={quest.id}
                className="bg-[#111827] border border-[#334155] rounded-3xl p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <h2 className="font-bold text-lg">
                      {quest.title}
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                      {quest.category}
                    </p>
                  </div>

                  <div className="text-cyan-400 text-sm">
                    進行中
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm mb-2">
                    完了証拠画像
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) =>
                      setReportImage(
                        e.target.files?.[0] || null
                      )
                    }
                    className="text-sm"
                  />
                </div>

                <button
                  onClick={() => completeQuest(quest.id)}
                  className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-2xl"
                >
                  完了報告する
                </button>
              </div>
            ))}

            <SectionTitle title="確認待ち" badge={waitingQuests.length} />

            {waitingQuests.map((quest) => (
              <div
                key={quest.id}
                className="bg-[#111827] border border-yellow-500 rounded-3xl p-4"
              >
                <h2 className="font-bold text-lg">
                  {quest.title}
                </h2>

                <p className="text-yellow-300 text-sm mt-1">
                  パートナーの確認待ち
                </p>

                <button
                  onClick={() => approveQuest(quest.id)}
                  className="w-full mt-4 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-2xl"
                >
                  達成承認
                </button>
              </div>
            ))}
          </div>
        )}

        {/* QUESTS */}
        {activeTab === "quests" && (
          <div>
            <SectionTitle
              title="募集中クエスト"
              badge={recruitingQuests.length}
            />

            <div className="space-y-4">
              {loading && (
                <EmptyCard text="読み込み中..." />
              )}

              {!loading &&
                recruitingQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className="bg-[#111827]
                    border border-[#334155]
                    rounded-3xl
                    p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold">
                          {quest.title}
                        </h2>

                        <p className="text-gray-400 text-sm mt-1">
                          {quest.description}
                        </p>
                      </div>

                      {quest.is_urgent && (
                        <span className="bg-red-500 text-xs px-2 py-1 rounded-full">
                          緊急
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <div className="bg-[#0f172a] px-3 py-2 rounded-xl text-sm">
                        {quest.category}
                      </div>

                      {quest.reward && (
                        <div className="bg-[#0f172a] px-3 py-2 rounded-xl text-sm">
                          報酬: {quest.reward}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => acceptQuest(quest.id)}
                      className="w-full mt-5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-2xl"
                    >
                      クエスト受注
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* REQUEST */}
        {activeTab === "request" && (
          <div className="bg-[#111827] border border-[#334155] rounded-3xl p-5">
            <p className="text-cyan-400 text-sm mb-1">
              New Quest
            </p>

            <h2 className="text-2xl font-bold mb-5">
              クエスト依頼
            </h2>

            <div className="space-y-4">
              <input
                placeholder="例：お風呂掃除クエスト"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-2xl p-4"
              />

              <textarea
                placeholder="内容：排水溝と床をきれいにする"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-2xl p-4 h-32"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-2xl p-4"
              >
                <option>掃除</option>
                <option>料理</option>
                <option>洗濯</option>
                <option>買い物</option>
              </select>

              <input
                placeholder="報酬：プリン1個"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-2xl p-4"
              />

              <button
                onClick={createQuest}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-2xl"
              >
                ギルドに依頼する
              </button>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <SettingCard title="アカウント" />
            <SettingCard title="パートナー招待" />
            <SettingCard title="通知設定" />
            <SettingCard title="利用規約" />
            <SettingCard title="アプリ情報" />
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div
        className="fixed bottom-0 left-0 right-0
        bg-[#0b1120]/95
        backdrop-blur-xl
        border-t border-[#1e293b]
        px-3 py-4"
      >
        <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
          <NavButton
            label="ホーム"
            active={activeTab === "home"}
            onClick={() => setActiveTab("home")}
            badge={waitingQuests.length}
          />

          <NavButton
            label="クエスト"
            active={activeTab === "quests"}
            onClick={() => setActiveTab("quests")}
            badge={recruitingQuests.length}
          />

          <NavButton
            label="依頼"
            active={activeTab === "request"}
            onClick={() => setActiveTab("request")}
          />

          <NavButton
            label="設定"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </div>
      </div>
    </main>
  );
}

function SectionTitle({
  title,
  badge,
}: {
  title: string;
  badge?: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      {!!badge && (
        <div className="bg-red-500 text-xs w-6 h-6 rounded-full flex items-center justify-center">
          {badge}
        </div>
      )}
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="bg-[#111827] border border-[#334155] rounded-3xl p-6 text-center text-gray-400">
      {text}
    </div>
  );
}

function SettingCard({ title }: { title: string }) {
  return (
    <div className="bg-[#111827] border border-[#334155] rounded-3xl p-5">
      {title}
    </div>
  );
}

function NavButton({
  label,
  active,
  onClick,
  badge,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative py-3 rounded-2xl text-sm font-semibold transition ${
        active
          ? "bg-cyan-500 text-black"
          : "bg-[#111827] text-gray-300"
      }`}
    >
      {label}

      {!!badge && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
          {badge}
        </div>
      )}
    </button>
  );
}