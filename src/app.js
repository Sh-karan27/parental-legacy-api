import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// CORS_ORIGIN="*" reflects any origin (dev); otherwise only comma-separated
// origins in the list are allowed, since credentialed CORS can't use "*".
const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((o) => o.trim());

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      callback(null, origin || true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes
import userRouter from "./routes/user.routes.js";
import legacyLensRouter from "./routes/legacyLens.routes.js";

app.get("/", (req, res) => {
  res.send("server ready");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/legacy", legacyLensRouter);

app.use(errorHandler);

export { app };
