import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { COLORS, GRAVITY_COLORS, SAO_PAULO_CENTER } from "./constants";
import { Chip } from "./components/ui/StatLine";

import { fetchAllData } from "./api";
import type { Point, GravityKey } from "./types";

export default function App() {
  const [allData, setAllData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData()
      .then(({ points }) => setAllData(points))
      .catch(err => {
        console.error("[App] Falha ao carregar dados do backend.", err);
        setError("Não foi possível carregar os dados do servidor.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-app-bg font-['DM_Mono','Courier_New',monospace] text-app-text overflow-hidden">

      {/* ── Topbar ── */}
      <div className="bg-app-surface border-b border-app-border px-[18px] py-[10px] flex items-center justify-between z-[1000] shrink-0">
        <div className="flex items-center gap-[14px]">
          <div className="flex items-center gap-2">
            
          </div>
          {loading && <span className="text-[11px] text-app-text-muted animate-pulse">carregando...</span>}
          {error && <span className="text-[11px] text-app-grave">{error}</span>}
        </div>
        <div className="flex items-center gap-3">
          <Chip label={`${allData.length} registros`} />
        </div>
      </div>

      {/* ── Map ── */}
      <div className="flex-1 relative">
        <MapContainer
          center={SAO_PAULO_CENTER}
          zoom={13}
          className="h-full w-full bg-[#0b0e14]"
          zoomControl={true}
          preferCanvas={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          {allData.map((p, i) => {
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
              />
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

        
      </div>
    </div>
  );
}
