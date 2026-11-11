import { prisma } from "../config/prisma";

type NewClient = {
  naziv: string;
  email: string;
  telefonskaStevilka?: string;
  naslov: string;
  davcnaStevilka?: string;
};

export type ClientErrorCode = "EMAIL_EXISTS" | "TAX_NUMBER_EXISTS";

export class ClientError extends Error {
  constructor(public readonly code: ClientErrorCode) {
    super(code);
  }
}

const clientSelection = {
  id: true,
  naziv: true,
  email: true,
  telefonskaStevilka: true,
  naslov: true,
  davcnaStevilka: true,
} as const;

function serializeClient(client: {
  id: number;
  naziv: string;
  email: string;
  telefonskaStevilka: string | null;
  naslov: string;
  davcnaStevilka: string | null;
}) {
  const { id, ...data } = client;
  return { ...data, id_Stranka: id };
}

export async function getClients() {
  const clients = await prisma.stranka.findMany({
    select: clientSelection,
    orderBy: { naziv: "asc" },
  });

  return clients.map(serializeClient);
}

export async function createClient(input: NewClient) {
  const email = input.email.trim().toLowerCase();
  const taxNumber = input.davcnaStevilka?.trim() || null;
  const [emailOwner, taxNumberOwner] = await Promise.all([
    prisma.stranka.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    }),
    taxNumber
      ? prisma.stranka.findUnique({
          where: { davcnaStevilka: taxNumber },
          select: { id: true },
        })
      : null,
  ]);

  if (emailOwner) throw new ClientError("EMAIL_EXISTS");
  if (taxNumberOwner) throw new ClientError("TAX_NUMBER_EXISTS");

  const client = await prisma.stranka.create({
    data: {
      naziv: input.naziv.trim(),
      email,
      telefonskaStevilka: input.telefonskaStevilka?.trim() || null,
      naslov: input.naslov.trim(),
      davcnaStevilka: taxNumber,
    },
    select: clientSelection,
  });

  return serializeClient(client);
}
