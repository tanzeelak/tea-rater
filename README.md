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

## Tasting tea membership

Teas belong to a tasting independently of ratings. The server creates the tasting_teas table and backfills links from existing ratings on startup. The frontend requires this version of the backend to add or remove unrated teas.

- GET /tastings returns each tasting with tea_ids (an empty array when there are no teas). The X-Tasting-Membership: true response header is exposed to browser clients, including when the list is empty.
- POST /create-tasting accepts {"name":"...","tea_ids":[1,2]} to save a tasting and its initial teas together. tea_ids may be empty.
- POST /tastings/{tastingId}/teas accepts {"tea_id":1} to add a tea without rating it.

Deploy this backend before relying on the new frontend controls. Existing tastings that had no ratings start empty and can have teas added through the frontend.

## Removing teas

Both endpoints below are currently public, just like the existing write routes. Anyone who can call the API can use them.

- `DELETE /tastings/{tastingId}/teas/{teaId}` removes the tea membership and all ratings for that tea **in that tasting only**. The tea and tasting remain; returns `404` when neither a membership nor ratings link them.
- `DELETE /teas/{id}` permanently removes the tea and all its ratings in every tasting. Tastings remain; returns `404` when the tea does not exist.

Both return JSON with `message` and `ratings_deleted`. IDs must be positive integers (`400` otherwise). Database failures return `500`. These endpoints are only available after the updated backend is deployed.
