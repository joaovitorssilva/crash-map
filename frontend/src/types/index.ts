import type { LatLngTuple } from "leaflet";

export interface VehicleCounts {
  pedestre:  number;
  bicicleta: number;
  moto:      number;
  automovel: number;
  onibus:    number;
  caminhao:  number;
}

export interface Point {
  id?:          number;
  lat:          number;
  lng:          number;
  type:         string;
  date:         string;
  neighborhood: string;
  gravity?:     string;
  street?:      string;
  hour?:        string;
  turno?:       string;
  diaSemana?:   string;
  tipoVia?:     string;
  veiculos?:    VehicleCounts;
}

export interface BoundaryNode {
  x:     number;
  y:     number;
  w:     number;
  h:     number;
  depth: number;
}

export interface Selection {
  sw: LatLngTuple;
  ne: LatLngTuple;
}

// Matches GET /api/stats response
export interface ApiBounds {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export interface ApiStats {
  total:  number;
  bounds: ApiBounds;
  types:  Array<{ type: string; count: number }>;
}

// Matches GET /api/query response
export interface ApiQueryResponse {
  points:      Point[];
  count:       number;
  timeMs:      number;
  timeLinearMs: number;
}

export type GravityKey = "FATAL" | "GRAVE" | "LEVE" | "ILESO";