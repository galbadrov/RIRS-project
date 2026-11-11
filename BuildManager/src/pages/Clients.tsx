import { useEffect, useState, type FormEvent } from "react";
import { Building2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Client = {
  id_Stranka: number;
  naziv: string;
  email: string;
  telefonskaStevilka: string | null;
  naslov: string;
  davcnaStevilka: string | null;
};

const initialForm = {
  naziv: "",
  email: "",
  telefonskaStevilka: "",
  naslov: "",
  davcnaStevilka: "",
};

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadClients() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/clients`,
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
          clients?: Client[];
          message?: string;
        };

        if (!response.ok || !result.clients) {
          setPageError(result.message ?? "Strank ni mogoče pridobiti.");
          return;
        }

        setClients(result.clients);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setPageError("Povezava s strežnikom ni uspela.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadClients();
    return () => controller.abort();
  }, [navigate]);

  function openCreateSheet() {
    setForm(initialForm);
    setFormError("");
    setSheetOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/clients`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        },
      );
      const result = (await response.json()) as {
        client?: Client;
        message?: string;
      };

      if (!response.ok || !result.client) {
        setFormError(result.message ?? "Stranke trenutno ni mogoče ustvariti.");
        return;
      }

      setClients((current) =>
        [...current, result.client!].sort((first, second) =>
          first.naziv.localeCompare(second.naziv, "sl"),
        ),
      );
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
          <h1 className='text-2xl font-bold text-slate-900'>Stranke</h1>
          <p className='mt-1 text-sm text-slate-600'>
            Pregled strank in njihovih kontaktnih podatkov.
          </p>
        </div>

        <Button type='button' onClick={openCreateSheet}>
          <Plus />
          Nova stranka
        </Button>

        <Sheet
          open={sheetOpen}
          onOpenChange={(open) => {
            setSheetOpen(open);
            if (!open) setFormError("");
          }}>
          <SheetContent className='overflow-y-auto sm:max-w-md'>
            <SheetHeader>
              <SheetTitle>Nova stranka</SheetTitle>
              <SheetDescription>
                Vnesite osnovne in kontaktne podatke stranke.
              </SheetDescription>
            </SheetHeader>

            <form className='flex flex-1 flex-col px-4' onSubmit={handleSubmit}>
              <div className='space-y-5'>
                <div className='space-y-2'>
                  <Label htmlFor='naziv'>Naziv</Label>
                  <Input
                    id='naziv'
                    value={form.naziv}
                    onChange={(event) =>
                      setForm({ ...form, naziv: event.target.value })
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
                  <Label htmlFor='telefonskaStevilka'>Telefonska številka</Label>
                  <Input
                    id='telefonskaStevilka'
                    type='tel'
                    value={form.telefonskaStevilka}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        telefonskaStevilka: event.target.value,
                      })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='naslov'>Naslov</Label>
                  <Input
                    id='naslov'
                    value={form.naslov}
                    onChange={(event) =>
                      setForm({ ...form, naslov: event.target.value })
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='davcnaStevilka'>Davčna številka</Label>
                  <Input
                    id='davcnaStevilka'
                    value={form.davcnaStevilka}
                    onChange={(event) =>
                      setForm({ ...form, davcnaStevilka: event.target.value })
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
                  {isSubmitting ? "Ustvarjanje ..." : "Ustvari stranko"}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className='mt-6 overflow-hidden rounded-xl border bg-white shadow-sm'>
        {isLoading ? (
          <p className='p-6 text-sm text-slate-600'>Nalaganje strank ...</p>
        ) : pageError ? (
          <p className='p-6 text-sm text-red-700' role='alert'>
            {pageError}
          </p>
        ) : clients.length === 0 ? (
          <div className='grid place-items-center gap-2 p-12 text-center'>
            <Building2 className='size-8 text-slate-400' />
            <p className='font-medium text-slate-900'>Ni strank</p>
            <p className='text-sm text-slate-500'>
              Prvo stranko ustvarite z gumbom »Nova stranka«.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naziv</TableHead>
                <TableHead>E-pošta</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Naslov</TableHead>
                <TableHead>Davčna številka</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id_Stranka}>
                  <TableCell className='font-medium'>{client.naziv}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.telefonskaStevilka || "—"}</TableCell>
                  <TableCell>{client.naslov}</TableCell>
                  <TableCell>{client.davcnaStevilka || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
