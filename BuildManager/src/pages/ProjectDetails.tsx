import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Pencil, Save, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

type ProjectForm = Pick<
  Project,
  "opis" | "datumZacetka" | "datumZakljucka" | "status"
>;

const statusLabels: Record<string, string> = {
  NACRTOVAN: "Načrtovan",
  V_TEKU: "V teku",
  ZAKLJUCEN: "Zaključen",
  PREKLICAN: "Preklican",
};

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") ?? "null") as {
      id_Zaposleni?: number;
      vloga?: string;
    } | null;
  } catch {
    return null;
  }
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProjectForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  const user = getStoredUser();
  const canEdit =
    user?.vloga === "PROJECT_MANAGER" &&
    user.id_Zaposleni === project?.vodjaProjekta.id_Zaposleni;

  function startEditing() {
    if (!project) return;
    setForm({
      opis: project.opis,
      datumZacetka: project.datumZacetka,
      datumZakljucka: project.datumZakljucka,
      status: project.status,
    });
    setFormError("");
    setSuccessMessage("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setForm(null);
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    setFormError("");
    setSuccessMessage("");
    if (!form.opis.trim()) {
      setFormError("Opis projekta je obvezen.");
      return;
    }
    if (form.datumZakljucka < form.datumZacetka) {
      setFormError("Datum zaključka ne sme biti pred datumom začetka.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/projects/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
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
        setFormError(result.message ?? "Projekta trenutno ni mogoče posodobiti.");
        return;
      }

      setProject(result.project);
      setForm(null);
      setIsEditing(false);
      setSuccessMessage("Spremembe projekta so bile uspešno shranjene.");
    } catch {
      setFormError("Povezava s strežnikom ni uspela.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <div className='flex items-center gap-2'>
            <Badge variant='secondary'>
              {statusLabels[project.status] ?? project.status}
            </Badge>
            {canEdit && !isEditing && (
              <Button type='button' size='sm' onClick={startEditing}>
                <Pencil /> Uredi projekt
              </Button>
            )}
          </div>
        </div>

        {successMessage && (
          <p
            className='mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700'
            role='status'>
            {successMessage}
          </p>
        )}

        {isEditing && form ? (
          <form className='mt-6 space-y-6' onSubmit={handleSubmit}>
            <div className='space-y-2'>
              <Label htmlFor='opis'>Opis</Label>
              <Textarea
                id='opis'
                className='min-h-32'
                value={form.opis}
                onChange={(event) =>
                  setForm({ ...form, opis: event.target.value })
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='datumZacetka'>Datum začetka</Label>
                <Input
                  id='datumZacetka'
                  type='date'
                  value={form.datumZacetka}
                  onChange={(event) =>
                    setForm({ ...form, datumZacetka: event.target.value })
                  }
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='datumZakljucka'>Datum zaključka</Label>
                <Input
                  id='datumZakljucka'
                  type='date'
                  min={form.datumZacetka}
                  value={form.datumZakljucka}
                  onChange={(event) =>
                    setForm({ ...form, datumZakljucka: event.target.value })
                  }
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className='space-y-2 md:max-w-sm'>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={form.status}
                onValueChange={(status) => setForm({ ...form, status })}
                disabled={isSubmitting}>
                <SelectTrigger id='status' className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formError && (
              <p
                className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'
                role='alert'>
                {formError}
              </p>
            )}

            <div className='flex flex-wrap gap-2'>
              <Button type='submit' disabled={isSubmitting}>
                <Save /> {isSubmitting ? "Shranjevanje ..." : "Shrani spremembe"}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={cancelEditing}
                disabled={isSubmitting}>
                <X /> Prekliči
              </Button>
            </div>
          </form>
        ) : (
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
        )}
      </div>
    </div>
  );
}
