export interface Point {
  lat: number;
  lng: number;
  type: string;
  date: string;
  neighborhood: string;
  gravity?: string;
  street: string;
  hour?: string;
  turno?: string;
  diaSemana?: string;
  tipoVia?: string;
}

export interface BoudaryNode{
  x: number;
  y: number;
  w: number;
  h:number;
  deph: number;
}

type Quadrant = "NW" | "NE" | "SW" | "SE";


export class Rectangle {
  constructor(
    public readonly x: number, // longitude mínima
    public readonly y: number, // latitude mínima
    public readonly w: number, // largura  (variação da longitude)
    public readonly h: number  // altura  (variação da latitude)
  ) {}

  contains(point: Point): Boolean {
    return (
      point.lng >= this.x && 
      point.lng < this.x + this.w && 
      point.lat >= this.y &&
      point.lat < this.y + this.h 
    )
  }

  intersects(other: Rectangle): boolean {
    return !(
      other.x > this.x + this.w || 
      other.x + other.w < this.x ||
      other.y > this.y + this.h || 
      other.y + other.h < this.y
    )
  }
}

export class QuadTree{
  private points: Point[] = [];
  private divided = false;
  private children: Partial<Record<Quadrant,QuadTree>> = {};

  constructor (
    private readonly boundary: Rectangle,
    private readonly capacity: number = 8
  ){}

  insert(point: Point): boolean {
    if (!this.boundary.contains(point)) return false;

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) this.subdivide()

    return (
      (this.children.NW?.insert(point) ?? false) ||
      (this.children.NE?.insert(point) ?? false) ||
      (this.children.SW?.insert(point) ?? false) ||
      (this.children.SE?.insert(point) ?? false)
    );
  }

  private subdivide(): void {
    const {x, y, w, h} = this.boundary;
    const hw = w / 2;
    const hh = h / 2;

    this.children.NW = new QuadTree(new Rectangle(x, y + hh, hw, hh), this.capacity);
    this.children.NE = new QuadTree(new Rectangle(x + hw, y + hh, hw, hh), this.capacity);
    this.children.SW = new QuadTree(new Rectangle(x, y, hw, hh), this.capacity);
    this.children.SE = new QuadTree(new Rectangle(x + hw, y, hw, hh), this.capacity);
    this.divided = true;

    const pts = this.points;
    this.points = [];
    for (const p of pts){
      this.children.NW?.insert(p) ||
      this.children.NE?.insert(p) ||
      this.children.SW?.insert(p) ||
      this.children.SE?.insert(p);
    }
  }

  query(range: Rectangle, found: Point[] = []): Point[] {
    if (!this.boundary.intersects(range)) return found;

    for (const p of this.points) {
      if (range.contains(p)) found.push(p);
    }

    if (this.divided) {
      this.children.NW?.query(range, found);
      this.children.NE?.query(range, found);
      this.children.SW?.query(range, found);
      this.children.SE?.query(range, found);
    }

    return found;
  }

  getBoundaries(deph = 0, maxDeph = 6): BoudaryNode[] {
    const result: BoudaryNode[] = [{...this.boundary, deph}];

    if (this.divided && deph < maxDeph) {
      for (const child of Object.values(this.children) as QuadTree[]) {
        result.push(...child.getBoundaries(deph + 1, maxDeph))
      }
    }

    return result;
  }

  static linearSearch(points: Point[], range: Rectangle): Point[] {
    return points.filter(p => range.contains(p));
  }
  
}