import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Dynamic CORS setup to allow all origins WITH credentials
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman) or from any origin
    callback(null, origin || true);
  },
  credentials: true, // Allow cookies, authorization headers
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
