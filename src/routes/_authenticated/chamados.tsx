import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TICKET_CATEGORIES,
  formatDateTime,
  slaState,
  validateAttachment,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/tickets";

export const Route = createFileRoute("/_authenticated/chamados")({
  head: () => ({
    meta: [
      { title: "Meus Chamados — Portal de Suporte | AguiarT.I" },
      {
        name: "description",
        content:
          "Abra, acompanhe e responda chamados de suporte técnico da AguiarT.I com controle de SLA e anexos seguros.",
      },
      { property: "og:title", content: "Meus Chamados | AguiarT.I" },
      { property: "og:description", content: "Gestão de chamados com SLA no portal AguiarT.I." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Chamados,
});

type TicketRow = {
  id: string;
  title: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  sla_due_at: string | null;
  resolved_at: string | null;
  created_at: string;
};

function Chamados() {
  const { user, hasAnyRole } = useAuth();
  const staff = hasAnyRole(["tecnico", "admin"]);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(TICKET_CATEGORIES[0]);
  const [priority, setPriority] = useState<TicketPriority>("media");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tickets")
      .select("id, title, category, status, priority, sla_due_at, resolved_at, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error("Não foi possível carregar os chamados", { description: error.message });
    setTickets((data ?? []) as TicketRow[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (title.trim().length < 5 || description.trim().length < 10) {
      toast.error("Preencha um título (5+ caracteres) e uma descrição (10+ caracteres).");
      return;
    }
    if (file) {
      const err = validateAttachment(file);
      if (err) {
        toast.error("Anexo inválido", { description: err });
        return;
      }
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("tickets")
      .insert({
        user_id: user.id,
        title: title.trim().slice(0, 140),
        description: description.trim().slice(0, 5000),
        category,
        priority,
      })
      .select("id")
      .single();

    if (error || !data) {
      setBusy(false);
      toast.error("Não foi possível abrir o chamado", { description: error?.message });
      return;
    }

    if (file) {
      const path = `${data.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
      const up = await supabase.storage
        .from("ticket-attachments")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (up.error) {
        toast.error("Chamado criado, mas o anexo falhou", { description: up.error.message });
      } else {
        await supabase.from("ticket_attachments").insert({
          ticket_id: data.id,
          uploaded_by: user.id,
          storage_path: path,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        });
      }
    }

    setBusy(false);
    setTitle("");
    setDescription("");
    setFile(null);
    toast.success("Chamado aberto com sucesso");
    void load();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-primary">
        {staff ? "Fila de atendimento" : "Meus chamados"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Acompanhe o status e o prazo de SLA de cada atendimento.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <section>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando chamados…</p>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum chamado por aqui ainda.</p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {tickets.map((t) => {
                const sla = slaState(t.sla_due_at, t.resolved_at);
                return (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <Link
                        to="/chamados/$ticketId"
                        params={{ ticketId: t.id }}
                        className="font-medium text-primary hover:underline"
                      >
                        {t.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.category} · aberto em {formatDateTime(t.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{STATUS_LABELS[t.status]}</Badge>
                      <Badge>{PRIORITY_LABELS[t.priority]}</Badge>
                      <span
                        className={
                          sla.tone === "danger"
                            ? "text-xs font-medium text-destructive"
                            : "text-xs text-muted-foreground"
                        }
                      >
                        {sla.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="rounded-xl border border-border p-6 shadow-card">
          <h2 className="font-semibold">Abrir novo chamado</h2>
          <form className="mt-4 space-y-4" onSubmit={handleCreate}>
            <div className="space-y-2">
              <Label htmlFor="t-title">Título</Label>
              <Input
                id="t-title"
                maxLength={140}
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-cat">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="t-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-prio">Urgência</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                <SelectTrigger id="t-prio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_LABELS) as TicketPriority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-desc">Descrição</Label>
              <Textarea
                id="t-desc"
                rows={5}
                maxLength={5000}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-file">Anexo (opcional, até 10 MB)</Label>
              <Input
                id="t-file"
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.csv,.zip"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={busy}>
              Abrir chamado
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
