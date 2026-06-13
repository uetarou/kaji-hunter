type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  questCount?: number;
  requestCount?: number;
  unreadCount?: number;
};

const tabs = [
  { key: "home", label: "ホーム", icon: <HomeIcon /> },
  { key: "quests", label: "クエスト", icon: <SwordIcon /> },
  { key: "request", label: "依頼", icon: <ScrollIcon /> },
  { key: "shop", label: "ショップ", icon: <ShopIcon /> },
  { key: "settings", label: "設定", icon: <GearIcon /> },
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
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1.5 px-3 pb-2 pt-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          const badge = getBadgeCount(tab.key);

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex min-h-[62px] flex-col items-center justify-center rounded-2xl border text-[11px] font-bold shadow-lg ${
                active
                  ? "border-[#c9a86a]/50 bg-gradient-to-b from-[#355e8d] to-[#183151] text-white"
                  : "border-[#c9a86a]/10 bg-[#111827] text-[#d8c08a]"
              }`}
            >
              {!!badge && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
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

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

function SwordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M14.5 4.5 20 10" />
      <path d="M3.5 20.5 15 9" />
      <path d="m12 6 6 6" />
      <path d="M5 16.5 7.5 19" />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M8 4h8l2 3v13H6V7l2-3Z" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
      <path d="M19.4 15a8 8 0 0 0 .1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1l-.3-2.6h-4l-.3 2.6a7 7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a8 8 0 0 0 .1 1l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 2.6h4l.3-2.6a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5Z" />
    </svg>
  );
}
