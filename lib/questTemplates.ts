export type DailyQuestTemplate = {
  id: string;
  title: string;
  description: string;
  reward: string;
  is_urgent: boolean;
  status: "daily";
};

export const dailyQuestTemplates: DailyQuestTemplate[] = [
  {
    id: "daily-dishes",
    title: "皿洗い",
    description: "食器を洗って、シンク周りも軽く整える",
    reward: "感謝ポイント",
    is_urgent: false,
    status: "daily",
  },
  {
    id: "daily-toilet",
    title: "トイレ掃除",
    description: "便器・床・ペーパー周りをきれいにする",
    reward: "清潔ポイント",
    is_urgent: false,
    status: "daily",
  },
  {
    id: "daily-bath",
    title: "お風呂磨き",
    description: "浴槽と排水口まわりを掃除する",
    reward: "入浴ポイント",
    is_urgent: false,
    status: "daily",
  },
  {
    id: "daily-laundry",
    title: "洗濯物",
    description: "洗濯・干す・取り込み・たたむのどれかを対応する",
    reward: "生活ポイント",
    is_urgent: false,
    status: "daily",
  },
  {
    id: "daily-vacuum",
    title: "掃除機での掃除",
    description: "リビングや寝室など気になる場所に掃除機をかける",
    reward: "快適ポイント",
    is_urgent: false,
    status: "daily",
  },
];