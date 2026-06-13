"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type QuestType = "normal" | "urgent" | "daily";

type CreateQuestInput = {
  title: string;
  description: string;
  points: number;
  reward?: string;
  dueAt: string | null;
  isUrgent: boolean;
  category?: string;
};

type Props = {
  onCreate: (quest: CreateQuestInput) => void;
  onModalOpenChange?: (open: boolean) => void;
};

export function RequestForm({ onCreate, onModalOpenChange }: Props) {
  const [modalType, setModalType] = useState<QuestType | null>(null);
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
  tone: QuestType;
  onClick: () => void;
}) {
  const style =
    tone === "urgent"
      ? "border-red-300/30 bg-gradient-to-br from-[#321117] via-[#1a1423] to-[#111827]"
      : tone === "daily"
      ? "border-sky-300/30 bg-gradient-to-br from-[#0d2538] via-[#0c1b2e] to-[#111827]"
      : "border-emerald-300/30 bg-gradient-to-br from-[#0d261c] via-[#0d1d23] to-[#111827]";

  const badge =
    tone === "urgent"
      ? "border-red-300/40 bg-red-500/20 text-red-100"
      : tone === "daily"
      ? "border-sky-300/40 bg-sky-500/20 text-sky-100"
      : "border-emerald-300/40 bg-emerald-500/15 text-emerald-100";

  return (
    <button onClick={onClick} className={`relative overflow-hidden rounded-3xl border p-5 text-left shadow-xl ${style}`}>
      <span className="pointer-events-none absolute inset-1 rounded-[20px] border border-white/5" />
      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black tracking-wide ${badge}`}>
        {label}
      </span>
      <div className="mt-3 flex items-center justify-between gap-3">
        <h3 className="font-title text-3xl font-black leading-none">{title}</h3>
        <span className="text-3xl text-[#d8c08a]">›</span>
      </div>
    </button>
  );
}

function RequestModal({
  type,
  onClose,
  onCreate,
}: {
  type: QuestType;
  onClose: () => void;
  onCreate: (quest: CreateQuestInput) => void;
}) {
  const isUrgent = type === "urgent";
  const isDaily = type === "daily";
  const minPoint = isUrgent ? 50 : 20;
  const maxPoint = isUrgent ? 100 : isDaily ? 20 : 50;

  const [title, setTitle] = useState(isDaily ? "ゴミ出し" : "");
  const [description, setDescription] = useState(isDaily ? "燃えるゴミを出してください" : "");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [points, setPoints] = useState(minPoint);

  const submit = () => {
    if (!title.trim()) return;

    const safePoints = isDaily ? 20 : Math.min(Math.max(points, minPoint), maxPoint);
    const dueAt = dueDate && dueTime ? new Date(`${dueDate}T${dueTime}`).toISOString() : null;

    onCreate({
      title,
      description,
      points: safePoints,
      reward: `${safePoints}pt`,
      dueAt,
      isUrgent,
      category: isDaily ? "毎日" : "依頼",
    });
  };

  const tone = isUrgent ? "red" : isDaily ? "sky" : "emerald";
  const titleText = isUrgent ? "緊急依頼" : isDaily ? "毎日依頼" : "通常依頼";
  const labelText = isUrgent ? "URGENT QUEST" : isDaily ? "DAILY QUEST" : "NORMAL QUEST";

  const borderClass = tone === "red" ? "border-red-300/40" : tone === "sky" ? "border-sky-300/40" : "border-[#c9a86a]/35";
  const badgeClass = tone === "red" ? "border-red-300/50 bg-red-500/20 text-red-100" : tone === "sky" ? "border-sky-300/50 bg-sky-500/20 text-sky-100" : "border-emerald-300/50 bg-emerald-500/15 text-emerald-100";
  const buttonClass = tone === "red" ? "border-red-300/60 bg-gradient-to-r from-red-950 via-red-800 to-red-950" : tone === "sky" ? "border-sky-300/60 bg-gradient-to-r from-sky-950 via-sky-800 to-sky-950" : "border-emerald-300/60 bg-gradient-to-r from-[#0f3b2c] via-[#17704f] to-[#0f3b2c]";

  return (
    <div className="fixed inset-0 z-[999] bg-black/78 backdrop-blur-sm">
      <div className="mx-auto flex h-[100dvh] w-full max-w-md items-start px-2 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-[calc(env(safe-area-inset-top)+34px)]">
        <div className={`relative flex max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-48px)] w-full flex-col overflow-hidden rounded-[28px] border bg-gradient-to-b from-[#111827] via-[#0b1425] to-[#07111f] shadow-[0_0_50px_rgba(0,0,0,0.8)] ${borderClass}`}>
          <div className="shrink-0 border-b border-[#c9a86a]/15 px-5 pb-3 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black tracking-wide ${badgeClass}`}>{labelText}</span>
                <h2 className="mt-2 font-title text-[34px] font-black leading-none">{titleText}</h2>
              </div>

              <button onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937] text-2xl text-gray-400 shadow-lg">✕</button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3">
            <div className="space-y-2.5">
              <InputBlock label="クエスト名">
                <input placeholder="例：お風呂掃除" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-4 py-2.5 text-sm outline-none" />
              </InputBlock>

              <InputBlock label="依頼内容">
                <textarea placeholder="例：浴槽と排水口までお願い！" value={description} onChange={(e) => setDescription(e.target.value)} className="h-20 w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-4 py-2.5 text-sm outline-none" />
              </InputBlock>

              <div className="grid grid-cols-2 gap-2.5">
                <InputBlock label="希望日">
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="min-w-0 w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-3 py-2.5 text-xs outline-none" />
                </InputBlock>
                <InputBlock label="希望時間">
                  <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className="min-w-0 w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-3 py-2.5 text-xs outline-none" />
                </InputBlock>
              </div>

              <InputBlock label={isDaily ? "報酬ポイント（毎日依頼は20pt）" : `報酬ポイント（${minPoint}〜${maxPoint}pt）`}>
                <div className="rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">報酬</span>
                    <span className={`font-title text-3xl font-black ${isDaily ? "text-sky-200" : "text-[#d8c08a]"}`}>{points} pt</span>
                  </div>
                  <input type="range" min={minPoint} max={maxPoint} step={5} value={points} disabled={isDaily} onChange={(e) => setPoints(Number(e.target.value))} className="w-full disabled:opacity-60" />
                </div>
              </InputBlock>
            </div>
          </div>

          <div className="shrink-0 border-t border-[#c9a86a]/15 bg-[#07111f]/95 px-5 pb-4 pt-3">
            <button onClick={submit} className={`relative w-full overflow-hidden rounded-2xl border py-3.5 text-base font-black text-white shadow-2xl ${buttonClass}`}>
              <span className="absolute inset-x-4 top-1 h-px bg-white/40" />
              {isUrgent ? "緊急クエストを依頼する" : isDaily ? "毎日クエストを設定する" : "ギルドに依頼する"}
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
