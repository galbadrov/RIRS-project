import type { Request, Response } from "express";
import {
  authenticateEmployee,
  LoginError,
  type LoginErrorCode,
} from "../models/authModel";

const errorResponses: Record<LoginErrorCode, { status: number; message: string }> = {
  INVALID_CREDENTIALS: {
    status: 401,
    message: "E-poštni naslov ali geslo ni pravilno.",
  },
  INACTIVE_ACCOUNT: {
    status: 403,
    message: "Uporabniški račun ni aktiven.",
  },
  ACCESS_DENIED: {
    status: 403,
    message: "Uporabniški račun nima dostopa do aplikacije.",
  },
  SERVICE_ERROR: {
    status: 500,
    message: "Prijava trenutno ni mogoča. Poskusite znova pozneje.",
  },
};

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as {
    email?: unknown;
    password?: unknown;
  };

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Vnesite e-poštni naslov in geslo.",
    });
    return;
  }

  try {
    const result = await authenticateEmployee(email.trim(), password);
    res.json(result);
  } catch (error) {
    if (error instanceof LoginError) {
      const response = errorResponses[error.code];
      res
        .status(response.status)
        .json({ code: error.code, message: response.message });
      return;
    }

    console.error("Nepričakovana napaka pri prijavi:", error);
    res
      .status(500)
      .json({
        code: "SERVICE_ERROR",
        message: "Prijava trenutno ni mogoča. Poskusite znova pozneje.",
      });
  }
}

export function register(_req: Request, res: Response): void {
  res.status(501).json({ message: "Registracija še ni implementirana." });
}
