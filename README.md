# Mapa de acidentes de São Paulo

> Projeto final da disciplina de **Organização e Recuperação da Informação** — Ciências da Computação, UFSCar.

Visualização interativa de acidentes de trânsito no estado de São Paulo usando uma **QuadTree** como índice espacial. O backend serve dados reais por _bounding box query_; o frontend renderiza os pontos em um mapa Leaflet com _overlay_ da grade da árvore.

## Stack

| Camada     | Tecnologia                                          |
| ---------- | ---------------------------------------------------- |
| Backend    | Node.js, Express 5, TypeScript                       |
| Frontend   | React 19, Vite 8, Tailwind CSS 4, Leaflet            |
| Dados      | CSV com coordenadas de acidentes (SP)                |

## Getting Started

1. Clone esse repositório:
```bash
  git clone https://github.com/joaovitorssilva/crash-map
```

2. Inicie o Backend
```bash
cd backend
pnpm install
pnpm dev        # http://localhost:3001
```

3. Frontend (outro terminal)
```
cd frontend
pnpm install
pnpm dev           # http://localhost:5173
```

