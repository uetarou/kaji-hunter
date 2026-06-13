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
  const current = totalPoints % 200;
  const progress = Math.max(0, Math.min(100, (current / 200) * 100));
  const remain = current === 0 ? 200 : 200 - current;

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#c9a86a]/30 bg-gradient-to-r from-[#0b1425] via-[#13233d] to-[#0d1a30] shadow-2xl">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="grid h-[56px] w-[56px] shrink-0 place-items-center rounded-full p-[4px] shadow-[0_0_18px_rgba(216,192,138,0.14)]"
            style={{
              background: `conic-gradient(#d8c08a ${progress}%, #273244 ${progress}% 100%)`,
            }}
            title={`次のHRまで ${remain}pt`}
          >
            <div className="grid h-full w-full place-items-center rounded-full border border-[#c9a86a]/35 bg-[#07111f]">
              <div className="text-center leading-none">
                <p className="text-[9px] font-black tracking-wider text-[#d8c08a]">HR</p>
                <p className="mt-0.5 text-xl font-black text-white">{hr}</p>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[#d8c08a]">
              <GuildMark className="h-4 w-4 shrink-0" />
              <h1 className="font-title text-[18px] font-black leading-none tracking-wide">
                Kaji Hunter
              </h1>
            </div>
            <p className="mt-1 truncate text-2xl font-black leading-none text-white">
              {hunterName}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="rounded-2xl border border-[#c9a86a]/30 bg-[#111827] px-3 py-2 text-right shadow-lg">
            <p className="text-[9px] font-black tracking-wider text-[#d8c08a]">所持pt</p>
            <p className="text-base font-black leading-none text-[#f1d99b]">{points} pt</p>
          </div>

          <button
            type="button"
            onClick={onNotificationsClick}
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#c9a86a]/25 bg-[#111827] text-[#d8c08a] shadow-lg"
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
      </div>
    </header>
  );
}

function GuildMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true">
      <path d="M32 4 41 18 58 14 49 31 58 50 39 46 32 60 25 46 6 50 15 31 6 14 23 18 32 4Z" opacity="0.35" />
      <path d="M32 10 38 22 51 20 44 32 51 44 38 42 32 54 26 42 13 44 20 32 13 20 26 22 32 10Z" />
    </svg>
  );
}
