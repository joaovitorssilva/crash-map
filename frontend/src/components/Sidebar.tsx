import type { FC } from "react";
import { GRAVITY_COLORS } from "../constants";
import type { ApiStats, GravityKey, Point } from "../types";
import { Section } from "./ui/Section";
import { FilterRow } from "./ui/FilterRow";
import { ToggleRow } from "./ui/ToggleRow";
import { StatLine } from "./ui/StatLine";

interface SidebarProps {
  filtered: Point[];
  gravFilter: string;
  typeFilter: string;
  allTypes: string[];
  qtVisible: boolean;
  qtDepth: number;
  selectMode: boolean;
  selection: boolean;
  selectedCount: number;
  queryTime: number | null;
  linearTime: number | null;
  stats: ApiStats | null;
  onGravFilter: (g: string) => void;
  onTypeFilter: (t: string) => void;
  onToggleQt: () => void;
  onDepthChange: (d: number) => void;
  onToggleSelect: () => void;
  onClear: () => void;
}

const GRAVITIES = ["TODOS", "FATAL", "GRAVE", "LEVE", "ILESO"] as const;

export const Sidebar: FC<SidebarProps> = ({
  filtered, gravFilter, typeFilter, allTypes,
  qtVisible, qtDepth, selectMode, selection,
  selectedCount, queryTime, linearTime, stats,
  onGravFilter, onTypeFilter, onToggleQt,
  onDepthChange, onToggleSelect, onClear,
}) => {
  const gravCounts = (["FATAL", "GRAVE", "LEVE", "ILESO"] as GravityKey[]).map(g => ({
    g, count: filtered.filter(p => p.gravity === g).length,
  }));

  return (
    <div className="w-[260px] bg-app-surface border-r border-app-border flex flex-col overflow-y-auto shrink-0">
      {/* Gravidade */}
      <Section title="GRAVIDADE">
        {GRAVITIES.map(g => (
          <FilterRow
            key={g}
            label={g}
            active={gravFilter === g}
            color={g !== "TODOS" ? GRAVITY_COLORS[g as GravityKey] : undefined}
            count={g === "TODOS" ? filtered.length : (gravCounts.find(x => x.g === g)?.count ?? 0)}
            onClick={() => onGravFilter(g)}
          />
        ))}
      </Section>

      {/* Tipo de sinistro */}
      <Section title="TIPO DE SINISTRO">
        {allTypes.slice(0, 7).map(t => (
          <FilterRow
            key={t}
            label={t}
            active={typeFilter === t}
            onClick={() => onTypeFilter(t)}
          />
        ))}
      </Section>

      {/* Quad Tree */}
      <Section title="QUAD TREE">
        <ToggleRow label="Mostrar grade" active={qtVisible} onClick={onToggleQt} />

        {qtVisible && (
          <div className="px-3 pt-1 pb-2">
            <div className="text-[10px] text-app-text-muted mb-1">
              PROFUNDIDADE: {qtDepth}
            </div>
            <input
              type="range" min={1} max={7} value={qtDepth}
              onChange={e => onDepthChange(+e.target.value)}
              className="w-full accent-[var(--color-app-accent)]"
            />
          </div>
        )}

        <ToggleRow
          label={selectMode ? "Cancelar seleção" : "Selecionar região"}
          active={selectMode}
          onClick={onToggleSelect}
        />

        {selection && (
          <div className="px-3 pt-1.5 pb-2">
            <StatLine label="Quad tree" value={`${queryTime} ms`} accent />
            <StatLine label="Linear" value={`${linearTime} ms`} />
            <StatLine label="Resultado" value={`${selectedCount} pontos`} />
            <button
              onClick={onClear}
              className="mt-1.5 text-[10px] text-app-text-muted bg-transparent border border-app-border rounded px-[10px] py-[3px] cursor-pointer w-full"
            >
              LIMPAR SELEÇÃO
            </button>
          </div>
        )}
      </Section>

      {/* Top tipos */}
      {stats && (
        <Section title="TOP TIPOS">
          {stats.types.slice(0, 5).map(t => (
            <div key={t.type} className="px-3 py-[3px] flex justify-between items-center">
              <span className="text-[10px] text-app-text-muted flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {t.type}
              </span>
              <span className="text-[10px] text-app-accent ml-2">
                {t.count}
              </span>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
};
