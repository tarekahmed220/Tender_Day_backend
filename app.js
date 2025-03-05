import dotenv from "dotenv";
import express from "express";
import { dbConnect } from "./db/connectDb.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import userRoutes from "./src/modules/auth/auth.routes.js";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import MongoStore from "connect-mongo";
import session from "express-session";
import clientRoutes from "./src/modules/clients/clients.routes.js";
import countryRoutes from "./src/modules/countries/country.routes.js";
import advertiserRoutes from "./src/modules/advertisers/advertiser.routes.js";
import fieldRoutes from "./src/modules/fields/fields.routes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5500;
dbConnect();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
];

const BASE_URL = process.env.BASE_URL || "/api/v1";

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: { action: "deny" },
  })
);

app.use(limiter);
app.use(compression());
app.use(hpp());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(`/api/v1/auth`, userRoutes);
app.use(`/api/v1/clients`, clientRoutes);
app.use(`/api/v1/countries`, countryRoutes);
app.use(`/api/v1/advertisers`, advertiserRoutes);
app.use(`/api/v1/fields`, fieldRoutes);
// app.use(`${BASE_URL}/auth`, userRoutes);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mySecretKey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 3 * 24 * 60 * 60,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(mongoSanitize());

app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    status: err.status || "error",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

app.listen(port, () => console.log(`Server running on port: ${port}!`));
