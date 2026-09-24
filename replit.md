# Running the tea-rater API on Replit

This is a Go HTTP API backed by PostgreSQL. The development database is provided by Replit through the runtime-managed `DATABASE_URL`; do not commit a `.env` file or put the connection string in source code.

The **Start application** workflow runs `PORT=5000 go run .` and serves the API in the Preview. The root route (`GET /`) returns a small JSON response. For a one-off local check, run `PORT=5000 go run .` in the shell.

The app creates its tables with Gorm on startup. No sample teas are seeded automatically. Other read-only endpoints include `GET /all-teas`, `GET /tastings`, and `GET /ratings`. There is no frontend in this repository.