"use client";

import type { Quest } from "@/app/page";

export function ReportModal({
  quest,
  reportImage,
  setReportImage,
  onClose,
  onSubmit,
}: {
  quest: Quest;
  reportImage: File | null;
  setReportImage: (file: File | null) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-md rounded-t-3xl border-t border-[#c9a86a]/20 bg-[#111827] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#d8c08a]">Quest Report</p>
            <h2 className="font-title text-3xl font-black">完了報告</h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] text-gray-400"
          >
            ✕
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4">
          <p className="text-sm text-gray-400">クエスト</p>
          <h3 className="mt-1 text-2xl font-bold">{quest.title}</h3>

          {quest.description && (
            <p className="mt-3 text-sm leading-6 text-gray-400">
              {quest.description}
            </p>
          )}
        </div>

        <div className="mb-5">
          <label className="mb-2 block font-semibold text-[#d8c08a]">
            完了証拠画像
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#c9a86a]/30 bg-[#1f2937] p-6 text-center">
            <span className="text-sm font-bold">画像を選択する</span>
            <span className="mt-1 text-xs text-gray-400">
              カメラ撮影・写真選択どちらもOK
            </span>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setReportImage(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          {reportImage && (
            <p className="mt-3 rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-3 text-xs text-gray-300">
              選択中：{reportImage.name}
            </p>
          )}
        </div>

        <button
          onClick={onSubmit}
          className="w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-4 font-bold text-white shadow-lg"
        >
          ギルドへ完了報告する
        </button>
      </div>
    </div>
  );
}