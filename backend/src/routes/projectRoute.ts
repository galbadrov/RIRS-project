import express from "express";
import {
  addProject,
  listProjects,
  showProject,
} from "../controllers/projectController";
import { requireAdmin } from "../middleware/requireAdmin";

const projectRouter = express.Router();

projectRouter.use(requireAdmin);
projectRouter.get("/", listProjects);
projectRouter.get("/:id", showProject);
projectRouter.post("/", addProject);

export default projectRouter;
