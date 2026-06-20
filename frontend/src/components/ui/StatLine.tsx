import type { FC } from "react";

interface StatLineProps {
  label: string;
  value: string;
  accent?: boolean;
}

export const StatLine: FC<StatLineProps> = ({ label, value, accent }) => (
  <div className="flex justify-between py-0.5">
    <span className="text-[10px] text-app-text-muted">{label}</span>
    <span className={`text-[10px] ${accent ? "font-bold text-app-accent" : "text-app-text"}`}>
      {value}
    </span>
  </div>
);

interface ChipProps {
  label: string;
  dim?: boolean;
}

export const Chip: FC<ChipProps> = ({ label, dim }) => (
  <span className={`text-[10px] tracking-[0.08em] px-[9px] py-[3px] rounded bg-app-border border border-app-border ${dim ? "text-app-text-muted" : "text-app-text"}`}>
    {label}
  </span>
);
