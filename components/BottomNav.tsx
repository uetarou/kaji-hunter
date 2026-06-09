type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  questCount: number;
  requestCount: number;
  unreadCount: number;
};

export function BottomNav({
  activeTab,
  setActiveTab,
}: Props) {
  const tabs = [
    ["home", "ホーム"],
    ["quests", "クエスト"],
    ["request", "依頼"],
    ["settings", "設定"],
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#c9a86a]/20 bg-[#07111f]/95 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-3 px-4 py-4">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded-2xl border py-4 text-sm font-bold ${
              activeTab === key
                ? "border-[#8eb8f5] bg-[#426da0]"
                : "border-[#c9a86a]/10 bg-[#111827]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}