"use client";

import { useState } from "react";

export function SettingsView({
  hunterName,
  setHunterName,
  inviteCode,
  partnerCode,
  setPartnerCode,
  onSaveProfile,
  onLinkPartner,
}: {
  hunterName: string;
  setHunterName: (value: string) => void;
  inviteCode: string;
  partnerCode: string;
  setPartnerCode: (value: string) => void;
  onSaveProfile: () => void;
  onLinkPartner: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-[#c9a86a]/20 bg-gradient-to-br from-[#111827] to-[#07111f] p-5 shadow-2xl">
        <p className="text-sm font-bold text-[#d8c08a]">Hunter Settings</p>
        <h2 className="mt-1 font-title text-3xl font-black">設定</h2>
      </div>

      <div className="space-y-4">
        <SettingCard title="ハンター情報">
          <div className="space-y-3">
            <div>
              <p className="mb-2 text-sm font-bold text-[#d8c08a]">
                ハンター名
              </p>

              <input
                value={hunterName}
                onChange={(e) => setHunterName(e.target.value)}
                placeholder="ハンター名を入力"
                className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 text-sm outline-none"
              />
            </div>

            <button
              onClick={onSaveProfile}
              className="w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-3 font-bold text-white"
            >
              保存する
            </button>
          </div>
        </SettingCard>

        <SettingCard title="パートナー設定">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-bold text-[#d8c08a]">
                自分の招待コード
              </p>

              <div className="flex gap-2">
                <div className="flex-1 rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 text-sm font-bold tracking-wider text-white">
                  {inviteCode || "生成中..."}
                </div>

                <button
                  onClick={copyInviteCode}
                  className="rounded-2xl border border-[#6e8fb4] bg-[#355e8d] px-4 text-sm font-bold text-white"
                >
                  コピー
                </button>
              </div>

              {copied && (
                <p className="mt-2 text-xs text-emerald-300">
                  コピーしました！
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-bold text-[#d8c08a]">
                パートナー招待コード
              </p>

              <input
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value)}
                placeholder="招待コードを入力"
                className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 text-sm outline-none"
              />
            </div>

            <button
              onClick={onLinkPartner}
              className="w-full rounded-2xl border border-emerald-300/40 bg-emerald-800 py-3 font-bold text-white"
            >
              パートナーと連携する
            </button>
          </div>
        </SettingCard>

        <SettingCard title="通知設定">
          <div className="space-y-3">
            <NotificationItem
              title="クエスト受注通知"
              description="パートナーが受注した時に通知"
            />

            <NotificationItem
              title="完了報告通知"
              description="完了報告が送られた時に通知"
            />

            <NotificationItem
              title="緊急依頼通知"
              description="緊急クエスト時に通知"
            />
          </div>
        </SettingCard>
      </div>
    </section>
  );
}

function SettingCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-5 shadow-xl">
      <h3 className="mb-4 text-xl font-black">{title}</h3>
      {children}
    </div>
  );
}

function NotificationItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4">
      <div className="pr-3">
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-xs text-gray-400">{description}</p>
      </div>

      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative h-7 w-14 rounded-full transition ${
          enabled ? "bg-emerald-500" : "bg-gray-600"
        }`}
      >
        <div
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            enabled ? "right-1" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}