# Express + SQLite API

A clean Node.js backend with Express and SQLite, featuring CRUD APIs, validation, and error handling.

## Structure

```
express-api/
├── src/
│   ├── config/       # Database configuration
│   ├── db/           # Schema and initialization
│   ├── repositories/  # Data access layer
│   ├── controllers/  # Request handlers
│   ├── routes/       # API routes
│   ├── validators/   # Request validation
│   ├── middleware/    # Error handling
│   ├── app.js        # Express app
│   └── index.js      # Entry point
├── data/             # SQLite database (auto-created)
└── package.json
```

## Setup

```bash
cd express-api
npm install
```

## Run

```bash
npm start
# or with auto-reload
npm run dev
```

Server runs on `http://localhost:3001` (or `PORT` env var).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/items` | List all items (query: `name`, `minQuantity`) |
| GET | `/api/items/:id` | Get item by ID |
| POST | `/api/items` | Create item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

## Example Requests

**Create item:**
```bash
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Widget","description":"A useful widget","quantity":10}'
```

**List items:**
```bash
curl http://localhost:3001/api/items
curl "http://localhost:3001/api/items?name=Widget&minQuantity=5"
```

**Update item:**
```bash
curl -X PUT http://localhost:3001/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"quantity":20}'
```

**Delete item:**
```bash
curl -X DELETE http://localhost:3001/api/items/1
```

## Integration with Next.js App

When `EXPRESS_API_URL` is set in the Next.js `.env` (e.g. `EXPRESS_API_URL=http://localhost:3001`), the app proxies all data API calls to this Express backend. All modules, questions, answers, and videos are then persisted in SQLite.

**To enable:**
1. Start Express: `cd express-api && npm start`
2. Seed initial data: `npm run seed` (loads from `data/app-data.json`)
3. Add to Next.js `.env`: `EXPRESS_API_URL=http://localhost:3001`
4. Restart Next.js dev server

## Environment

- `PORT` - Server port (default: 3001)
- `DB_PATH` - SQLite database file path (default: `data/app.db`)
