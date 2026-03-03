Usage: migrate data from local JSON files into Postgres

1. Set `DATABASE_URL` to your Postgres connection string, e.g.:

   - On Windows PowerShell:

```powershell
$env:DATABASE_URL = "postgres://user:pass@localhost:5432/dbname"
npm run migrate-pg
```

2. Install dependencies (if not installed):

```bash
npm install
```

3. Run the migration (uses `tsx` to run TypeScript script):

```bash
# adds a script alias in package.json, or run directly:
npx tsx src/scripts/migrate-to-postgres.ts
```

What it does:
- Creates tables `modules`, `questions`, `answers`, `users` if they don't exist
- Inserts/updates modules and questions from `data/app-data.json`

Notes:
- The app still uses the in-memory JSON store at `src/lib/store.ts` by default. To switch the application to use Postgres you must update `src/lib/store.ts` to use the `pg-client` methods or replace it with a DB-backed implementation.
- This script is intended as a one-time migration helper; consider adding backups before running in production.