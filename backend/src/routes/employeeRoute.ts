import express from "express";
import {
  addEmployee,
  editEmployee,
  listEmployees,
} from "../controllers/employeeController";
import { requireAdmin } from "../middleware/requireAdmin";

const employeeRouter = express.Router();

employeeRouter.use(requireAdmin);
employeeRouter.get("/", listEmployees);
employeeRouter.post("/", addEmployee);
employeeRouter.patch("/:id", editEmployee);

export default employeeRouter;
