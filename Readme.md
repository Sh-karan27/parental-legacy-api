# Parental Legacy & Life Factors Calculator — API

Backend for the Parental Legacy & Life Factors Calculator. Takes a user's date of birth and deterministically generates life factor scores split between two parents/guardians (grand total = 100).

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication (access + refresh tokens, httpOnly cookies + response body)

## Features

- Register / login / logout with bcrypt-hashed passwords
- Access + refresh token auth — tokens are set as httpOnly cookies and also returned in the response body, so the frontend can use either cookie-based or localStorage-based sessions
- Silent access-token refresh via `/users/refresh-token`
- LegacyLens calculation engine — deterministic factor scores derived from DOB, split between parents/guardians

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the root (see `.env.sample`):

   ```
   PORT=8000
   MONGODB_URL=your_mongodb_connection_string
   DB_NAME=parental_legacy
   CORS_ORIGIN=http://localhost:5173
   ACCESS_TOKEN_SECRET=your_secret
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_SECRET=your_secret
   REFRESH_TOKEN_EXPIRY=1d
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

Server starts at `http://localhost:8000`.

## API Endpoints

### Users — `/api/v1/users`

| Method | Route              | Auth | Description                          |
| ------ | ------------------ | ---- | ------------------------------------ |
| POST   | `/register`        | No   | Create a new user                    |
| POST   | `/login`           | No   | Log in, sets auth cookies            |
| POST   | `/refresh-token`   | No   | Exchange refresh token for a new pair|
| POST   | `/logout`          | Yes  | Clear auth cookies                   |
| POST   | `/change-password` | Yes  | Change the current user's password   |
| GET    | `/current-user`    | Yes  | Get the logged-in user's profile     |

### LegacyLens — `/api/v1/legacy`

| Method | Route          | Auth | Description                                  |
| ------ | -------------- | ---- | --------------------------------------------- |
| GET    | `/me`          | Yes  | LegacyLens analysis for the logged-in user    |
| GET    | `/users`       | Yes  | LegacyLens summary for every registered user  |
| GET    | `/users/:userId`| Yes | LegacyLens analysis for a specific user       |

## Project Structure

```
src/
├── index.js          # Entry point — loads env, connects DB, starts server
├── app.js            # Express app — middleware, CORS, routes
├── db/
│   └── index.js      # MongoDB connection
├── constants/
│   └── factors.constants.js
├── controllers/       # Route handlers
├── models/            # Mongoose schemas
├── routes/            # API route definitions
├── services/
│   └── legacyLens.service.js
├── middlewares/
│   ├── auth.middleware.js
│   └── errorHandler.js
└── utils/
    ├── ApiError.js
    ├── ApiResponse.js
    ├── asyncHandler.js
    └── legacyLens.util.js
```

## Deployment (Render)

This runs as a normal persistent Node process, not a serverless function.

1. Create a new Web Service from this repo.
2. **Root Directory**: leave blank
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Add the same environment variables listed above under the service's Environment tab. Don't set `PORT` — Render injects its own.
6. In MongoDB Atlas → Network Access, allow `0.0.0.0/0` so Render's dynamic IPs can connect.
7. Set `CORS_ORIGIN` to your deployed frontend's exact URL so cross-origin cookies (`sameSite: "none"`) are accepted only from it.
