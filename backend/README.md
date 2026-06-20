# Backend 

API de dados espaciais de acidentes de trânsito do estado de São Paulo, utilizando QuadTree para consultas geográficas.

## Rotas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/query` | Retorna pontos de acidente dentro de um bounding box (`minLng`, `minLat`, `maxLng`, `maxLat`). Parâmetro opcional `limit` (padrão 500). |
| GET | `/api/stats` | Retorna total de registros, bounding box geral e contagem por tipo de sinistro. |
| GET | `/api/tree` | Retorna as subdivisões da QuadTree para visualização. Parâmetro opcional `maxDepth` (padrão 5). |
