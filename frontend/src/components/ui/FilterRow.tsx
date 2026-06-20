import type { FC } from "react";

interface FilterRowProps {
  label: string;
  active: boolean;
  color?: string;
  count?: number;
  onClick: () => void;
}

export const FilterRow: FC<FilterRowProps> = ({ label, active, color, count, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full px-3 py-1.5 border-none cursor-pointer gap-2 ${active ? "bg-app-accent-dim" : "bg-transparent"}`}
  >
    <div className="flex items-center gap-[7px]">
      {color && (
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: active ? color : undefined }}
        />
      )}
      <span className={`text-[11px] tracking-[0.06em] ${active ? "text-app-accent" : "text-app-text-muted"}`}>
        {label}
      </span>
    </div>
    {count !== undefined && (
      <span className={`text-[10px] ${active ? "text-app-accent" : "text-app-text-muted/50"}`}>
        {count}
      </span>
    )}
  </button>
);
