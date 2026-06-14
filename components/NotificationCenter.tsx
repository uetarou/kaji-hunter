"use client";

import type { Notification, Quest } from "@/app/page";

export function NotificationCenter({
  notifications,
  pendingPartnerRequests = [],
  waitingConfirmQuests = [],
  onBack,
  onMarkAllRead,
  onApprovePartner,
  onRejectPartner,
  onApproveQuest,
}: {
  notifications: Notification[];
  pendingPartnerRequests?: Array<{
    id: string;
    requester?: { hunter_name?: string | null } | null;
  }>;
  waitingConfirmQuests?: Quest[];
  onBack: () => void;
  onMarkAllRead: () => void;
  onApprovePartner?: (requestId: string) => void;
  onRejectPartner?: (requestId: string) => void;
  onApproveQuest?: (quest: Quest) => void;
}) {
  return (
    <section className="space-y-5">
      <button
        onClick={onBack}
        className="rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] px-4 py-3 text-sm font-black text-[#d8c08a]"
      >
        ‹ 戻る
      </button>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#d8c08a]">Hunter Notices</p>
          <h2 className="mt-1 font-title text-4xl font-black">通知</h2>
        </div>

        <button
          onClick={onMarkAllRead}
          className="mb-1 rounded-xl border border-[#c9a86a]/15 bg-[#1f2937] px-3 py-2 text-xs font-bold text-[#d8c08a]"
        >
          既読
        </button>
      </div>

      <div className="space-y-3">
        {pendingPartnerRequests.map((request) => (
          <div key={request.id} className="rounded-3xl border border-emerald-300/25 bg-gradient-to-br from-[#0d221a] to-[#111827] p-4">
            <p className="text-xs font-bold text-[#d8c08a]">パートナー申請</p>
            <h3 className="mt-2 text-xl font-black">
              {request.requester?.hunter_name || "ハンター"} から申請
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => onApprovePartner?.(request.id)}
                className="rounded-2xl border border-emerald-300/40 bg-emerald-800 py-3 text-sm font-black text-white"
              >
                承認
              </button>
              <button
                onClick={() => onRejectPartner?.(request.id)}
                className="rounded-2xl border border-red-300/40 bg-red-900/60 py-3 text-sm font-black text-red-100"
              >
                拒否
              </button>
            </div>
          </div>
        ))}

        {waitingConfirmQuests.map((quest) => (
          <div key={quest.id} className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-4">
            <p className="text-xs font-bold text-[#d8c08a]">完了報告</p>
            <h3 className="mt-2 text-xl font-black">{quest.title}</h3>
            <p className="mt-1 text-sm text-gray-400">承認待ちです</p>
            {quest.quest_reports?.[0]?.image_url && (
              <img
                src={quest.quest_reports[0].image_url}
                alt="完了報告画像"
                className="mt-3 max-h-56 w-full rounded-2xl border border-[#c9a86a]/10 object-cover"
              />
            )}
            <button
              onClick={() => onApproveQuest?.(quest)}
              className="mt-4 w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-3 text-sm font-black text-white"
            >
              達成を承認
            </button>
          </div>
        ))}

        {notifications.length === 0 &&
          pendingPartnerRequests.length === 0 &&
          waitingConfirmQuests.length === 0 && (
            <div className="rounded-3xl border border-[#c9a86a]/10 bg-[#111827] p-7 text-center text-gray-400">
              通知はありません
            </div>
          )}

        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-3xl border p-4 ${
              notification.is_read
                ? "border-[#c9a86a]/10 bg-[#111827]"
                : "border-[#c9a86a]/25 bg-[#1f2937]"
            }`}
          >
            <h3 className="font-black">{notification.title}</h3>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              {notification.message}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
