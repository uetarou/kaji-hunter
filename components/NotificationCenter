"use client";

import type { Notification, PartnerRequest, Quest } from "@/app/page";

export function NotificationCenter({
  notifications,
  incomingPartnerRequests,
  waitingConfirmQuests,
  onBack,
  onMarkAllRead,
  onApprovePartnerRequest,
  onRejectPartnerRequest,
  onApproveQuest,
}: {
  notifications: Notification[];
  incomingPartnerRequests: PartnerRequest[];
  waitingConfirmQuests: Quest[];
  onBack: () => void;
  onMarkAllRead: () => void;
  onApprovePartnerRequest: (request: PartnerRequest) => void;
  onRejectPartnerRequest: (request: PartnerRequest) => void;
  onApproveQuest: (quest: Quest) => void;
}) {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-5 shadow-xl">
        <button
          onClick={onBack}
          className="mb-5 rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] px-4 py-3 text-sm font-bold text-[#d8c08a]"
        >
          ‹ 戻る
        </button>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#d8c08a]">Notification Center</p>
            <h2 className="mt-1 font-title text-3xl font-black">通知</h2>
          </div>

          <button
            onClick={onMarkAllRead}
            className="rounded-2xl border border-[#6e8fb4]/30 bg-[#355e8d] px-4 py-3 text-xs font-bold text-white"
          >
            既読にする
          </button>
        </div>
      </div>

      {incomingPartnerRequests.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="パートナー申請" badge={incomingPartnerRequests.length} />

          {incomingPartnerRequests.map((request) => (
            <ActionCard
              key={request.id}
              title={`${request.requester?.hunter_name || "相手"} から申請`}
              message="パートナー申請が届いています。"
              primaryLabel="承認する"
              secondaryLabel="拒否する"
              onPrimary={() => onApprovePartnerRequest(request)}
              onSecondary={() => onRejectPartnerRequest(request)}
            />
          ))}
        </section>
      )}

      {waitingConfirmQuests.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="完了報告" badge={waitingConfirmQuests.length} />

          {waitingConfirmQuests.map((quest) => (
            <ActionCard
              key={quest.id}
              title={quest.title}
              message={`完了報告が届いています。承認すると ${quest.points ?? 20}pt が付与されます。`}
              primaryLabel="承認する"
              secondaryLabel="あとで"
              onPrimary={() => onApproveQuest(quest)}
              onSecondary={() => {}}
            />
          ))}
        </section>
      )}

      <section className="space-y-3">
        <SectionTitle title="通知履歴" badge={notifications.filter((n) => !n.is_read).length} />

        {notifications.length === 0 && (
          <div className="rounded-3xl border border-[#c9a86a]/10 bg-[#111827] p-7 text-center text-gray-400">
            通知はありません
          </div>
        )}

        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-3xl border p-4 shadow-xl ${
              notification.is_read
                ? "border-[#c9a86a]/10 bg-[#111827]"
                : "border-[#c9a86a]/30 bg-[#1f2937]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black">{notification.title}</h3>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  {notification.message}
                </p>
              </div>

              {!notification.is_read && (
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-red-500" />
              )}
            </div>
          </div>
        ))}
      </section>
    </section>
  );
}

function ActionCard({
  title,
  message,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: {
  title: string;
  message: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  return (
    <div className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-4 shadow-xl">
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-400">{message}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={onPrimary}
          className="rounded-2xl border border-emerald-300/40 bg-emerald-800 py-3 text-sm font-black text-white"
        >
          {primaryLabel}
        </button>
        <button
          onClick={onSecondary}
          className="rounded-2xl border border-red-300/30 bg-red-900/40 py-3 text-sm font-black text-red-100"
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ title, badge }: { title: string; badge?: number }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="font-title text-2xl font-black">{title}</h2>
      {!!badge && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold">
          {badge}
        </div>
      )}
    </div>
  );
}
