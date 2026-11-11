import type { Request, Response } from "express";
import {
  ClientError,
  createClient,
  getClients,
} from "../models/clientModel";

export async function listClients(_req: Request, res: Response): Promise<void> {
  try {
    res.json({ clients: await getClients() });
  } catch (error) {
    console.error("Napaka pri pridobivanju strank:", error);
    res.status(500).json({
      code: "SERVICE_ERROR",
      message: "Strank trenutno ni mogoče pridobiti.",
    });
  }
}

export async function addClient(req: Request, res: Response): Promise<void> {
  const { naziv, email, telefonskaStevilka, naslov, davcnaStevilka } =
    req.body as Record<string, unknown>;

  if (
    typeof naziv !== "string" ||
    !naziv.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof naslov !== "string" ||
    !naslov.trim() ||
    (telefonskaStevilka !== undefined &&
      typeof telefonskaStevilka !== "string") ||
    (davcnaStevilka !== undefined && typeof davcnaStevilka !== "string")
  ) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Preverite vnesene podatke stranke.",
    });
    return;
  }

  try {
    const client = await createClient({
      naziv,
      email,
      telefonskaStevilka,
      naslov,
      davcnaStevilka,
    });
    res.status(201).json({ client });
  } catch (error) {
    if (error instanceof ClientError) {
      const emailExists = error.code === "EMAIL_EXISTS";
      res.status(409).json({
        code: error.code,
        message: emailExists
          ? "Stranka s tem e-poštnim naslovom že obstaja."
          : "Stranka s to davčno številko že obstaja.",
      });
      return;
    }

    console.error("Napaka pri ustvarjanju stranke:", error);
    res.status(500).json({
      code: "SERVICE_ERROR",
      message: "Stranke trenutno ni mogoče ustvariti.",
    });
  }
}
