import express from "express";
import cors from "cors";

import authRouter from "./routes/authRoute";
import employeeRouter from "./routes/employeeRoute";
import projectRouter from "./routes/projectRoute";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/projects", projectRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
