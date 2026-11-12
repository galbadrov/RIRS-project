import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Pencil, Save, Users, X } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

type EmployeeRole = "ADMIN" | "PROJECT_MANAGER" | "WORKER";

type ActiveEmployee = {
  id_Zaposleni: number;
  ime: string;
  priimek: string;
  email: string;
  vloga: EmployeeRole;
  dodeljen: boolean;
};

const statusLabels: Record<string, string> = {
  NACRTOVAN: "Načrtovan",
  V_TEKU: "V teku",
  ZAKLJUCEN: "Zaključen",
  PREKLICAN: "Preklican",
};

const roleLabels: Record<EmployeeRole, string> = {
  ADMIN: "Administrator",
  PROJECT_MANAGER: "Projektni vodja",
  WORKER: "Delavec",
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
  const [activeEmployees, setActiveEmployees] = useState<ActiveEmployee[]>([]);
  const [areEmployeesLoading, setAreEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [assignmentSuccess, setAssignmentSuccess] = useState("");

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
  const canManageAssignments =
    user?.vloga === "PROJECT_MANAGER" &&
    user.id_Zaposleni === project?.vodjaProjekta.id_Zaposleni;
  const canEditProject = user?.vloga === "ADMIN" || canManageAssignments;

  useEffect(() => {
    if (!canManageAssignments) return;

    const controller = new AbortController();

    async function loadActiveEmployees() {
      setAreEmployeesLoading(true);
      setEmployeesError("");

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/projects/${id}/active-employees`,
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
          employees?: ActiveEmployee[];
          message?: string;
        };

        if (!response.ok || !result.employees) {
          setEmployeesError(
            result.message ?? "Aktivnih zaposlenih ni mogoče pridobiti.",
          );
          return;
        }

        setActiveEmployees(result.employees);
      } catch (requestError) {
        if (requestError instanceof Error && requestError.name !== "AbortError") {
          setEmployeesError("Povezava s strežnikom ni uspela.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setAreEmployeesLoading(false);
        }
      }
    }

    void loadActiveEmployees();
    return () => controller.abort();
  }, [canManageAssignments, id, navigate]);

  const unassignedEmployees = activeEmployees.filter(
    (employee) => !employee.dodeljen,
  );
  const assignedEmployees = activeEmployees.filter(
    (employee) => employee.dodeljen,
  );

  async function handleAssignmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAssignmentError("");
    setAssignmentSuccess("");

    const employeeId = Number(selectedEmployeeId);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      setAssignmentError("Izberite zaposlenega.");
      return;
    }

    setIsAssigning(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/projects/${id}/assignments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idZaposleni: employeeId,
          }),
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
        assignment?: {
          id_Zaposleni: number;
        };
        message?: string;
      };

      if (!response.ok || !result.assignment) {
        setAssignmentError(
          result.message ?? "Zaposlenega trenutno ni mogoče dodeliti.",
        );
        return;
      }

      setActiveEmployees((employees) =>
        employees.map((employee) =>
          employee.id_Zaposleni === result.assignment!.id_Zaposleni
            ? {
                ...employee,
                dodeljen: true,
              }
            : employee,
        ),
      );
      setSelectedEmployeeId("");
      setAssignmentSuccess("Zaposleni je bil uspešno dodeljen projektu.");
    } catch {
      setAssignmentError("Povezava s strežnikom ni uspela.");
    } finally {
      setIsAssigning(false);
    }
  }

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
            {canEditProject && !isEditing && (
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

      {canManageAssignments && (
        <section className='rounded-xl border bg-white shadow-sm'>
          <div className='border-b p-6'>
            <div className='flex items-center gap-2'>
              <Users className='size-5 text-slate-600' aria-hidden='true' />
              <h2 className='text-lg font-semibold text-slate-900'>
                Zaposleni na projektu
              </h2>
            </div>
            <p className='mt-1 text-sm text-slate-600'>
              Dodelite aktivnega zaposlenega in preglejte trenutne člane projekta.
            </p>
          </div>

          {areEmployeesLoading ? (
            <p className='p-6 text-sm text-slate-600'>
              Nalaganje aktivnih zaposlenih ...
            </p>
          ) : employeesError ? (
            <p className='m-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700' role='alert'>
              {employeesError}
            </p>
          ) : activeEmployees.length === 0 ? (
            <p className='p-6 text-sm text-slate-600'>
              Trenutno ni aktivnih zaposlenih.
            </p>
          ) : (
            <>
              <form className='space-y-4 border-b p-6' onSubmit={handleAssignmentSubmit}>
                <div className='grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end'>
                  <div className='space-y-2'>
                    <Label htmlFor='assignmentEmployee'>Zaposleni</Label>
                    <Select
                      value={selectedEmployeeId}
                      onValueChange={setSelectedEmployeeId}
                      disabled={isAssigning || unassignedEmployees.length === 0}>
                      <SelectTrigger id='assignmentEmployee' className='w-full'>
                        <SelectValue placeholder='Izberite zaposlenega' />
                      </SelectTrigger>
                      <SelectContent>
                        {unassignedEmployees.map((employee) => (
                          <SelectItem
                            key={employee.id_Zaposleni}
                            value={String(employee.id_Zaposleni)}>
                            {employee.ime} {employee.priimek}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type='submit'
                    disabled={
                      isAssigning ||
                      unassignedEmployees.length === 0 ||
                      !selectedEmployeeId
                    }>
                    <Users />
                    {isAssigning ? "Dodeljevanje ..." : "Dodeli zaposlenega"}
                  </Button>
                </div>

                {unassignedEmployees.length === 0 && (
                  <p className='text-sm text-slate-600'>
                    Vsi aktivni zaposleni so že dodeljeni projektu.
                  </p>
                )}
                {assignmentError && (
                  <p className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700' role='alert'>
                    {assignmentError}
                  </p>
                )}
                {assignmentSuccess && (
                  <p className='rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700' role='status'>
                    {assignmentSuccess}
                  </p>
                )}
              </form>

              {assignedEmployees.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zaposleni</TableHead>
                      <TableHead>E-pošta</TableHead>
                      <TableHead>Vloga</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedEmployees.map((employee) => (
                      <TableRow key={employee.id_Zaposleni}>
                        <TableCell className='font-medium'>
                          {employee.ime} {employee.priimek}
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          <Badge variant='secondary'>
                            {roleLabels[employee.vloga] ?? employee.vloga}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className='p-6 text-sm text-slate-600'>
                  Projektu trenutno ni dodeljen noben zaposleni.
                </p>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
