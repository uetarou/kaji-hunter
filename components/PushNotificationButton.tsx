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

  useEffect(() => {
    const checkEnabled = async () => {
      const { data } = await supabase
        .from("user_push_tokens")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      setEnabled(!!data?.length);
    };

    checkEnabled();
  }, [userId]);

  const handleClick = async () => {
    if (loading || enabled) return;

    setLoading(true);

    try {
      const result = await requestPushPermission(userId);
      setMessage(result.message);
      setEnabled(result.ok);
    } catch (error) {
      console.error(error);
      setMessage("通知設定中にエラーが発生しました。");
      setEnabled(false);
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
          {enabled
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