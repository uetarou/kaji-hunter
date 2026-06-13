"use client";

import { useState } from "react";
import type { Profile, ShopItem } from "@/app/page";

export function ShopView({
  profile,
  partnerProfile,
  items,
  onCreateItem,
  onBuyItem,
}: {
  profile: Profile | null;
  partnerProfile: Profile | null;
  items: ShopItem[];
  onCreateItem: (input: { title: string; description: string; price: number }) => void;
  onBuyItem: (item: ShopItem) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(20);

  const partnerItems = items.filter(
    (item) => item.status === "available" && item.seller_id === partnerProfile?.id
  );

  const myItems = items.filter((item) => item.seller_id === profile?.id);

  const submit = () => {
    if (!title.trim()) return;
    onCreateItem({ title, description, price });
    setTitle("");
    setDescription("");
    setPrice(20);
  };

  return (
    <section className="space-y-5">
      <div className="px-1">
        <p className="text-sm font-bold text-[#d8c08a]">Guild Shop</p>
        <h2 className="mt-1 font-title text-3xl font-black">ショップ</h2>
      </div>

      <div className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-5 shadow-xl">
        <p className="text-sm text-gray-400">所持ポイント</p>
        <p className="mt-1 text-4xl font-black text-[#d8c08a]">{profile?.points ?? 0} pt</p>
      </div>

      <div className="rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-[#0d261c] to-[#111827] p-5 shadow-xl">
        <p className="text-sm font-bold text-[#d8c08a]">Partner Items</p>
        <h3 className="mt-1 font-title text-2xl font-black">購入できる商品</h3>

        <div className="mt-4 space-y-3">
          {partnerItems.length === 0 && (
            <EmptyCard text="パートナーの出品はまだありません" />
          )}

          {partnerItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              canBuy={(profile?.points ?? 0) >= item.price}
              onBuy={() => onBuyItem(item)}
            />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-5 shadow-xl">
        <p className="text-sm font-bold text-[#d8c08a]">Sell Item</p>
        <h3 className="mt-1 font-title text-2xl font-black">商品を出品</h3>

        <div className="mt-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：肩もみ10分"
            className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="商品の説明"
            className="h-24 w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none"
          />

          <div className="rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-400">価格</span>
              <span className="text-2xl font-black text-[#d8c08a]">{price} pt</span>
            </div>
            <input
              type="range"
              min={10}
              max={300}
              step={10}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={submit}
            className="w-full rounded-2xl border border-[#c9a86a]/40 bg-[#355e8d] py-4 font-black text-white shadow-lg"
          >
            出品する
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-5 shadow-xl">
        <p className="text-sm font-bold text-[#d8c08a]">My Items</p>
        <h3 className="mt-1 font-title text-2xl font-black">自分の出品</h3>

        <div className="mt-4 space-y-3">
          {myItems.length === 0 && <EmptyCard text="自分の出品はまだありません" />}

          {myItems.map((item) => (
            <div key={item.id} className="rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-black">{item.title}</h4>
                  <p className="mt-1 text-sm text-gray-400">{item.description || "説明なし"}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#111827] px-3 py-1 text-sm font-black text-[#d8c08a]">
                  {item.price} pt
                </span>
              </div>
              <p className="mt-3 text-xs text-gray-400">
                {item.status === "available" ? "販売中" : "購入済み"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ItemCard({ item, canBuy, onBuy }: { item: ShopItem; canBuy: boolean; onBuy: () => void }) {
  return (
    <div className="rounded-2xl border border-emerald-300/10 bg-[#1f2937] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-lg font-black">{item.title}</h4>
          <p className="mt-1 text-sm leading-6 text-gray-400">{item.description || "説明なし"}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#111827] px-3 py-1 text-sm font-black text-[#d8c08a]">
          {item.price} pt
        </span>
      </div>

      <button
        onClick={onBuy}
        disabled={!canBuy}
        className="mt-4 w-full rounded-2xl border border-emerald-300/40 bg-emerald-800 py-3 text-sm font-black text-white disabled:opacity-50"
      >
        {canBuy ? "購入する" : "ポイント不足"}
      </button>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-5 text-center text-sm text-gray-400">
      {text}
    </div>
  );
}
