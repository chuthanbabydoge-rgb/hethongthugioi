import { useState, Suspense, lazy } from "react";
import { CREATURES, CreatureModel, RARITY_COLORS, CATEGORY_ICONS } from "./data/creatures";

const CreatureViewer = lazy(() => import("./components/CreatureViewer"));

function PowerBar({ value, max = 10000 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">Sức Mạnh</span>
        <span className="font-bold text-amber-400">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, #7c3aed, #f59e0b)`,
          }}
        />
      </div>
    </div>
  );
}

function CreatureCard({
  creature,
  selected,
  onClick,
}: {
  creature: CreatureModel;
  selected: boolean;
  onClick: () => void;
}) {
  const rarityColor = RARITY_COLORS[creature.rarity];
  const icon = CATEGORY_ICONS[creature.category];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${
        selected
          ? "border-amber-500/80 bg-amber-500/10 shadow-lg shadow-amber-500/20"
          : "border-slate-700/60 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white text-sm truncate">{creature.name}</div>
          <div className="text-xs text-slate-400 truncate">{creature.nameEn}</div>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
          style={{ color: rarityColor, background: rarityColor + "22", border: `1px solid ${rarityColor}44` }}
        >
          {creature.rarity}
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
        placeholder="Tìm kiếm sinh vật..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
      />
    </div>
  );
}

const CATEGORIES = ["Tất Cả", "Động Vật", "Huyền Thoại", "Thần Thú", "Yêu Quái"] as const;

export default function App() {
  const [selected, setSelected] = useState<CreatureModel>(CREATURES[0]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("Tất Cả");
  const [tab, setTab] = useState<"info" | "abilities">("info");

  const filtered = CREATURES.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Tất Cả" || c.category === category;
    return matchSearch && matchCat;
  });

  const rarityColor = RARITY_COLORS[selected.rarity];

  return (
    <div className="min-h-screen bg-[#050714] text-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-slate-800/60 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-sm">
            🐉
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none">Thú Giới 3D</h1>
            <p className="text-xs text-slate-400">AI Tạo Mô Hình Sinh Vật</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {CREATURES.length} sinh vật
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — creature list */}
        <aside className="w-72 border-r border-slate-800/60 flex flex-col flex-shrink-0 overflow-hidden">
          <div className="p-4 space-y-3 border-b border-slate-800/40">
            <SearchBar value={search} onChange={setSearch} />
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-all ${
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

          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
            {filtered.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-8">Không tìm thấy sinh vật</div>
            ) : (
              filtered.map((c) => (
                <CreatureCard
                  key={c.id}
                  creature={c}
                  selected={selected.id === c.id}
                  onClick={() => setSelected(c)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Center — 3D viewer */}
        <div className="flex-1 relative overflow-hidden" style={{ background: "radial-gradient(ellipse at center, #0d0d2b 0%, #050714 70%)" }}>
          {/* Creature name overlay */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
            <div className="text-3xl font-black tracking-wide" style={{ textShadow: `0 0 30px ${selected.glowColor}` }}>
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

          {/* 3D Canvas */}
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

          {/* Bottom hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-xs text-slate-500 flex items-center gap-2 pointer-events-none">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Kéo để xoay • Cuộn để zoom
          </div>
        </div>

        {/* Right panel — creature info */}
        <aside className="w-80 border-l border-slate-800/60 flex flex-col flex-shrink-0 overflow-hidden">
          {/* Tabs */}
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
                {/* Power */}
                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
                  <PowerBar value={selected.power} />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Loại", value: selected.category },
                    { label: "Nguồn gốc", value: selected.origin },
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

                {/* Description */}
                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
                  <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Mô Tả</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{selected.description}</p>
                </div>

                {/* Visual properties */}
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
                      <div className="text-xs text-slate-500">Kỹ năng đặc biệt #{i + 1}</div>
                    </div>
                  </div>
                ))}

                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40 mt-2">
                  <div className="text-xs text-slate-500 mb-2">Chỉ số tổng hợp</div>
                  {[
                    { label: "Tấn công", val: Math.min(100, Math.round(selected.power / 100)) },
                    { label: "Phòng thủ", val: Math.min(100, Math.round(selected.power / 120)) },
                    { label: "Tốc độ", val: selected.hasWings ? 95 : Math.round(selected.power / 130) },
                    { label: "Ma thuật", val: selected.emissiveIntensity > 0.8 ? 98 : Math.round(selected.power / 110) },
                  ].map(({ label, val }) => (
                    <div key={label} className="mb-2">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-400">{label}</span>
                        <span className="text-white font-medium">{val}</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
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
    </div>
  );
}
