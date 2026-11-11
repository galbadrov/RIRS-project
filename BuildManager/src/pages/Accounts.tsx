import { useEffect, useState, type FormEvent } from "react";
import { Check, Copy, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EmployeeRole = "ADMIN" | "PROJECT_MANAGER" | "WORKER";

type Employee = {
  id_Zaposleni: number;
  ime: string;
  priimek: string;
  email: string;
  vloga: EmployeeRole;
  urnaPostavka: number;
  aktiven: boolean;
};

const roleLabels: Record<EmployeeRole, string> = {
  ADMIN: "Administrator",
  PROJECT_MANAGER: "Projektni vodja",
  WORKER: "Delavec",
};

const initialForm = {
  ime: "",
  priimek: "",
  email: "",
  vloga: "WORKER" as EmployeeRole,
  urnaPostavka: "",
  aktiven: true,
};

export default function Accounts() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEmployees() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/employees`,
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
          employees?: Employee[];
          message?: string;
        };

        if (!response.ok || !result.employees) {
          setPageError(result.message ?? "Zaposlenih ni mogoče pridobiti.");
          return;
        }

        setEmployees(result.employees);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setPageError("Povezava s strežnikom ni uspela.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadEmployees();
    return () => controller.abort();
  }, [navigate]);

  function openCreateSheet() {
    setSelectedEmployee(null);
    setForm(initialForm);
    setFormError("");
    setSheetOpen(true);
  }

  function openEditSheet(employee: Employee) {
    setSelectedEmployee(employee);
    setForm({
      ime: employee.ime,
      priimek: employee.priimek,
      email: employee.email,
      vloga: employee.vloga,
      urnaPostavka: String(employee.urnaPostavka),
      aktiven: employee.aktiven,
    });
    setFormError("");
    setSheetOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/employees${selectedEmployee ? `/${selectedEmployee.id_Zaposleni}` : ""}`,
        {
          method: selectedEmployee ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            urnaPostavka: Number(form.urnaPostavka),
          }),
        },
      );
      const result = (await response.json()) as {
        employee?: Employee;
        password?: string;
        message?: string;
      };

      if (
        !response.ok ||
        !result.employee ||
        (!selectedEmployee && !result.password)
      ) {
        setFormError(
          result.message ?? "Zaposlenega trenutno ni mogoče shraniti.",
        );
        return;
      }

      setEmployees((current) =>
        (selectedEmployee
          ? current.map((employee) =>
              employee.id_Zaposleni === result.employee!.id_Zaposleni
                ? result.employee!
                : employee,
            )
          : [...current, result.employee!]
        ).sort((first, second) =>
          `${first.priimek} ${first.ime}`.localeCompare(
            `${second.priimek} ${second.ime}`,
            "sl",
          ),
        ),
      );
      if (!selectedEmployee && result.password) {
        setCredentials({
          email: result.employee.email,
          password: result.password,
        });
      }
      setForm(initialForm);
      setSheetOpen(false);
      setSelectedEmployee(null);
    } catch {
      setFormError("Povezava s strežnikom ni uspela.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyPassword() {
    if (!credentials) return;

    try {
      await navigator.clipboard.writeText(credentials.password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900'>Računi</h1>
          <p className='mt-1 text-sm text-slate-600'>
            Pregled zaposlenih, njihovih vlog in stanja računa.
          </p>
        </div>

        <Button type='button' onClick={openCreateSheet}>
          <Plus />
          Nov zaposleni
        </Button>

        <Sheet
          open={sheetOpen}
          onOpenChange={(open) => {
            setSheetOpen(open);
            if (!open) {
              setFormError("");
              setSelectedEmployee(null);
            }
          }}>
          <SheetContent className='overflow-y-auto sm:max-w-md'>
            <SheetHeader>
              <SheetTitle>
                {selectedEmployee ? "Uredi zaposlenega" : "Nov zaposleni"}
              </SheetTitle>
              <SheetDescription>
                {selectedEmployee
                  ? "Spremenite podatke, vlogo ali stanje računa."
                  : "Ustvarite račun in določite dostop zaposlenega."}
              </SheetDescription>
            </SheetHeader>

            <form className='flex flex-1 flex-col px-4' onSubmit={handleSubmit}>
              <div className='space-y-5'>
                <div className='space-y-2'>
                  <Label htmlFor='ime'>Ime</Label>
                  <Input
                    id='ime'
                    value={form.ime}
                    onChange={(event) =>
                      setForm({ ...form, ime: event.target.value })
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='priimek'>Priimek</Label>
                  <Input
                    id='priimek'
                    value={form.priimek}
                    onChange={(event) =>
                      setForm({ ...form, priimek: event.target.value })
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>E-poštni naslov</Label>
                  <Input
                    id='email'
                    type='email'
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='vloga'>Vloga</Label>
                  <Select
                    value={form.vloga}
                    onValueChange={(value) =>
                      setForm({ ...form, vloga: value as EmployeeRole })
                    }
                    disabled={isSubmitting}>
                    <SelectTrigger id='vloga' className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ADMIN'>Administrator</SelectItem>
                      <SelectItem value='PROJECT_MANAGER'>
                        Projektni vodja
                      </SelectItem>
                      <SelectItem value='WORKER'>Delavec</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='urnaPostavka'>Urna postavka (€)</Label>
                  <Input
                    id='urnaPostavka'
                    type='number'
                    min='0'
                    step='0.01'
                    value={form.urnaPostavka}
                    onChange={(event) =>
                      setForm({ ...form, urnaPostavka: event.target.value })
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <div>
                    <Label htmlFor='aktiven'>Aktiven račun</Label>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      Neaktiven zaposleni se ne more prijaviti.
                    </p>
                  </div>
                  <Switch
                    id='aktiven'
                    checked={form.aktiven}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, aktiven: checked })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                {formError && (
                  <p
                    className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'
                    role='alert'>
                    {formError}
                  </p>
                )}
              </div>

              <SheetFooter className='mt-6 p-0 pb-4'>
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting
                    ? "Shranjevanje ..."
                    : selectedEmployee
                      ? "Shrani spremembe"
                      : "Ustvari zaposlenega"}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className='mt-6 overflow-hidden rounded-xl border bg-white shadow-sm'>
        {isLoading ? (
          <p className='p-6 text-sm text-slate-600'>Nalaganje zaposlenih ...</p>
        ) : pageError ? (
          <p className='p-6 text-sm text-red-700' role='alert'>
            {pageError}
          </p>
        ) : employees.length === 0 ? (
          <div className='grid place-items-center gap-2 p-12 text-center'>
            <Users className='size-8 text-slate-400' />
            <p className='font-medium text-slate-900'>Ni zaposlenih</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zaposleni</TableHead>
                <TableHead>E-pošta</TableHead>
                <TableHead>Vloga</TableHead>
                <TableHead>Urna postavka</TableHead>
                <TableHead>Stanje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow
                  key={employee.id_Zaposleni}
                  className='cursor-pointer focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  role='button'
                  tabIndex={0}
                  onClick={() => openEditSheet(employee)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openEditSheet(employee);
                    }
                  }}>
                  <TableCell className='font-medium'>
                    {employee.ime} {employee.priimek}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{roleLabels[employee.vloga]}</TableCell>
                  <TableCell>{employee.urnaPostavka.toFixed(2)} €/h</TableCell>
                  <TableCell>
                    <Badge
                      variant={employee.aktiven ? "secondary" : "destructive"}>
                      {employee.aktiven ? "Aktiven" : "Neaktiven"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog
        open={credentials !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCredentials(null);
            setCopied(false);
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zaposleni je ustvarjen</DialogTitle>
            <DialogDescription>
              Geslo se prikaže samo zdaj. Varno ga posredujte zaposlenemu.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
            <p className='text-sm text-muted-foreground'>
              {credentials?.email}
            </p>
            <div className='flex items-center gap-2 rounded-lg border bg-muted p-3'>
              <code className='min-w-0 flex-1 break-all font-mono text-sm'>
                {credentials?.password}
              </code>
              <Button
                type='button'
                size='icon'
                variant='outline'
                onClick={() => void copyPassword()}
                aria-label='Kopiraj geslo'>
                {copied ? <Check /> : <Copy />}
              </Button>
            </div>
            {copied && (
              <p className='text-sm text-green-700'>Geslo je kopirano.</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Zapri</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
