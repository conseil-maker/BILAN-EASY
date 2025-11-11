# Docker PostgreSQL Database Fix

## Problem
PostgreSQL error: `database "bilan_user" does not exist`

The backend is trying to connect to database `bilan_user` (username) instead of `bilan_easy` (database name).

## Solution

### Step 1: Stop and remove containers
```bash
docker-compose down
```

### Step 2: Remove the PostgreSQL volume (if it exists with wrong database)
```bash
docker volume rm bilan-101120251636_postgres_data
```

Or remove all volumes:
```bash
docker volume prune
```

### Step 3: Restart with fresh database
```bash
docker-compose up --build
```

## What was fixed

1. **docker-compose.yml**: Now explicitly sets `POSTGRES_DB` environment variable in backend service
2. This ensures the DATABASE_URL connection string uses the correct database name: `bilan_easy`

## Verification

After restart, check the logs:
```bash
docker-compose logs backend | grep DATABASE
docker-compose logs postgres
```

You should see:
- Backend connecting successfully
- No "database does not exist" errors
- Health check returning 200 OK

## Alternative: Manual Database Creation

If the issue persists, you can manually create the database:

```bash
docker-compose exec postgres psql -U bilan_user -d postgres -c "CREATE DATABASE bilan_easy;"
```

