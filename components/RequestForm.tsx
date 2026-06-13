"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type CreateQuestInput = {
  title: string;
  description: string;
  points: number;
  reward?: string;
  dueAt: string | null;
  isUrgent: boolean;
  questType?: "normal" | "urgent" | "daily";
};

type Props = {
  onCreate: (quest: CreateQuestInput) => void;
  onModalOpenChange?: (open: boolean) => void;
};

type ModalType = "normal" | "urgent" | "daily";

const QUEST_CONFIG = {
  normal: { title: "通常依頼", label: "NORMAL QUEST", min: 20, max: 50, step: 5 },
  urgent: { title: "緊急依頼", label: "URGENT QUEST", min: 50, max: 100, step: 5 },
  daily: { title: "毎日依頼", label: "DAILY QUEST", min: 20, max: 50, step: 5 },
} as const;

export function RequestForm({ onCreate, onModalOpenChange }: Props) {
  const [modalType, setModalType] = useState<ModalType | null>(null);
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
        <RequestTypeButton title="通常依頼" label="NORMAL QUEST" tone="normal" onClick={() => setModalType("normal")} />
        <RequestTypeButton title="緊急依頼" label="URGENT QUEST" tone="urgent" onClick={() => setModalType("urgent")} />
        <RequestTypeButton title="毎日依頼" label="DAILY QUEST" tone="daily" onClick={() => setModalType("daily")} />
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
  tone: ModalType;
  onClick: () => void;
}) {
  const styles = {
    normal: "border-emerald-300/30 bg-gradient-to-br from-[#0d261c] to-[#111827]",
    urgent: "border-red-300/30 bg-gradient-to-br from-[#2a1115] to-[#111827]",
    daily: "border-sky-300/30 bg-gradient-to-br from-[#0c2235] to-[#111827]",
  } as const;

  const labelStyles = {
    normal: "border-emerald-300/40 bg-emerald-500/15 text-emerald-100",
    urgent: "border-red-300/40 bg-red-500/20 text-red-100",
    daily: "border-sky-300/40 bg-sky-500/20 text-sky-100",
  } as const;

  return (
    <button onClick={onClick} className={`rounded-3xl border p-5 text-left shadow-xl ${styles[tone]}`}>
      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${labelStyles[tone]}`}>
        {label}
      </span>
      <h3 className="mt-3 font-title text-2xl font-black">{title}</h3>
    </button>
  );
}

function RequestModal({
  type,
  onClose,
  onCreate,
}: {
  type: ModalType;
  onClose: () => void;
  onCreate: (quest: CreateQuestInput) => void;
}) {
  const config = QUEST_CONFIG[type];
  const isUrgent = type === "urgent";
  const isDaily = type === "daily";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [points, setPoints] = useState<number>(config.min);

  useEffect(() => {
    setPoints(config.min);
  }, [config.min, type]);

  const submit = () => {
    if (!title.trim()) return;

    const safePoints = Math.min(Math.max(points, config.min), config.max);
    const dueAt = dueDate && dueTime ? new Date(`${dueDate}T${dueTime}`).toISOString() : null;

    onCreate({
      title,
      description,
      points: safePoints,
      reward: `${safePoints}pt`,
      dueAt,
      isUrgent,
      questType: type,
    });
  };

  const borderTone = isUrgent ? "border-red-300/35" : isDaily ? "border-sky-300/35" : "border-[#c9a86a]/35";

  const labelTone = isUrgent
    ? "border-red-300/50 bg-red-500/20 text-red-100"
    : isDaily
    ? "border-sky-300/50 bg-sky-500/20 text-sky-100"
    : "border-emerald-300/50 bg-emerald-500/15 text-emerald-100";

  const buttonTone = isUrgent
    ? "border-red-300/60 bg-gradient-to-r from-red-900 to-red-700"
    : isDaily
    ? "border-sky-300/60 bg-gradient-to-r from-[#0c4a6e] via-[#0369a1] to-[#0c4a6e]"
    : "border-emerald-300/60 bg-gradient-to-r from-[#0f3b2c] via-[#17704f] to-[#0f3b2c]";

  return (
    <div className="fixed inset-0 z-[999] bg-black/75 backdrop-blur-sm">
      <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col px-2 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-[calc(env(safe-area-inset-top)+16px)]">
        <div
          className={`relative flex max-h-[calc(100dvh-32px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] min-h-0 flex-col overflow-hidden rounded-[28px] border bg-gradient-to-b from-[#111827] via-[#0b1425] to-[#07111f] shadow-[0_0_50px_rgba(0,0,0,0.8)] ${borderTone}`}
        >
          <div className="shrink-0 border-b border-[#c9a86a]/15 px-5 pb-3 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black tracking-wide ${labelTone}`}>
                  {config.label}
                </span>
                <h2 className="mt-2 font-title text-3xl font-black leading-none">{config.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] text-2xl text-gray-400 shadow-lg"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3">
            <div className="space-y-2.5">
              <InputBlock label="クエスト名">
                <input
                  placeholder={isDaily ? "例：ゴミ出し" : "例：お風呂掃除"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-4 py-2.5 text-sm outline-none"
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
                      className="min-w-0 w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-3 py-2.5 text-sm outline-none"
                    />
                  </InputBlock>
                )}

                <InputBlock label="希望時間">
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="min-w-0 w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-3 py-2.5 text-sm outline-none"
                  />
                </InputBlock>
              </div>

              <InputBlock label={`報酬ポイント（${config.min}〜${config.max}pt）`}>
                <div className="rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">報酬</span>
                    <span className={`text-2xl font-black ${isDaily ? "text-sky-200" : "text-[#d8c08a]"}`}>
                      {points} pt
                    </span>
                  </div>
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </InputBlock>

              <p className="pt-0.5 text-center text-[11px] text-gray-400">
                ※ 承認されたら受注者にポイントが付与されます
              </p>
            </div>
          </div>

          <div className="shrink-0 border-t border-[#c9a86a]/15 bg-[#07111f]/90 px-5 pb-4 pt-3">
            <button
              onClick={submit}
              className={`relative w-full overflow-hidden rounded-2xl border py-3.5 text-base font-black text-white shadow-2xl ${buttonTone}`}
            >
              <span className="absolute inset-x-4 top-1 h-px bg-white/40" />
              {isUrgent ? "緊急クエストを依頼する" : isDaily ? "毎日クエストを依頼する" : "ギルドに依頼する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <p className="mb-1 text-xs font-black text-[#d8c08a]">{label}</p>
      {children}
    </label>
  );
}