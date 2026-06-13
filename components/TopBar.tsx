export function TopBar({
  hunterName,
  hr,
  unreadCount,
  partnerName,
  points = 0,
  totalPoints = 0,
  onNotificationsClick,
}: {
  hunterName: string;
  hr: number;
  unreadCount: number;
  partnerName?: string | null;
  points?: number;
  totalPoints?: number;
  onNotificationsClick?: () => void;
}) {
  const progress = Math.max(0, Math.min(100, ((totalPoints % 200) / 200) * 100));
  const remain = totalPoints % 200 === 0 ? 200 : 200 - (totalPoints % 200);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#c9a86a]/30 bg-gradient-to-r from-[#0b1425] via-[#13233d] to-[#0d1a30] shadow-2xl">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="relative grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full p-[4px] shadow-lg"
            style={{
              background: `conic-gradient(#d8c08a ${progress}%, #273244 ${progress}% 100%)`,
            }}
            title={`次のHRまで ${remain}pt`}
          >
            <div className="grid h-full w-full place-items-center rounded-full border border-[#c9a86a]/35 bg-[#07111f]">
              <div className="text-center leading-none">
                <p className="text-[10px] font-black text-[#d8c08a]">HR</p>
                <p className="mt-1 text-xl font-black text-white">{hr}</p>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="font-title text-2xl font-black tracking-wide">
              Kaji Hunter
            </h1>

            <div className="mt-1 flex max-w-[230px] items-center gap-2 text-sm">
              <p className="truncate text-[#d8c08a]">{hunterName}</p>

              {partnerName && (
                <>
                  <span className="shrink-0 text-[#d8c08a]">×</span>
                  <p className="truncate text-emerald-200">{partnerName}</p>
                </>
              )}
            </div>

            <div className="mt-2 inline-flex items-center rounded-full border border-[#c9a86a]/25 bg-[#111827] px-3 py-1 text-sm font-black text-[#d8c08a]">
              {points} pt
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onNotificationsClick}
          className="relative ml-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#c9a86a]/25 bg-[#111827] text-[#d8c08a] shadow-lg"
          aria-label="通知を開く"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>

          {!!unreadCount && (
            <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
