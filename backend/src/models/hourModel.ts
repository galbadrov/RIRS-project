import { prisma } from "../config/prisma";

export type HourErrorCode = "PROJECT_NOT_ASSIGNED" | "EMPLOYEE_NOT_FOUND";

export class HourError extends Error {
  constructor(public readonly code: HourErrorCode) {
    super(code);
  }
}

const hourSelection = {
  id: true,
  datum: true,
  steviloUr: true,
  urnaPostavka: true,
  projekt: {
    select: {
      id: true,
      naziv: true,
    },
  },
} as const;

function serializeHour(hour: {
  id: number;
  datum: Date;
  steviloUr: { toNumber(): number };
  urnaPostavka: { toNumber(): number };
  projekt: { id: number; naziv: string };
}) {
  return {
    id_Ure: hour.id,
    datum: hour.datum.toISOString().slice(0, 10),
    steviloUr: hour.steviloUr.toNumber(),
    urnaPostavka: hour.urnaPostavka.toNumber(),
    projekt: {
      id_Projekt: hour.projekt.id,
      naziv: hour.projekt.naziv,
    },
  };
}

export async function createHourEntry(
  employeeId: number,
  projectId: number,
  date: Date,
  numberOfHours: number,
) {
  const [employee, assignment] = await Promise.all([
    prisma.zaposleni.findUnique({
      where: { id: employeeId },
      select: { urnaPostavka: true },
    }),
    prisma.dodelitev.findUnique({
      where: {
        idProjekt_idZaposleni: {
          idProjekt: projectId,
          idZaposleni: employeeId,
        },
      },
      select: { id: true },
    }),
  ]);

  if (!employee) throw new HourError("EMPLOYEE_NOT_FOUND");
  if (!assignment) throw new HourError("PROJECT_NOT_ASSIGNED");

  const hour = await prisma.ure.create({
    data: {
      idProjekt: projectId,
      idZaposleni: employeeId,
      datum: date,
      steviloUr: numberOfHours,
      urnaPostavka: employee.urnaPostavka,
    },
    select: hourSelection,
  });

  return serializeHour(hour);
}

export async function getMonthlyHours(
  employeeId: number,
  year: number,
  month: number,
) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const hours = await prisma.ure.findMany({
    where: {
      idZaposleni: employeeId,
      datum: { gte: start, lt: end },
    },
    select: hourSelection,
    orderBy: [{ datum: "desc" }, { id: "desc" }],
  });

  return hours.map(serializeHour);
}
