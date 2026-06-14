"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Quest } from "@/app/page";

type BoardQuest = Quest;
type HomeMode = "accepted" | "requested";

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
  const [detail, setDetail] = useState<{ quest: Quest; mode: HomeMode } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const calendarQuests = useMemo(
    () => [...acceptedQuests, ...myRequestQuests],
    [acceptedQuests, myRequestQuests]
  );

  useEffect(() => {
    setShowCalendar(false);
    setDetail(null);
  }, [resetKey]);

  if (showCalendar) {
    return <QuestCalendar quests={calendarQuests} onClose={() => setShowCalendar(false)} />;
  }

  return (
    <div className="space-y-5">
      <section className="flex items-end justify-between gap-3">
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
      </section>

      <section className="space-y-2">
        <SectionTitle title="受注中クエスト" badge={acceptedQuests.length} />
        {acceptedQuests.length === 0 && <EmptyCard text="受注中クエストはありません" />}
        {acceptedQuests.map((quest) => (
          <HomeQuestCard
            key={quest.id}
            quest={quest}
            statusText={getStatusText(quest.status)}
            mode="accepted"
            onOpen={() => setDetail({ quest, mode: "accepted" })}
            onEdit={() => onEdit(quest)}
            onCancel={() => onCancel(quest)}
          />
        ))}
      </section>

      <section className="space-y-2">
        <SectionTitle title="依頼中クエスト" badge={myRequestQuests.length} />
        {myRequestQuests.length === 0 && <EmptyCard text="依頼中クエストはありません" />}
        {myRequestQuests.map((quest) => (
          <HomeQuestCard
            key={quest.id}
            quest={quest}
            statusText={getStatusText(quest.status)}
            mode="requested"
            onOpen={() => setDetail({ quest, mode: "requested" })}
            onEdit={() => onEdit(quest)}
            onCancel={() => onCancel(quest)}
          />
        ))}
      </section>

      {mounted &&
        detail &&
        createPortal(
          <HomeQuestDetailModal
            quest={detail.quest}
            mode={detail.mode}
            onClose={() => setDetail(null)}
            onReport={() => {
              setDetail(null);
              onReport(detail.quest);
            }}
            onApprove={() => {
              setDetail(null);
              onApprove(detail.quest);
            }}
          />,
          document.body
        )}
    </div>
  );
}

function QuestCalendar({ quests, onClose }: { quests: Quest[]; onClose: () => void }) {
  const [baseDate, setBaseDate] = useState(() => new Date());
  const [detailDay, setDetailDay] = useState<number | null>(null);

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = Array.from({ length: startDay + daysInMonth }, (_, index) =>
    index < startDay ? null : index - startDay + 1
  );
  while (cells.length < 35) cells.push(null);
  if (cells.length > 35) while (cells.length < 42) cells.push(null);

  const questsByDay = useMemo(() => {
    const map = new Map<number, Quest[]>();
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayQuests = quests.filter((quest) => isQuestScheduledOnDay(quest, year, month, day));
      if (dayQuests.length) map.set(day, dayQuests);
    }
    return map;
  }, [quests, year, month, daysInMonth]);

  const moveMonth = (amount: number) => {
    setBaseDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
    setDetailDay(null);
  };

  if (detailDay) {
    return (
      <CalendarDayDetail
        year={year}
        month={month}
        day={detailDay}
        quests={questsByDay.get(detailDay) || []}
        onClose={() => setDetailDay(null)}
      />
    );
  }

  return (
    <section className="flex min-h-[calc(100svh-190px)] flex-col gap-3 pb-24">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#d8c08a]">Quest Calendar</p>
          <h2 className="mt-1 font-title text-[26px] font-black leading-none tracking-tight">スケジュール</h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-1">
            <button onClick={() => moveMonth(-1)} className="grid h-9 w-9 place-items-center rounded-xl border border-[#c9a86a]/10 bg-[#111827] text-lg font-black">‹</button>
            <p className="w-16 text-center font-title text-base font-black text-[#d8c08a]">{String(year).slice(2)}/{month + 1}</p>
            <button onClick={() => moveMonth(1)} className="grid h-9 w-9 place-items-center rounded-xl border border-[#c9a86a]/10 bg-[#111827] text-lg font-black">›</button>
          </div>
          <button
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] text-xl font-black text-[#d8c08a]"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-black text-gray-400">
        {["月", "火", "水", "木", "金", "土", "日"].map((day) => (
          <div key={day} className="py-1">{day}</div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 gap-1.5">
        {cells.map((day, index) => {
          const dayQuests = day ? questsByDay.get(day) || [] : [];
          const hasQuests = dayQuests.length > 0;
          const today = new Date();
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <button
              type="button"
              key={`${day || "blank"}-${index}`}
              disabled={!day}
              onClick={() => day && setDetailDay(day)}
              className={`min-h-[92px] rounded-xl border p-2 text-left transition active:scale-[0.98] ${
                day
                  ? hasQuests
                    ? "border-[#6e8fb4]/60 bg-[#12304c]/70"
                    : isToday
                    ? "border-[#6e8fb4]/55 bg-[#12304c]/35"
                    : "border-[#c9a86a]/10 bg-[#101827]"
                  : "border-transparent bg-transparent"
              }`}
            >
              {day && <p className="text-left text-[13px] font-black leading-none text-[#d8c08a]">{day}</p>}
              <div className="mt-2 space-y-0.5">
                {dayQuests.slice(0, 2).map((quest) => (
                  <p key={quest.id} className="truncate rounded bg-[#6e8fb4]/25 px-1 py-0.5 text-[8px] font-bold leading-tight text-sky-100">
                    {quest.title}
                  </p>
                ))}
                {dayQuests.length > 2 && <p className="text-[8px] font-black text-sky-200">+{dayQuests.length - 2}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CalendarDayDetail({
  year,
  month,
  day,
  quests,
  onClose,
}: {
  year: number;
  month: number;
  day: number;
  quests: Quest[];
  onClose: () => void;
}) {
  const memoKey = `kaji-calendar-memo-${year}-${month + 1}-${day}`;
  const [memo, setMemo] = useState("");

  useEffect(() => {
    setMemo(window.localStorage.getItem(memoKey) || "");
  }, [memoKey]);

  const saveMemo = (value: string) => {
    setMemo(value);
    window.localStorage.setItem(memoKey, value);
  };

  return (
    <section className="relative space-y-4 pb-28">
      <button
        onClick={onClose}
        className="absolute right-0 top-0 grid h-11 w-11 place-items-center rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] text-xl font-black text-[#d8c08a]"
        aria-label="カレンダーに戻る"
      >
        ×
      </button>

      <div className="pr-14">
        <p className="text-sm font-bold text-[#d8c08a]">Quest Schedule</p>
        <h2 className="mt-1 font-title text-3xl font-black leading-none">{month + 1}/{day} の予定</h2>
      </div>

      <div className="space-y-2">
        {quests.length === 0 && <EmptyCard text="この日のクエストはありません" />}
        {quests.map((quest) => (
          <div key={quest.id} className="rounded-2xl border border-[#c9a86a]/10 bg-[#111827] p-4 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-black">{quest.title}</h3>
                <p className="mt-1 text-xs text-gray-400">{getScheduleLabel(quest)} / {quest.points ?? 20}pt</p>
              </div>
              <span className="shrink-0 rounded-full border border-[#6e8fb4]/40 bg-[#355e8d]/20 px-2 py-1 text-[10px] font-bold text-blue-100">
                {getQuestType(quest)}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-[#1f2937] p-3 text-sm leading-6 text-gray-300">
              {stripSchedulePrefix(quest.description || "内容なし")}
            </p>
          </div>
        ))}
      </div>

      <label className="block rounded-3xl border border-[#c9a86a]/10 bg-[#111827] p-4 shadow-xl">
        <p className="text-sm font-black text-[#d8c08a]">メモ</p>
        <textarea
          value={memo}
          onChange={(e) => saveMemo(e.target.value)}
          placeholder="例：燃えるゴミ、資源ゴミ、買い足すものなど"
          className="mt-3 h-32 w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-3 text-[16px] outline-none"
        />
      </label>
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const boardQuests = useMemo(() => {
    const list: Quest[] = [...partnerQuests];
    return list.sort((a, b) => {
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
          <option value="due">期限順</option>
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

      {mounted && selectedQuest && createPortal(
        <QuestDetailModal
          quest={selectedQuest}
          onClose={() => setSelectedQuest(null)}
          onAccept={() => {
            onAccept(selectedQuest);
            setSelectedQuest(null);
          }}
        />,
        document.body
      )}
    </section>
  );
}

function HomeQuestCard({
  quest,
  statusText,
  mode,
  onOpen,
  onEdit,
  onCancel,
}: {
  quest: Quest;
  statusText: string;
  mode: HomeMode;
  onOpen: () => void;
  onEdit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-[#c9a86a]/15 bg-[#111827] p-3 shadow-lg">
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left active:scale-[0.99]">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base font-black">{quest.title}</h3>
          <span className="shrink-0 rounded-full border border-[#6e8fb4]/40 bg-[#355e8d]/20 px-2 py-0.5 text-[10px] font-bold text-blue-100">
            {statusText}
          </span>
        </div>
        <div className="mt-1 flex min-w-0 items-center gap-2 text-[12px] text-gray-400">
          <span className="truncate">{getScheduleLabel(quest)}</span>
          <span className="shrink-0 rounded-full bg-[#1f2937] px-2 py-0.5 text-[#d8c08a]">{quest.points ?? 20}pt</span>
        </div>
      </button>

      <div className="flex shrink-0 flex-col gap-1">
        <button onClick={onEdit} className="rounded-lg border border-[#6e8fb4]/50 bg-[#1f2937] px-2.5 py-1.5 text-[11px] font-black text-sky-100">
          編集
        </button>
        <button onClick={onCancel} className="rounded-lg border border-red-300/25 bg-red-950/30 px-2.5 py-1.5 text-[11px] font-black text-red-100">
          {mode === "accepted" ? "辞退" : "取下"}
        </button>
      </div>
    </div>
  );
}

function BoardQuestCard({ quest, isMine, onOpen, onEdit, onCancel }: { quest: BoardQuest; isMine?: boolean; onOpen: () => void; onEdit?: () => void; onCancel?: () => void }) {
  const type = getQuestType(quest);
  const tone = getTone(type);

  return (
    <div className={`flex w-full items-center gap-2 rounded-2xl border p-3 shadow-lg ${tone.card}`}>
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left active:scale-[0.99]">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base font-black">{quest.title}</h3>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${tone.badge}`}>{type}</span>
        </div>
        <p className="mt-1 truncate text-[12px] text-gray-400">{getScheduleLabel(quest)} / {quest.points ?? 20}pt</p>
      </button>

      {isMine && (
        <div className="flex shrink-0 flex-col gap-1">
          <button onClick={onEdit} className="rounded-lg border border-[#6e8fb4]/50 bg-[#1f2937] px-2.5 py-1.5 text-[11px] font-black text-sky-100">
            編集
          </button>
          <button onClick={onCancel} className="rounded-lg border border-red-300/25 bg-red-950/30 px-2.5 py-1.5 text-[11px] font-black text-red-100">
            取下
          </button>
        </div>
      )}
      <span className="shrink-0 text-2xl font-black text-[#d8c08a]">›</span>
    </div>
  );
}

function HomeQuestDetailModal({
  quest,
  mode,
  onClose,
  onReport,
  onApprove,
}: {
  quest: Quest;
  mode: HomeMode;
  onClose: () => void;
  onReport: () => void;
  onApprove: () => void;
}) {
  const canApprove = mode === "requested" && quest.status === "waiting_confirm";
  const canReport = mode === "accepted" && quest.status === "accepted";

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[calc(100svh-48px)] w-full max-w-md overflow-y-auto rounded-3xl border border-[#c9a86a]/20 bg-[#111827] p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex rounded-full border border-[#6e8fb4]/40 bg-[#355e8d]/20 px-3 py-1 text-xs font-bold text-blue-100">{getStatusText(quest.status)}</span>
            <h2 className="mt-3 break-words text-2xl font-black">{quest.title}</h2>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] text-gray-400">✕</button>
        </div>

        <div className="space-y-3">
          <DetailBox label="進行状況" value={getStatusText(quest.status)} />
          <DetailBox label="依頼内容" value={stripSchedulePrefix(quest.description || "内容なし")} />
          <DetailBox label="期限" value={getScheduleLabel(quest)} />
          <DetailBox label="報酬" value={`${quest.points ?? 20}pt`} />
          {canApprove && <DetailBox label="完了報告" value="相手から完了報告が届いています。内容を確認して問題なければ承認してください。" />}
        </div>

        {canReport && (
          <button onClick={onReport} className="mt-5 w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-4 text-sm font-black text-white">
            完了報告へ
          </button>
        )}
        {canApprove && (
          <button onClick={onApprove} className="mt-5 w-full rounded-2xl border border-emerald-300/50 bg-emerald-800 py-4 text-sm font-black text-white">
            達成を確認する
          </button>
        )}
      </div>
    </div>
  );
}

function QuestDetailModal({ quest, onClose, onAccept }: { quest: BoardQuest; onClose: () => void; onAccept: () => void }) {
  const type = getQuestType(quest);
  const tone = getTone(type);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[calc(100svh-48px)] w-full max-w-md overflow-y-auto rounded-3xl border border-[#c9a86a]/20 bg-[#111827] p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${tone.badge}`}>{type}</span>
            <h2 className="mt-3 break-words text-2xl font-black">{quest.title}</h2>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] text-gray-400">✕</button>
        </div>

        <div className="space-y-3">
          <DetailBox label="依頼内容" value={stripSchedulePrefix(quest.description || "内容なし")} />
          <DetailBox label="期限" value={getScheduleLabel(quest)} />
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
      <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-gray-200">{value}</p>
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
  return <div className="rounded-2xl border border-[#c9a86a]/10 bg-[#111827] p-5 text-center text-sm text-gray-400">{text}</div>;
}

function getQuestType(quest: BoardQuest) {
  if (quest.category === "毎日") return "毎日";
  if (quest.is_urgent) return "緊急";
  return "パートナー";
}

function getTone(type: string) {
  if (type === "緊急") {
    return { card: "border-red-400/30 bg-gradient-to-br from-[#2a1115] to-[#111827]", badge: "border-red-300/40 bg-red-500/20 text-red-100", button: "border-red-300/50 bg-red-700" };
  }
  if (type === "パートナー") {
    return { card: "border-emerald-300/25 bg-gradient-to-br from-[#0d221a] to-[#111827]", badge: "border-emerald-300/40 bg-emerald-500/15 text-emerald-100", button: "border-emerald-300/40 bg-emerald-800" };
  }
  return { card: "border-[#6e8fb4]/30 bg-gradient-to-br from-[#0b1c33] to-[#111827]", badge: "border-[#6e8fb4]/50 bg-[#355e8d]/30 text-blue-100", button: "border-[#6e8fb4] bg-[#355e8d]" };
}

function getStatusText(status: string) {
  if (status === "recruiting") return "未受注";
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

function getScheduleLabel(quest: Quest) {
  const parsed = parseSchedulePrefix(quest.description || "");
  if (parsed) return parsed.label;
  return `期限：${formatDueAt(quest.due_at)}`;
}

function stripSchedulePrefix(description: string) {
  return description.replace(/^【[^】]+】\s*/, "").trim() || "内容なし";
}

const weekdayMap: Record<string, number> = {
  日: 0,
  日曜: 0,
  日曜日: 0,
  月: 1,
  月曜: 1,
  月曜日: 1,
  火: 2,
  火曜: 2,
  火曜日: 2,
  水: 3,
  水曜: 3,
  水曜日: 3,
  木: 4,
  木曜: 4,
  木曜日: 4,
  金: 5,
  金曜: 5,
  金曜日: 5,
  土: 6,
  土曜: 6,
  土曜日: 6,
};

function parseSchedulePrefix(description: string) {
  const match = description.match(/^【([^】]+)】/);
  if (!match) return null;
  const text = match[1];
  const weekly = text.match(/^毎週(.+?)(?:\s+(\d{1,2}:\d{2}))?$/);
  if (weekly) {
    const dayText = weekly[1];
    const weekday = weekdayMap[dayText];
    return { kind: "weekly" as const, weekday, time: weekly[2] || "", label: `毎週${dayText}${weekly[2] ? ` ${weekly[2]}` : ""}` };
  }
  const daily = text.match(/^毎日(?:\s+(\d{1,2}:\d{2}))?$/);
  if (daily) return { kind: "daily" as const, time: daily[1] || "", label: `毎日${daily[1] ? ` ${daily[1]}` : ""}` };
  if (text === "いつでも") return { kind: "anytime" as const, time: "", label: "いつでも" };
  return null;
}

function isQuestScheduledOnDay(quest: Quest, year: number, month: number, day: number) {
  const schedule = parseSchedulePrefix(quest.description || "");
  const date = new Date(year, month, day);

  if (schedule?.kind === "weekly" && typeof schedule.weekday === "number") {
    return date.getDay() === schedule.weekday;
  }

  if (schedule?.kind === "daily") return true;

  if (!quest.due_at) return false;
  const due = new Date(quest.due_at);
  if (Number.isNaN(due.getTime())) return false;
  return due.getFullYear() === year && due.getMonth() === month && due.getDate() === day;
}
