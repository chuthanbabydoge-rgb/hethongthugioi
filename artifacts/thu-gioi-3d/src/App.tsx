import { useState, useRef } from "react";
import { CREATURES, CreatureModel, RARITY_COLORS, CATEGORY_ICONS } from "./data/creatures";
import { breedCreatures } from "./utils/breeding";
import { generateCreatureFromText } from "./utils/aiGenerator";
import CreatureViewer from "./components/CreatureViewer";

/* ──────────── PowerBar ──────────── */
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

/* ──────────── CreatureCard ──────────── */
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
      className={`w-full text-left rounded-xl border transition-all duration-200 ${compact ? "p-2.5" : "p-3"} ${
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

/* ──────────── SearchBar ──────────── */
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

/* ──────────── AI Generator Panel ──────────── */
function AIGeneratorPanel({ onResult }: { onResult: (c: CreatureModel) => void }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCreature, setLastCreature] = useState<CreatureModel | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const examples = [
    "Rồng lửa khổng lồ",
    "Phượng Hoàng băng",
    "Quỷ bóng tối có cánh",
    "Thần thú sấm sét",
    "Linh thú rừng xanh",
  ];

  const handleGenerate = (text?: string) => {
    const input = (text ?? prompt).trim();
    if (!input) return;
    setLoading(true);
    setPrompt(input);
    setTimeout(() => {
      const creature = generateCreatureFromText(input);
      setLastCreature(creature);
      onResult(creature);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="p-3 border-b border-slate-800/60 space-y-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">✨</span>
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">AI Tạo Sinh Vật</span>
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="Nhập tên hoặc mô tả..."
          className="flex-1 min-w-0 px-3 py-2 bg-slate-900 border border-slate-600/60 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors"
        />
        <button
          onClick={() => handleGenerate()}
          disabled={loading || !prompt.trim()}
          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            prompt.trim() && !loading
              ? "bg-gradient-to-r from-purple-600 to-amber-500 text-white hover:from-purple-500 hover:to-amber-400 shadow-md shadow-purple-500/30"
              : "bg-slate-700/50 text-slate-500 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Tạo...
            </span>
          ) : "Tạo"}
        </button>
      </div>

      {/* Example prompts */}
      <div className="flex flex-wrap gap-1">
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => handleGenerate(ex)}
            className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>

      {lastCreature && (
        <div
          className="flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer hover:opacity-80 transition-opacity"
          style={{ borderColor: RARITY_COLORS[lastCreature.rarity] + "55", background: RARITY_COLORS[lastCreature.rarity] + "0a" }}
          onClick={() => onResult(lastCreature)}
        >
          <span className="text-lg">{CATEGORY_ICONS[lastCreature.category]}</span>
          <div className="min-w-0">
            <div className="font-semibold text-white truncate">{lastCreature.name}</div>
            <div style={{ color: RARITY_COLORS[lastCreature.rarity] }}>{lastCreature.rarity} · ⚡{lastCreature.power.toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────── Breeding Modal ──────────── */
function BreedingModal({
  allCreatures, onClose, onResult,
}: {
  allCreatures: CreatureModel[];
  onClose: () => void;
  onResult: (c: CreatureModel) => void;
}) {
  const [parentA, setParentA] = useState<CreatureModel | null>(null);
  const [parentB, setParentB] = useState<CreatureModel | null>(null);
  const [result, setResult] = useState<CreatureModel | null>(null);
  const [breeding, setBreeding] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = allCreatures.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(search.toLowerCase())
  );

  const handleBreed = () => {
    if (!parentA || !parentB) return;
    setBreeding(true);
    setTimeout(() => {
      setResult(breedCreatures(parentA, parentB));
      setBreeding(false);
    }, 1800);
  };

  const selectParent = (c: CreatureModel) => {
    if (!parentA || (parentA && parentB)) { setParentA(c); setParentB(null); setResult(null); }
    else if (parentA && !parentB && c.id !== parentA.id) { setParentB(c); setResult(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0a0d1f] border border-slate-700/60 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <div>
            <h2 className="text-lg font-bold text-white">⚗️ Lai Giống Sinh Vật</h2>
            <p className="text-xs text-slate-400 mt-0.5">Chọn 2 sinh vật để tạo hậu duệ mới</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-52 border-r border-slate-800/60 flex flex-col p-3 gap-2">
            <SearchBar value={search} onChange={setSearch} />
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
              {filtered.map((c) => {
                const isA = parentA?.id === c.id, isB = parentB?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => selectParent(c)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg border text-xs transition-all ${
                      isA ? "border-blue-500/70 bg-blue-500/10 text-white"
                         : isB ? "border-rose-500/70 bg-rose-500/10 text-white"
                         : "border-slate-700/40 bg-slate-800/30 text-slate-300 hover:border-slate-600 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{CATEGORY_ICONS[c.category]}</span>
                      <span className="font-medium truncate">{c.name}</span>
                      {isA && <span className="ml-auto text-blue-400 font-bold">A</span>}
                      {isB && <span className="ml-auto text-rose-400 font-bold">B</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 text-center">
              {!parentA ? "Chọn cha/mẹ A" : !parentB ? "Chọn cha/mẹ B" : "Sẵn sàng lai giống"}
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5">
            <div className="flex items-center gap-6 w-full">
              {[parentA, parentB].map((parent, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-xl border p-4 text-center transition-all ${
                    parent
                      ? idx === 0 ? "border-blue-500/50 bg-blue-500/5" : "border-rose-500/50 bg-rose-500/5"
                      : "border-slate-700/40 bg-slate-800/20"
                  }`}
                >
                  {parent ? (
                    <>
                      <div className="text-3xl mb-2">{CATEGORY_ICONS[parent.category]}</div>
                      <div className="font-bold text-white text-sm">{parent.name}</div>
                      <div className="text-xs text-slate-400">{parent.nameEn}</div>
                      <div className="mt-2 text-xs font-semibold" style={{ color: RARITY_COLORS[parent.rarity] }}>{parent.rarity}</div>
                      <div className="mt-1 text-xs text-amber-400">⚡ {parent.power.toLocaleString()}</div>
                      <div className="flex gap-1 justify-center mt-2">
                        {[parent.bodyColor, parent.accentColor, parent.glowColor].map((c, i) => (
                          <div key={i} className="w-4 h-4 rounded-full border border-slate-700" style={{ background: c }} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500 text-sm py-4">
                      <div className="text-3xl mb-2 opacity-30">?</div>
                      {idx === 0 ? "Cha / Mẹ A" : "Cha / Mẹ B"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2">
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
            </div>

            {breeding && (
              <div className="w-full rounded-xl border border-purple-500/30 bg-purple-500/5 p-6 text-center">
                <div className="flex justify-center gap-3 mb-3">
                  {[parentA?.glowColor, "#a855f7", parentB?.glowColor].map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-full animate-bounce" style={{ background: c ?? "#888", animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p className="text-sm text-purple-300 animate-pulse">Đang kết hợp năng lượng...</p>
              </div>
            )}

            {result && !breeding && (
              <div
                className="w-full rounded-xl border p-5 text-center"
                style={{ borderColor: RARITY_COLORS[result.rarity] + "60", background: RARITY_COLORS[result.rarity] + "08" }}
              >
                <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: RARITY_COLORS[result.rarity] }}>
                  ✦ Hậu Duệ Mới — {result.rarity}
                </div>
                <div className="text-xl font-black text-white mb-0.5">{result.name}</div>
                <div className="text-xs text-slate-400 mb-3">{result.nameEn}</div>
                <div className="flex justify-center gap-3 mb-3">
                  {[result.bodyColor, result.accentColor, result.glowColor].map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-slate-700" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
                  ))}
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
                  onClick={() => { onResult(result!); onClose(); }}
                  className="px-6 py-2.5 rounded-xl font-semibold text-sm text-black transition-all shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${result.glowColor}, ${result.accentColor})` }}
                >
                  🎉 Xem Mô Hình
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────── Main App ──────────── */
const CATEGORIES = ["Tất Cả", "Động Vật", "Huyền Thoại", "Thần Thú", "Yêu Quái"] as const;

export default function App() {
  const [selected, setSelected] = useState<CreatureModel>(CREATURES[0]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("Tất Cả");
  const [tab, setTab] = useState<"info" | "abilities">("info");
  const [showBreeding, setShowBreeding] = useState(false);
  const [generated, setGenerated] = useState<CreatureModel[]>([]);

  const allCreatures = [...CREATURES, ...generated];

  const filtered = allCreatures.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Tất Cả" || c.category === category;
    return matchSearch && matchCat;
  });

  const rarityColor = RARITY_COLORS[selected.rarity];
  const isGenerated = generated.some((g) => g.id === selected.id);

  const handleAIResult = (creature: CreatureModel) => {
    setGenerated((prev) => {
      const exists = prev.find((g) => g.id === creature.id);
      if (exists) return prev;
      return [creature, ...prev];
    });
    setSelected(creature);
  };

  const handleBreedResult = (offspring: CreatureModel) => {
    setGenerated((prev) => [offspring, ...prev]);
    setSelected(offspring);
  };

  return (
    <div className="min-h-screen bg-[#050714] text-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Header ── */}
      <header className="border-b border-slate-800/60 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-sm">🐉</div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none">Thú Giới 3D</h1>
            <p className="text-xs text-slate-400">AI Tạo Mô Hình Sinh Vật</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {generated.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
              ✨ {generated.length} đã tạo
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

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left sidebar ── */}
        <aside className="w-64 border-r border-slate-800/60 flex flex-col flex-shrink-0 overflow-hidden">
          {/* AI Generator */}
          <AIGeneratorPanel onResult={handleAIResult} />

          {/* Search + filter */}
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

          {/* Creature list */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {generated.length > 0 && (category === "Tất Cả" || generated.some(g => g.category === category)) && (
              <div className="text-xs text-purple-400/60 font-medium px-1 pt-1 pb-0.5">✨ Đã tạo / Lai giống</div>
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

        {/* ── Center — creature viewer ── */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{ background: "radial-gradient(ellipse at center, #0d0d2b 0%, #050714 70%)" }}
        >
          {/* Name overlay */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none w-full px-20">
            {isGenerated && (
              <div className="text-xs text-purple-400 mb-1 flex items-center justify-center gap-1">
                ✨ AI tạo sinh
              </div>
            )}
            <div
              className="text-2xl sm:text-3xl font-black tracking-wide drop-shadow-lg"
              style={{ textShadow: `0 0 30px ${selected.glowColor}` }}
            >
              {selected.name}
            </div>
            <div className="text-sm text-slate-400 mt-0.5">{selected.nameEn}</div>
          </div>

          {/* Rarity badge */}
          <div className="absolute top-5 right-5 z-10">
            <span
              className="text-sm px-3 py-1 rounded-full font-semibold"
              style={{ color: rarityColor, background: rarityColor + "22", border: `1px solid ${rarityColor}55` }}
            >
              ✦ {selected.rarity}
            </span>
          </div>

          {/* Viewer */}
          <div className="absolute inset-0">
            <CreatureViewer key={selected.id} creature={selected} />
          </div>

          {/* Bottom hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-xs text-slate-600 pointer-events-none">
            Canvas 2D · Phủ hào quang sinh vật
          </div>
        </div>

        {/* ── Right panel ── */}
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

                {isGenerated && (
                  <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/30 text-xs text-purple-300">
                    ✨ Sinh vật này được AI tạo ra theo yêu cầu của bạn — hoàn toàn độc nhất.
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
                  <div className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Màu Sắc</div>
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
                          style={{ width: `${val}%`, background: `linear-gradient(90deg, ${selected.glowColor}, ${selected.accentColor})` }}
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

      {showBreeding && (
        <BreedingModal
          allCreatures={allCreatures}
          onClose={() => setShowBreeding(false)}
          onResult={handleBreedResult}
        />
      )}
    </div>
  );
}
