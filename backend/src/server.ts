import express from "express";
import cors from "cors";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use(cors());

app.get("/", (_req, res) => {
  res.send("Hello, World!");
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
