import type { Point, BoundaryNode } from "../types";

type Quadrant = "NW" | "NE" | "SW" | "SE";

export class QTRect {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly w: number,
    public readonly h: number,
  ) {}

  contains(p: Pick<Point, "lat" | "lng">): boolean {
    return (
      p.lng >= this.x && p.lng <= this.x + this.w &&
      p.lat >= this.y && p.lat <= this.y + this.h
    );
  }

  intersects(r: QTRect): boolean {
    return !(
      r.x > this.x + this.w || r.x + r.w < this.x ||
      r.y > this.y + this.h || r.y + r.h < this.y
    );
  }
}

export class ClientQuadTree {
  private points:   Point[]                                   = [];
  private divided   = false;
  private children: Partial<Record<Quadrant, ClientQuadTree>> = {};

  constructor(
    private readonly boundary: QTRect,
    private readonly cap = 6,
  ) {}

  insert(p: Point): boolean {
    if (!this.boundary.contains(p)) return false;
    if (this.points.length < this.cap) { this.points.push(p); return true; }
    if (!this.divided) this.subdivide();
    return (
      (this.children.NW?.insert(p) ?? false) ||
      (this.children.NE?.insert(p) ?? false) ||
      (this.children.SW?.insert(p) ?? false) ||
      (this.children.SE?.insert(p) ?? false)
    );
  }

  private subdivide(): void {
    const { x, y, w, h } = this.boundary;
    this.children.NW = new ClientQuadTree(new QTRect(x,       y + h/2, w/2, h/2), this.cap);
    this.children.NE = new ClientQuadTree(new QTRect(x + w/2, y + h/2, w/2, h/2), this.cap);
    this.children.SW = new ClientQuadTree(new QTRect(x,       y,       w/2, h/2), this.cap);
    this.children.SE = new ClientQuadTree(new QTRect(x + w/2, y,       w/2, h/2), this.cap);
    this.divided = true;
    const pts = this.points;
    this.points = [];
    pts.forEach(p =>
      this.children.NW?.insert(p) ||
      this.children.NE?.insert(p) ||
      this.children.SW?.insert(p) ||
      this.children.SE?.insert(p)
    );
  }

  query(range: QTRect, found: Point[] = []): Point[] {
    if (!this.boundary.intersects(range)) return found;
    this.points.forEach(p => { if (range.contains(p)) found.push(p); });
    if (this.divided)
      (Object.values(this.children) as ClientQuadTree[]).forEach(c => c.query(range, found));
    return found;
  }

  getBoundaries(depth = 0, maxDepth = 5): BoundaryNode[] {
    const result: BoundaryNode[] = [{ ...this.boundary, depth }];
    if (this.divided && depth < maxDepth)
      (Object.values(this.children) as ClientQuadTree[])
        .forEach(c => result.push(...c.getBoundaries(depth + 1, maxDepth)));
    return result;
  }
}