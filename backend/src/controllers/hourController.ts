import type { Request, Response } from "express";

import {
  createHourEntry,
  getMonthlyHours,
  HourError,
} from "../models/hourModel";
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

function parseMonth(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12) return null;
  return { year, month };
}

export async function addHour(req: Request, res: Response): Promise<void> {
  const { idProjekt, datum, steviloUr } = req.body as Record<string, unknown>;
  const parsedDate = parseDate(datum);

  if (
    !Number.isInteger(idProjekt) ||
    Number(idProjekt) <= 0 ||
    !parsedDate ||
    typeof steviloUr !== "number" ||
    !Number.isFinite(steviloUr) ||
    steviloUr <= 0 ||
    steviloUr > 24
  ) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Izberite projekt in vnesite veljaven datum ter število ur nad 0 in največ 24.",
    });
    return;
  }

  try {
    const employee = res.locals.employee as AuthenticatedEmployee;
    const hour = await createHourEntry(
      employee.id,
      Number(idProjekt),
      parsedDate,
      steviloUr,
    );
    res.status(201).json({ hour });
  } catch (error) {
    if (error instanceof HourError) {
      if (error.code === "PROJECT_NOT_ASSIGNED") {
        res.status(403).json({
          code: error.code,
          message: "Ure lahko vpišete samo za projekt, na katerega ste dodeljeni.",
        });
        return;
      }

      if (error.code === "EMPLOYEE_NOT_FOUND") {
        res.status(403).json({
          code: error.code,
          message: "Prijavljeni zaposleni ne obstaja.",
        });
        return;
      }
    }

    console.error("Napaka pri shranjevanju delovnih ur:", error);
    res.status(500).json({
      code: "SERVICE_ERROR",
      message: "Delovnih ur trenutno ni mogoče shraniti.",
    });
  }
}

export async function listMonthlyHours(
  req: Request,
  res: Response,
): Promise<void> {
  const month = parseMonth(req.query.month);
  if (!month) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Mesec mora biti podan v obliki LLLL-MM.",
    });
    return;
  }

  try {
    const employee = res.locals.employee as AuthenticatedEmployee;
    const hours = await getMonthlyHours(employee.id, month.year, month.month);
    res.json({ hours });
  } catch (error) {
    console.error("Napaka pri pridobivanju delovnih ur:", error);
    res.status(500).json({
      code: "SERVICE_ERROR",
      message: "Delovnih ur trenutno ni mogoče pridobiti.",
    });
  }
}
