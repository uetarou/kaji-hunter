"use client";

import { useEffect, useMemo, useState } from "react";

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

type ShopInput = { title: string; description: string; price: number };

export function ShopView({
  userId,
  points,
  items,
  onBuy,
  onCreate,
  onUpdate,
  onWithdraw,
}: {
  userId: string;
  points: number;
  items: ShopItem[];
  onBuy: (item: ShopItem) => void;
  onCreate: (input: ShopInput) => void;
  onUpdate?: (itemId: string, input: ShopInput) => void;
  onWithdraw?: (item: ShopItem) => void;
}) {
  const [page, setPage] = useState<"top" | "buy" | "sell">("top");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(20);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);

  useEffect(() => {
    const reset = () => {
      setPage("top");
      resetForm();
    };
    window.addEventListener("kaji-shop-reset", reset);
    return () => window.removeEventListener("kaji-shop-reset", reset);
  }, []);

  const buyableItems = useMemo(
    () => items.filter((item) => item.status === "available"),
    [items]
  );

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice(20);
    setEditingItem(null);
  };

  const startEdit = (item: ShopItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || "");
    setPrice(item.price);
    setPage("sell");
  };

  const submit = () => {
    const safePrice = Math.max(0, Math.floor(Number(price) || 0));
    if (!title.trim()) return;

    if (editingItem) {
      onUpdate?.(editingItem.id, { title, description, price: safePrice });
      resetForm();
      setPage("buy");
      return;
    }

    onCreate({ title, description, price: safePrice });
    resetForm();
    setPage("top");
  };

  if (page === "buy") {
    return (
      <section className="space-y-4">
        <PageHeader title="購入" sub="Guild Market" right={`${points}pt`} onBack={() => setPage("top")} />

        <div className="space-y-2.5">
          {buyableItems.length === 0 && <EmptyCard text="出品中の商品はありません" />}

          {buyableItems.map((item) => {
            const isMine = item.seller_id === userId;
            return (
              <div key={item.id} className="rounded-2xl border border-[#c9a86a]/15 bg-[#111827] p-3 shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border bg-[#1f2937] ${isMine ? "border-purple-300/30 text-purple-100" : "border-orange-300/30 text-orange-100"}`}>
                      <MarketIcon mine={isMine} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-black">{item.title}</h3>
                        {isMine && <span className="shrink-0 rounded-full border border-purple-300/30 bg-purple-500/15 px-2 py-0.5 text-[10px] font-black text-purple-100">自分</span>}
                      </div>
                      {item.description && <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{item.description}</p>}
                    </div>
                  </div>
                  <p className="shrink-0 text-lg font-black text-[#d8c08a]">{item.price}pt</p>
                </div>

                <div className={`mt-3 grid gap-2 ${isMine ? "grid-cols-3" : "grid-cols-1"}`}>
                  <button onClick={() => onBuy(item)} disabled={points < item.price} className="rounded-xl border border-orange-300/35 bg-orange-900/40 py-2.5 text-xs font-black text-orange-50 disabled:opacity-40">購入する</button>
                  {isMine && <button onClick={() => startEdit(item)} className="rounded-xl border border-[#6e8fb4]/50 bg-[#1f2937] py-2.5 text-xs font-black text-sky-100">価格変更</button>}
                  {isMine && <button onClick={() => onWithdraw?.(item)} className="rounded-xl border border-red-300/25 bg-red-950/30 py-2.5 text-xs font-black text-red-100">取り下げ</button>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (page === "sell") {
    return (
      <section className="space-y-4">
        <PageHeader title="出品" sub={editingItem ? "Edit Item" : "Sell Item"} right={`${points}pt`} onBack={() => { resetForm(); setPage("top"); }} />

        <div className="rounded-3xl border border-[#c9a86a]/15 bg-[#111827] p-5 shadow-xl">
          <div className="space-y-4">
            <InputBlock label="商品名"><input placeholder="例：肩もみ10分" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none" /></InputBlock>
            <InputBlock label="説明"><textarea placeholder="例：寝る前に肩もみする" value={description} onChange={(e) => setDescription(e.target.value)} className="h-24 w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none" /></InputBlock>
            <InputBlock label="価格（上限なし）"><input type="number" min={0} inputMode="numeric" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full rounded-2xl border border-[#c9a86a]/10 bg-[#1f2937] p-4 outline-none" /></InputBlock>
            <button onClick={submit} className="w-full rounded-2xl border border-[#6e8fb4] bg-[#355e8d] py-4 font-black text-white shadow-lg">{editingItem ? "出品を更新する" : "出品する"}</button>
            {editingItem && <button onClick={resetForm} className="w-full rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] py-3 font-black text-[#d8c08a]">新規出品に戻す</button>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3"><div><p className="text-sm font-bold text-[#d8c08a]">Guild Shop</p><h2 className="mt-1 font-title text-4xl font-black leading-none">ショップ</h2></div><div className="mb-1 rounded-full border border-[#c9a86a]/25 bg-[#111827] px-4 py-2 text-sm font-black text-[#d8c08a]">{points}pt</div></div>
      <div className="space-y-3"><MenuCard sub="Guild Market" title="購入" description="出品中のアイテムを買う" tone="buy" onClick={() => setPage("buy")} /><MenuCard sub="Sell Item" title="出品" description="報酬アイテムを出品する" tone="sell" onClick={() => setPage("sell")} /></div>
    </section>
  );
}

function MenuCard({ sub, title, description, tone, onClick }: { sub: string; title: string; description: string; tone: "buy" | "sell"; onClick: () => void }) {
  const isBuy = tone === "buy";
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between gap-4 overflow-hidden rounded-3xl border p-5 text-left shadow-xl transition active:scale-[0.99] ${isBuy ? "border-orange-300/35 bg-gradient-to-br from-[#4a2608] via-[#24160d] to-[#111827]" : "border-purple-300/35 bg-gradient-to-br from-[#31174a] via-[#20112d] to-[#111827]"}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#d8c08a]">{sub}</p>
        <h3 className="mt-2 text-3xl font-black">{title}</h3>
        <p className="mt-2 text-sm text-gray-300/75">{description}</p>
      </div>
      <div className={`grid h-20 w-20 shrink-0 place-items-center rounded-2xl border bg-[#1f2937]/90 ${isBuy ? "border-orange-200/40 text-orange-100" : "border-purple-200/40 text-purple-100"}`}>
        {isBuy ? <CoinPouchIcon /> : <TreasureChestIcon />}
      </div>
      <span className="text-3xl font-black text-[#d8c08a]/70 transition group-active:translate-x-1">›</span>
    </button>
  );
}

function MarketIcon({ mine }: { mine: boolean }) {
  return mine ? <TreasureChestIcon small /> : <CoinPouchIcon small />;
}

function CoinPouchIcon({ small = false }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={small ? "h-8 w-8" : "h-14 w-14"} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 9h20l-4 10H26L22 9Z" fill="currentColor" opacity="0.16" />
      <path d="M25 19h14" />
      <path d="M17 29c3-7 9-10 15-10s12 3 15 10c6 13 1 26-15 26S11 42 17 29Z" fill="currentColor" opacity="0.12" />
      <path d="M17 29c3-7 9-10 15-10s12 3 15 10c6 13 1 26-15 26S11 42 17 29Z" />
      <path d="M25 34h14" />
      <path d="M32 27v20" />
      <path d="M38 31c-2-3-10-3-12 1-2 5 12 4 11 9-1 4-9 5-13 1" />
    </svg>
  );
}

function TreasureChestIcon({ small = false }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={small ? "h-8 w-8" : "h-14 w-14"} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 28h42v25H11z" fill="currentColor" opacity="0.12" />
      <path d="M15 18h34l4 10H11l4-10Z" />
      <path d="M11 28h42v25H11z" />
      <path d="M32 28v25" />
      <path d="M25 37h14v9H25z" />
      <path d="M18 18c2-6 7-10 14-10s12 4 14 10" />
    </svg>
  );
}

function PageHeader({ title, sub, right, onBack }: { title: string; sub: string; right: string; onBack: () => void }) { return <div><button onClick={onBack} className="mb-4 rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] px-4 py-3 text-sm font-black text-[#d8c08a]">‹ ショップに戻る</button><div className="flex items-end justify-between gap-3"><div><p className="text-sm font-bold text-[#d8c08a]">{sub}</p><h2 className="mt-1 font-title text-4xl font-black leading-none">{title}</h2></div><div className="mb-1 rounded-full border border-[#c9a86a]/25 bg-[#111827] px-4 py-2 text-sm font-black text-[#d8c08a]">{right}</div></div></div>; }
function InputBlock({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><p className="mb-2 text-sm font-black text-[#d8c08a]">{label}</p>{children}</label>; }
function EmptyCard({ text }: { text: string }) { return <div className="rounded-3xl border border-[#c9a86a]/10 bg-[#1f2937] p-7 text-center text-gray-400">{text}</div>; }
