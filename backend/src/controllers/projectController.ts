import type { Request, Response } from "express";
import {
  createProject,
  getProject,
  getProjectPageData,
  ProjectError,
  projectStatuses,
  updateProject,
} from "../models/projectModel";
import type { AuthenticatedEmployee } from "../middleware/requireEmployee";

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
    const employee = res.locals.employee as AuthenticatedEmployee;
    if (employee.role !== "ADMIN" && employee.role !== "PROJECT_MANAGER") {
      res.status(403).json({ code: "FORBIDDEN", message: "Dostop ni dovoljen." });
      return;
    }

    res.json(
      await getProjectPageData(
        employee.role === "PROJECT_MANAGER" ? employee.id : undefined,
      ),
    );
  } catch (error) {
    console.error("Napaka pri pridobivanju projektov:", error);
    res.status(500).json({
      code: "SERVICE_ERROR",
      message: "Projektov trenutno ni mogoče pridobiti.",
    });
  }
}

export async function showProject(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Identifikator projekta ni veljaven.",
    });
    return;
  }

  try {
    const project = await getProject(id);
    const employee = res.locals.employee as AuthenticatedEmployee;

    if (
      employee.role !== "ADMIN" &&
      (employee.role !== "PROJECT_MANAGER" ||
        project.vodjaProjekta.id_Zaposleni !== employee.id)
    ) {
      res.status(403).json({
        code: "FORBIDDEN",
        message: "Dostop do tega projekta ni dovoljen.",
      });
      return;
    }

    res.json({ project });
  } catch (error) {
    if (error instanceof ProjectError && error.code === "NOT_FOUND") {
      res.status(404).json({
        code: error.code,
        message: "Projekt ne obstaja.",
      });
      return;
    }

    console.error("Napaka pri pridobivanju projekta:", error);
    res.status(500).json({
      code: "SERVICE_ERROR",
      message: "Projekta trenutno ni mogoče pridobiti.",
    });
  }
}

export async function editProject(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { opis, datumZacetka, datumZakljucka, status } = req.body as Record<
    string,
    unknown
  >;
  const startDate = parseDate(datumZacetka);
  const endDate = parseDate(datumZakljucka);

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    typeof opis !== "string" ||
    !opis.trim() ||
    !startDate ||
    !endDate ||
    endDate < startDate ||
    typeof status !== "string" ||
    !projectStatuses.includes(status as (typeof projectStatuses)[number])
  ) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message:
        endDate && startDate && endDate < startDate
          ? "Datum zaključka ne sme biti pred datumom začetka."
          : "Preverite vnesene podatke projekta.",
    });
    return;
  }

  const employee = res.locals.employee as AuthenticatedEmployee;
  if (employee.role !== "PROJECT_MANAGER") {
    res.status(403).json({
      code: "FORBIDDEN",
      message: "Projekt lahko ureja samo njegov projektni vodja.",
    });
    return;
  }

  try {
    const project = await updateProject(id, employee.id, {
      opis,
      datumZacetka: startDate,
      datumZakljucka: endDate,
      status: status as (typeof projectStatuses)[number],
    });
    res.json({ project });
  } catch (error) {
    if (error instanceof ProjectError) {
      if (error.code === "NOT_FOUND") {
        res.status(404).json({ code: error.code, message: "Projekt ne obstaja." });
        return;
      }
      if (error.code === "NOT_MANAGER") {
        res.status(403).json({
          code: "FORBIDDEN",
          message: "Urejate lahko samo projekte, ki jih vodite.",
        });
        return;
      }
    }

    console.error("Napaka pri posodabljanju projekta:", error);
    res.status(500).json({
      code: "SERVICE_ERROR",
      message: "Projekta trenutno ni mogoče posodobiti.",
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
