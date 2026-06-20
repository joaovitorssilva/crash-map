import { useState, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { COLORS, GRAVITY_COLORS, SAO_PAULO_CENTER, QT_BOUNDS } from "./constants";
import { ClientQuadTree, QTRect } from "./quadtree";
import { QuadTreeOverlay } from "./components/QuadTreeOverlay";
import { SelectionOverlay } from "./components/SelectionOverlay";
import { SelectionControl } from "./components/SelectionControl";
import { GravityBadge } from "./components/GravityBadge";
import { Sidebar } from "./components/Sidebar";
import { Chip } from "./components/ui/StatLine";

import { fetchAllData } from "./api";
import type { Point, Selection, ApiStats, GravityKey } from "./types";

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [allData,        setAllData]        = useState<Point[]>([]);
  const [qtVisible,      setQtVisible]      = useState(false);
  const [qtDepth,        setQtDepth]        = useState(4);
  const [selectMode,     setSelectMode]     = useState(false);
  const [selection,      setSelection]      = useState<Selection | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
  const [gravFilter,     setGravFilter]     = useState("TODOS");
  const [typeFilter,     setTypeFilter]     = useState("TODOS");
  const [queryTime,      setQueryTime]      = useState<number | null>(null);
  const [linearTime,     setLinearTime]     = useState<number | null>(null);
  const [stats,          setStats]          = useState<ApiStats | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);

  const filtered = useMemo(() => {
    let res = allData;
    if (gravFilter !== "TODOS") res = res.filter(p => p.gravity === gravFilter);
    if (typeFilter !== "TODOS") res = res.filter(p => p.type    === typeFilter);
    return res;
  }, [allData, gravFilter, typeFilter]);

  const qt = useMemo(() => {
    if (!allData.length) return null;
    const b    = stats?.bounds;
    const rect = b
      ? new QTRect(b.minLng, b.minLat, b.maxLng - b.minLng, b.maxLat - b.minLat)
      : new QTRect(QT_BOUNDS.x, QT_BOUNDS.y, QT_BOUNDS.w, QT_BOUNDS.h);
    const tree = new ClientQuadTree(rect, 6);
    allData.forEach(p => tree.insert(p));
    return tree;
  }, [allData, stats]);

  // ── Load data: real backend, fake fallback ────────────────────────────────
  useEffect(() => {
    fetchAllData()
      .then(({ points, stats }) => {
        setStats(stats);
        setAllData(points);
      })
      .catch(err => {
        console.error("[App] Falha ao carregar dados do backend.", err);
        setError("Não foi possível carregar os dados do servidor.");
      })
      .finally(() => setLoading(false));
  }, []);


  // ── Region selection: local quad tree query + linear benchmark ────────────
  const handleSelect = useCallback((sel: Selection) => {
    if (!qt) return;
    setSelection(sel);

    const range = new QTRect(
      sel.sw[1], sel.sw[0],
      sel.ne[1] - sel.sw[1],
      sel.ne[0] - sel.sw[0],
    );

    const t0 = performance.now();
    let qtResult = qt.query(range);
    const tQt = +(performance.now() - t0).toFixed(2);

    const t1 = performance.now();
    filtered.filter(p => range.contains(p)); // linear baseline
    const tLinear = +(performance.now() - t1).toFixed(2);

    if (gravFilter !== "TODOS") qtResult = qtResult.filter(p => p.gravity === gravFilter);
    if (typeFilter !== "TODOS") qtResult = qtResult.filter(p => p.type === typeFilter);

    setSelectedPoints(qtResult);
    setQueryTime(tQt);
    setLinearTime(tLinear);
    setSelectMode(false);
  }, [qt, filtered, gravFilter, typeFilter]);

  const clearSelection = useCallback(() => {
    setSelection(null);
    setSelectedPoints([]);
    setQueryTime(null);
    setLinearTime(null);
  }, []);

  const handleGravFilter = useCallback((g: string) => { setGravFilter(g); clearSelection(); }, [clearSelection]);
  const handleTypeFilter = useCallback((t: string) => { setTypeFilter(t); clearSelection(); }, [clearSelection]);
  const handleToggleSelect = useCallback(() => {
    setSelectMode(v => !v);
    if (selectMode) clearSelection();
  }, [selectMode, clearSelection]);

  const allTypes = ["TODOS", ...Array.from(new Set(allData.map(p => p.type))).sort()];
  const displayPoints = selection ? selectedPoints : filtered;

  return (
    <div className="h-screen flex flex-col bg-app-bg font-['DM_Mono','Courier_New',monospace] text-app-text overflow-hidden">

      {/* ── Topbar ── */}
      <div className="bg-app-surface border-b border-app-border px-[18px] py-[10px] flex items-center justify-between z-[1000] shrink-0">
        <div className="flex items-center gap-[14px]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-app-accent shadow-[0_0_8px_var(--color-app-accent)]" />
            <span className="text-[13px] font-bold tracking-[0.12em] text-app-accent">SINISTROS</span>
            <span className="text-[13px] text-app-text-muted tracking-[0.04em]">/ SÃO PAULO </span>
          </div>
          {loading && <span className="text-[11px] text-app-text-muted animate-pulse">carregando...</span>}
          {error && <span className="text-[11px] text-app-grave">{error}</span>}
        </div>
        <div className="flex items-center gap-3">
          <Chip label={`${allData.length} registros`} />
          <Chip label="Infosiga / DETRAN-SP" dim />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">

        <Sidebar
          filtered={filtered}
          gravFilter={gravFilter}
          typeFilter={typeFilter}
          allTypes={allTypes}
          qtVisible={qtVisible}
          qtDepth={qtDepth}
          selectMode={selectMode}
          selection={!!selection}
          selectedCount={selectedPoints.length}
          queryTime={queryTime}
          linearTime={linearTime}
          stats={stats}
          onGravFilter={handleGravFilter}
          onTypeFilter={handleTypeFilter}
          onToggleQt={() => setQtVisible(v => !v)}
          onDepthChange={setQtDepth}
          onToggleSelect={handleToggleSelect}
          onClear={clearSelection}
        />

        {/* ── Map ── */}
        <div className="flex-1 relative">
          {selectMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-app-surface border border-app-accent rounded-md px-4 py-1.5 text-[11px] text-app-accent tracking-[0.1em] pointer-events-none">
              ▣ ARRASTE PARA SELECIONAR UMA REGIÃO
            </div>
          )}

          <MapContainer
            center={SAO_PAULO_CENTER}
            zoom={13}
            className="h-full w-full bg-[#0b0e14]"
            zoomControl={false}
            preferCanvas={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <SelectionControl active={selectMode} onSelect={handleSelect} />
            <QuadTreeOverlay qt={qt} visible={qtVisible} maxDepth={qtDepth} />
            {selection && <SelectionOverlay selection={selection} />}

            {displayPoints.map((p, i) => {
              const pointId = p.id ?? i;
              const color = p.gravity
                ? (GRAVITY_COLORS[p.gravity as GravityKey] ?? COLORS.accent)
                : COLORS.accent;
              return (
                <CircleMarker
                  key={pointId}
                  center={[p.lat, p.lng]}
                  radius={4}
                  pathOptions={{
                    color, fillColor: color, fillOpacity: 0.85,
                    weight: 0,
                  }}
                  eventHandlers={{
                    mouseover({ target }) {
                      target.setStyle({ radius: 7, weight: 2 });
                    },
                    mouseout({ target }) {
                      target.setStyle({ radius: 4, weight: 0 });
                    },
                  }}
                >
                  <Popup>
                    <div className="bg-app-surface text-app-text px-[14px] py-[10px] rounded-md min-w-[180px] font-['DM_Mono',monospace] text-xs">
                      <div className="font-bold mb-1.5 text-app-accent">{p.type}</div>
                      <GravityBadge gravity={p.gravity} />
                      <div className="mt-2 text-app-text-muted leading-[1.7]">
                        <div>📅 {p.date}{p.hour ? ` ${p.hour}` : ""}</div>
                        {p.street && <div>📍 {p.street}</div>}
                        {p.turno && <div>🕐 {p.turno}</div>}
                        {p.tipoVia && <div>🛣 {p.tipoVia}</div>}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-5 right-4 z-[1000] bg-app-surface/90 border border-app-border rounded-lg px-[14px] py-[10px] flex flex-col gap-[5px]">
            {(["FATAL", "GRAVE", "LEVE", "ILESO"] as GravityKey[]).map(g => (
              <div
                key={g}
                className="flex items-center gap-[7px]"
                style={{ '--dot-c': GRAVITY_COLORS[g] } as React.CSSProperties}
              >
                <div className="w-2 h-2 rounded-full bg-[var(--dot-c)] shadow-[0_0_6px_color-mix(in_srgb,var(--dot-c)_60%)]" />
                <span className="text-[10px] text-app-text-muted tracking-[0.08em]">{g}</span>
              </div>
            ))}
          </div>

          {/* Counter */}
          <div className="absolute bottom-5 left-4 z-[1000] bg-app-surface/90 border border-app-border rounded-lg px-[14px] py-2">
            <span className="text-[11px] text-app-text-muted">exibindo </span>
            <span className="text-[11px] text-app-accent font-bold">{displayPoints.length}</span>
            <span className="text-[11px] text-app-text-muted"> de {allData.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
