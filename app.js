import compression from "compression";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import session from "express-session";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { dbConnect } from "./db/connectDb.js";
import advertiserRoutes from "./src/modules/advertisers/advertiser.routes.js";
import userRoutes from "./src/modules/auth/auth.routes.js";
import clientRoutes from "./src/modules/clients/clients.routes.js";
import countryRoutes from "./src/modules/countries/country.routes.js";
import fieldRoutes from "./src/modules/fields/fields.routes.js";
import siteInfoRoutes from "./src/modules/site_info/siteInfo.routes.js";
import tenderRoutes from "./src/modules/Tenders/tenders.routes.js";
import currencyRoutes from "./src/modules/currency/currency.routes.js";
import messagesRoutes from "./src/modules/messages/message.routes.js";
import "./src/modules/utility/scheduler.js";
import sitemapRouter from "./src/modules/sitemap/sitemap.routes.js";
import { startSitemapJob } from "./src/modules/utility/sitemapJob.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
dbConnect();
startSitemapJob();
console.log(`[${new Date().toLocaleTimeString()}] Sitemap generated`);
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://www.tendersday.com",
  "https://tendersday.com",
];

const BASE_URL = process.env.BASE_URL || "/api/v1";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  allowedOrigins: ["Content-Type", "Authorization"],
};

const limiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: 1000,
  message: "عدد كبير من الطلبات، حاول مرة أخرى لاحقًا.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

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
app.use(`/api/v1/messages`, messagesRoutes);
app.use(`/api/v1/site-info`, siteInfoRoutes);
app.use(`/api/v1/tenders`, tenderRoutes);
app.use(`/api/v1/currencies`, currencyRoutes);
app.use("/", sitemapRouter);

const addStaticWithCors = (route, folder) => {
  app.use(
    route,
    (req, res, next) => {
      const origin = req.headers.origin;
      if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Methods", "GET");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      }
      next();
    },
    express.static(path.resolve("uploads", folder))
  );
};

addStaticWithCors("/uploads/tenders", "tenders");
addStaticWithCors("/uploads/siteInfo", "siteInfo");
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
