import type { FC } from "react";
import { COLORS, GRAVITY_COLORS } from "../constants";
import type { GravityKey } from "../types";

interface GravityBadgeProps {
  gravity?: string;
}

export const GravityBadge: FC<GravityBadgeProps> = ({ gravity }) => {
  const color = gravity
    ? (GRAVITY_COLORS[gravity as GravityKey] ?? COLORS.textMuted)
    : COLORS.textMuted;

  return (
    <span className="text-[10px] font-bold tracking-[0.08em] px-[7px] py-0.5 rounded" style={{
      background: color + "22", color, border: `1px solid ${color}55`,
    }}>
      {gravity ?? "—"}
    </span>
  );
};
