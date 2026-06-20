import express, { Request, Response } from "express";
import cors from "cors"
import { loadCSV, getQuadTree, getAllPoints, getBounds } from "./loader";
import { Rectangle } from "./quadtree";

const PORT = (process.env.PORT ?? "3001")

const app = express()
app.use(cors())
app.use(express.json())

try {
  loadCSV("./data/acidentes.csv")
} catch (err) {
  console.error("[Server] Falha ao carregar dados: ", (err as Error).message);
  process.exit(1);
}

app.get("/api/query", (req: Request, res: Response) => {
  const { minLng, minLat, maxLng, maxLat, limit = "500" } = req.query as Record<string, string>;

  if (!minLng || !minLat || !maxLng || !maxLat) {
    res.status(400).json({ error: "informe minLng, minLat, maxLng, maxLat" });
    return
  }

  const range = new Rectangle(
    parseFloat(minLng),
    parseFloat(minLat),
    parseFloat(maxLng) - parseFloat(minLng),
    parseFloat(maxLat) - parseFloat(minLat)
  );

  let results = getQuadTree().query(range);

  res.json({
    points: results.slice(0, parseInt(limit, 10)),
    count: results.length
  })
})

app.get("/api/stats", (_req: Request, res: Response) => {
  const all = getAllPoints();
  const bounds = getBounds();
  const typeCount = new Map<string, number>();
  for (const p of all) {
    typeCount.set(p.type, (typeCount.get(p.type) ?? 0) + 1);
  }
  const types = Array.from(typeCount.entries()).map(([type, count]) => ({ type, count }));

  res.json({
    total: all.length,
    bounds: {
      minLng: bounds.x,
      minLat: bounds.y,
      maxLng: bounds.x + bounds.w,
      maxLat: bounds.y + bounds.h,
    },
    types,
  });
});

app.get("/api/tree", (req: Request, res: Response) => {
  const maxDepth = parseInt((req.query.maxDepth as string) ?? "5", 10);
  const boundaries = getQuadTree().getBoundaries(0, maxDepth);
  res.json({ boundaries });
})


app.listen(PORT, () => {
  console.log(`[Server] Rodando em http://localhost:${PORT}`);
  console.log(`[Server] Pontos carregados: ${getAllPoints().length}`);
})