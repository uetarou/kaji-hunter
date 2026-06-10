"use client";

import { useState } from "react";
import { requestPushPermission } from "@/lib/pushNotification";

type Props = {
  userId: string;
  setMessage: (message: string) => void;
};

export function PushNotificationButton({ userId, setMessage }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const result = await requestPushPermission(userId);
    setMessage(result.message);
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full rounded-2xl border border-emerald-300/40 bg-emerald-800 px-4 py-4 text-sm font-bold text-white shadow-lg disabled:opacity-60"
    >
      {loading ? "通知設定中..." : "スマホ通知をONにする"}
    </button>
  );
}
