import type { LatLngTuple } from "leaflet";
import type { GravityKey } from "../types";

export const COLORS = {
  bg: "#0b0e14",
  surface: "#12161f",
  border: "#1e2535",
  accent: "#e8c84a",
  accentDim: "rgba(232,200,74,0.12)",
  text: "#e2e8f0",
  textMuted: "#64748b",
  fatal: "#ff4d4d",
  grave: "#ff8c42",
  leve: "#e8c84a",
  ileso: "#4ade80",
} as const;

export const GRAVITY_COLORS: Record<GravityKey, string> = {
  FATAL: COLORS.fatal,
  GRAVE: COLORS.grave,
  LEVE: COLORS.leve,
  ILESO: COLORS.ileso,
};

export const SAO_PAULO_CENTER: LatLngTuple = [-22.37, -48.44];

export const SAO_PAULO_MAP_BOUNDS: [LatLngTuple, LatLngTuple] = [
  [-25.31, -53.11],
  [-17.44, -44.06],
];

export const QT_BOUNDS = {
  x: -53.11, y: -25.31, w: 9.05, h: 7.87
} as const;