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

## Removing teas

Both endpoints below are currently public, just like the existing write routes. Anyone who can call the API can use them.

- `DELETE /tastings/{tastingId}/teas/{teaId}` removes all ratings for that tea **in that tasting only**. The tea and tasting remain; returns `404` when there are no ratings linking them.
- `DELETE /teas/{id}` permanently removes the tea and all its ratings in every tasting. Tastings remain; returns `404` when the tea does not exist.

Both return JSON with `message` and `ratings_deleted`. IDs must be positive integers (`400` otherwise). Database failures return `500`. These endpoints are only available after the updated backend is deployed.
