"use client";

import { useState } from "react";

export type ShopItem = {
  id: string;
  seller_id: string | null;
  pair_id: string | null;
  title: string;
  description: string | null;
  price: number;
  status: string;
  bought_by: string | null;
  created_at: string | null;
};

export function ShopView({
  userId,
  points,
  items,
  onBuy,
  onCreate,
}: {
  userId: string;
  points: number;
  items: ShopItem[];
  onBuy: (item: ShopItem) => void;
  onCreate: (input: { title: string; description: string; price: number }) => void;
}) {
  const [page, setPage] = useState<"top" | "buy" | "sell">("top");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(20);

  const buyableItems = items.filter(
    (item) => item.status === "available" && item.seller_id !== userId
  );

  const submit = () => {
    if (!title.trim()) return;
    onCreate({ title, description, price });
    setTitle("");
    setDescription("");
    setPrice(20);
    setPage("top");
  };

  if (page === "buy") {
    return (
      <section className="space-y-4">
        <PageHeader title="購入" sub="Partner Items" right={`${points}pt`} onBack={() => setPage("top")} />

        <div className="space-y-2.5">
          {buyableItems.length === 0 && <EmptyCard text="パートナーの出品はまだありません" />}

          {buyableItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onBuy(item)}
              disabled={points < item.price}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-emerald-300/20 bg-[#111827] p-3 text-left shadow-lg disabled:opacity-40"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#c9a86a]/20 bg-[#1f2937] text-xl">
                  🎁
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black">{item.title}</h3>
                  {item.description && <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{item.description}</p>}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-base font-black text-[#d8c08a]">{item.price}pt</p>
                <p className="text-xl text-[#d8c08a]">›</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (page === "sell") {
    return (
      <section className="space-y-4">
        <PageHeader title="出品" sub="Sell Item" right={`${points}pt`} onBack={() => setPage("top")} />

        <div className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-5 shadow-xl">
          <div className="space-y-4">
            <InputBlock label="商品名">
              <input
                placeholder="例：肩もみ10分"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
              />
            </InputBlock>

            <InputBlock label="説明">
              <textarea
                placeholder="例：寝る前に肩もみする"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-24 w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
              />
            </InputBlock>

            <InputBlock label="価格">
              <select
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
              >
                {[20, 30, 40, 50, 60, 80, 100, 150, 200].map((point) => (
                  <option key={point} value={point}>{point}pt</option>
                ))}
              </select>
            </InputBlock>

            <button onClick={submit} className="w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-4 font-black text-white shadow-lg">
              出品する
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#d8c08a]">Guild Shop</p>
          <h2 className="mt-1 font-title text-4xl font-black leading-none">ショップ</h2>
        </div>

        <div className="mb-1 rounded-full border border-[#c9a86a]/25 bg-[#111827] px-4 py-2 text-sm font-black text-[#d8c08a]">
          {points}pt
        </div>
      </div>

      <div className="space-y-3">
        <MenuCard sub="Partner Items" title="購入" description="パートナーの出品を買う" icon="🧺" tone="green" onClick={() => setPage("buy")} />
        <MenuCard sub="Sell Item" title="出品" description="報酬アイテムを並べる" icon="📦" tone="normal" onClick={() => setPage("sell")} />
      </div>
    </section>
  );
}

function MenuCard({
  sub,
  title,
  description,
  icon,
  tone,
  onClick,
}: {
  sub: string;
  title: string;
  description: string;
  icon: string;
  tone: "green" | "normal";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-4 rounded-3xl border p-5 text-left shadow-xl ${
        tone === "green"
          ? "border-emerald-300/25 bg-gradient-to-br from-[#0d221a] to-[#111827]"
          : "border-[#c9a86a]/15 bg-gradient-to-br from-[#111827] to-[#07111f]"
      }`}
    >
      <div>
        <p className="text-sm font-bold text-[#d8c08a]">{sub}</p>
        <h3 className="mt-2 text-3xl font-black">{title}</h3>
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      </div>
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-[#c9a86a]/20 bg-[#1f2937] text-3xl">{icon}</div>
    </button>
  );
}

function PageHeader({ title, sub, right, onBack }: { title: string; sub: string; right: string; onBack: () => void }) {
  return (
    <div>
      <button onClick={onBack} className="mb-4 rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] px-4 py-3 text-sm font-black text-[#d8c08a]">
        ‹ ショップに戻る
      </button>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#d8c08a]">{sub}</p>
          <h2 className="mt-1 font-title text-4xl font-black leading-none">{title}</h2>
        </div>
        <div className="mb-1 rounded-full border border-[#c9a86a]/25 bg-[#111827] px-4 py-2 text-sm font-black text-[#d8c08a]">{right}</div>
      </div>
    </div>
  );
}

function InputBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-bold text-[#d8c08a]">{label}</p>
      {children}
    </label>
  );
}

function EmptyCard({ text }: { text: string }) {
  return <div className="rounded-3xl border border-[#c9a86a]/10 bg-[#1f2937] p-7 text-center text-gray-400">{text}</div>;
}
