import fs from "fs";
import { parse } from "csv-parse/sync"
import { QuadTree, Rectangle, Point } from "./quadtree"

export interface LoadResult {
  loaded: number;
  skipped: number;
}

interface InfosigaRow {
  latitude: string;
  longitude: string;
  tp_sinistro_primario: string;
  data_sinistro: string;
  hora_sinistro: string;
  logradouro: string;
  turno: string;
  dia_da_semana: string;
  tipo_via: string;
  qtd_gravidade_fatal: string;
  qtd_gravidade_grave: string;
  qtd_gravidade_leve: string;
  qtd_gravidade_ileso: string;
}
const SAO_PAULO_BOUNDS = new Rectangle(
  -53.11,  // lng min (oeste)
  -25.31,  // lat min (sul)
   9.05,   // largura  (-53.11 → -44.06)
   7.87    // altura   (-25.31 → -17.44)
);

let quadTree: QuadTree | null = null;
let allPoints: Point[] = [];

function deriveGravity(row: InfosigaRow): string | undefined {
  if (parseInt(row.qtd_gravidade_fatal, 10) > 0) return "FATAL";
  if (parseInt(row.qtd_gravidade_grave, 10) > 0) return "GRAVE";
  if (parseInt(row.qtd_gravidade_leve,  10) > 0) return "LEVE";
  if (parseInt(row.qtd_gravidade_ileso, 10) > 0) return "ILESO";
  return undefined;
}

function parseRow(row: InfosigaRow): Point | null {
  const lat = parseFloat(row.latitude?.replace(",", "."));
  const lng = parseFloat(row.longitude?.replace(",", "."));

  if (isNaN(lat) || isNaN(lng)) return null;
  if (!SAO_PAULO_BOUNDS.contains({ lat, lng } as Point)) return null;

  return {
    lat,
    lng,
    type:         row.tp_sinistro_primario ?? "",
    date:         row.data_sinistro ?? "",
    hour:         row.hora_sinistro || undefined,
    street:       row.logradouro ?? "",
    turno:        row.turno || undefined,
    diaSemana:    row.dia_da_semana || undefined,
    tipoVia:      row.tipo_via || undefined,
    neighborhood: "",
    gravity:      deriveGravity(row),
  } as Point;
}

export function loadCSV(filePath: string): LoadResult {
  console.log(`[loader] lendo ${filePath}`);

  const raw = fs.readFileSync(filePath, "utf8");
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: ";",
    relax_column_count: true
  }) as InfosigaRow[];

  let loaded = 0;
  let skipped = 0;

  quadTree = new QuadTree(SAO_PAULO_BOUNDS, 8);
  allPoints = [];

  for (const row of records) {
    const point = parseRow(row);
    if (!point) {
      skipped++;
      continue;
    }

    quadTree.insert(point);
    allPoints.push(point);
    loaded++;
  }

  console.log(`[loader] ${loaded} pontos carregados | ${skipped} ignorados`);

  return { loaded, skipped }
}

export function getQuadTree(): QuadTree {
  if (!quadTree) throw new Error("[loader] Quad tree não inicializada. Chame loadCSV() primeiro")
  return quadTree
}

export function getAllPoints(): Point[] {
  return allPoints;
}

export function getBounds(): Rectangle {
  return SAO_PAULO_BOUNDS;
}