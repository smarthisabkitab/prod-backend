import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import { logger } from "./utils/logger.js";
import { authenticate } from "./config/database.js";
import apiRoute from "./api.route.js";

const app = express();

// Middleware
app.use(helmet());
app.use(morgan("combined", { stream: logger.stream }));
app.use(express.json());

const whitelist = [
  "http://localhost:5173",
  "https://smarthisabkitab.com",
  "https://api.smarthisabkitab.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      callback(null, "*");
    } else if (whitelist.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // If you need to allow cookies/auth
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// connection for database
authenticate();

// Routes
app.get("/", (req, res) => {
  res.send("Gold & Jewellery Backend API");
});

app.use("/api/v1", apiRoute);

export default app;
