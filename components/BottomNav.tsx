type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  questCount?: number;
  requestCount?: number;
  unreadCount?: number;
};

const tabs = [
  {
    key: "home",
    label: "ホーム",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10.5V20h13v-9.5" />
        <path d="M10 20v-6h4v6" />
      </svg>
    ),
  },
  {
    key: "quests",
    label: "クエスト",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M14.5 4.5 20 10" />
        <path d="M3.5 20.5 15 9" />
        <path d="m12 6 6 6" />
        <path d="M5 16.5 7.5 19" />
      </svg>
    ),
  },
  {
    key: "request",
    label: "依頼",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M8 4h8l2 3v13H6V7l2-3Z" />
        <path d="M9 9h6" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </svg>
    ),
  },
  {
    key: "settings",
    label: "設定",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
        <path d="M19 13.5v-3l-2.1-.5a7 7 0 0 0-.7-1.7l1.1-1.9-2.1-2.1-1.9 1.1a7 7 0 0 0-1.7-.7L11 2H8l-.5 2.1a7 7 0 0 0-1.7.7L3.9 3.7 1.8 5.8l1.1 1.9a7 7 0 0 0-.7 1.7L0 10v3l2.1.5a7 7 0 0 0 .7 1.7l-1.1 1.9 2.1 2.1 1.9-1.1a7 7 0 0 0 1.7.7L8 22h3l.5-2.1a7 7 0 0 0 1.7-.7l1.9 1.1 2.1-2.1-1.1-1.9a7 7 0 0 0 .7-1.7L19 13.5Z" transform="translate(2 0)" />
      </svg>
    ),
  },
];

export function BottomNav({
  activeTab,
  setActiveTab,
  questCount = 0,
  requestCount = 0,
  unreadCount = 0,
}: Props) {
  const getBadgeCount = (key: string) => {
    if (key === "quests") return questCount;
    if (key === "request") return requestCount;
    if (key === "settings") return unreadCount;
    return 0;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#07111f]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2 px-3 pb-2 pt-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          const badge = getBadgeCount(tab.key);

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex min-h-[64px] flex-col items-center justify-center rounded-2xl border text-xs font-bold shadow-lg ${
                active
                  ? "border-[#c9a86a]/50 bg-gradient-to-b from-[#355e8d] to-[#183151] text-white"
                  : "border-[#c9a86a]/10 bg-[#111827] text-[#d8c08a]"
              }`}
            >
              {!!badge && (
                <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white">
                  {badge}
                </span>
              )}

              <span className="leading-none">{tab.icon}</span>
              <span className="mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
