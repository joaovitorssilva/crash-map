import type { FC } from "react";
import { SVGOverlay } from "react-leaflet";
import type { Selection } from "../types";

interface SelectionOverlayProps {
  selection: Selection | null;
}

export const SelectionOverlay: FC<SelectionOverlayProps> = ({ selection }) => {
  if (!selection) return null;

  return (
    <SVGOverlay
      bounds={[selection.sw, selection.ne]}
      attributes={{ style: " pointerEvents: none " }}
    >
      <svg width="100%" height="100%">
        <rect
          x="0" y="0" width="100%" height="100%"
          fill="rgba(232,200,74,0.07)"
          stroke="rgba(232,200,74,0.6)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
      </svg>
    </SVGOverlay>
  );
};