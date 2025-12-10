// backend/api/src/main.ts

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import scoreRoutes from "./routes/scoreRoutes";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Cos_u API server is running.");
});

// =============================
// API ROUTES
// =============================
app.use("/api/score", scoreRoutes);

// =============================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 API Server running at http://localhost:${PORT}`);
});
