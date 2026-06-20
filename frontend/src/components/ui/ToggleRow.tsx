import type { FC } from "react";

interface ToggleRowProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export const ToggleRow: FC<ToggleRowProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full px-3 py-[7px] border-none cursor-pointer ${active ? "bg-app-accent-dim" : "bg-transparent"}`}
  >
    <span className={`text-[11px] tracking-[0.06em] ${active ? "text-app-accent" : "text-app-text-muted"}`}>
      {label}
    </span>
    <div className={`w-[26px] h-[14px] rounded-[7px] relative transition-[background_0.2s] ${active ? "bg-app-accent" : "bg-app-border"}`}>
      <div className={`w-[10px] h-[10px] rounded-full absolute top-0.5 transition-[left_0.2s] ${active ? "bg-app-bg left-[14px]" : "bg-app-text-muted left-0.5"}`} />
    </div>
  </button>
);
