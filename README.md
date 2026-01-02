# tea-rater

Backend
`cd backend`
`go run main.go`

Database
`cd backend`
`sqlite3 ratings.db`

Frontend
`cd frontend`
`npm install`
`npm run dev`


FAQ 

1. If you see this issue: 
```
[error] failed to initialize database, got error failed to connect to `host=db.juddjuhbkgxvufjekjib.supabase.co user=postgres database=postgres`: dial error (dial tcp [2600:1f18:2e13:9d1c:59b5:ca86:6669:821e]:5432: connect: no route to host)
2026/01/01 19:00:52 Failed to connect database:failed to connect to `host=db.juddjuhbkgxvufjekjib.supabase.co user=postgres database=postgres`: dial error (dial tcp [2600:1f18:2e13:9d1c:59b5:ca86:6669:821e]:5432: connect: no route to host)
exit status 1
```
It's likely an IPv4 issue which can be solved with IPv4 add-on.