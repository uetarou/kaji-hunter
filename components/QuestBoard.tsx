import type { Quest } from "@/app/page";
import { dailyQuestTemplates } from "@/lib/questTemplates";

type AcceptableQuest =
  | Quest
  | {
      id: string;
      title: string;
    };

export const QuestBoard = {
  Home,
  Board,
};

function Home({
  acceptedQuests,
  myRequestQuests,
  onReport,
  onApprove,
}: {
  acceptedQuests: Quest[];
  myRequestQuests: Quest[];
  onReport: (quest: Quest) => void;
  onApprove: (quest: Quest) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <SectionTitle title="受注中クエスト" badge={acceptedQuests.length} />

        {acceptedQuests.length === 0 && (
          <EmptyCard text="受注中クエストはありません" />
        )}

        {acceptedQuests.map((quest) => (
          <CompactQuestCard
            key={quest.id}
            quest={quest}
            statusText="進行中"
            actionLabel="報告"
            onAction={() => onReport(quest)}
          />
        ))}
      </section>

      <section className="space-y-3">
        <SectionTitle title="依頼中クエスト" badge={myRequestQuests.length} />

        {myRequestQuests.length === 0 && (
          <EmptyCard text="依頼中クエストはありません" />
        )}

        {myRequestQuests.map((quest) => (
          <CompactQuestCard
            key={quest.id}
            quest={quest}
            statusText={getStatusText(quest.status)}
            actionLabel={quest.status === "waiting_confirm" ? "承認" : "確認"}
            onAction={() => {
              if (quest.status === "waiting_confirm") {
                onApprove(quest);
              }
            }}
          />
        ))}
      </section>
    </div>
  );
}

function Board({
  partnerQuests,
  onAccept,
}: {
  partnerQuests: Quest[];
  onAccept: (quest: AcceptableQuest) => void;
}) {
  const urgentPartnerQuests = partnerQuests.filter((q) => q.is_urgent);
  const normalPartnerQuests = partnerQuests.filter((q) => !q.is_urgent);

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-[#c9a86a]/20 bg-gradient-to-br from-[#111827] to-[#07111f] p-5 shadow-2xl">
        <p className="text-sm font-bold text-[#d8c08a]">Guild Quest Board</p>
        <h2 className="mt-1 font-title text-3xl font-black">クエストボード</h2>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          パートナーからの依頼と、毎日こなせる家事クエストを受注できます。
        </p>
      </div>

      {urgentPartnerQuests.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="緊急クエスト" badge={urgentPartnerQuests.length} />

          {urgentPartnerQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              label="緊急"
              tone="urgent"
              buttonLabel="緊急クエスト受注"
              onClick={() => onAccept(quest)}
            />
          ))}
        </section>
      )}

      <section className="space-y-3">
        <SectionTitle title="パートナー依頼" badge={normalPartnerQuests.length} />

        {normalPartnerQuests.length === 0 && (
          <EmptyCard text="パートナーからの依頼はありません" />
        )}

        {normalPartnerQuests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            label="依頼"
            tone="partner"
            buttonLabel="クエスト受注"
            onClick={() => onAccept(quest)}
          />
        ))}
      </section>

      <section className="space-y-3">
        <SectionTitle title="毎日クエスト" badge={dailyQuestTemplates.length} />

        {dailyQuestTemplates.map((quest) => (
          <DailyQuestCard
            key={quest.id}
            quest={quest}
            onClick={() => onAccept(quest)}
          />
        ))}
      </section>
    </section>
  );
}

function QuestCard({
  quest,
  label,
  tone,
  buttonLabel,
  onClick,
}: {
  quest: Quest;
  label: string;
  tone: "urgent" | "partner";
  buttonLabel: string;
  onClick: () => void;
}) {
  const isUrgent = tone === "urgent";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-5 shadow-xl ${
        isUrgent
          ? "border-red-400/40 bg-gradient-to-br from-[#2a1115] to-[#111827]"
          : "border-[#c9a86a]/15 bg-[#111827]"
      }`}
    >
      <div className="absolute right-[-35px] top-[-35px] h-24 w-24 rounded-full border border-[#c9a86a]/10" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className={`mb-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
              isUrgent
                ? "border-red-300/40 bg-red-500/20 text-red-200"
                : "border-[#c9a86a]/20 bg-[#1f2937] text-[#d8c08a]"
            }`}
          >
            {label}
          </div>

          <h3 className="text-2xl font-black">{quest.title}</h3>

          {quest.description && (
            <p className="mt-3 text-sm leading-6 text-gray-400">
              {quest.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <InfoPill label="希望時間" value={formatDueAt(quest.due_at)} />
        <InfoPill label="報酬" value={quest.reward || "なし"} />
      </div>

      <button
        onClick={onClick}
        className={`mt-5 w-full rounded-2xl border py-4 font-bold text-white shadow-lg ${
          isUrgent
            ? "border-red-300/50 bg-red-700"
            : "border-[#6e8fb4] bg-[#355e8d]"
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function DailyQuestCard({
  quest,
  onClick,
}: {
  quest: {
    id: string;
    title: string;
    description: string;
    reward: string;
  };
  onClick: () => void;
}) {
  return (
    <div className="rounded-3xl border border-[#c9a86a]/15 bg-gradient-to-br from-[#111827] to-[#0b1425] p-5 shadow-xl">
      <div className="mb-3 inline-flex rounded-full border border-[#c9a86a]/20 bg-[#1f2937] px-3 py-1 text-xs font-bold text-[#d8c08a]">
        DAILY
      </div>

      <h3 className="text-2xl font-black">{quest.title}</h3>
      <p className="mt-3 text-sm leading-6 text-gray-400">{quest.description}</p>

      <div className="mt-5">
        <InfoPill label="報酬" value={quest.reward} />
      </div>

      <button
        onClick={onClick}
        className="mt-5 w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-4 font-bold text-white shadow-lg"
      >
        デイリー受注
      </button>
    </div>
  );
}

function CompactQuestCard({
  quest,
  statusText,
  actionLabel,
  onAction,
}: {
  quest: Quest;
  statusText: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-4 shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-black">{quest.title}</h3>
          <p className="mt-1 text-sm text-[#d8c08a]">{statusText}</p>
        </div>

        <button
          onClick={onAction}
          className="shrink-0 rounded-2xl border border-[#6e8fb4] bg-[#355e8d] px-5 py-3 font-bold text-white shadow-lg"
        >
          {actionLabel}
        </button>
      </div>

      {(quest.due_at || quest.reward) && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <InfoPill label="希望時間" value={formatDueAt(quest.due_at)} />
          <InfoPill label="報酬" value={quest.reward || "なし"} />
        </div>
      )}
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] px-3 py-2">
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function SectionTitle({ title, badge }: { title: string; badge?: number }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="font-title text-2xl font-black tracking-tight">{title}</h2>

      {!!badge && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
          {badge}
        </div>
      )}
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-[#c9a86a]/10 bg-[#111827] p-7 text-center text-gray-400">
      {text}
    </div>
  );
}

function getStatusText(status: string) {
  if (status === "recruiting") return "募集中";
  if (status === "accepted") return "進行中";
  if (status === "waiting_confirm") return "完了確認待ち";
  if (status === "completed") return "達成済み";
  return status;
}

function formatDueAt(dueAt: string | null) {
  if (!dueAt) return "指定なし";

  const date = new Date(dueAt);

  if (Number.isNaN(date.getTime())) return "指定なし";

  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}