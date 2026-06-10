export function TopBar({
  hunterName,
  hr,
  unreadCount,
  partnerName,
}: {
  hunterName: string;
  hr: number;
  unreadCount: number;
  partnerName?: string | null;
}) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#c9a86a]/30 bg-gradient-to-r from-[#0b1425] via-[#13233d] to-[#0d1a30] shadow-2xl">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#c9a86a]/40 bg-[#111827] text-xl text-[#d8c08a] shadow-lg">
            ⚔
          </div>

          <div className="min-w-0">
            <h1 className="font-title text-2xl font-black tracking-wide">
              Kaji Hunter
            </h1>

            <div className="mt-1 flex max-w-[250px] items-center gap-2 text-sm">
              <p className="truncate text-[#d8c08a]">{hunterName}</p>

              {partnerName && (
                <>
                  <span className="shrink-0 text-[#d8c08a]">×</span>
                  <p className="truncate text-emerald-200">{partnerName}</p>
                </>
              )}

              <span className="shrink-0 text-[#d8c08a]">・</span>
              <p className="shrink-0 font-bold text-slate-100">HR {hr}</p>
            </div>
          </div>
        </div>

        {!!unreadCount && (
          <div className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-bold">
            {unreadCount}
          </div>
        )}
      </div>
    </header>
  );
}
