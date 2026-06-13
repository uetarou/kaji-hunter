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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#c9a86a]/35 bg-[#08111f]/95 shadow-2xl backdrop-blur-md">
      <div className="mx-auto max-w-md px-3 py-2">
        <div className="relative overflow-hidden rounded-[22px] border border-[#c9a86a]/30 bg-gradient-to-r from-[#0b1425] via-[#12213a] to-[#0a1426] px-3 py-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-1 rounded-[18px] border border-white/5" />
          <div className="pointer-events-none absolute -right-10 -top-16 h-28 w-28 rounded-full bg-[#d8c08a]/10 blur-2xl" />
          <div className="pointer-events-none absolute left-24 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full border border-[#c9a86a]/10 opacity-40" />

          <div className="relative flex items-center gap-3">
            <div
              className="grid h-[62px] w-[62px] shrink-0 place-items-center rounded-full p-[4px] shadow-lg"
              style={{
                background: `conic-gradient(#d8c08a ${progress}%, #2b3445 ${progress}% 100%)`,
              }}
              title={`次のHRまで ${remain}pt`}
            >
              <div className="grid h-full w-full place-items-center rounded-full border border-[#c9a86a]/45 bg-[#07111f] shadow-inner">
                <div className="text-center leading-none">
                  <p className="text-[9px] font-black tracking-wider text-[#d8c08a]">HR</p>
                  <p className="mt-0.5 text-[26px] font-black text-white">{hr}</p>
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[#d8c08a]">
                <GuildMark className="h-4 w-4 shrink-0" />
                <h1 className="font-title text-[16px] font-black leading-none tracking-wide">
                  Kaji Hunter
                </h1>
              </div>

              <p className="mt-1.5 truncate font-title text-[25px] font-black leading-none text-white drop-shadow">
                {hunterName}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="rounded-xl border border-[#c9a86a]/35 bg-[#111827]/90 px-2.5 py-1.5 text-center shadow-lg">
                <p className="text-[9px] font-black text-[#d8c08a]/80">所持pt</p>
                <p className="font-title text-[18px] font-black leading-none text-[#f2d994]">
                  {points}<span className="ml-0.5 text-[11px]">pt</span>
                </p>
              </div>

              <button
                type="button"
                onClick={onNotificationsClick}
                className="relative grid h-12 w-12 place-items-center rounded-2xl border border-[#c9a86a]/35 bg-[#111827]/90 text-[#d8c08a] shadow-lg"
                aria-label="通知を開く"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>

                {!!unreadCount && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function GuildMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true">
      <path d="M32 4l7 13 14-5-5 15 12 7-15 5 4 15-17-8-17 8 4-15-15-5 12-7-5-15 14 5 7-13z" opacity="0.45" />
      <path d="M32 10l5 15 15-4-11 11 11 11-15-4-5 15-5-15-15 4 11-11-11-11 15 4 5-15z" />
    </svg>
  );
}
