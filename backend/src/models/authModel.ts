import { prisma } from "../config/prisma";
import { createSupabaseAuthClient } from "../config/supabase";

export type EmployeeRole = "ADMIN" | "PROJECT_MANAGER" | "WORKER";

type AuthenticatedEmployee = {
  id_Zaposleni: number;
  ime: string;
  priimek: string;
  email: string;
  vloga: EmployeeRole;
};

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
  user: AuthenticatedEmployee;
};

export type LoginErrorCode =
  | "INVALID_CREDENTIALS"
  | "INACTIVE_ACCOUNT"
  | "ACCESS_DENIED"
  | "SERVICE_ERROR";

export class LoginError extends Error {
  constructor(public readonly code: LoginErrorCode) {
    super(code);
  }
}

const allowedRoles: EmployeeRole[] = ["ADMIN", "PROJECT_MANAGER", "WORKER"];

export async function authenticateEmployee(
  email: string,
  password: string,
): Promise<LoginResult> {
  const supabaseAuth = createSupabaseAuthClient();

  const {
    data: { user, session },
    error: authError,
  } = await supabaseAuth.auth.signInWithPassword({ email, password });

  if (authError || !user || !session) {
    throw new LoginError("INVALID_CREDENTIALS");
  }

  let employee;

  try {
    employee = await prisma.zaposleni.findUnique({
      where: { supabaseUid: user.id },
      select: {
        id: true,
        ime: true,
        priimek: true,
        email: true,
        vloga: true,
        aktiven: true,
      },
    });
  } catch (error) {
    console.error("Napaka pri branju zaposlenega s Prisma:", error);
    throw new LoginError("SERVICE_ERROR");
  }

  if (!employee) {
    throw new LoginError("ACCESS_DENIED");
  }

  if (!employee.aktiven) {
    throw new LoginError("INACTIVE_ACCOUNT");
  }

  if (!allowedRoles.includes(employee.vloga as EmployeeRole)) {
    throw new LoginError("ACCESS_DENIED");
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? null,
    user: {
      id_Zaposleni: employee.id,
      ime: employee.ime,
      priimek: employee.priimek,
      email: employee.email,
      vloga: employee.vloga as EmployeeRole,
    },
  };
}
