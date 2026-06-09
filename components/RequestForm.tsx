function RequestModal({
  type,
  onClose,
  onCreate,
}: {
  type: "normal" | "urgent";
  onClose: () => void;
  onCreate: (quest: CreateQuestInput) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [reward, setReward] = useState("");

  const isUrgent = type === "urgent";

  const submit = () => {
    if (!title.trim()) return;

    const dueAt =
      dueDate && dueTime
        ? new Date(`${dueDate}T${dueTime}`).toISOString()
        : null;

    onCreate({
      title,
      description,
      reward,
      dueAt,
      isUrgent,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm">
      <div className="absolute left-0 right-0 top-[108px] bottom-[84px] px-2">
        <div
          className={`relative h-full w-full overflow-hidden rounded-[32px] border bg-gradient-to-b from-[#111827] via-[#0b1425] to-[#07111f] shadow-[0_0_50px_rgba(0,0,0,0.8)] ${
            isUrgent
              ? "border-red-300/35"
              : "border-[#c9a86a]/35"
          }`}
        >
          <Corner position="left-top" urgent={isUrgent} />
          <Corner position="right-top" urgent={isUrgent} />
          <Corner position="left-bottom" urgent={isUrgent} />
          <Corner position="right-bottom" urgent={isUrgent} />

          {/* HEADER */}
          <div className="absolute left-0 right-0 top-0 border-b border-[#c9a86a]/15 px-5 pb-4 pt-5">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black tracking-wide ${
                    isUrgent
                      ? "border-red-300/50 bg-red-500/20 text-red-100"
                      : "border-[#6e8fb4]/60 bg-[#355e8d]/30 text-blue-100"
                  }`}
                >
                  {isUrgent ? "URGENT QUEST" : "NORMAL QUEST"}
                </span>

                <h2 className="mt-3 font-title text-5xl font-black leading-none">
                  {isUrgent ? "緊急依頼" : "通常依頼"}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c9a86a]/15 bg-[#1f2937] text-3xl text-gray-400 shadow-lg"
              >
                ✕
              </button>
            </div>
          </div>

          {/* FORM */}
          <div className="absolute inset-x-0 bottom-[112px] top-[170px] overflow-y-auto px-5">
            <div className="space-y-5 pb-10">
              <InputBlock label="クエスト名">
                <input
                  placeholder="例：お風呂掃除"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-3xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-5 py-4 text-base outline-none"
                />
              </InputBlock>

              <InputBlock label="依頼内容">
                <textarea
                  placeholder="例：浴槽と排水口までお願い！"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-36 w-full rounded-3xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-5 py-4 text-base outline-none"
                />
              </InputBlock>

              <div className="grid grid-cols-2 gap-4">
                <InputBlock label="希望日">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-3xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-4 py-4 text-sm outline-none"
                  />
                </InputBlock>

                <InputBlock label="希望時間">
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full rounded-3xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-4 py-4 text-sm outline-none"
                  />
                </InputBlock>
              </div>

              <InputBlock label="報酬">
                <input
                  placeholder="例：プリン / 肩もみ"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  className="w-full rounded-3xl border border-[#c9a86a]/20 bg-[#1f2937]/90 px-5 py-4 text-base outline-none"
                />
              </InputBlock>

              <p className="text-center text-xs text-gray-400">
                ※ パートナーのクエストボードに表示されます
              </p>
            </div>
          </div>

          {/* BUTTON */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-[#c9a86a]/15 bg-[#07111f]/90 px-5 pb-5 pt-4">
            <button
              onClick={submit}
              className={`relative w-full overflow-hidden rounded-3xl border py-5 text-xl font-black text-white shadow-2xl ${
                isUrgent
                  ? "border-red-300/60 bg-gradient-to-r from-red-900 to-red-700"
                  : "border-[#c9a86a]/70 bg-gradient-to-r from-[#16315f] via-[#355e8d] to-[#16315f]"
              }`}
            >
              <span className="absolute inset-x-5 top-1 h-px bg-white/40" />

              {isUrgent
                ? "緊急クエストを依頼する"
                : "ギルドに依頼する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}