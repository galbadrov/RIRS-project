import express from "express";
import {
  addEmployee,
  listEmployees,
} from "../controllers/employeeController";
import { requireAdmin } from "../middleware/requireAdmin";

const employeeRouter = express.Router();

employeeRouter.use(requireAdmin);
employeeRouter.get("/", listEmployees);
employeeRouter.post("/", addEmployee);

export default employeeRouter;
