import { KajiAppIcon } from "@/components/icons/KajiAppIcon";

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
    <header className="fixed left-0 right-0 top-0 z-50 bg-[#08111f]/96 shadow-[0_12px_28px_rgba(0,0,0,0.38)] backdrop-blur-md">
      <div className="relative h-[88px] w-full overflow-hidden bg-gradient-to-r from-[#07111f] via-[#101f36] to-[#07111f] px-2.5 pt-[calc(env(safe-area-inset-top)+6px)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_20%_20%,#d8c08a_0,transparent_24%),linear-gradient(135deg,transparent_0_47%,#d8c08a_48%_49%,transparent_50%_100%)]" />
        <KajiAppIcon className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-[40%] text-[#d8c08a]/10" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a86a]/30 to-transparent" />

        <div className="relative flex h-full items-center gap-2">
          <div
            className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full p-[4px] shadow-lg"
            style={{
              background: `conic-gradient(#d8c08a ${progress}%, #273247 ${progress}% 100%)`,
            }}
            title={`次のHRまで ${remain}pt`}
          >
            <div className="grid h-full w-full place-items-center rounded-full border border-[#c9a86a]/45 bg-[#07111f] shadow-inner">
              <div className="text-center leading-none">
                <p className="text-[8px] font-black tracking-wider text-[#d8c08a]">HR</p>
                <p className="mt-0.5 text-[24px] font-black text-white">{hr}</p>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1 pl-0.5">
            <div className="flex items-center gap-1.5 text-[#d8c08a]">
              <KajiAppIcon className="h-4 w-4 shrink-0" />
              <h1 className="font-title text-[14px] font-black leading-none tracking-wide">
                Kaji Hunter
              </h1>
            </div>
            <p className="mt-1 truncate font-title text-[25px] font-black leading-none text-white drop-shadow">
              {hunterName || "ハンター"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="min-w-[88px] rounded-xl border border-[#c9a86a]/35 bg-[#0b1322]/90 px-2.5 py-2 text-center shadow-lg">
              <p className="text-[9px] font-black leading-none text-[#d8c08a]/85">所持pt</p>
              <p className="mt-1 font-title text-[18px] font-black leading-none text-[#f2d994] tabular-nums">
                {points.toLocaleString()}<span className="ml-0.5 text-[10px]">pt</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onNotificationsClick}
              className="relative grid h-12 w-12 place-items-center rounded-2xl border border-[#c9a86a]/35 bg-[#0b1322]/90 text-[#d8c08a] shadow-lg"
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
    </header>
  );
}
