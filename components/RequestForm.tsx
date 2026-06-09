"use client";

import { useEffect, useState } from "react";

type CreateQuestInput = {
  title: string;
  description: string;
  reward: string;
  dueAt: string | null;
  isUrgent: boolean;
};

type Props = {
  onCreate: (quest: CreateQuestInput) => void;
  onModalOpenChange?: (open: boolean) => void;
};

export function RequestForm({ onCreate, onModalOpenChange }: Props) {
  const [modalType, setModalType] = useState<"normal" | "urgent" | null>(null);

  useEffect(() => {
    onModalOpenChange?.(modalType !== null);
  }, [modalType, onModalOpenChange]);

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-[#c9a86a]/20 bg-gradient-to-br from-[#111827] to-[#07111f] p-5 shadow-2xl">
        <p className="text-sm font-bold text-[#d8c08a]">
          Guild Request Counter
        </p>
        <h2 className="mt-1 font-title text-3xl font-black">クエスト依頼</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <RequestTypeButton
          title="通常依頼"
          description="日常の家事を依頼する"
          label="NORMAL QUEST"
          tone="normal"
          onClick={() => setModalType("normal")}
        />

        <RequestTypeButton
          title="緊急依頼"
          description="急ぎでお願いしたい家事を依頼する"
          label="URGENT QUEST"
          tone="urgent"
          onClick={() => setModalType("urgent")}
        />
      </div>

      {modalType && (
        <RequestModal
          type={modalType}
          onClose={() => setModalType(null)}
          onCreate={(quest) => {
            onCreate(quest);
            setModalType(null);
          }}
        />
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
          : "border-[#6e8fb4]/30 bg-gradient-to-br from-[#0b1c33] to-[#111827]"
      }`}
    >
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
          isUrgent
            ? "border-red-300/40 bg-red-500/20 text-red-100"
            : "border-[#6e8fb4]/50 bg-[#355e8d]/30 text-blue-100"
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [reward, setReward] = useState("");

  const isUrgent = type === "urgent";

  const submit = () => {
    if (!title.trim()) return;

    const dueAt =
      dueDate && dueTime
        ? new Date(`${dueDate}T${dueTime}`).toISOString()
        : null;

    onCreate({
      title,
      description,
      reward,
      dueAt,
      isUrgent,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0 overflow-y-auto overscroll-contain">
        <div className="min-h-full px-4 pb-56 pt-8">
          <div
            className={`mx-auto w-full max-w-md rounded-3xl border bg-[#111827] p-5 shadow-2xl ${
              isUrgent ? "border-red-300/30" : "border-[#c9a86a]/20"
            }`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                    isUrgent
                      ? "border-red-300/40 bg-red-500/20 text-red-100"
                      : "border-[#6e8fb4]/50 bg-[#355e8d]/30 text-blue-100"
                  }`}
                >
                  {isUrgent ? "URGENT QUEST" : "NORMAL QUEST"}
                </span>

                <h2 className="mt-2 font-title text-3xl font-black">
                  {isUrgent ? "緊急依頼" : "通常依頼"}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] text-2xl text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <InputBlock label="クエスト名">
                <input
                  placeholder="例：お風呂掃除"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 text-sm outline-none"
                />
              </InputBlock>

              <InputBlock label="依頼内容">
                <textarea
                  placeholder="例：浴槽と排水口までお願い！"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-32 w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 text-sm outline-none"
                />
              </InputBlock>

              <InputBlock label="希望日">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 text-sm outline-none"
                />
              </InputBlock>

              <InputBlock label="希望時間">
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 text-sm outline-none"
                />
              </InputBlock>

              <InputBlock label="報酬">
                <input
                  placeholder="例：プリン / 肩もみ"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 text-sm outline-none"
                />
              </InputBlock>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-[108px] left-0 right-0 z-[110] px-4">
        <div className="mx-auto w-full max-w-md">
          <button
            onClick={submit}
            className={`w-full rounded-2xl border py-4 font-bold text-white shadow-2xl ${
              isUrgent
                ? "border-red-300/50 bg-red-700"
                : "border-[#6e8fb4] bg-[#355e8d]"
            }`}
          >
            {isUrgent ? "緊急クエストを依頼する" : "ギルドに依頼する"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-bold text-[#d8c08a]">{label}</p>
      {children}
    </label>
  );
}