"use client";

import { useState } from "react";
import type { Quest } from "@/app/page";
import { dailyQuestTemplates } from "@/lib/questTemplates";

type BoardQuest =
  | Quest
  | {
      id: string;
      title: string;
      description: string;
      reward: string;
      is_urgent: boolean;
      status: "daily";
      due_at?: null;
    };

export const QuestBoard = { Home, Board };

function Home({
  acceptedQuests,
  myRequestQuests,
  onReport,
  onApprove,
  onEdit,
  onCancel,
}: {
  acceptedQuests: Quest[];
  myRequestQuests: Quest[];
  onReport: (quest: Quest) => void;
  onApprove: (quest: Quest) => void;
  onEdit: (quest: Quest) => void;
  onCancel: (quest: Quest) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <SectionTitle title="受注中クエスト" badge={acceptedQuests.length} />

        {acceptedQuests.length === 0 && (
          <EmptyCard text="受注中クエストはありません" />
        )}

        {acceptedQuests.map((quest) => (
          <HomeQuestCard
            key={quest.id}
            quest={quest}
            statusText="進行中"
            primaryLabel="報告"
            onPrimary={() => onReport(quest)}
            secondaryLabel="取り下げ"
            onSecondary={() => onCancel(quest)}
          />
        ))}
      </section>

      <section className="space-y-3">
        <SectionTitle title="依頼中クエスト" badge={myRequestQuests.length} />

        {myRequestQuests.length === 0 && (
          <EmptyCard text="依頼中クエストはありません" />
        )}

        {myRequestQuests.map((quest) => (
          <HomeQuestCard
            key={quest.id}
            quest={quest}
            statusText={getStatusText(quest.status)}
            primaryLabel={quest.status === "waiting_confirm" ? "承認" : "変更"}
            onPrimary={() => {
              if (quest.status === "waiting_confirm") onApprove(quest);
              else onEdit(quest);
            }}
            secondaryLabel="取り下げ"
            onSecondary={() => onCancel(quest)}
          />
        ))}
      </section>
    </div>
  );
}

function Board({
  partnerQuests,
  onAccept,
}: {
  partnerQuests: Quest[];
  onAccept: (quest: BoardQuest) => void;
}) {
  const [selectedQuest, setSelectedQuest] = useState<BoardQuest | null>(null);

  const boardQuests: BoardQuest[] = [
    ...partnerQuests.filter((q) => q.is_urgent),
    ...partnerQuests.filter((q) => !q.is_urgent),
    ...dailyQuestTemplates,
  ];

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-[#c9a86a]/20 bg-gradient-to-br from-[#111827] to-[#07111f] p-5 shadow-2xl">
        <p className="text-sm font-bold text-[#d8c08a]">Guild Quest Board</p>
        <h2 className="mt-1 font-title text-3xl font-black">クエストボード</h2>
      </div>

      <div className="space-y-3">
        {boardQuests.map((quest) => (
          <BoardQuestCard
            key={quest.id}
            quest={quest}
            onOpen={() => setSelectedQuest(quest)}
          />
        ))}
      </div>

      {selectedQuest && (
        <QuestDetailModal
          quest={selectedQuest}
          onClose={() => setSelectedQuest(null)}
          onAccept={() => {
            onAccept(selectedQuest);
            setSelectedQuest(null);
          }}
        />
      )}
    </section>
  );
}

function BoardQuestCard({
  quest,
  onOpen,
}: {
  quest: BoardQuest;
  onOpen: () => void;
}) {
  const type = getQuestType(quest);
  const tone = getTone(type);

  return (
    <div className={`rounded-3xl border p-3 shadow-xl ${tone.card}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-black">{quest.title}</h3>
            <span
              className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${tone.badge}`}
            >
              {type}
            </span>
          </div>

          <p className="mt-1 truncate text-xs text-gray-400">
            希望：
            {formatDueAt("due_at" in quest ? quest.due_at || null : null)}
          </p>
        </div>

        <button
          onClick={onOpen}
          className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold text-white ${tone.button}`}
        >
          内容確認
        </button>
      </div>
    </div>
  );
}

function QuestDetailModal({
  quest,
  onClose,
  onAccept,
}: {
  quest: BoardQuest;
  onClose: () => void;
  onAccept: () => void;
}) {
  const type = getQuestType(quest);
  const tone = getTone(type);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden bg-black/70 px-4 pb-28 pt-8 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#c9a86a]/20 bg-[#111827] p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${tone.badge}`}
            >
              {type}
            </span>
            <h2 className="mt-3 truncate font-title text-3xl font-black">
              {quest.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] text-gray-400"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <DetailBox label="依頼内容" value={quest.description || "内容なし"} />
          <DetailBox
            label="希望日時"
            value={formatDueAt("due_at" in quest ? quest.due_at || null : null)}
          />
          <DetailBox label="報酬" value={quest.reward || "なし"} />
        </div>

        <button
          onClick={onAccept}
          className={`mt-4 w-full rounded-2xl border py-4 font-bold text-white shadow-lg ${tone.button}`}
        >
          このクエストを受注する
        </button>
      </div>
    </div>
  );
}

function HomeQuestCard({
  quest,
  statusText,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  quest: Quest;
  statusText: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-4 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-black">{quest.title}</h3>
          <p className="mt-1 text-sm text-[#d8c08a]">{statusText}</p>
          <p className="mt-2 text-xs text-gray-400">
            希望：{formatDueAt(quest.due_at)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <button
            onClick={onPrimary}
            className="rounded-2xl border border-[#6e8fb4] bg-[#355e8d] px-4 py-2 text-sm font-bold text-white"
          >
            {primaryLabel}
          </button>

          {secondaryLabel && onSecondary && (
            <button
              onClick={onSecondary}
              className="rounded-2xl border border-red-300/30 bg-red-900/40 px-4 py-2 text-sm font-bold text-red-100"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-3">
      <p className="text-xs font-bold text-[#d8c08a]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-gray-200">{value}</p>
    </div>
  );
}

function SectionTitle({ title, badge }: { title: string; badge?: number }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="font-title text-2xl font-black">{title}</h2>

      {!!badge && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold">
          {badge}
        </div>
      )}
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

function getQuestType(quest: BoardQuest) {
  if ("status" in quest && quest.status === "daily") return "毎日";
  if ("is_urgent" in quest && quest.is_urgent) return "緊急";
  return "パートナー";
}

function getTone(type: string) {
  if (type === "緊急") {
    return {
      card: "border-red-400/30 bg-gradient-to-br from-[#2a1115] to-[#111827]",
      badge: "border-red-300/40 bg-red-500/20 text-red-100",
      button: "border-red-300/50 bg-red-700",
    };
  }

  if (type === "パートナー") {
    return {
      card: "border-emerald-300/25 bg-gradient-to-br from-[#0d221a] to-[#111827]",
      badge: "border-emerald-300/40 bg-emerald-500/15 text-emerald-100",
      button: "border-emerald-300/40 bg-emerald-800",
    };
  }

  return {
    card: "border-[#6e8fb4]/30 bg-gradient-to-br from-[#0b1c33] to-[#111827]",
    badge: "border-[#6e8fb4]/50 bg-[#355e8d]/30 text-blue-100",
    button: "border-[#6e8fb4] bg-[#355e8d]",
  };
}

function getStatusText(status: string) {
  if (status === "recruiting") return "募集中";
  if (status === "accepted") return "進行中";
  if (status === "waiting_confirm") return "完了確認待ち";
  if (status === "completed") return "達成済み";
  if (status === "cancelled") return "取り下げ済み";
  return status;
}

function formatDueAt(dueAt: string | null) {
  if (!dueAt) return "指定なし";

  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return "指定なし";

  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}