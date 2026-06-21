import { useState, Suspense, lazy, useRef } from "react";
import { CREATURES, CreatureModel, RARITY_COLORS, CATEGORY_ICONS } from "./data/creatures";
import { breedCreatures } from "./utils/breeding";

const CreatureViewer = lazy(() => import("./components/CreatureViewer"));

/* ───────────── small reusable pieces ───────────── */

function PowerBar({ value, max = 10000 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">Sức Mạnh</span>
        <span className="font-bold text-amber-400">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#f59e0b)" }}
        />
      </div>
    </div>
  );
}

function CreatureCard({
  creature, selected, onClick, compact = false,
}: {
  creature: CreatureModel; selected: boolean; onClick: () => void; compact?: boolean;
}) {
  const rarityColor = RARITY_COLORS[creature.rarity];
  const icon = CATEGORY_ICONS[creature.category];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${compact ? "p-2.5" : "p-3"} ${
        selected
          ? "border-amber-500/80 bg-amber-500/10 shadow-lg shadow-amber-500/20"
          : "border-slate-700/60 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={compact ? "text-base" : "text-xl"}>{icon}</span>
        <div className="min-w-0 flex-1">
          <div className={`font-semibold text-white truncate ${compact ? "text-xs" : "text-sm"}`}>{creature.name}</div>
          {!compact && <div className="text-xs text-slate-400 truncate">{creature.nameEn}</div>}
        </div>
        <span
          className="text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
          style={{ color: rarityColor, background: rarityColor + "22", border: `1px solid ${rarityColor}44` }}
        >
          {compact ? creature.rarity.slice(0, 4) : creature.rarity}
        </span>
      </div>
    </button>
  );
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
      />
    </div>
  );
}

const CATEGORIES = ["Tất Cả", "Động Vật", "Huyền Thoại", "Thần Thú", "Yêu Quái"] as const;

/* ─────────── Breeding Modal ─────────── */
function BreedingModal({
  onClose,
  onResult,
}: {
  onClose: () => void;
  onResult: (c: CreatureModel) => void;
}) {
  const [parentA, setParentA] = useState<CreatureModel | null>(null);
  const [parentB, setParentB] = useState<CreatureModel | null>(null);
  const [result, setResult] = useState<CreatureModel | null>(null);
  const [breeding, setBreeding] = useState(false);
  const [search, setSearch] = useState("");

  const allCreatures = CREATURES;
  const filtered = allCreatures.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.nameEn.toLowerCase().includes(search.toLowerCase())
  );

  const handleBreed = () => {
    if (!parentA || !parentB) return;
    setBreeding(true);
    setTimeout(() => {
      const offspring = breedCreatures(parentA, parentB);
      setResult(offspring);
      setBreeding(false);
    }, 1800);
  };

  const handleViewResult = () => {
    if (result) {
      onResult(result);
      onClose();
    }
  };

  const selectParent = (c: CreatureModel) => {
    if (!parentA || (parentA && parentB)) {
      setParentA(c);
      setParentB(null);
      setResult(null);
    } else if (parentA && !parentB && c.id !== parentA.id) {
      setParentB(c);
      setResult(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0a0d1f] border border-slate-700/60 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <div>
            <h2 className="text-lg font-bold text-white">⚗️ Lai Giống Sinh Vật</h2>
            <p className="text-xs text-slate-400 mt-0.5">Chọn 2 sinh vật để tạo ra hậu duệ mới</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: creature picker */}
          <div className="w-56 border-r border-slate-800/60 flex flex-col p-3 gap-2">
            <SearchBar value={search} onChange={setSearch} />
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
              {filtered.map((c) => {
                const isParentA = parentA?.id === c.id;
                const isParentB = parentB?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => selectParent(c)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg border text-xs transition-all ${
                      isParentA
                        ? "border-blue-500/70 bg-blue-500/10 text-white"
                        : isParentB
                        ? "border-rose-500/70 bg-rose-500/10 text-white"
                        : "border-slate-700/40 bg-slate-800/30 text-slate-300 hover:border-slate-600 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{CATEGORY_ICONS[c.category]}</span>
                      <span className="font-medium truncate">{c.name}</span>
                      {isParentA && <span className="ml-auto text-blue-400 font-bold text-xs">A</span>}
                      {isParentB && <span className="ml-auto text-rose-400 font-bold text-xs">B</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 text-center">
              {!parentA ? "Chọn cha/mẹ A" : !parentB ? "Chọn cha/mẹ B" : "Sẵn sàng lai giống"}
            </p>
          </div>

          {/* Right: breeding arena */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5">
            {/* Parents display */}
            <div className="flex items-center gap-6 w-full">
              {/* Parent A */}
              <div className={`flex-1 rounded-xl border p-4 text-center transition-all ${parentA ? "border-blue-500/50 bg-blue-500/5" : "border-slate-700/40 bg-slate-800/20"}`}>
                {parentA ? (
                  <>
                    <div className="text-3xl mb-2">{CATEGORY_ICONS[parentA.category]}</div>
                    <div className="font-bold text-white text-sm">{parentA.name}</div>
                    <div className="text-xs text-slate-400">{parentA.nameEn}</div>
                    <div className="mt-2 text-xs font-semibold" style={{ color: RARITY_COLORS[parentA.rarity] }}>{parentA.rarity}</div>
                    <div className="mt-1 text-xs text-amber-400">⚡ {parentA.power.toLocaleString()}</div>
                    <div className="flex gap-1 justify-center mt-2">
                      <div className="w-4 h-4 rounded-full border border-slate-700" style={{ background: parentA.bodyColor }} />
                      <div className="w-4 h-4 rounded-full border border-slate-700" style={{ background: parentA.accentColor }} />
                      <div className="w-4 h-4 rounded-full border border-slate-700" style={{ background: parentA.glowColor }} />
                    </div>
                  </>
                ) : (
                  <div className="text-slate-500 text-sm py-4">
                    <div className="text-3xl mb-2 opacity-30">?</div>
                    Cha / Mẹ A
                  </div>
                )}
              </div>

              {/* Middle: breed button */}
              <div className="flex flex-col items-center gap-3">
                <div className="text-2xl">💞</div>
                <button
                  onClick={handleBreed}
                  disabled={!parentA || !parentB || breeding}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    parentA && parentB && !breeding
                      ? "bg-gradient-to-r from-purple-600 to-amber-500 text-white hover:from-purple-500 hover:to-amber-400 shadow-lg shadow-purple-500/30"
                      : "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {breeding ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang lai...
                    </span>
                  ) : "✨ Lai Giống"}
                </button>
                <div className="text-xs text-slate-500">×</div>
              </div>

              {/* Parent B */}
              <div className={`flex-1 rounded-xl border p-4 text-center transition-all ${parentB ? "border-rose-500/50 bg-rose-500/5" : "border-slate-700/40 bg-slate-800/20"}`}>
                {parentB ? (
                  <>
                    <div className="text-3xl mb-2">{CATEGORY_ICONS[parentB.category]}</div>
                    <div className="font-bold text-white text-sm">{parentB.name}</div>
                    <div className="text-xs text-slate-400">{parentB.nameEn}</div>
                    <div className="mt-2 text-xs font-semibold" style={{ color: RARITY_COLORS[parentB.rarity] }}>{parentB.rarity}</div>
                    <div className="mt-1 text-xs text-amber-400">⚡ {parentB.power.toLocaleString()}</div>
                    <div className="flex gap-1 justify-center mt-2">
                      <div className="w-4 h-4 rounded-full border border-slate-700" style={{ background: parentB.bodyColor }} />
                      <div className="w-4 h-4 rounded-full border border-slate-700" style={{ background: parentB.accentColor }} />
                      <div className="w-4 h-4 rounded-full border border-slate-700" style={{ background: parentB.glowColor }} />
                    </div>
                  </>
                ) : (
                  <div className="text-slate-500 text-sm py-4">
                    <div className="text-3xl mb-2 opacity-30">?</div>
                    Cha / Mẹ B
                  </div>
                )}
              </div>
            </div>

            {/* Arrow */}
            {(breeding || result) && (
              <div className="text-slate-500 text-lg">▼</div>
            )}

            {/* Breeding animation */}
            {breeding && (
              <div className="w-full rounded-xl border border-purple-500/30 bg-purple-500/5 p-6 text-center">
                <div className="flex justify-center gap-3 mb-3">
                  {[parentA?.glowColor, "#a855f7", parentB?.glowColor].map((c, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full animate-bounce"
                      style={{ background: c ?? "#888", animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <p className="text-sm text-purple-300 animate-pulse">Đang kết hợp năng lượng...</p>
              </div>
            )}

            {/* Result */}
            {result && !breeding && (
              <div
                className="w-full rounded-xl border p-5 text-center transition-all"
                style={{ borderColor: RARITY_COLORS[result.rarity] + "60", background: RARITY_COLORS[result.rarity] + "08" }}
              >
                <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: RARITY_COLORS[result.rarity] }}>
                  ✦ Hậu Duệ Mới — {result.rarity}
                </div>
                <div className="text-xl font-black text-white mb-0.5">{result.name}</div>
                <div className="text-xs text-slate-400 mb-3">{result.nameEn}</div>

                <div className="flex justify-center gap-3 mb-3">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-700" style={{ background: result.bodyColor, boxShadow: `0 0 8px ${result.bodyColor}` }} />
                  <div className="w-5 h-5 rounded-full border-2 border-slate-700" style={{ background: result.accentColor, boxShadow: `0 0 8px ${result.accentColor}` }} />
                  <div className="w-5 h-5 rounded-full border-2 border-slate-700" style={{ background: result.glowColor, boxShadow: `0 0 8px ${result.glowColor}` }} />
                </div>

                <div className="flex justify-center gap-4 text-xs text-slate-400 mb-4">
                  <span>⚡ {result.power.toLocaleString()}</span>
                  {result.hasWings && <span>🪶 Có cánh</span>}
                  {result.hasHorns && <span>🦄 Có sừng</span>}
                  {result.hasTail && <span>🐍 Có đuôi</span>}
                </div>

                <div className="flex gap-2 justify-center flex-wrap mb-4">
                  {result.abilities.map((ab, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-slate-700/60 text-slate-300">{ab}</span>
                  ))}
                </div>

                <button
                  onClick={handleViewResult}
                  className="px-6 py-2.5 rounded-xl font-semibold text-sm text-black transition-all shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${result.glowColor}, ${result.accentColor})` }}
                >
                  🎉 Xem Mô Hình 3D
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Main App ─────────── */
export default function App() {
  const [selected, setSelected] = useState<CreatureModel>(CREATURES[0]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("Tất Cả");
  const [tab, setTab] = useState<"info" | "abilities">("info");
  const [showBreeding, setShowBreeding] = useState(false);
  const [hybrids, setHybrids] = useState<CreatureModel[]>([]);

  const allCreatures = [...CREATURES, ...hybrids];

  const filtered = allCreatures.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Tất Cả" || c.category === category;
    return matchSearch && matchCat;
  });

  const rarityColor = RARITY_COLORS[selected.rarity];
  const isHybrid = hybrids.some((h) => h.id === selected.id);

  const handleBreedResult = (offspring: CreatureModel) => {
    setHybrids((prev) => [offspring, ...prev]);
    setSelected(offspring);
  };

  return (
    <div className="min-h-screen bg-[#050714] text-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-slate-800/60 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-sm">🐉</div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none">Thú Giới 3D</h1>
            <p className="text-xs text-slate-400">AI Tạo Mô Hình Sinh Vật</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hybrids.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
              🧬 {hybrids.length} hậu duệ
            </span>
          )}
          <button
            onClick={() => setShowBreeding(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-amber-500 text-white hover:from-purple-500 hover:to-amber-400 transition-all shadow-lg shadow-purple-500/25"
          >
            ⚗️ Lai Giống
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {allCreatures.length} sinh vật
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-64 border-r border-slate-800/60 flex flex-col flex-shrink-0 overflow-hidden">
          <div className="p-3 space-y-2 border-b border-slate-800/40">
            <SearchBar value={search} onChange={setSearch} />
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-2 py-0.5 rounded-full transition-all ${
                    category === cat
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "text-slate-400 border border-slate-700/60 hover:text-white hover:border-slate-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {hybrids.length > 0 && (
              <div className="text-xs text-purple-400/60 font-medium px-1 pt-1 pb-0.5">🧬 Hậu Duệ Lai</div>
            )}
            {filtered.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-8">Không tìm thấy sinh vật</div>
            ) : (
              filtered.map((c) => (
                <CreatureCard
                  key={c.id}
                  creature={c}
                  selected={selected.id === c.id}
                  onClick={() => setSelected(c)}
                  compact
                />
              ))
            )}
          </div>
        </aside>

        {/* Center — 3D viewer */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{ background: "radial-gradient(ellipse at center, #0d0d2b 0%, #050714 70%)" }}
        >
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
            {isHybrid && (
              <div className="text-xs text-purple-400 mb-1 flex items-center justify-center gap-1">
                🧬 Hậu Duệ Lai Giống
              </div>
            )}
            <div className="text-3xl font-black tracking-wide" style={{ textShadow: `0 0 30px ${selected.glowColor}` }}>
              {selected.name}
            </div>
            <div className="text-sm text-slate-400 mt-0.5">{selected.nameEn}</div>
          </div>

          <div className="absolute top-5 right-5 z-10">
            <span
              className="text-sm px-3 py-1 rounded-full font-semibold"
              style={{ color: rarityColor, background: rarityColor + "22", border: `1px solid ${rarityColor}55` }}
            >
              ✦ {selected.rarity}
            </span>
          </div>

          <div className="absolute inset-0">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 rounded-full border-2 border-amber-500/40 border-t-amber-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm">Đang tải mô hình 3D...</p>
                  </div>
                </div>
              }
            >
              <CreatureViewer key={selected.id} creature={selected} />
            </Suspense>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-xs text-slate-500 flex items-center gap-2 pointer-events-none">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
            </svg>
            Kéo để xoay • Cuộn để zoom
          </div>
        </div>

        {/* Right panel */}
        <aside className="w-72 border-l border-slate-800/60 flex flex-col flex-shrink-0 overflow-hidden">
          <div className="flex border-b border-slate-800/60 flex-shrink-0">
            {(["info", "abilities"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === t ? "text-amber-400 border-b-2 border-amber-500" : "text-slate-400 hover:text-white"
                }`}
              >
                {t === "info" ? "📋 Thông Tin" : "⚔️ Kỹ Năng"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {tab === "info" ? (
              <>
                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
                  <PowerBar value={selected.power} />
                </div>

                {isHybrid && (
                  <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/30 text-xs text-purple-300">
                    🧬 Sinh vật này là hậu duệ lai giống — mang đặc điểm hỗn hợp của hai dòng máu khác nhau.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Loại", value: selected.category },
                    { label: "Nguồn gốc", value: selected.origin.length > 18 ? selected.origin.slice(0, 16) + "…" : selected.origin },
                    { label: "Cánh", value: selected.hasWings ? "Có" : "Không" },
                    { label: "Sừng", value: selected.hasHorns ? `${selected.hornCount} cái` : "Không" },
                    { label: "Đuôi", value: selected.hasTail ? "Có" : "Không" },
                    { label: "Chân", value: selected.legCount === 0 ? "Không có" : `${selected.legCount} chân` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/40">
                      <div className="text-xs text-slate-500 mb-1">{label}</div>
                      <div className="text-sm font-medium text-white">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
                  <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Mô Tả</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{selected.description}</p>
                </div>

                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
                  <div className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Màu Sắc 3D</div>
                  <div className="flex gap-3">
                    {[
                      { label: "Thân", color: selected.bodyColor },
                      { label: "Điểm nhấn", color: selected.accentColor },
                      { label: "Hào quang", color: selected.glowColor },
                    ].map(({ label, color }) => (
                      <div key={label} className="text-center flex-1">
                        <div
                          className="w-8 h-8 rounded-full mx-auto mb-1 border-2 border-slate-700/60"
                          style={{ background: color, boxShadow: `0 0 8px ${color}66` }}
                        />
                        <div className="text-xs text-slate-500">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowBreeding(true)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/60 transition-all"
                >
                  ⚗️ Dùng để Lai Giống
                </button>
              </>
            ) : (
              <div className="space-y-3">
                {selected.abilities.map((ability, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-slate-800/40 rounded-xl p-4 border border-slate-700/40 hover:border-slate-600 transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: selected.glowColor + "22", border: `1px solid ${selected.glowColor}44` }}
                    >
                      {["⚡", "🔥", "💧", "🌪️", "✨", "☄️", "🌙", "⚔️"][i % 8]}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{ability}</div>
                      <div className="text-xs text-slate-500">Kỹ năng #{i + 1}</div>
                    </div>
                  </div>
                ))}

                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
                  <div className="text-xs text-slate-500 mb-3">Chỉ số chiến đấu</div>
                  {[
                    { label: "Tấn công", val: Math.min(99, Math.round(selected.power / 100)) },
                    { label: "Phòng thủ", val: Math.min(99, Math.round(selected.power / 120)) },
                    { label: "Tốc độ", val: selected.hasWings ? 95 : Math.min(99, Math.round(selected.power / 130)) },
                    { label: "Ma thuật", val: selected.emissiveIntensity > 0.8 ? 98 : Math.min(99, Math.round(selected.power / 110)) },
                  ].map(({ label, val }) => (
                    <div key={label} className="mb-2">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-400">{label}</span>
                        <span className="text-white font-medium">{val}</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${val}%`,
                            background: `linear-gradient(90deg, ${selected.glowColor}, ${selected.accentColor})`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Breeding modal */}
      {showBreeding && (
        <BreedingModal
          onClose={() => setShowBreeding(false)}
          onResult={handleBreedResult}
        />
      )}
    </div>
  );
}
