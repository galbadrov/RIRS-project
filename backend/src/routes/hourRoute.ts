import express from "express";

import { addHour, listMonthlyHours } from "../controllers/hourController";
import { requireEmployee } from "../middleware/requireEmployee";

const hourRouter = express.Router();

hourRouter.get("/", requireEmployee, listMonthlyHours);
hourRouter.post("/", requireEmployee, addHour);

export default hourRouter;
