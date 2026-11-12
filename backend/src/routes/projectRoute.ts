import express from "express";
import {
  addEmployeeToProject,
  addProject,
  editProject,
  listAssignedProjects,
  listActiveEmployeesForProject,
  listProjects,
  removeEmployeeFromProject,
  showProject,
} from "../controllers/projectController";
import { requireAdmin } from "../middleware/requireAdmin";
import { requireEmployee } from "../middleware/requireEmployee";

const projectRouter = express.Router();

projectRouter.get("/", requireEmployee, listProjects);
projectRouter.post("/", requireAdmin, addProject);
projectRouter.get("/assigned", requireEmployee, listAssignedProjects);
projectRouter.get(
  "/:id/active-employees",
  requireEmployee,
  listActiveEmployeesForProject,
);
projectRouter.post(
  "/:id/assignments",
  requireEmployee,
  addEmployeeToProject,
);
projectRouter.delete(
  "/:id/assignments/:employeeId",
  requireEmployee,
  removeEmployeeFromProject,
);
projectRouter.get("/:id", requireEmployee, showProject);
projectRouter.patch("/:id", requireEmployee, editProject);

export default projectRouter;
