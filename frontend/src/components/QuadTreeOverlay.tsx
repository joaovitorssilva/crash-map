import type { FC } from "react";
import { SVGOverlay, useMap } from "react-leaflet";
import { SAO_PAULO_MAP_BOUNDS } from "../constants";
import type { ClientQuadTree } from "../quadtree";

interface QuadTreeOverlayProps {
  qt:       ClientQuadTree | null;
  visible:  boolean;
  maxDepth: number;
}

export const QuadTreeOverlay: FC<QuadTreeOverlayProps> = ({ qt, visible, maxDepth }) => {
  useMap(); // keeps component in map context for re-renders
  if (!qt || !visible) return null;

  const [[swLat, swLng], [neLat, neLng]] = SAO_PAULO_MAP_BOUNDS;
  const rects = qt.getBoundaries(0, maxDepth);

  const lngToX = (lng: number) => ((lng - swLng) / (neLng - swLng)) * 100;
  const latToY = (lat: number) => ((neLat - lat) / (neLat - swLat)) * 100;

  return (
    <SVGOverlay bounds={SAO_PAULO_MAP_BOUNDS} attributes={{ style:" pointerEvents: none"}}>
      <svg width="100%" height="100%">
        {rects.map((r, i) => (
          <rect
            key={i}
            x={`${lngToX(r.x)}%`}
            y={`${latToY(r.y + r.h)}%`}
            width={`${(r.w / (neLng - swLng)) * 100}%`}
            height={`${(r.h / (neLat - swLat)) * 100}%`}
            fill={`rgba(232,200,74,${(0.08 + r.depth * 0.04) * 0.3})`}
            stroke={`rgba(232,200,74,${0.15 + r.depth * 0.08})`}
            strokeWidth="0.5"
          />
        ))}
      </svg>
    </SVGOverlay>
  );
};