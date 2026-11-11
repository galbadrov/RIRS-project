import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { supabasePublic } from "../config/supabase";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authorization = req.header("authorization");
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!accessToken) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Prijava je potrebna." });
    return;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabasePublic.auth.getUser(accessToken);

    if (error || !user) {
      res.status(401).json({ code: "UNAUTHORIZED", message: "Seja ni veljavna." });
      return;
    }

    const employee = await prisma.zaposleni.findUnique({
      where: { supabaseUid: user.id },
      select: { aktiven: true, vloga: true },
    });

    if (!employee?.aktiven || employee.vloga !== "ADMIN") {
      res.status(403).json({ code: "FORBIDDEN", message: "Dostop ni dovoljen." });
      return;
    }

    next();
  } catch (error) {
    console.error("Napaka pri preverjanju administratorskega dostopa:", error);
    res.status(500).json({
      code: "SERVICE_ERROR",
      message: "Preverjanje dostopa trenutno ni mogoče.",
    });
  }
}
