# Coin Tracker
###### *This is the API repository. If you wish to view the front end repository, you can find it [here](https://github.com/alicenstar/coin-tracker-3-api).*
***
#### Visit the site and create your own tracker [here](https://www.cointracker.me/), or view a demo tracker [here](https://www.cointracker.me/6046ee08e4fabe00153867e5).
***
### Purpose
Are you tired of having to log in to seven different exchanges just to see where your crypto portfolio stands? Me too. So, I created Coin Tracker, the site that tracks your cryptocurrency portfolio value anonymously - no login necessary.

## Development Features
- Used `Mongoose` to design `MongoDB` database schemas
- Utilized `Mongoose` virtuals to include related Model documents and convert them to `JSON`
- Utilized `TypeScript` to add type safety
- Integrated `csv-parser` to read and write `.csv` files
- Designed `RESTful API` endpoints to manage front end interactions with the database
- Created endpoints to interact with the `CoinMarketCap API`