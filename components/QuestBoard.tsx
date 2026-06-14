"use client";

import { useEffect, useMemo, useState } from "react";
import type { Quest } from "@/app/page";

type BoardQuest = Quest;

export const QuestBoard = { Home, Board };

function Home({
  resetKey = 0,
  acceptedQuests,
  myRequestQuests,
  onReport,
  onApprove,
  onEdit,
  onCancel,
}: {
  resetKey?: number;
  acceptedQuests: Quest[];
  myRequestQuests: Quest[];
  onReport: (quest: Quest) => void;
  onApprove: (quest: Quest) => void;
  onEdit: (quest: Quest) => void;
  onCancel: (quest: Quest) => void;
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarQuests = useMemo(
    () => [...acceptedQuests, ...myRequestQuests].filter((quest) => !!quest.due_at),
    [acceptedQuests, myRequestQuests]
  );

  useEffect(() => {
    setShowCalendar(false);
  }, [resetKey]);

  if (showCalendar) {
    return <QuestCalendar quests={calendarQuests} onBack={() => setShowCalendar(false)} />;
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#d8c08a]">Guild Home</p>
            <h2 className="mt-1 font-title text-3xl font-black leading-none">ホーム</h2>
          </div>
          <button
            onClick={() => setShowCalendar(true)}
            className="mb-1 rounded-xl border border-[#6e8fb4]/45 bg-[#355e8d]/30 px-4 py-2 text-[16px] font-black text-sky-100"
          >
            カレンダー
          </button>
        </div>

        <div className="rounded-2xl border border-[#c9a86a]/10 bg-[#111827] px-4 py-3 text-sm text-gray-400">
          {calendarQuests.length === 0
            ? "希望日時があるクエストはありません"
            : `希望日時あり：${calendarQuests.length}件`}
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle title="受注中クエスト" badge={acceptedQuests.length} />

        {acceptedQuests.length === 0 && <EmptyCard text="受注中クエストはありません" />}

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

        {myRequestQuests.length === 0 && <EmptyCard text="依頼中クエストはありません" />}

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

function QuestCalendar({ quests, onBack }: { quests: Quest[]; onBack: () => void }) {
  const [baseDate, setBaseDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(() => new Date().getDate());
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: startDay + daysInMonth }, (_, index) =>
    index < startDay ? null : index - startDay + 1
  );
  while (cells.length % 7 !== 0) cells.push(null);

  const questsByDay = useMemo(() => {
    const map = new Map<number, Quest[]>();
    quests.forEach((quest) => {
      if (!quest.due_at) return;
      const date = new Date(quest.due_at);
      if (Number.isNaN(date.getTime())) return;
      if (date.getFullYear() !== year || date.getMonth() !== month) return;
      const day = date.getDate();
      map.set(day, [...(map.get(day) || []), quest]);
    });
    return map;
  }, [quests, year, month]);

  const selectedQuests = selectedDay ? questsByDay.get(selectedDay) || [] : [];
  const memoKey = `kaji-calendar-memo-${year}-${month + 1}-${selectedDay || "none"}`;
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (!selectedDay) {
      setMemo("");
      return;
    }
    setMemo(window.localStorage.getItem(memoKey) || "");
  }, [memoKey, selectedDay]);

  const saveMemo = (value: string) => {
    setMemo(value);
    if (!selectedDay) return;
    window.localStorage.setItem(memoKey, value);
  };

  const moveMonth = (amount: number) => {
    setBaseDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
    setSelectedDay(1);
  };

  return (
    <section className="space-y-4 pb-28">
      <button
        onClick={onBack}
        className="rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] px-5 py-3 text-sm font-black text-[#d8c08a]"
      >
        ‹ ホームに戻る
      </button>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#d8c08a]">Quest Calendar</p>
          <h2 className="mt-1 font-title text-3xl font-black leading-none">クエスト予定</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => moveMonth(-1)} className="rounded-xl border border-[#c9a86a]/15 bg-[#1f2937] px-3 py-2 font-black">‹</button>
          <button onClick={() => moveMonth(1)} className="rounded-xl border border-[#c9a86a]/15 bg-[#1f2937] px-3 py-2 font-black">›</button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-3 text-center">
        <p className="font-title text-xl font-black text-[#d8c08a]">{year}年 {month + 1}月</p>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black text-gray-400">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day} className="py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          const dayQuests = day ? questsByDay.get(day) || [] : [];
          const active = day === selectedDay;
          return (
            <button
              type="button"
              key={`${day || "blank"}-${index}`}
              disabled={!day}
              onClick={() => day && setSelectedDay(day)}
              className={`min-h-[48px] rounded-xl border p-1 text-left transition ${
                day
                  ? active
                    ? "border-[#6e8fb4] bg-[#12304c]"
                    : dayQuests.length
                      ? "border-[#6e8fb4]/45 bg-[#12304c]/55"
                      : "border-[#c9a86a]/10 bg-[#101827]"
                  : "border-transparent bg-transparent"
              }`}
            >
              {day && <p className="text-[11px] font-black text-[#d8c08a]">{day}</p>}
              {!!dayQuests.length && (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {dayQuests.slice(0, 3).map((quest) => (
                    <span key={quest.id} className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                  ))}
                  {dayQuests.length > 3 && <span className="text-[8px] leading-none text-sky-100">+{dayQuests.length - 3}</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-[#c9a86a]/10 bg-[#111827] p-4 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black text-[#d8c08a]">
            {selectedDay ? `${month + 1}/${selectedDay} の予定` : "日付を選択"}
          </p>
          <span className="text-xs font-bold text-gray-400">{selectedQuests.length}件</span>
        </div>

        <div className="mt-3 space-y-2">
          {selectedQuests.length === 0 && <p className="rounded-2xl bg-[#1f2937] p-3 text-sm text-gray-400">この日のクエストはありません</p>}
          {selectedQuests.map((quest) => (
            <div key={quest.id} className="rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{quest.title}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatDueAt(quest.due_at)} / {quest.points ?? 20}pt</p>
                </div>
                <span className="shrink-0 rounded-full border border-[#6e8fb4]/40 bg-[#355e8d]/20 px-2 py-1 text-[10px] font-bold text-blue-100">
                  {getQuestType(quest)}
                </span>
              </div>
              {quest.description && <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-300">{quest.description}</p>}
            </div>
          ))}
        </div>

        <label className="mt-4 block">
          <p className="text-xs font-black text-[#d8c08a]">メモ</p>
          <textarea
            value={memo}
            onChange={(e) => saveMemo(e.target.value)}
            placeholder="例：燃えるゴミ、資源ゴミ、買い足すものなど"
            className="mt-2 h-24 w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-3 text-[16px] outline-none"
          />
        </label>
      </div>
    </section>
  );
}

function Board({
  partnerQuests,
  myId,
  onAccept,
  onView,
  onEdit,
  onCancel,
}: {
  partnerQuests: Quest[];
  myId?: string;
  onAccept: (quest: Quest) => void;
  onView?: (quest: Quest) => void;
  onEdit?: (quest: Quest) => void;
  onCancel?: (quest: Quest) => void;
}) {
  const [selectedQuest, setSelectedQuest] = useState<BoardQuest | null>(null);
  const [sortType, setSortType] = useState<"priority" | "partner" | "due">("priority");

  const boardQuests = useMemo(() => {
    const quests: Quest[] = [...partnerQuests];

    return quests.sort((a, b) => {
      if (sortType === "partner") return Number(getQuestType(b) === "パートナー") - Number(getQuestType(a) === "パートナー");

      if (sortType === "due") {
        const aTime = a.due_at ? new Date(a.due_at).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.due_at ? new Date(b.due_at).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      }

      const score = (quest: BoardQuest) => {
        const type = getQuestType(quest);
        if (type === "緊急") return 0;
        if (type === "パートナー") return 1;
        return 2;
      };

      return score(a) - score(b);
    });
  }, [partnerQuests, sortType]);

  const openQuest = (quest: BoardQuest) => {
    setSelectedQuest(quest);
    onView?.(quest);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#d8c08a]">Guild Quest Board</p>
          <h2 className="mt-1 font-title text-3xl font-black leading-none">クエストボード</h2>
        </div>

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value as "priority" | "partner" | "due")}
          className="mb-1 w-[104px] rounded-xl border border-[#c9a86a]/15 bg-[#1f2937] px-2 py-2 text-[16px] font-bold outline-none"
        >
          <option value="priority">おすすめ</option>
          <option value="partner">依頼優先</option>
          <option value="due">日時順</option>
        </select>
      </div>

      <div className="space-y-2">
        {boardQuests.length === 0 && <EmptyCard text="受注できるクエストはありません" />}
        {boardQuests.map((quest) => (
          <BoardQuestCard
            key={quest.id}
            quest={quest}
            isMine={!!myId && quest.created_by === myId}
            onOpen={() => openQuest(quest)}
            onEdit={() => onEdit?.(quest)}
            onCancel={() => onCancel?.(quest)}
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

function HomeQuestCard({
  quest,
  statusText,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: {
  quest: Quest;
  statusText: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  return (
    <div className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-4 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-xl font-black">{quest.title}</h3>
            <span className="rounded-full border border-[#6e8fb4]/40 bg-[#355e8d]/20 px-2 py-1 text-[10px] font-bold text-blue-100">
              {statusText}
            </span>
          </div>

          {quest.description && <p className="mt-2 line-clamp-2 text-sm text-gray-400">{quest.description}</p>}

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-[#1f2937] px-3 py-1 text-[#d8c08a]">報酬：{quest.points ?? 20}pt</span>
            <span className="rounded-full bg-[#1f2937] px-3 py-1 text-[#d8c08a]">{formatDueAt(quest.due_at)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={onPrimary} className="rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-3 text-sm font-bold text-white">
          {primaryLabel}
        </button>
        <button onClick={onSecondary} className="rounded-2xl border border-red-400/30 bg-red-900/40 py-3 text-sm font-bold text-red-100">
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}

function BoardQuestCard({ quest, isMine, onOpen, onEdit, onCancel }: { quest: BoardQuest; isMine?: boolean; onOpen: () => void; onEdit?: () => void; onCancel?: () => void }) {
  const type = getQuestType(quest);
  const tone = getTone(type);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
      className={`w-full rounded-2xl border p-3 text-left shadow-lg ${tone.card}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-black">{quest.title}</h3>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${tone.badge}`}>{type}</span>
          </div>
          <p className="mt-1 truncate text-xs text-gray-400">希望：{formatDueAt(quest.due_at)} / 報酬：{quest.points ?? 20}pt</p>
        </div>

        {isMine ? (
          <div className="flex shrink-0 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="rounded-xl border border-[#6e8fb4]/50 bg-[#1f2937] px-3 py-2 text-xs font-black text-sky-100"
            >
              編集
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.();
              }}
              className="rounded-xl border border-red-300/25 bg-red-950/30 px-3 py-2 text-xs font-black text-red-100"
            >
              取下
            </button>
          </div>
        ) : (
          <span className="shrink-0 text-2xl font-black text-[#d8c08a]">›</span>
        )}
      </div>
    </div>
  );
}

function QuestDetailModal({ quest, onClose, onAccept }: { quest: BoardQuest; onClose: () => void; onAccept: () => void }) {
  const type = getQuestType(quest);
  const tone = getTone(type);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-[calc(env(safe-area-inset-top)+20px)] backdrop-blur-sm">
      <div className="my-auto w-full max-w-md max-h-[calc(100svh-56px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto rounded-3xl border border-[#c9a86a]/20 bg-[#111827] p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${tone.badge}`}>{type}</span>
            <h2 className="mt-3 break-words text-3xl font-black">{quest.title}</h2>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] text-gray-400">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <DetailBox label="依頼内容" value={quest.description || "内容なし"} />
          <DetailBox label="希望日時" value={formatDueAt(quest.due_at)} />
          <DetailBox label="報酬" value={`${quest.points ?? 20}pt`} />
        </div>

        <button onClick={onAccept} className={`mt-5 w-full rounded-2xl border py-4 text-sm font-black text-white ${tone.button}`}>
          クエスト受注
        </button>
      </div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4">
      <p className="text-xs font-bold text-[#d8c08a]">{label}</p>
      <p className="mt-2 text-base leading-7 text-gray-200">{value}</p>
    </div>
  );
}

function SectionTitle({ title, badge }: { title: string; badge?: number }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="font-title text-3xl font-black leading-none">{title}</h2>
      {!!badge && <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold">{badge}</div>}
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return <div className="rounded-3xl border border-[#c9a86a]/10 bg-[#111827] p-7 text-center text-gray-400">{text}</div>;
}

function getQuestType(quest: BoardQuest) {
  if (quest.category === "毎日") return "毎日";
  if (quest.is_urgent) return "緊急";
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
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}
