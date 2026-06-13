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

    onCreate({
      title,
      description,
      price,
    });

    setTitle("");
    setDescription("");
    setPrice(20);
    setPage("top");
  };

  if (page === "buy") {
    return (
      <section className="space-y-4">
        <PageHeader
          title="購入できる商品"
          sub="Partner Items"
          right={`${points}pt`}
          onBack={() => setPage("top")}
        />

        <div className="space-y-3">
          {buyableItems.length === 0 && (
            <EmptyCard text="パートナーの出品はまだありません" />
          )}

          {buyableItems.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-[#0d221a] to-[#111827] p-4 shadow-xl"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-black">{item.title}</h3>
                  {item.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-lg font-black text-[#d8c08a]">{item.price}pt</p>
                  <button
                    onClick={() => onBuy(item)}
                    disabled={points < item.price}
                    className="mt-2 rounded-xl border border-emerald-300/40 bg-emerald-800 px-4 py-2 text-xs font-black text-white disabled:opacity-40"
                  >
                    購入
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (page === "sell") {
    return (
      <section className="space-y-4">
        <PageHeader
          title="商品を出品"
          sub="Sell Item"
          right={`${points}pt`}
          onBack={() => setPage("top")}
        />

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
                  <option key={point} value={point}>
                    {point}pt
                  </option>
                ))}
              </select>
            </InputBlock>

            <button
              onClick={submit}
              className="w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-4 font-black text-white shadow-lg"
            >
              出品する
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#d8c08a]">Guild Shop</p>
          <h2 className="mt-1 font-title text-4xl font-black">ショップ</h2>
        </div>

        <div className="mb-1 rounded-full border border-[#c9a86a]/25 bg-[#111827] px-4 py-2 text-sm font-black text-[#d8c08a]">
          {points}pt
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setPage("buy")}
          className="rounded-3xl border border-emerald-300/25 bg-gradient-to-br from-[#0d221a] to-[#111827] p-5 text-left shadow-xl"
        >
          <p className="text-sm font-bold text-[#d8c08a]">Partner Items</p>
          <h3 className="mt-2 text-3xl font-black">購入</h3>
          <p className="mt-3 text-sm text-gray-400">
            パートナーの出品を買う
          </p>
        </button>

        <button
          onClick={() => setPage("sell")}
          className="rounded-3xl border border-[#c9a86a]/15 bg-gradient-to-br from-[#111827] to-[#07111f] p-5 text-left shadow-xl"
        >
          <p className="text-sm font-bold text-[#d8c08a]">Sell Item</p>
          <h3 className="mt-2 text-3xl font-black">出品</h3>
          <p className="mt-3 text-sm text-gray-400">
            報酬アイテムを並べる
          </p>
        </button>
      </div>
    </section>
  );
}

function PageHeader({
  title,
  sub,
  right,
  onBack,
}: {
  title: string;
  sub: string;
  right: string;
  onBack: () => void;
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-5 rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] px-4 py-3 text-sm font-black text-[#d8c08a]"
      >
        ‹ ショップに戻る
      </button>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#d8c08a]">{sub}</p>
          <h2 className="mt-1 font-title text-4xl font-black">{title}</h2>
        </div>

        <div className="mb-1 rounded-full border border-[#c9a86a]/25 bg-[#111827] px-4 py-2 text-sm font-black text-[#d8c08a]">
          {right}
        </div>
      </div>
    </div>
  );
}

function InputBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-bold text-[#d8c08a]">{label}</p>
      {children}
    </label>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-[#c9a86a]/10 bg-[#1f2937] p-7 text-center text-gray-400">
      {text}
    </div>
  );
}
