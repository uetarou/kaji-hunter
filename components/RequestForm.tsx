"use client";

import { useState } from "react";

export function RequestForm({
  onCreate,
}: {
  onCreate: (quest: {
    title: string;
    description: string;
    reward: string;
    dueAt: string | null;
    isUrgent: boolean;
  }) => void;
}) {
  const [requestType, setRequestType] = useState<"normal" | "urgent">("normal");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [reward, setReward] = useState("");

  const isUrgent = requestType === "urgent";

  const submit = () => {
    if (!title.trim()) return;

    const dueAt =
      dueDate && dueTime ? new Date(`${dueDate}T${dueTime}`).toISOString() : null;

    onCreate({
      title,
      description,
      reward,
      dueAt,
      isUrgent,
    });

    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("");
    setReward("");
    setRequestType("normal");
  };

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-[#c9a86a]/20 bg-gradient-to-br from-[#111827] to-[#07111f] p-5 shadow-2xl">
        <p className="text-sm font-bold text-[#d8c08a]">Guild Request Counter</p>
        <h2 className="mt-1 font-title text-3xl font-black">クエスト依頼</h2>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          パートナーへ通常依頼または緊急依頼を出せます。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setRequestType("normal")}
          className={`rounded-3xl border p-4 text-left shadow-xl ${
            requestType === "normal"
              ? "border-[#89a9cf] bg-gradient-to-br from-[#446f9f] to-[#28476d]"
              : "border-[#c9a86a]/10 bg-[#111827]"
          }`}
        >
          <p className="font-title text-lg font-black">通常依頼</p>
          <p className="mt-2 text-xs text-gray-300">いつもの家事クエスト</p>
        </button>

        <button
          onClick={() => setRequestType("urgent")}
          className={`rounded-3xl border p-4 text-left shadow-xl ${
            requestType === "urgent"
              ? "border-red-300/50 bg-gradient-to-br from-red-800 to-[#2a1115]"
              : "border-[#c9a86a]/10 bg-[#111827]"
          }`}
        >
          <p className="font-title text-lg font-black">緊急依頼</p>
          <p className="mt-2 text-xs text-gray-300">急ぎでお願いしたい時</p>
        </button>
      </div>

      <div
        className={`rounded-3xl border p-5 shadow-xl ${
          isUrgent
            ? "border-red-300/30 bg-gradient-to-br from-[#2a1115] to-[#111827]"
            : "border-[#c9a86a]/15 bg-[#111827]"
        }`}
      >
        <div className="mb-5 inline-flex rounded-full border border-[#c9a86a]/20 bg-[#1f2937] px-3 py-1 text-xs font-bold text-[#d8c08a]">
          {isUrgent ? "URGENT QUEST" : "NORMAL QUEST"}
        </div>

        <div className="space-y-5">
          <InputBlock label="クエスト名">
            <input
              placeholder="例：お風呂掃除"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
            />
          </InputBlock>

          <InputBlock label="依頼内容">
            <textarea
              placeholder="例：浴槽と排水口までお願い！"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-32 w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
            />
          </InputBlock>

          <InputBlock label="希望日時">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
              />

              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
              />
            </div>
          </InputBlock>

          <InputBlock label="報酬">
            <input
              placeholder="例：プリン / 肩もみ / ありがとう券"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
            />
          </InputBlock>

          <button
            onClick={submit}
            className={`w-full rounded-2xl border py-4 font-bold text-white shadow-lg ${
              isUrgent
                ? "border-red-300/50 bg-red-700"
                : "border-[#6e8fb4] bg-[#355e8d]"
            }`}
          >
            {isUrgent ? "緊急クエストを依頼する" : "ギルドに依頼する"}
          </button>
        </div>
      </div>
    </section>
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