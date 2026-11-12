import express from "express";
import {
  addProject,
  editProject,
  listProjects,
  showProject,
} from "../controllers/projectController";
import { requireAdmin } from "../middleware/requireAdmin";
import { requireEmployee } from "../middleware/requireEmployee";

const projectRouter = express.Router();

projectRouter.get("/", requireEmployee, listProjects);
projectRouter.post("/", requireAdmin, addProject);
projectRouter.get("/:id", requireEmployee, showProject);
projectRouter.patch("/:id", requireEmployee, editProject);

export default projectRouter;
