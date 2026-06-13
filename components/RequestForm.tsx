"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type CreateQuestInput = {
  title: string;
  description: string;
  points: number;
  dueAt: string | null;
  isUrgent: boolean;
};

type Props = {
  onCreate: (quest: CreateQuestInput) => void;
  onModalOpenChange?: (open: boolean) => void;
};

export function RequestForm({ onCreate, onModalOpenChange }: Props) {
  const [modalType, setModalType] = useState<"normal" | "urgent" | null>(null);
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
          description="日常の家事を20〜50ptで依頼する"
          label="NORMAL QUEST"
          tone="normal"
          onClick={() => setModalType("normal")}
        />

        <RequestTypeButton
          title="緊急依頼"
          description="急ぎの家事を50〜100ptで依頼する"
          label="URGENT QUEST"
          tone="urgent"
          onClick={() => setModalType("urgent")}
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
  description,
  label,
  tone,
  onClick,
}: {
  title: string;
  description: string;
  label: string;
  tone: "normal" | "urgent";
  onClick: () => void;
}) {
  const isUrgent = tone === "urgent";

  return (
    <button
      onClick={onClick}
      className={`rounded-3xl border p-5 text-left shadow-xl ${
        isUrgent
          ? "border-red-300/30 bg-gradient-to-br from-[#2a1115] to-[#111827]"
          : "border-emerald-300/30 bg-gradient-to-br from-[#0d261c] to-[#111827]"
      }`}
    >
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
          isUrgent
            ? "border-red-300/40 bg-red-500/20 text-red-100"
            : "border-emerald-300/40 bg-emerald-500/15 text-emerald-100"
        }`}
      >
        {label}
      </span>

      <h3 className="mt-3 font-title text-2xl font-black">{title}</h3>
      <p className="mt-2 text-sm text-gray-400">{description}</p>
    </button>
  );
}

function RequestModal({
  type,
  onClose,
  onCreate,
}: {
  type: "normal" | "urgent";
  onClose: () => void;
  onCreate: (quest: CreateQuestInput) => void;
}) {
  const isUrgent = type === "urgent";
  const minPoint = isUrgent ? 50 : 20;
  const maxPoint = isUrgent ? 100 : 50;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [points, setPoints] = useState(minPoint);

  const submit = () => {
    if (!title.trim()) return;

    const safePoints = Math.min(Math.max(points, minPoint), maxPoint);
    const dueAt =
      dueDate && dueTime ? new Date(`${dueDate}T${dueTime}`).toISOString() : null;

    onCreate({
      title,
      description,
      points: safePoints,
      dueAt,
      isUrgent,
    });
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/75 backdrop-blur-sm">
      <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col px-2 pb-[calc(env(safe-area-inset-bottom)+82px)] pt-[calc(env(safe-area-inset-top)+108px)]">
        <div
          className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-gradient-to-b from-[#111827] via-[#0b1425] to-[#07111f] shadow-[0_0_50px_rgba(0,0,0,0.8)] ${
            isUrgent ? "border-red-300/35" : "border-[#c9a86a]/35"
          }`}
        >
          <div className="shrink-0 border-b border-[#c9a86a]/15 px-5 pb-3 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black tracking-wide ${
                    isUrgent
                      ? "border-red-300/50 bg-red-500/20 text-red-100"
                      : "border-emerald-300/50 bg-emerald-500/15 text-emerald-100"
                  }`}
                >
                  {isUrgent ? "URGENT QUEST" : "NORMAL QUEST"}
                </span>

                <h2 className="mt-2 font-title text-4xl font-black leading-none">
                  {isUrgent ? "緊急依頼" : "通常依頼"}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] text-2xl text-gray-400 shadow-lg"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
            <div className="space-y-3">
              <InputBlock label="クエスト名">
                <input
                  placeholder="例：お風呂掃除"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-4 py-3 text-sm outline-none"
                />
              </InputBlock>

              <InputBlock label="依頼内容">
                <textarea
                  placeholder="例：浴槽と排水口までお願い！"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-24 w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-4 py-3 text-sm outline-none"
                />
              </InputBlock>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InputBlock label="希望日">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="min-w-0 w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-4 py-3 text-sm outline-none"
                  />
                </InputBlock>

                <InputBlock label="希望時間">
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="min-w-0 w-full rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-4 py-3 text-sm outline-none"
                  />
                </InputBlock>
              </div>

              <InputBlock label={`報酬ポイント（${minPoint}〜${maxPoint}pt）`}>
                <div className="rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937]/90 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-gray-400">報酬</span>
                    <span className="text-2xl font-black text-[#d8c08a]">{points} pt</span>
                  </div>

                  <input
                    type="range"
                    min={minPoint}
                    max={maxPoint}
                    step={5}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </InputBlock>

              <p className="pt-1 text-center text-[11px] text-gray-400">
                ※ 承認されたら受注者にポイントが付与されます
              </p>
            </div>
          </div>

          <div className="shrink-0 border-t border-[#c9a86a]/15 bg-[#07111f]/90 px-5 pb-5 pt-3">
            <button
              onClick={submit}
              className={`relative w-full overflow-hidden rounded-2xl border py-4 text-base font-black text-white shadow-2xl ${
                isUrgent
                  ? "border-red-300/60 bg-gradient-to-r from-red-900 to-red-700"
                  : "border-emerald-300/60 bg-gradient-to-r from-[#0f3b2c] via-[#17704f] to-[#0f3b2c]"
              }`}
            >
              <span className="absolute inset-x-4 top-1 h-px bg-white/40" />
              {isUrgent ? "緊急クエストを依頼する" : "ギルドに依頼する"}
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
