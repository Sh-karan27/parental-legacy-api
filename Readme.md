# Parental Legacy & Life Factors Calculator — API

Backend for the Parental Legacy & Life Factors Calculator. Takes a user's Date of Birth and generates life factor values split between Mother and Father (grand total = 100).

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication (bonus feature)

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
   ACCESS_TOKEN_SECRET=your_secret
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

Server starts at `http://localhost:8000`.

## Project Structure

```
src/
├── index.js          # Entry point — loads env, connects DB, starts server
├── app.js            # Express app — middleware, CORS, routes
├── db/
│   └── index.js      # MongoDB connection
├── controllers/      # Route handlers
├── models/           # Mongoose schemas
├── routes/           # API route definitions
├── middlewares/
│   └── errorHandler.js
└── utils/
    ├── ApiError.js
    ├── ApiResponse.js
    └── asyncHandler.js
```
