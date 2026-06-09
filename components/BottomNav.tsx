type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  questCount?: number;
  requestCount?: number;
  unreadCount?: number;
};

const tabs = [
  { key: "home", label: "ホーム", icon: "⌂" },
  { key: "quests", label: "クエスト", icon: "⚔" },
  { key: "request", label: "依頼", icon: "≡" },
  { key: "settings", label: "設定", icon: "⚙" },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#c9a86a]/15 bg-[#07111f]/95 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2 px-3 pb-5 pt-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          const badge = getBadgeCount(tab.key);

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex h-[72px] flex-col items-center justify-center rounded-2xl border text-xs font-bold shadow-lg ${
                active
                  ? "border-[#8eb8f5] bg-[#426da0] text-white"
                  : "border-[#c9a86a]/10 bg-[#111827] text-[#d8c08a]"
              }`}
            >
              {!!badge && (
                <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white">
                  {badge}
                </span>
              )}

              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}