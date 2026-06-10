export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07111f] text-white">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#c9a86a]/40 bg-[#111827] text-4xl text-[#d8c08a] shadow-2xl">
          ⚔
        </div>
        <h1 className="mt-5 font-title text-4xl font-black">Kaji Hunter</h1>
        <p className="mt-3 text-sm font-bold text-[#d8c08a]">Guild Connection...</p>
      </div>
    </main>
  );
}
