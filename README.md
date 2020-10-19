# reddit-clone

To get the project running in local environment
1. Server setup
```sh
# from root folder
cd server
npm install
```
2. Create a `.env` file inside server folder and setup the following environment variable.\
N.B. Postgres has used as database for the app.
```
DATABASE_URL=
REDISCLOUD_URL =
SESSION_SECRET=
SENDGRID_KEY=
PORT=
CORS_ORIGIN=
```
3. To start the project in locally, requires running two scripts. One to compile the TS to JS. Another to run the JS code. Instead of running two script,
we could have used `ts-node-dev` for the development but the recompiling and running the TS code is significantly slower than running the JS code.
```sh
# one terminal
npm run watch
# another terminal
npm run dev
```
4. Client setup
```sh
# from root folder
cd web
npm install
```
5. Create `.env.local` inside the web folder and setup the api url
```sh
NEXT_PUBLIC_API_URL=
```
6. Start the project locally with
```sh
npm run dev
```
