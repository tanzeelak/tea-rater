# tea-rater

## Start Server
`go run main.go`

## Database
`psql tea_rater`
Get all tables
`\dt`
Get all teas
`select * from teas`

Heroku Deploy
* Use IP4 for server connection
`git push heroku main`
https://tea-rater-api-9687118a646c.herokuapp.com/

TODO
- figure out why register is broken on production
