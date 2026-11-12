import { useEffect, useState, type FormEvent } from "react";
import { FolderKanban, Info, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type Client = { id_Stranka: number; naziv: string };
type ProjectManager = { id_Zaposleni: number; ime: string; priimek: string };
type Project = {
  id_Projekt: number;
  naziv: string;
  opis: string;
  lokacija: string;
  datumZacetka: string;
  datumZakljucka: string;
  dogovorjenaCena: number;
  status: string;
  stranka: Client;
  vodjaProjekta: ProjectManager;
};

const statusLabels: Record<string, string> = {
  NACRTOVAN: "Načrtovan",
  V_TEKU: "V teku",
  ZAKLJUCEN: "Zaključen",
  PREKLICAN: "Preklican",
};

const initialForm = {
  naziv: "",
  opis: "",
  idStranka: "",
  idVodjaProjekta: "",
  lokacija: "",
  datumZacetka: "",
  datumZakljucka: "",
  dogovorjenaCena: "",
};

export function Projects() {
  const navigate = useNavigate();
  const isAdmin = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") ?? "null") as {
        vloga?: string;
      } | null;
      return user?.vloga === "ADMIN";
    } catch {
      return false;
    }
  })();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/projects`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}` },
          signal: controller.signal,
        });

        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("expiresAt");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        const result = (await response.json()) as {
          projects?: Project[];
          clients?: Client[];
          projectManagers?: ProjectManager[];
          message?: string;
        };

        if (!response.ok || !result.projects || !result.clients || !result.projectManagers) {
          setPageError(result.message ?? "Projektov ni mogoče pridobiti.");
          return;
        }

        setProjects(result.projects);
        setClients(result.clients);
        setProjectManagers(result.projectManagers);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setPageError("Povezava s strežnikom ni uspela.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadProjects();
    return () => controller.abort();
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!form.idStranka || !form.idVodjaProjekta) {
      setFormError("Izberite stranko in projektnega vodjo.");
      return;
    }
    if (form.datumZakljucka < form.datumZacetka) {
      setFormError("Datum zaključka ne sme biti pred datumom začetka.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          idStranka: Number(form.idStranka),
          idVodjaProjekta: Number(form.idVodjaProjekta),
          dogovorjenaCena: Number(form.dogovorjenaCena),
        }),
      });
      const result = (await response.json()) as { project?: Project; message?: string };

      if (!response.ok || !result.project) {
        setFormError(result.message ?? "Projekta trenutno ni mogoče ustvariti.");
        return;
      }

      setProjects((current) => [result.project!, ...current]);
      setForm(initialForm);
      setSheetOpen(false);
    } catch {
      setFormError("Povezava s strežnikom ni uspela.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900'>Projekti</h1>
          <p className='mt-1 text-sm text-slate-600'>Pregled projektov, rokov in dogovorjenih cen.</p>
        </div>
        {isAdmin && (
          <Button type='button' onClick={() => { setForm(initialForm); setFormError(""); setSheetOpen(true); }}>
            <Plus /> Nov projekt
          </Button>
        )}

        {isAdmin && <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) setFormError(""); }}>
          <SheetContent className='overflow-y-auto sm:max-w-lg'>
            <SheetHeader>
              <SheetTitle>Nov projekt</SheetTitle>
              <SheetDescription>Vnesite osnovne podatke, odgovorne osebe, roke in ceno.</SheetDescription>
            </SheetHeader>
            <form className='flex flex-1 flex-col px-4' onSubmit={handleSubmit}>
              <div className='space-y-5'>
                <div className='space-y-2'>
                  <Label htmlFor='naziv'>Naziv</Label>
                  <Input id='naziv' value={form.naziv} onChange={(event) => setForm({ ...form, naziv: event.target.value })} disabled={isSubmitting} required />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='opis'>Opis</Label>
                  <Textarea id='opis' value={form.opis} onChange={(event) => setForm({ ...form, opis: event.target.value })} disabled={isSubmitting} required />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='stranka'>Stranka</Label>
                  <Select value={form.idStranka} onValueChange={(value) => setForm({ ...form, idStranka: value })} disabled={isSubmitting || clients.length === 0}>
                    <SelectTrigger id='stranka' className='w-full'><SelectValue placeholder='Izberite stranko' /></SelectTrigger>
                    <SelectContent>{clients.map((client) => <SelectItem key={client.id_Stranka} value={String(client.id_Stranka)}>{client.naziv}</SelectItem>)}</SelectContent>
                  </Select>
                  {clients.length === 0 && <p className='text-xs text-amber-700'>Pred ustvarjanjem projekta dodajte stranko.</p>}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='vodja'>Projektni vodja</Label>
                  <Select value={form.idVodjaProjekta} onValueChange={(value) => setForm({ ...form, idVodjaProjekta: value })} disabled={isSubmitting || projectManagers.length === 0}>
                    <SelectTrigger id='vodja' className='w-full'><SelectValue placeholder='Izberite projektnega vodjo' /></SelectTrigger>
                    <SelectContent>{projectManagers.map((manager) => <SelectItem key={manager.id_Zaposleni} value={String(manager.id_Zaposleni)}>{manager.ime} {manager.priimek}</SelectItem>)}</SelectContent>
                  </Select>
                  {projectManagers.length === 0 && <p className='text-xs text-amber-700'>Potrebujete vsaj enega aktivnega projektnega vodjo.</p>}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='lokacija'>Lokacija</Label>
                  <Input id='lokacija' value={form.lokacija} onChange={(event) => setForm({ ...form, lokacija: event.target.value })} disabled={isSubmitting} required />
                </div>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='datumZacetka'>Datum začetka</Label>
                    <Input id='datumZacetka' type='date' value={form.datumZacetka} onChange={(event) => setForm({ ...form, datumZacetka: event.target.value })} disabled={isSubmitting} required />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='datumZakljucka'>Datum zaključka</Label>
                    <Input id='datumZakljucka' type='date' min={form.datumZacetka} value={form.datumZakljucka} onChange={(event) => setForm({ ...form, datumZakljucka: event.target.value })} disabled={isSubmitting} required />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='dogovorjenaCena'>Dogovorjena cena (€)</Label>
                  <Input id='dogovorjenaCena' type='number' min='0' step='0.01' value={form.dogovorjenaCena} onChange={(event) => setForm({ ...form, dogovorjenaCena: event.target.value })} disabled={isSubmitting} required />
                </div>
                {formError && <p className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700' role='alert'>{formError}</p>}
              </div>
              <SheetFooter className='mt-6 p-0 pb-4'>
                <Button type='submit' disabled={isSubmitting || clients.length === 0 || projectManagers.length === 0}>
                  {isSubmitting ? "Ustvarjanje ..." : "Ustvari projekt"}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>}
      </div>

      <Sheet
        open={selectedProject !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}>
        <SheetContent className='overflow-y-auto sm:max-w-lg'>
          <SheetHeader>
            <div className='flex items-center gap-2 pr-8'>
              <SheetTitle>{selectedProject?.naziv}</SheetTitle>
              <Badge variant='secondary'>
                {selectedProject
                  ? statusLabels[selectedProject.status] ?? selectedProject.status
                  : ""}
              </Badge>
            </div>
            <SheetDescription>
              Podrobnosti izbranega projekta.
            </SheetDescription>
          </SheetHeader>

          {selectedProject && (
            <dl className='space-y-5 px-4 pb-6'>
              <div>
                <dt className='text-sm font-medium text-muted-foreground'>
                  Opis
                </dt>
                <dd className='mt-1 whitespace-pre-wrap text-sm'>
                  {selectedProject.opis}
                </dd>
              </div>
              <div className='grid gap-5 sm:grid-cols-2'>
                <div>
                  <dt className='text-sm font-medium text-muted-foreground'>
                    Stranka
                  </dt>
                  <dd className='mt-1'>{selectedProject.stranka.naziv}</dd>
                </div>
                <div>
                  <dt className='text-sm font-medium text-muted-foreground'>
                    Projektni vodja
                  </dt>
                  <dd className='mt-1'>
                    {selectedProject.vodjaProjekta.ime}{" "}
                    {selectedProject.vodjaProjekta.priimek}
                  </dd>
                </div>
              </div>
              <div>
                <dt className='text-sm font-medium text-muted-foreground'>
                  Lokacija
                </dt>
                <dd className='mt-1'>{selectedProject.lokacija}</dd>
              </div>
              <div className='grid gap-5 sm:grid-cols-2'>
                <div>
                  <dt className='text-sm font-medium text-muted-foreground'>
                    Datum začetka
                  </dt>
                  <dd className='mt-1'>
                    {new Intl.DateTimeFormat("sl-SI").format(
                      new Date(`${selectedProject.datumZacetka}T00:00:00`),
                    )}
                  </dd>
                </div>
                <div>
                  <dt className='text-sm font-medium text-muted-foreground'>
                    Datum zaključka
                  </dt>
                  <dd className='mt-1'>
                    {new Intl.DateTimeFormat("sl-SI").format(
                      new Date(`${selectedProject.datumZakljucka}T00:00:00`),
                    )}
                  </dd>
                </div>
              </div>
              <div>
                <dt className='text-sm font-medium text-muted-foreground'>
                  Dogovorjena cena
                </dt>
                <dd className='mt-1 text-lg font-semibold'>
                  {new Intl.NumberFormat("sl-SI", {
                    style: "currency",
                    currency: "EUR",
                  }).format(selectedProject.dogovorjenaCena)}
                </dd>
              </div>
            </dl>
          )}
        </SheetContent>
      </Sheet>

      <div className='mt-6 overflow-hidden rounded-xl border bg-white shadow-sm'>
        {isLoading ? <p className='p-6 text-sm text-slate-600'>Nalaganje projektov ...</p> : pageError ? (
          <p className='p-6 text-sm text-red-700' role='alert'>{pageError}</p>
        ) : projects.length === 0 ? (
          <div className='grid place-items-center gap-2 p-12 text-center'>
            <FolderKanban className='size-8 text-slate-400' />
            <p className='font-medium text-slate-900'>Ni projektov</p>
            <p className='text-sm text-slate-500'>Prvi projekt ustvarite z gumbom »Nov projekt«.</p>
          </div>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Projekt</TableHead><TableHead>Stranka</TableHead><TableHead>Projektni vodja</TableHead><TableHead>Rok</TableHead><TableHead>Cena</TableHead><TableHead>Status</TableHead><TableHead><span className='sr-only'>Podrobnosti</span></TableHead></TableRow></TableHeader>
            <TableBody>{projects.map((project) => (
              <TableRow
                key={project.id_Projekt}
                className='cursor-pointer focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                role='button'
                tabIndex={0}
                onClick={() => navigate(`/projekti/${project.id_Projekt}/detajli`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/projekti/${project.id_Projekt}/detajli`);
                  }
                }}>
                <TableCell><p className='font-medium'>{project.naziv}</p><p className='text-xs text-muted-foreground'>{project.lokacija}</p></TableCell>
                <TableCell>{project.stranka.naziv}</TableCell>
                <TableCell>{project.vodjaProjekta.ime} {project.vodjaProjekta.priimek}</TableCell>
                <TableCell>{new Intl.DateTimeFormat("sl-SI").format(new Date(`${project.datumZakljucka}T00:00:00`))}</TableCell>
                <TableCell>{new Intl.NumberFormat("sl-SI", { style: "currency", currency: "EUR" }).format(project.dogovorjenaCena)}</TableCell>
                <TableCell>
                  <Badge variant='secondary'>
                    {statusLabels[project.status] ?? project.status}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <Button
                    type='button'
                    size='icon-sm'
                    variant='ghost'
                    aria-label={`Hitri pregled projekta ${project.naziv}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedProject(project);
                    }}
                    onKeyDown={(event) => event.stopPropagation()}>
                    <Info />
                  </Button>
                </TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
