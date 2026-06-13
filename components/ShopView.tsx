"use client";

import { useMemo, useState } from "react";

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

  const buyableItems = useMemo(
    () => items.filter((item) => item.status === "available" && item.seller_id !== userId),
    [items, userId]
  );

  const myItems = useMemo(
    () => items.filter((item) => item.seller_id === userId && item.status === "available"),
    [items, userId]
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
      return;
    }

    onCreate({ title, description, price: safePrice });
    resetForm();
    setPage("top");
  };

  if (page === "buy") {
    return (
      <section className="space-y-4">
        <PageHeader title="購入" sub="Partner Items" right={`${points}pt`} onBack={() => setPage("top")} />

        <div className="space-y-2.5">
          {buyableItems.length === 0 && <EmptyCard text="パートナーの出品はまだありません" />}

          {buyableItems.map((item) => (
            <button key={item.id} onClick={() => onBuy(item)} disabled={points < item.price} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-emerald-300/20 bg-[#111827] p-3 text-left shadow-lg disabled:opacity-40">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#c9a86a]/25 bg-[#1f2937] text-[#d8c08a]"><GuildBadge /></div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black">{item.title}</h3>
                  {item.description && <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{item.description}</p>}
                </div>
              </div>
              <div className="shrink-0 text-right"><p className="text-base font-black text-[#d8c08a]">{item.price}pt</p><p className="text-xl text-[#d8c08a]">›</p></div>
            </button>
          ))}
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

        <section className="space-y-2">
          <div className="flex items-center justify-between px-1"><h3 className="text-sm font-black text-[#d8c08a]">自分の出品</h3><span className="text-xs text-gray-500">編集・取り下げ</span></div>
          {myItems.length === 0 && <EmptyCard text="出品中の商品はありません" />}
          {myItems.map((item) => (
            <div key={item.id} className="rounded-2xl border border-[#c9a86a]/15 bg-[#111827] p-3 shadow-lg">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-black">{item.title}</p>{item.description && <p className="mt-1 line-clamp-1 text-xs text-gray-400">{item.description}</p>}</div><p className="shrink-0 font-black text-[#d8c08a]">{item.price}pt</p></div>
              <div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => startEdit(item)} className="rounded-xl border border-[#6e8fb4]/50 bg-[#1f2937] py-2 text-xs font-black text-sky-100">編集</button><button onClick={() => onWithdraw?.(item)} className="rounded-xl border border-red-300/25 bg-red-950/30 py-2 text-xs font-black text-red-100">取り下げ</button></div>
            </div>
          ))}
        </section>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3"><div><p className="text-sm font-bold text-[#d8c08a]">Guild Shop</p><h2 className="mt-1 font-title text-4xl font-black leading-none">ショップ</h2></div><div className="mb-1 rounded-full border border-[#c9a86a]/25 bg-[#111827] px-4 py-2 text-sm font-black text-[#d8c08a]">{points}pt</div></div>
      <div className="space-y-3"><MenuCard sub="Partner Items" title="購入" description="パートナーの出品を買う" tone="buy" onClick={() => setPage("buy")} /><MenuCard sub="Sell Item" title="出品" description="報酬アイテムを並べる" tone="sell" onClick={() => setPage("sell")} /></div>
    </section>
  );
}

function MenuCard({ sub, title, description, tone, onClick }: { sub: string; title: string; description: string; tone: "buy" | "sell"; onClick: () => void }) {
  const isBuy = tone === "buy";
  return <button onClick={onClick} className={`flex w-full items-center justify-between gap-4 rounded-3xl border p-5 text-left shadow-xl ${isBuy ? "border-orange-300/30 bg-gradient-to-br from-[#3a2108] to-[#111827]" : "border-purple-300/30 bg-gradient-to-br from-[#26133a] to-[#111827]"}`}><div><p className="text-sm font-bold text-[#d8c08a]">{sub}</p><h3 className="mt-2 text-3xl font-black">{title}</h3><p className="mt-2 text-sm text-gray-400">{description}</p></div><div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full border bg-[#1f2937] ${isBuy ? "border-orange-300/30 text-orange-200" : "border-purple-300/30 text-purple-200"}`}>{isBuy ? <GuildBadge /> : <GuildChest />}</div></button>;
}

function GuildBadge() { return <svg viewBox="0 0 64 64" className="h-10 w-10" fill="currentColor"><path d="M32 5 42 18 58 16 49 31 57 48 39 45 32 59 25 45 7 48 15 31 6 16 22 18 32 5Z" opacity=".35"/><path d="M32 12 39 23 50 22 44 32 50 43 38 41 32 52 26 41 14 43 20 32 14 22 25 23 32 12Z"/><path d="M32 24 37 32 32 40 27 32 32 24Z" fill="#07111f"/></svg>; }
function GuildChest() { return <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"><path d="M12 27h40v27H12z"/><path d="M17 19h30l5 8H12l5-8Z"/><path d="M32 27v27"/><path d="M26 38h12v8H26z"/></svg>; }
function PageHeader({ title, sub, right, onBack }: { title: string; sub: string; right: string; onBack: () => void }) { return <div><button onClick={onBack} className="mb-4 rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] px-4 py-3 text-sm font-black text-[#d8c08a]">‹ ショップに戻る</button><div className="flex items-end justify-between gap-3"><div><p className="text-sm font-bold text-[#d8c08a]">{sub}</p><h2 className="mt-1 font-title text-4xl font-black leading-none">{title}</h2></div><div className="mb-1 rounded-full border border-[#c9a86a]/25 bg-[#111827] px-4 py-2 text-sm font-black text-[#d8c08a]">{right}</div></div></div>; }
function InputBlock({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><p className="mb-2 text-sm font-bold text-[#d8c08a]">{label}</p>{children}</label>; }
function EmptyCard({ text }: { text: string }) { return <div className="rounded-3xl border border-[#c9a86a]/10 bg-[#1f2937] p-7 text-center text-gray-400">{text}</div>; }
