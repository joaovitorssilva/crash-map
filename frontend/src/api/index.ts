import type { Point, ApiStats, ApiQueryResponse } from "../types";

export async function fetchAllData(): Promise<{ points: Point[]; stats: ApiStats }> {
  const stats = await fetch("/api/stats").then(r => {
    if (!r.ok) throw new Error(`/api/stats ${r.status}`);
    return r.json() as Promise<ApiStats>;
  });

  const { minLng, minLat, maxLng, maxLat } = stats.bounds;
  const url = `/api/query?minLng=${minLng}&minLat=${minLat}&maxLng=${maxLng}&maxLat=${maxLat}&limit=99999`;

  const { points } = await fetch(url).then(r => {
    if (!r.ok) throw new Error(`/api/query ${r.status}`);
    return r.json() as Promise<ApiQueryResponse>;
  });

  return { points, stats };
}
