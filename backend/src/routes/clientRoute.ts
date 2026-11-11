import express from "express";
import {
  addClient,
  listClients,
} from "../controllers/clientController";
import { requireAdmin } from "../middleware/requireAdmin";

const clientRouter = express.Router();

clientRouter.use(requireAdmin);
clientRouter.get("/", listClients);
clientRouter.post("/", addClient);

export default clientRouter;
