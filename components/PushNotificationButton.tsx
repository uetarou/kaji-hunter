"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { requestPushPermission } from "@/lib/pushNotification";

type Props = {
  userId: string;
  setMessage: (message: string) => void;
};

export function PushNotificationButton({ userId, setMessage }: Props) {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const checkEnabled = async () => {
    const { count, error } = await supabase
      .from("user_push_tokens")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      console.error(error);
      return;
    }

    setEnabled((count ?? 0) > 0);
  };

  useEffect(() => {
    checkEnabled();
  }, [userId]);

  const handleClick = async () => {
    if (loading || enabled) return;

    setLoading(true);

    try {
      const result = await requestPushPermission(userId);
      setMessage(result.message);

      await checkEnabled();
    } catch (error) {
      console.error(error);
      setMessage("通知設定中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || enabled}
      className="flex w-full items-center justify-between rounded-2xl border border-emerald-300/30 bg-[#1f2937] p-4 disabled:opacity-90"
    >
      <div className="text-left">
        <p className="text-lg font-black text-white">スマホ通知</p>
        <p className="mt-1 text-sm text-gray-400">
          {loading
            ? "通知設定中..."
            : enabled
            ? "この端末の通知はONです"
            : "この端末で通知を受け取る"}
        </p>
      </div>

      <div
        className={`relative h-9 w-16 rounded-full border transition ${
          enabled
            ? "border-emerald-300/50 bg-emerald-700"
            : "border-[#6e8fb4]/50 bg-[#355e8d]"
        }`}
      >
        <div
          className={`absolute top-1 h-7 w-7 rounded-full bg-white transition ${
            enabled ? "left-8" : "left-1"
          }`}
        />
      </div>
    </button>
  );
}