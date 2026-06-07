import { Home, ScrollText, Settings, Sword } from "lucide-react";

export function BottomNav({
  activeTab,
  setActiveTab,
  questCount,
  requestCount,
  unreadCount,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  questCount: number;
  requestCount: number;
  unreadCount: number;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#c9a86a]/10 bg-[#08101d]/90 px-3 py-3 backdrop-blur-2xl">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        <NavButton
          label="ホーム"
          active={activeTab === "home"}
          onClick={() => setActiveTab("home")}
          badge={requestCount}
          icon={<Home size={21} />}
        />
        <NavButton
          label="クエスト"
          active={activeTab === "quests"}
          onClick={() => setActiveTab("quests")}
          badge={questCount}
          icon={<Sword size={21} />}
        />
        <NavButton
          label="依頼"
          active={activeTab === "request"}
          onClick={() => setActiveTab("request")}
          icon={<ScrollText size={21} />}
        />
        <NavButton
          label="設定"
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          badge={unreadCount}
          icon={<Settings size={21} />}
        />
      </div>
    </div>
  );
}

function NavButton({
  label,
  active,
  onClick,
  badge,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border px-2 py-3 backdrop-blur-xl transition-all duration-300 ${
        active
          ? "scale-[1.03] border-[#89a9cf] bg-gradient-to-b from-[#446f9f] to-[#28476d] text-[#f4e7c5] shadow-[0_0_25px_rgba(100,160,255,0.45)]"
          : "border-[#c9a86a]/10 bg-[#111827]/80 text-[#d8c08a]"
      }`}
    >
      <div className={active ? "text-[#f4e7c5]" : "text-[#6e8fb4]"}>
        {icon}
      </div>

      <span className="text-[11px] font-bold">{label}</span>

      {!!badge && (
        <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
          {badge}
        </div>
      )}
    </button>
  );
}