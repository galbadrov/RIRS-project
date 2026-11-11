import type { Request, Response } from "express";
import {
  createProject,
  getProjectPageData,
  ProjectError,
} from "../models/projectModel";

function parseDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? date
    : null;
}

export async function listProjects(_req: Request, res: Response): Promise<void> {
  try {
    res.json(await getProjectPageData());
  } catch (error) {
    console.error("Napaka pri pridobivanju projektov:", error);
    res.status(500).json({
      code: "SERVICE_ERROR",
      message: "Projektov trenutno ni mogoče pridobiti.",
    });
  }
}

export async function addProject(req: Request, res: Response): Promise<void> {
  const {
    naziv,
    opis,
    idStranka,
    idVodjaProjekta,
    lokacija,
    datumZacetka,
    datumZakljucka,
    dogovorjenaCena,
  } = req.body as Record<string, unknown>;
  const startDate = parseDate(datumZacetka);
  const endDate = parseDate(datumZakljucka);

  if (
    typeof naziv !== "string" ||
    !naziv.trim() ||
    typeof opis !== "string" ||
    !opis.trim() ||
    !Number.isInteger(idStranka) ||
    Number(idStranka) <= 0 ||
    !Number.isInteger(idVodjaProjekta) ||
    Number(idVodjaProjekta) <= 0 ||
    typeof lokacija !== "string" ||
    !lokacija.trim() ||
    !startDate ||
    !endDate ||
    endDate < startDate ||
    typeof dogovorjenaCena !== "number" ||
    !Number.isFinite(dogovorjenaCena) ||
    dogovorjenaCena < 0
  ) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Preverite vnesene podatke projekta.",
    });
    return;
  }

  try {
    const project = await createProject({
      naziv,
      opis,
      idStranka: Number(idStranka),
      idVodjaProjekta: Number(idVodjaProjekta),
      lokacija,
      datumZacetka: startDate,
      datumZakljucka: endDate,
      dogovorjenaCena,
    });
    res.status(201).json({ project });
  } catch (error) {
    if (error instanceof ProjectError) {
      const clientMissing = error.code === "CLIENT_NOT_FOUND";
      res.status(400).json({
        code: error.code,
        message: clientMissing
          ? "Izbrana stranka ne obstaja."
          : "Izbrani projektni vodja ni na voljo.",
      });
      return;
    }

    console.error("Napaka pri ustvarjanju projekta:", error);
    res.status(500).json({
      code: "SERVICE_ERROR",
      message: "Projekta trenutno ni mogoče ustvariti.",
    });
  }
}
