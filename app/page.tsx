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

  const [selectedQuest, setSelectedQuest] =
    useState<Quest | null>(null);

  const [reportImage, setReportImage] =
    useState<File | null>(null);

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
        created_by:
          "11111111-1111-1111-1111-111111111111",
      },
    ]);

    setTitle("");
    setDescription("");
    setReward("");

    fetchQuests();
    setActiveTab("quests");
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

  const completeQuest = async (questId: string) => {
    let imageUrl = "";

    if (reportImage) {
      const fileName = `${Date.now()}-${reportImage.name}`;

      const { data: uploadData } =
        await supabase.storage
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

    setSelectedQuest(null);
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

  const recruitingQuests = useMemo(
    () =>
      quests.filter(
        (q) => q.status === "recruiting"
      ),
    [quests]
  );

  const acceptedQuests = useMemo(
    () =>
      quests.filter((q) => q.status === "accepted"),
    [quests]
  );

  const waitingQuests = useMemo(
    () =>
      quests.filter(
        (q) => q.status === "waiting_confirm"
      ),
    [quests]
  );

  return (
    <main className="min-h-screen bg-[#020817] text-white pb-32">
      {/* TOP BAR */}
      <div
        className="
        sticky top-0 z-50
        bg-gradient-to-r
        from-[#071120]
        via-[#0b1730]
        to-[#102348]
        border-b border-cyan-500/20
        shadow-2xl
        "
      >
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-wide">
              Kaji Hunter
            </h1>

            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-cyan-300">
                テストハンター
              </p>

              <div className="w-1 h-1 bg-cyan-300 rounded-full" />

              <p className="text-sm text-cyan-100 font-bold">
                HR 1
              </p>
            </div>
          </div>

          <div
            className="
            w-12 h-12
            rounded-2xl
            bg-cyan-400/10
            border border-cyan-400/30
            flex items-center justify-center
            text-cyan-300 text-xl
            "
          >
            ⚔
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5">
        {/* HOME */}
        {activeTab === "home" && (
          <div className="space-y-5">
            {/* 受注中 */}
            <SectionTitle
              title="受注中クエスト"
              badge={acceptedQuests.length}
            />

            {acceptedQuests.length === 0 && (
              <EmptyCard text="受注中クエストはありません" />
            )}

            {acceptedQuests.map((quest) => (
              <div
                key={quest.id}
                className="
                bg-[#0b1220]
                border border-[#1e293b]
                rounded-3xl
                p-4
                flex items-center justify-between
                "
              >
                <div>
                  <h2 className="font-bold text-lg">
                    {quest.title}
                  </h2>

                  <p className="text-sm text-cyan-300 mt-1">
                    進行中
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelectedQuest(quest)
                  }
                  className="
                  bg-blue-500
                  hover:bg-blue-400
                  text-white
                  px-5 py-3
                  rounded-2xl
                  font-bold
                  "
                >
                  報告
                </button>
              </div>
            ))}

            {/* 依頼中 */}
            <SectionTitle
              title="依頼中クエスト"
              badge={waitingQuests.length}
            />

            {waitingQuests.length === 0 && (
              <EmptyCard text="依頼中クエストはありません" />
            )}

            {waitingQuests.map((quest) => (
              <div
                key={quest.id}
                className="
                bg-[#0b1220]
                border border-yellow-500/40
                rounded-3xl
                p-4
                "
              >
                <h2 className="font-bold text-lg">
                  {quest.title}
                </h2>

                <p className="text-yellow-300 text-sm mt-1">
                  完了確認待ち
                </p>

                <button
                  onClick={() =>
                    approveQuest(quest.id)
                  }
                  className="
                  w-full mt-4
                  bg-green-500
                  hover:bg-green-400
                  text-black
                  font-bold
                  py-3
                  rounded-2xl
                  "
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
                    className="
                    bg-[#0b1220]
                    border border-[#1e293b]
                    rounded-3xl
                    p-5
                    "
                  >
                    <div className="flex justify-between">
                      <div>
                        <h2 className="text-xl font-bold">
                          {quest.title}
                        </h2>

                        <p className="text-gray-400 text-sm mt-2">
                          {quest.description}
                        </p>
                      </div>

                      {quest.is_urgent && (
                        <div className="bg-red-500 px-2 py-1 rounded-full text-xs">
                          緊急
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <div className="bg-[#111827] px-3 py-2 rounded-xl text-sm">
                        {quest.category}
                      </div>

                      {quest.reward && (
                        <div className="bg-[#111827] px-3 py-2 rounded-xl text-sm">
                          報酬: {quest.reward}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        acceptQuest(quest.id)
                      }
                      className="
                      w-full mt-5
                      bg-blue-500
                      hover:bg-blue-400
                      text-white
                      font-bold
                      py-3
                      rounded-2xl
                      "
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
          <div
            className="
            bg-[#0b1220]
            border border-[#1e293b]
            rounded-3xl
            p-5
            "
          >
            <p className="text-cyan-300 text-sm mb-1">
              New Quest
            </p>

            <h2 className="text-2xl font-bold mb-5">
              クエスト依頼
            </h2>

            <div className="space-y-4">
              <input
                placeholder="例：お風呂掃除"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="
                w-full
                bg-[#111827]
                border border-[#1e293b]
                rounded-2xl
                p-4
                "
              />

              <textarea
                placeholder="内容を書く"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                className="
                w-full
                h-32
                bg-[#111827]
                border border-[#1e293b]
                rounded-2xl
                p-4
                "
              />

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="
                w-full
                bg-[#111827]
                border border-[#1e293b]
                rounded-2xl
                p-4
                "
              >
                <option>掃除</option>
                <option>料理</option>
                <option>洗濯</option>
                <option>買い物</option>
              </select>

              <input
                placeholder="報酬：プリン"
                value={reward}
                onChange={(e) =>
                  setReward(e.target.value)
                }
                className="
                w-full
                bg-[#111827]
                border border-[#1e293b]
                rounded-2xl
                p-4
                "
              />

              <button
                onClick={createQuest}
                className="
                w-full
                bg-blue-500
                hover:bg-blue-400
                text-white
                font-bold
                py-4
                rounded-2xl
                "
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
            <SettingCard title="パートナー設定" />
            <SettingCard title="通知設定" />
            <SettingCard title="利用規約" />
          </div>
        )}
      </div>

      {/* REPORT MODAL */}
      {selectedQuest && (
        <div
          className="
          fixed inset-0 z-50
          bg-black/70
          backdrop-blur-sm
          flex items-end
          "
        >
          <div
            className="
            bg-[#0b1220]
            border-t border-[#1e293b]
            w-full
            rounded-t-3xl
            p-5
            max-w-md
            mx-auto
            "
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold">
                完了報告
              </h2>

              <button
                onClick={() =>
                  setSelectedQuest(null)
                }
                className="text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#111827] rounded-2xl p-4 mb-5">
              <p className="text-sm text-gray-400">
                クエスト
              </p>

              <h3 className="text-xl font-bold mt-1">
                {selectedQuest.title}
              </h3>

              <p className="text-gray-400 mt-3 text-sm">
                {selectedQuest.description}
              </p>
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-semibold">
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
              onClick={() =>
                completeQuest(selectedQuest.id)
              }
              className="
              w-full
              bg-blue-500
              hover:bg-blue-400
              text-white
              font-bold
              py-4
              rounded-2xl
              "
            >
              完了報告する
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div
        className="
        fixed bottom-0 left-0 right-0
        bg-[#08111f]/95
        backdrop-blur-xl
        border-t border-[#1e293b]
        px-3 py-4
        "
      >
        <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
          <NavButton
            label="ホーム"
            active={activeTab === "home"}
            onClick={() =>
              setActiveTab("home")
            }
          />

          <NavButton
            label="クエスト"
            active={activeTab === "quests"}
            onClick={() =>
              setActiveTab("quests")
            }
            badge={recruitingQuests.length}
          />

          <NavButton
            label="依頼"
            active={activeTab === "request"}
            onClick={() =>
              setActiveTab("request")
            }
          />

          <NavButton
            label="設定"
            active={activeTab === "settings"}
            onClick={() =>
              setActiveTab("settings")
            }
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
    <div className="flex items-center gap-2">
      <h2 className="text-3xl font-black">
        {title}
      </h2>

      {!!badge && (
        <div
          className="
          bg-red-500
          text-white
          w-7 h-7
          rounded-full
          flex items-center justify-center
          text-sm
          "
        >
          {badge}
        </div>
      )}
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div
      className="
      bg-[#0b1220]
      border border-[#1e293b]
      rounded-3xl
      p-6
      text-center
      text-gray-400
      "
    >
      {text}
    </div>
  );
}

function SettingCard({
  title,
}: {
  title: string;
}) {
  return (
    <div
      className="
      bg-[#0b1220]
      border border-[#1e293b]
      rounded-3xl
      p-5
      "
    >
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
      className={`
      relative
      py-3
      rounded-2xl
      text-sm
      font-bold
      transition
      ${
        active
          ? "bg-blue-500 text-white"
          : "bg-[#111827] text-gray-300"
      }
      `}
    >
      {label}

      {!!badge && (
        <div
          className="
          absolute
          -top-1 -right-1
          bg-red-500
          text-white
          w-5 h-5
          rounded-full
          flex items-center justify-center
          text-[10px]
          "
        >
          {badge}
        </div>
      )}
    </button>
  );
}