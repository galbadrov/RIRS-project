import { useEffect, useState, type FormEvent } from "react";
import { Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AssignedProject = {
  id_Projekt: number;
  naziv: string;
  status: string;
};

type HourEntry = {
  id_Ure: number;
  datum: string;
  steviloUr: number;
  urnaPostavka: number;
  projekt: {
    id_Projekt: number;
    naziv: string;
  };
};

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

const currentMonth = today().slice(0, 7);

function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("expiresAt");
  localStorage.removeItem("user");
}

export default function Hours() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<AssignedProject[]>([]);
  const [projectId, setProjectId] = useState("");
  const [date, setDate] = useState(today);
  const [hours, setHours] = useState("");
  const [hourEntries, setHourEntries] = useState<HourEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [areHoursLoading, setAreHoursLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [hoursError, setHoursError] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAssignedProjects() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/projects/assigned`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
            },
            signal: controller.signal,
          },
        );

        if (response.status === 401) {
          clearSession();
          navigate("/login", { replace: true });
          return;
        }

        const result = (await response.json()) as {
          projects?: AssignedProject[];
          message?: string;
        };

        if (!response.ok || !result.projects) {
          setPageError(
            result.message ?? "Dodeljenih projektov ni mogoče pridobiti.",
          );
          return;
        }

        setProjects(result.projects);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setPageError("Povezava s strežnikom ni uspela.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadAssignedProjects();
    return () => controller.abort();
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMonthlyHours() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/hours?month=${currentMonth}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
            },
            signal: controller.signal,
          },
        );

        if (response.status === 401) {
          clearSession();
          navigate("/login", { replace: true });
          return;
        }

        const result = (await response.json()) as {
          hours?: HourEntry[];
          message?: string;
        };

        if (!response.ok || !result.hours) {
          setHoursError(
            result.message ?? "Evidentiranih ur ni mogoče pridobiti.",
          );
          return;
        }

        setHourEntries(result.hours);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setHoursError("Povezava s strežnikom ni uspela.");
        }
      } finally {
        if (!controller.signal.aborted) setAreHoursLoading(false);
      }
    }

    void loadMonthlyHours();
    return () => controller.abort();
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setMessage("");

    const parsedHours = Number(hours);
    if (!projectId) {
      setFormError("Izberite projekt, za katerega vpisujete ure.");
      return;
    }
    if (!date) {
      setFormError("Izberite datum opravljenega dela.");
      return;
    }
    if (!Number.isFinite(parsedHours) || parsedHours <= 0 || parsedHours > 24) {
      setFormError("Število ur mora biti večje od 0 in največ 24.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/hours`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idProjekt: Number(projectId),
            datum: date,
            steviloUr: parsedHours,
          }),
        },
      );

      if (response.status === 401) {
        clearSession();
        navigate("/login", { replace: true });
        return;
      }

      const result = (await response.json()) as {
        hour?: HourEntry;
        message?: string;
      };

      if (!response.ok || !result.hour) {
        setFormError(
          result.message ?? "Delovnih ur trenutno ni mogoče shraniti.",
        );
        return;
      }

      if (result.hour.datum.startsWith(currentMonth)) {
        setHourEntries((entries) =>
          [...entries, result.hour!].sort((first, second) =>
            second.datum === first.datum
              ? second.id_Ure - first.id_Ure
              : second.datum.localeCompare(first.datum),
          ),
        );
      }
      setHours("");
      setMessage("Delovne ure so bile uspešno shranjene.");
    } catch {
      setFormError("Povezava s strežnikom ni uspela.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalHours = hourEntries.reduce(
    (sum, entry) => sum + entry.steviloUr,
    0,
  );
  const monthLabel = new Intl.DateTimeFormat("sl-SI", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${currentMonth}-01T00:00:00`));

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-slate-900'>Moje delovne ure</h1>
        <p className='mt-1 text-sm text-slate-600'>
          Vnesite opravljene ure za projekt, na katerega ste dodeljeni.
        </p>
      </div>

      <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
        <div className='mb-6 flex items-center gap-3'>
          <div className='rounded-lg bg-slate-100 p-2 text-slate-700'>
            <Clock3 className='size-5' />
          </div>
          <div>
            <h2 className='font-semibold text-slate-900'>Nov vnos</h2>
            <p className='text-sm text-slate-500'>
              Izberite projekt, datum in število opravljenih ur.
            </p>
          </div>
        </div>

        {pageError ? (
          <p
            className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'
            role='alert'>
            {pageError}
          </p>
        ) : (
          <form className='space-y-5' onSubmit={handleSubmit}>
            <div className='grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]'>
              <div className='space-y-2'>
                <Label htmlFor='project'>Projekt</Label>
                <Select
                  value={projectId}
                  onValueChange={setProjectId}
                  disabled={isLoading || isSubmitting || projects.length === 0}>
                  <SelectTrigger id='project' className='w-full'>
                    <SelectValue
                      placeholder={
                        isLoading ? "Nalaganje projektov ..." : "Izberite projekt"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem
                        key={project.id_Projekt}
                        value={String(project.id_Projekt)}>
                        {project.naziv}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isLoading && projects.length === 0 && (
                  <p className='text-xs text-amber-700'>
                    Trenutno niste dodeljeni nobenemu projektu.
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='date'>Datum</Label>
                <Input
                  id='date'
                  type='date'
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='hours'>Število ur</Label>
                <Input
                  id='hours'
                  type='number'
                  min='0.01'
                  max='24'
                  step='0.01'
                  placeholder='npr. 8'
                  value={hours}
                  onChange={(event) => setHours(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {formError && (
              <p
                className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'
                role='alert'>
                {formError}
              </p>
            )}
            {message && (
              <p
                className='rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700'
                role='status'>
                {message}
              </p>
            )}

            <div className='flex justify-end'>
              <Button
                type='submit'
                disabled={isLoading || isSubmitting || projects.length === 0}>
                {isSubmitting ? "Shranjevanje ..." : "Shrani vnos"}
              </Button>
            </div>
          </form>
        )}
      </section>

      <section className='rounded-xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6'>
          <h2 className='font-semibold capitalize text-slate-900'>
            {monthLabel}
          </h2>
          <span className='text-sm font-medium text-slate-600'>
            Skupaj: {totalHours.toLocaleString("sl-SI")} ur
          </span>
        </div>

        {hoursError ? (
          <p className='m-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
            {hoursError}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Projekt</TableHead>
                <TableHead className='text-right'>Ure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areHoursLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className='text-center text-slate-500'>
                    Nalaganje evidence ...
                  </TableCell>
                </TableRow>
              ) : hourEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className='text-center text-slate-500'>
                    V tem mesecu še nimate evidentiranih ur.
                  </TableCell>
                </TableRow>
              ) : (
                hourEntries.map((entry) => (
                  <TableRow key={entry.id_Ure}>
                    <TableCell>
                      {new Intl.DateTimeFormat("sl-SI").format(
                        new Date(`${entry.datum}T00:00:00`),
                      )}
                    </TableCell>
                    <TableCell className='font-medium'>
                      {entry.projekt.naziv}
                    </TableCell>
                    <TableCell className='text-right'>
                      {entry.steviloUr.toLocaleString("sl-SI")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
