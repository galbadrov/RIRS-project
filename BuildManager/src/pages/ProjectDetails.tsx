import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Project = {
  id_Projekt: number;
  naziv: string;
  opis: string;
  lokacija: string;
  datumZacetka: string;
  datumZakljucka: string;
  dogovorjenaCena: number;
  status: string;
  stranka: { id_Stranka: number; naziv: string };
  vodjaProjekta: { id_Zaposleni: number; ime: string; priimek: string };
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProject() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/projects/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
            },
            signal: controller.signal,
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("expiresAt");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        const result = (await response.json()) as {
          project?: Project;
          message?: string;
        };

        if (!response.ok || !result.project) {
          setError(result.message ?? "Projekta ni mogoče pridobiti.");
          return;
        }

        setProject(result.project);
      } catch (requestError) {
        if (requestError instanceof Error && requestError.name !== "AbortError") {
          setError("Povezava s strežnikom ni uspela.");
        }
      }
    }

    void loadProject();
    return () => controller.abort();
  }, [id, navigate]);

  if (error) {
    return (
      <div className='space-y-6'>
        <Button asChild variant='outline'>
          <Link to='/projekti'>
            <ArrowLeft /> Nazaj na projekte
          </Link>
        </Button>
        <p className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700' role='alert'>
          {error}
        </p>
      </div>
    );
  }

  if (!project) {
    return <p className='text-sm text-slate-600'>Nalaganje projekta ...</p>;
  }

  return (
    <div className='space-y-6'>
      <Button asChild variant='outline'>
        <Link to='/projekti'>
          <ArrowLeft /> Nazaj na projekte
        </Link>
      </Button>

      <div className='rounded-xl border bg-white p-6 shadow-sm'>
        <div className='flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-slate-900'>{project.naziv}</h1>
            <p className='mt-1 text-sm text-slate-600'>{project.lokacija}</p>
          </div>
          <Badge variant='secondary'>
            {project.status === "NACRTOVAN" ? "Načrtovan" : project.status}
          </Badge>
        </div>

        <dl className='mt-6 grid gap-6 md:grid-cols-2'>
          <div className='md:col-span-2'>
            <dt className='text-sm font-medium text-muted-foreground'>Opis</dt>
            <dd className='mt-1 whitespace-pre-wrap'>{project.opis}</dd>
          </div>
          <div>
            <dt className='text-sm font-medium text-muted-foreground'>Stranka</dt>
            <dd className='mt-1'>{project.stranka.naziv}</dd>
          </div>
          <div>
            <dt className='text-sm font-medium text-muted-foreground'>Projektni vodja</dt>
            <dd className='mt-1'>
              {project.vodjaProjekta.ime} {project.vodjaProjekta.priimek}
            </dd>
          </div>
          <div>
            <dt className='text-sm font-medium text-muted-foreground'>Datum začetka</dt>
            <dd className='mt-1'>
              {new Intl.DateTimeFormat("sl-SI").format(
                new Date(`${project.datumZacetka}T00:00:00`),
              )}
            </dd>
          </div>
          <div>
            <dt className='text-sm font-medium text-muted-foreground'>Datum zaključka</dt>
            <dd className='mt-1'>
              {new Intl.DateTimeFormat("sl-SI").format(
                new Date(`${project.datumZakljucka}T00:00:00`),
              )}
            </dd>
          </div>
          <div>
            <dt className='text-sm font-medium text-muted-foreground'>Dogovorjena cena</dt>
            <dd className='mt-1 text-lg font-semibold'>
              {new Intl.NumberFormat("sl-SI", {
                style: "currency",
                currency: "EUR",
              }).format(project.dogovorjenaCena)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
