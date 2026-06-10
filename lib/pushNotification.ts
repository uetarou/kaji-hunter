import { getToken } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";

export async function requestPushPermission(userId: string) {
  if (typeof window === "undefined") {
    return { ok: false, message: "ブラウザ環境ではありません。" };
  }

  if (!("Notification" in window)) {
    return { ok: false, message: "この端末は通知に対応していません。" };
  }

  if (!messaging) {
    return { ok: false, message: "Firebase Messagingの初期化に失敗しました。" };
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    return { ok: false, message: "通知が許可されませんでした。" };
  }

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  });

  if (!token) {
    return { ok: false, message: "通知トークンを取得できませんでした。" };
  }

  const { error } = await supabase.from("user_push_tokens").upsert(
    [
      {
        user_id: userId,
        token,
      },
    ],
    {
      onConflict: "user_id,token",
    }
  );

  if (error) {
    return { ok: false, message: `通知設定の保存に失敗しました: ${error.message}` };
  }

  return { ok: true, message: "スマホ通知をONにしました。" };
}