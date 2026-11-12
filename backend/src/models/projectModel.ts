import { prisma } from "../config/prisma";

type NewProject = {
  naziv: string;
  opis: string;
  idStranka: number;
  idVodjaProjekta: number;
  lokacija: string;
  datumZacetka: Date;
  datumZakljucka: Date;
  dogovorjenaCena: number;
};

type ProjectUpdate = {
  opis: string;
  datumZacetka: Date;
  datumZakljucka: Date;
  status: ProjectStatus;
};

export const projectStatuses = [
  "NACRTOVAN",
  "V_TEKU",
  "ZAKLJUCEN",
  "PREKLICAN",
] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

export type ProjectErrorCode =
  | "CLIENT_NOT_FOUND"
  | "MANAGER_NOT_AVAILABLE"
  | "NOT_MANAGER"
  | "NOT_FOUND";

export class ProjectError extends Error {
  constructor(public readonly code: ProjectErrorCode) {
    super(code);
  }
}

const projectSelection = {
  id: true,
  naziv: true,
  opis: true,
  lokacija: true,
  datumZacetka: true,
  datumZakljucka: true,
  dogovorjenaCena: true,
  status: true,
  stranka: { select: { id: true, naziv: true } },
  vodjaProjekta: { select: { id: true, ime: true, priimek: true } },
} as const;

function serializeProject(project: {
  id: number;
  naziv: string;
  opis: string;
  lokacija: string;
  datumZacetka: Date;
  datumZakljucka: Date;
  dogovorjenaCena: { toNumber(): number };
  status: string;
  stranka: { id: number; naziv: string };
  vodjaProjekta: { id: number; ime: string; priimek: string };
}) {
  return {
    id_Projekt: project.id,
    naziv: project.naziv,
    opis: project.opis,
    lokacija: project.lokacija,
    datumZacetka: project.datumZacetka.toISOString().slice(0, 10),
    datumZakljucka: project.datumZakljucka.toISOString().slice(0, 10),
    dogovorjenaCena: project.dogovorjenaCena.toNumber(),
    status: project.status,
    stranka: {
      id_Stranka: project.stranka.id,
      naziv: project.stranka.naziv,
    },
    vodjaProjekta: {
      id_Zaposleni: project.vodjaProjekta.id,
      ime: project.vodjaProjekta.ime,
      priimek: project.vodjaProjekta.priimek,
    },
  };
}

export async function getProjectPageData(managerId?: number) {
  const [projects, clients, projectManagers] = await Promise.all([
    prisma.projekt.findMany({
      where: managerId === undefined ? undefined : { idVodjaProjekta: managerId },
      select: projectSelection,
      orderBy: { datumZacetka: "desc" },
    }),
    managerId === undefined
      ? prisma.stranka.findMany({
          select: { id: true, naziv: true },
          orderBy: { naziv: "asc" },
        })
      : [],
    managerId === undefined
      ? prisma.zaposleni.findMany({
          where: { aktiven: true, vloga: "PROJECT_MANAGER" },
          select: { id: true, ime: true, priimek: true },
          orderBy: [{ priimek: "asc" }, { ime: "asc" }],
        })
      : [],
  ]);

  return {
    projects: projects.map(serializeProject),
    clients: clients.map((client) => ({
      id_Stranka: client.id,
      naziv: client.naziv,
    })),
    projectManagers: projectManagers.map((manager) => ({
      id_Zaposleni: manager.id,
      ime: manager.ime,
      priimek: manager.priimek,
    })),
  };
}

export async function getProject(id: number) {
  const project = await prisma.projekt.findUnique({
    where: { id },
    select: projectSelection,
  });

  if (!project) throw new ProjectError("NOT_FOUND");
  return serializeProject(project);
}

export async function createProject(input: NewProject) {
  const [client, manager] = await Promise.all([
    prisma.stranka.findUnique({
      where: { id: input.idStranka },
      select: { id: true },
    }),
    prisma.zaposleni.findFirst({
      where: {
        id: input.idVodjaProjekta,
        aktiven: true,
        vloga: "PROJECT_MANAGER",
      },
      select: { id: true },
    }),
  ]);

  if (!client) throw new ProjectError("CLIENT_NOT_FOUND");
  if (!manager) throw new ProjectError("MANAGER_NOT_AVAILABLE");

  const project = await prisma.projekt.create({
    data: {
      naziv: input.naziv.trim(),
      opis: input.opis.trim(),
      idStranka: input.idStranka,
      idVodjaProjekta: input.idVodjaProjekta,
      lokacija: input.lokacija.trim(),
      datumZacetka: input.datumZacetka,
      datumZakljucka: input.datumZakljucka,
      dogovorjenaCena: input.dogovorjenaCena,
      status: "NACRTOVAN",
    },
    select: projectSelection,
  });

  return serializeProject(project);
}

export async function updateProject(
  id: number,
  managerId: number,
  input: ProjectUpdate,
) {
  const existingProject = await prisma.projekt.findUnique({
    where: { id },
    select: { idVodjaProjekta: true },
  });

  if (!existingProject) throw new ProjectError("NOT_FOUND");
  if (existingProject.idVodjaProjekta !== managerId) {
    throw new ProjectError("NOT_MANAGER");
  }

  const project = await prisma.projekt.update({
    where: { id },
    data: {
      opis: input.opis.trim(),
      datumZacetka: input.datumZacetka,
      datumZakljucka: input.datumZakljucka,
      status: input.status,
    },
    select: projectSelection,
  });

  return serializeProject(project);
}
