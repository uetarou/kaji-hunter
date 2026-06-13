"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DailyQuestIcon } from "@/components/icons/DailyQuestIcon";
import { NormalQuestIcon } from "@/components/icons/NormalQuestIcon";
import { UrgentQuestIcon } from "@/components/icons/UrgentQuestIcon";

type RequestType = "normal" | "urgent" | "daily";

type CreateQuestInput = {
  title: string;
  description: string;
  reward?: string;
  points: number;
  dueAt: string | null;
  isUrgent: boolean;
};

type Props = {
  onCreate: (quest: CreateQuestInput) => void;
  onModalOpenChange?: (open: boolean) => void;
};

export function RequestForm({ onCreate, onModalOpenChange }: Props) {
  const [modalType, setModalType] = useState<RequestType | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    onModalOpenChange?.(modalType !== null);
  }, [modalType, onModalOpenChange]);

  return (
    <section className="space-y-5">
      <div className="px-1">
        <p className="text-sm font-bold text-[#d8c08a]">Guild Request Counter</p>
        <h2 className="mt-1 font-title text-3xl font-black">クエスト依頼</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <RequestTypeButton
          title="通常依頼"
          label="NORMAL QUEST"
          tone="normal"
          onClick={() => setModalType("normal")}
        />

        <RequestTypeButton
          title="緊急依頼"
          label="URGENT QUEST"
          tone="urgent"
          onClick={() => setModalType("urgent")}
        />

        <RequestTypeButton
          title="毎日依頼"
          label="DAILY QUEST"
          tone="daily"
          onClick={() => setModalType("daily")}
        />
      </div>

      {mounted &&
        modalType &&
        createPortal(
          <RequestModal
            type={modalType}
            onClose={() => setModalType(null)}
            onCreate={(quest) => {
              onCreate(quest);
              setModalType(null);
            }}
          />,
          document.body
        )}
    </section>
  );
}

function RequestTypeButton({
  title,
  label,
  tone,
  onClick,
}: {
  title: string;
  label: string;
  tone: RequestType;
  onClick: () => void;
}) {
  const style = getToneStyle(tone);

  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-3xl border p-5 text-left shadow-xl transition active:scale-[0.99] ${style.card}`}
    >
      <div className="pointer-events-none absolute inset-1 rounded-[20px] border border-white/5" />
      <div className={`relative grid h-[74px] w-[74px] shrink-0 place-items-center rounded-2xl border bg-[#07111f]/55 shadow-inner ${style.iconBox}`}>
        {tone === "normal" && <NormalQuestIcon className="h-14 w-14" />}
        {tone === "urgent" && <UrgentQuestIcon className="h-14 w-14" />}
        {tone === "daily" && <DailyQuestIcon className="h-14 w-14" />}
      </div>

      <div className="relative min-w-0 flex-1">
        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black tracking-wide ${style.badge}`}>
          {label}
        </span>
        <h3 className="mt-3 font-title text-3xl font-black leading-none text-white">{title}</h3>
      </div>

      <span className="relative text-3xl text-[#d8c08a]">›</span>
    </button>
  );
}

function RequestModal({
  type,
  onClose,
  onCreate,
}: {
  type: RequestType;
  onClose: () => void;
  onCreate: (quest: CreateQuestInput) => void;
}) {
  const isUrgent = type === "urgent";
  const isDaily = type === "daily";
  const minPoint = isUrgent ? 50 : isDaily ? 20 : 20;
  const maxPoint = isUrgent ? 100 : isDaily ? 50 : 50;
  const fixedDailyPoint = 20;
  const style = getToneStyle(type);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [points, setPoints] = useState(isDaily ? fixedDailyPoint : minPoint);

  const submit = () => {
    if (!title.trim()) return;

    const safePoints = isDaily ? fixedDailyPoint : Math.min(Math.max(points, minPoint), maxPoint);
    const dueAt =
      dueDate && dueTime ? new Date(`${dueDate}T${dueTime}`).toISOString() : null;

    onCreate({
      title,
      description,
      reward: String(safePoints),
      points: safePoints,
      dueAt,
      isUrgent,
    });
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/75 backdrop-blur-sm">
      <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col px-2 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-[calc(env(safe-area-inset-top)+18px)]">
        <div
          className={`relative flex max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-36px)] min-h-0 flex-col overflow-hidden rounded-[28px] border bg-gradient-to-b from-[#111827] via-[#0b1425] to-[#07111f] shadow-[0_0_50px_rgba(0,0,0,0.8)] ${style.modalBorder}`}
        >
          <div className={`shrink-0 border-b border-[#c9a86a]/15 px-5 pb-3 pt-4 ${style.modalHead}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border bg-[#07111f]/45 ${style.iconBox}`}>
                  {type === "normal" && <NormalQuestIcon className="h-10 w-10" />}
                  {type === "urgent" && <UrgentQuestIcon className="h-10 w-10" />}
                  {type === "daily" && <DailyQuestIcon className="h-10 w-10" />}
                </div>
                <div className="min-w-0">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black tracking-wide ${style.badge}`}>
                    {isUrgent ? "URGENT QUEST" : isDaily ? "DAILY QUEST" : "NORMAL QUEST"}
                  </span>
                  <h2 className="mt-2 font-title text-3xl font-black leading-none">
                    {isUrgent ? "緊急依頼" : isDaily ? "毎日依頼" : "通常依頼"}
                  </h2>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] text-2xl text-gray-400 shadow-lg"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3">
            <div className="space-y-3">
              <InputBlock label="クエスト名">
                <input
                  placeholder={isDaily ? "例：ゴミ出し" : "例：お風呂掃除"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-4 py-3 text-sm outline-none"
                />
              </InputBlock>

              <InputBlock label="依頼内容">
                <textarea
                  placeholder={isDaily ? "例：燃えるゴミを出してください" : "例：浴槽と排水口までお願い！"}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-20 w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-4 py-3 text-sm outline-none"
                />
              </InputBlock>

              <div className="grid grid-cols-2 gap-3">
                {!isDaily && (
                  <InputBlock label="希望日">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="min-w-0 w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-3 py-3 text-sm outline-none"
                    />
                  </InputBlock>
                )}

                <InputBlock label="希望時間">
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="min-w-0 w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-3 py-3 text-sm outline-none"
                  />
                </InputBlock>
              </div>

              <InputBlock label={isDaily ? "報酬ポイント（固定）" : `報酬ポイント（${minPoint}〜${maxPoint}pt）`}>
                <div className="rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-400">報酬</span>
                    <span className={`text-2xl font-black ${style.pointText}`}>{isDaily ? fixedDailyPoint : points} pt</span>
                  </div>

                  <input
                    type="range"
                    min={minPoint}
                    max={maxPoint}
                    step={5}
                    value={isDaily ? fixedDailyPoint : points}
                    disabled={isDaily}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full disabled:opacity-60"
                  />
                </div>
              </InputBlock>
            </div>
          </div>

          <div className="shrink-0 border-t border-[#c9a86a]/15 bg-[#07111f]/90 px-5 pb-4 pt-3">
            <button
              onClick={submit}
              className={`relative w-full overflow-hidden rounded-2xl border py-4 text-base font-black text-white shadow-2xl ${style.button}`}
            >
              <span className="absolute inset-x-4 top-1 h-px bg-white/40" />
              {isUrgent ? "緊急クエストを依頼する" : isDaily ? "毎日クエストを設定する" : "ギルドに依頼する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getToneStyle(tone: RequestType) {
  if (tone === "urgent") {
    return {
      card: "border-red-300/30 bg-gradient-to-br from-[#2b1113] via-[#151520] to-[#07111f] text-red-100",
      badge: "border-red-300/45 bg-red-500/20 text-red-100",
      iconBox: "border-red-300/35 text-red-200",
      modalBorder: "border-red-300/35",
      modalHead: "bg-red-950/15",
      pointText: "text-red-200",
      button: "border-red-300/60 bg-gradient-to-r from-red-950 via-red-800 to-red-950",
    };
  }

  if (tone === "daily") {
    return {
      card: "border-sky-300/30 bg-gradient-to-br from-[#0b2433] via-[#111827] to-[#07111f] text-sky-100",
      badge: "border-sky-300/45 bg-sky-500/20 text-sky-100",
      iconBox: "border-sky-300/35 text-sky-200",
      modalBorder: "border-sky-300/35",
      modalHead: "bg-sky-950/15",
      pointText: "text-sky-200",
      button: "border-sky-300/60 bg-gradient-to-r from-sky-950 via-sky-800 to-sky-950",
    };
  }

  return {
    card: "border-emerald-300/30 bg-gradient-to-br from-[#0d261c] via-[#111827] to-[#07111f] text-emerald-100",
    badge: "border-emerald-300/45 bg-emerald-500/15 text-emerald-100",
    iconBox: "border-emerald-300/35 text-emerald-200",
    modalBorder: "border-[#c9a86a]/35",
    modalHead: "bg-emerald-950/10",
    pointText: "text-[#d8c08a]",
    button: "border-emerald-300/60 bg-gradient-to-r from-[#0f3b2c] via-[#17704f] to-[#0f3b2c]",
  };
}

function InputBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <p className="mb-1 text-xs font-black text-[#d8c08a]">{label}</p>
      {children}
    </label>
  );
}
