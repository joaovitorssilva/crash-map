import { useEffect, useRef, type FC } from "react";
import { useMap } from "react-leaflet";
import { LatLng } from "leaflet";
import type { Selection } from "../types";

interface SelectionControlProps {
  active:   boolean;
  onSelect: (sel: Selection) => void;
}

export const SelectionControl: FC<SelectionControlProps> = ({ active, onSelect }) => {
  const map      = useMap();
  const dragging = useRef(false);
  const startPt  = useRef<LatLng | null>(null);
  const boxEl    = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active) return;
    map.dragging.disable();
    const container = map.getContainer();

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      dragging.current = true;
      startPt.current  = map.containerPointToLatLng([e.offsetX, e.offsetY]);
      const box        = document.createElement("div");
      box.style.cssText = `
        position: absolute;
        border: 1.5px dashed rgba(232,200,74,0.8);
        background: rgba(232,200,74,0.06);
        pointer-events: none;
        z-index: 1000;
      `;
      container.appendChild(box);
      boxEl.current = box;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !startPt.current || !boxEl.current) return;
      const cur = map.containerPointToLatLng([e.offsetX, e.offsetY]);
      const sp  = map.latLngToContainerPoint(startPt.current);
      const cp  = map.latLngToContainerPoint(cur);
      boxEl.current.style.cssText += `
        left:   ${Math.min(sp.x, cp.x)}px;
        top:    ${Math.min(sp.y, cp.y)}px;
        width:  ${Math.abs(sp.x - cp.x)}px;
        height: ${Math.abs(sp.y - cp.y)}px;
      `;
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      boxEl.current?.remove();
      boxEl.current = null;
      const end = map.containerPointToLatLng([e.offsetX, e.offsetY]);
      if (startPt.current) {
        onSelect({
          sw: [Math.min(startPt.current.lat, end.lat), Math.min(startPt.current.lng, end.lng)],
          ne: [Math.max(startPt.current.lat, end.lat), Math.max(startPt.current.lng, end.lng)],
        });
      }
      startPt.current = null;
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseup",   onMouseUp);

    return () => {
      map.dragging.enable();
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseup",   onMouseUp);
    };
  }, [active, map, onSelect]);

  return null;
};