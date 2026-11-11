import type { Request, Response } from "express";
import {
  createEmployee,
  EmployeeError,
  getEmployees,
  updateEmployee,
} from "../models/employeeModel";
import type { EmployeeRole } from "../models/authModel";

const allowedRoles: EmployeeRole[] = ["ADMIN", "PROJECT_MANAGER", "WORKER"];

export async function listEmployees(_req: Request, res: Response): Promise<void> {
  try {
    res.json({ employees: await getEmployees() });
  } catch (error) {
    console.error("Napaka pri pridobivanju zaposlenih:", error);
    res.status(500).json({
      code: "SERVICE_ERROR",
      message: "Zaposlenih trenutno ni mogoče pridobiti.",
    });
  }
}

export async function addEmployee(req: Request, res: Response): Promise<void> {
  const { ime, priimek, email, vloga, urnaPostavka, aktiven } = req.body as {
    ime?: unknown;
    priimek?: unknown;
    email?: unknown;
    vloga?: unknown;
    urnaPostavka?: unknown;
    aktiven?: unknown;
  };

  if (
    typeof ime !== "string" ||
    !ime.trim() ||
    typeof priimek !== "string" ||
    !priimek.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof vloga !== "string" ||
    !allowedRoles.includes(vloga as EmployeeRole) ||
    typeof urnaPostavka !== "number" ||
    !Number.isFinite(urnaPostavka) ||
    urnaPostavka < 0 ||
    typeof aktiven !== "boolean"
  ) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Preverite vnesene podatke zaposlenega.",
    });
    return;
  }

  try {
    const result = await createEmployee({
      ime,
      priimek,
      email,
      vloga: vloga as EmployeeRole,
      urnaPostavka,
      aktiven,
    });
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof EmployeeError && error.code === "EMAIL_EXISTS") {
      res.status(409).json({
        code: error.code,
        message: "Zaposleni s tem e-poštnim naslovom že obstaja.",
      });
      return;
    }

    console.error("Nepričakovana napaka pri ustvarjanju zaposlenega:", error);
    res.status(500).json({
      code: "SERVICE_ERROR",
      message: "Zaposlenega trenutno ni mogoče ustvariti.",
    });
  }
}

export async function editEmployee(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { ime, priimek, email, vloga, urnaPostavka, aktiven } = req.body as {
    ime?: unknown;
    priimek?: unknown;
    email?: unknown;
    vloga?: unknown;
    urnaPostavka?: unknown;
    aktiven?: unknown;
  };

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    typeof ime !== "string" ||
    !ime.trim() ||
    typeof priimek !== "string" ||
    !priimek.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof vloga !== "string" ||
    !allowedRoles.includes(vloga as EmployeeRole) ||
    typeof urnaPostavka !== "number" ||
    !Number.isFinite(urnaPostavka) ||
    urnaPostavka < 0 ||
    typeof aktiven !== "boolean"
  ) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Preverite vnesene podatke zaposlenega.",
    });
    return;
  }

  try {
    const employee = await updateEmployee(id, {
      ime,
      priimek,
      email,
      vloga: vloga as EmployeeRole,
      urnaPostavka,
      aktiven,
    });
    res.json({ employee });
  } catch (error) {
    if (error instanceof EmployeeError) {
      if (error.code === "EMAIL_EXISTS") {
        res.status(409).json({
          code: error.code,
          message: "Zaposleni s tem e-poštnim naslovom že obstaja.",
        });
        return;
      }

      if (error.code === "NOT_FOUND") {
        res.status(404).json({
          code: error.code,
          message: "Zaposleni ne obstaja.",
        });
        return;
      }
    }

    console.error("Nepričakovana napaka pri urejanju zaposlenega:", error);
    res.status(500).json({
      code: "SERVICE_ERROR",
      message: "Zaposlenega trenutno ni mogoče posodobiti.",
    });
  }
}
