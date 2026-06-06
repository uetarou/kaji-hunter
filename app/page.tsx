import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

type Quest = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  reward: string | null;
  is_urgent: boolean;
  status: string;
  created_at: string;
};

const TEST_USER_ID = "11111111-1111-1111-1111-111111111111";

async function createQuest(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const category = String(formData.get("category") || "その他");
  const reward = String(formData.get("reward") || "");
  const isUrgent = formData.get("is_urgent") === "on";

  if (!title) return;

  await supabase.from("quests").insert({
    title,
    description,
    category,
    reward,
    is_urgent: isUrgent,
    status: "recruiting",
    created_by: TEST_USER_ID,
  });

  revalidatePath("/");
}

async function acceptQuest(formData: FormData) {
  "use server";

  const questId = String(formData.get("quest_id"));

  await supabase
    .from("quests")
    .update({
      status: "accepted",
      accepted_by: TEST_USER_ID,
    })
    .eq("id", questId);

  revalidatePath("/");
}

async function completeQuest(formData: FormData) {
  "use server";

  const questId = String(formData.get("quest_id"));

  await supabase
    .from("quests")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", questId);

  revalidatePath("/");
}

function calcHunterStats(quests: Quest[]) {
  const completedCount = quests.filter((quest) => quest.status === "completed").length;
  const xp = completedCount * 30;
  const hr = Math.floor(xp / 100) + 1;
  const currentXp = xp % 100;

  return {
    completedCount,
    xp,
    hr,
    currentXp,
    title:
      hr >= 10
        ? "伝説の家事ハンター"
        : hr >= 5
        ? "ベテランハンター"
        : hr >= 3
        ? "一人前ハンター"
        : "見習いハンター",
  };
}

export default async function Home() {
  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .order("created_at", { ascending: false });

  const quests: Quest[] = data || [];
  const stats = calcHunterStats(quests);

  return (
    <main className="min-h-screen bg-orange-50 text-neutral-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 pt-5">
        <header className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-orange-500">Guild Board</p>
          <h1 className="mt-1 text-3xl font-black">Kaji Hunter</h1>
          <p className="mt-2 text-sm text-neutral-500">
            家事をクエスト化して、パートナーと楽しく攻略しよう。
          </p>

          <div className="mt-4 rounded-2xl bg-orange-100 p-4">
            <p className="text-xs font-bold text-orange-700">あなたのHR</p>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-2xl font-black">HR {stats.hr}</p>
              <p className="text-sm font-bold text-orange-700">{stats.title}</p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-orange-400"
                style={{ width: `${stats.currentXp}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              XP {stats.currentXp} / 100　完了数 {stats.completedCount}
            </p>
          </div>
        </header>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-orange-500">New Quest</p>
          <h2 className="mt-1 text-xl font-black">クエスト依頼</h2>

          <form action={createQuest} className="mt-4 space-y-3">
            <input
              name="title"
              placeholder="例：お風呂掃除クエスト"
              className="w-full rounded-2xl border border-orange-100 px-4 py-3 text-sm outline-none"
              required
            />

            <textarea
              name="description"
              placeholder="内容：浴槽と床をきれいにする"
              className="min-h-24 w-full rounded-2xl border border-orange-100 px-4 py-3 text-sm outline-none"
            />

            <select
              name="category"
              className="w-full rounded-2xl border border-orange-100 px-4 py-3 text-sm outline-none"
            >
              <option value="掃除">掃除</option>
              <option value="洗い物">洗い物</option>
              <option value="買い物">買い物</option>
              <option value="料理">料理</option>
              <option value="洗濯">洗濯</option>
              <option value="その他">その他</option>
            </select>

            <input
              name="reward"
              placeholder="報酬：プリン1個"
              className="w-full rounded-2xl border border-orange-100 px-4 py-3 text-sm outline-none"
            />

            <label className="flex items-center gap-2 text-sm font-bold">
              <input name="is_urgent" type="checkbox" />
              緊急クエストにする
            </label>

            <button className="w-full rounded-2xl bg-orange-500 py-3 text-sm font-bold text-white shadow-sm">
              ギルドに依頼する
            </button>
          </form>
        </section>

        <section className="mb-4">
          <p className="text-xs font-bold text-orange-500">Quest List</p>
          <h2 className="text-xl font-black">クエストボード</h2>
        </section>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-100 p-4 text-sm font-bold text-red-700">
            Supabase接続エラー：{error.message}
          </div>
        )}

        <section className="space-y-3">
          {quests.length > 0 ? (
            quests.map((quest) => (
              <article
                key={quest.id}
                className={`rounded-3xl border bg-white p-4 shadow-sm ${
                  quest.is_urgent ? "border-red-200 bg-red-50" : "border-orange-100"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex gap-2">
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                        {quest.category}
                      </span>
                      {quest.is_urgent && (
                        <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                          緊急
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-lg font-black">{quest.title}</h3>
                  </div>

                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600">
                    {quest.status}
                  </span>
                </div>

                {quest.description && (
                  <p className="mb-2 text-sm text-neutral-500">{quest.description}</p>
                )}

                <p className="text-sm text-neutral-500">
                  報酬：<span className="font-bold">{quest.reward || "なし"}</span>
                </p>

                {quest.status === "recruiting" && (
                  <form action={acceptQuest}>
                    <input type="hidden" name="quest_id" value={quest.id} />
                    <button className="mt-4 w-full rounded-2xl bg-neutral-900 py-3 text-sm font-bold text-white">
                      クエスト受注
                    </button>
                  </form>
                )}

                {quest.status === "accepted" && (
                  <form action={completeQuest}>
                    <input type="hidden" name="quest_id" value={quest.id} />
                    <button className="mt-4 w-full rounded-2xl bg-orange-500 py-3 text-sm font-bold text-white">
                      達成報告する
                    </button>
                  </form>
                )}

                {quest.status === "completed" && (
                  <div className="mt-4 rounded-2xl bg-green-100 py-3 text-center text-sm font-bold text-green-700">
                    クエスト完了！
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-orange-100 bg-white p-6 text-center shadow-sm">
              <p className="text-lg font-black">クエストはまだありません</p>
              <p className="mt-2 text-sm text-neutral-500">
                クエストを依頼するとここに表示されます。
              </p>
            </div>
          )}
        </section>

        <nav className="fixed bottom-4 left-1/2 grid w-[calc(100%-32px)] max-w-md -translate-x-1/2 grid-cols-4 rounded-3xl bg-white p-2 shadow-lg">
          <button className="rounded-2xl bg-orange-100 py-3 text-xs font-bold text-orange-700">
            ボード
          </button>
          <button className="py-3 text-xs font-bold text-neutral-500">記録</button>
          <button className="py-3 text-xs font-bold text-neutral-500">依頼</button>
          <button className="py-3 text-xs font-bold text-neutral-500">
            マイページ
          </button>
        </nav>
      </div>
    </main>
  );
}