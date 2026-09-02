import express from "express";
import cors from "cors";
import { loadEnv } from "./loadEnv.js";
import { router } from "./routes.js";

loadEnv();

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(router);

app.use((_req, res) => {
  res.status(404).json({ error: "not found" });
});

app.listen(port, () => {
  console.log(`SKONGA API listening on http://localhost:${port}`);
});
