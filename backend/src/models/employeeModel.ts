import { randomBytes } from "node:crypto";
import { prisma } from "../config/prisma";
import { createSupabaseAdminClient } from "../config/supabase";
import type { EmployeeRole } from "./authModel";

type NewEmployee = {
  ime: string;
  priimek: string;
  email: string;
  vloga: EmployeeRole;
  urnaPostavka: number;
  aktiven: boolean;
};

export type EmployeeErrorCode =
  | "EMAIL_EXISTS"
  | "NOT_FOUND"
  | "SERVICE_ERROR";

export class EmployeeError extends Error {
  constructor(public readonly code: EmployeeErrorCode) {
    super(code);
  }
}

const employeeSelection = {
  id: true,
  ime: true,
  priimek: true,
  email: true,
  vloga: true,
  urnaPostavka: true,
  aktiven: true,
} as const;

function serializeEmployee(employee: {
  id: number;
  ime: string;
  priimek: string;
  email: string;
  vloga: string;
  urnaPostavka: { toNumber(): number };
  aktiven: boolean;
}) {
  const { id, urnaPostavka, ...data } = employee;

  return {
    ...data,
    id_Zaposleni: id,
    urnaPostavka: urnaPostavka.toNumber(),
  };
}

export async function getEmployees() {
  const employees = await prisma.zaposleni.findMany({
    select: employeeSelection,
    orderBy: [{ priimek: "asc" }, { ime: "asc" }],
  });

  return employees.map(serializeEmployee);
}

export async function createEmployee(input: NewEmployee) {
  const email = input.email.trim().toLowerCase();
  const existingEmployee = await prisma.zaposleni.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });

  if (existingEmployee) {
    throw new EmployeeError("EMAIL_EXISTS");
  }

  const password = `Bm!${randomBytes(12).toString("base64url")}7a`;
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !data.user) {
    if (
      authError?.code === "email_exists" ||
      authError?.code === "user_already_exists"
    ) {
      throw new EmployeeError("EMAIL_EXISTS");
    }

    console.error("Napaka pri ustvarjanju Supabase Auth uporabnika:", authError);
    throw new EmployeeError("SERVICE_ERROR");
  }

  try {
    const employee = await prisma.zaposleni.create({
      data: {
        supabaseUid: data.user.id,
        ime: input.ime.trim(),
        priimek: input.priimek.trim(),
        email,
        vloga: input.vloga,
        urnaPostavka: input.urnaPostavka,
        aktiven: input.aktiven,
      },
      select: employeeSelection,
    });

    return { employee: serializeEmployee(employee), password };
  } catch (error) {
    const { error: cleanupError } = await supabaseAdmin.auth.admin.deleteUser(
      data.user.id,
    );

    if (cleanupError) {
      console.error("Napaka pri odstranjevanju Auth uporabnika:", cleanupError);
    }

    console.error("Napaka pri ustvarjanju zaposlenega s Prisma:", error);
    throw new EmployeeError("SERVICE_ERROR");
  }
}

export async function updateEmployee(id: number, input: NewEmployee) {
  const currentEmployee = await prisma.zaposleni.findUnique({
    where: { id },
    select: { id: true, supabaseUid: true, email: true },
  });

  if (!currentEmployee) {
    throw new EmployeeError("NOT_FOUND");
  }

  const email = input.email.trim().toLowerCase();
  const emailChanged = currentEmployee.email !== email;

  if (emailChanged) {
    const duplicate = await prisma.zaposleni.findFirst({
      where: {
        id: { not: id },
        email: { equals: email, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new EmployeeError("EMAIL_EXISTS");
    }
  }

  const supabaseAdmin = emailChanged ? createSupabaseAdminClient() : null;

  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      currentEmployee.supabaseUid,
      { email, email_confirm: true },
    );

    if (error) {
      if (error.code === "email_exists" || error.code === "user_already_exists") {
        throw new EmployeeError("EMAIL_EXISTS");
      }

      console.error("Napaka pri posodabljanju Supabase Auth uporabnika:", error);
      throw new EmployeeError("SERVICE_ERROR");
    }
  }

  try {
    const employee = await prisma.zaposleni.update({
      where: { id },
      data: {
        ime: input.ime.trim(),
        priimek: input.priimek.trim(),
        email,
        vloga: input.vloga,
        urnaPostavka: input.urnaPostavka,
        aktiven: input.aktiven,
      },
      select: employeeSelection,
    });

    return serializeEmployee(employee);
  } catch (error) {
    if (supabaseAdmin) {
      const { error: rollbackError } =
        await supabaseAdmin.auth.admin.updateUserById(
          currentEmployee.supabaseUid,
          { email: currentEmployee.email, email_confirm: true },
        );

      if (rollbackError) {
        console.error("Napaka pri povrnitvi Auth e-pošte:", rollbackError);
      }
    }

    console.error("Napaka pri posodabljanju zaposlenega s Prisma:", error);
    throw new EmployeeError("SERVICE_ERROR");
  }
}
