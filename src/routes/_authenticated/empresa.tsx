import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, MailPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABELS, useAuth, type AppRole } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { PRIORITY_LABELS, formatDateTime, type TicketPriority } from "@/lib/tickets";

export const Route = createFileRoute("/_authenticated/empresa")({
  head: () => ({
    meta: [
      { title: "Área da Empresa — Usuários e SLA por Contrato | AguiarT.I" },
      {
        name: "description",
        content:
          "Gerencie os usuários da sua empresa e acompanhe o SLA contratado com a AguiarT.I em um só lugar.",
      },
      { property: "og:title", content: "Área da Empresa | AguiarT.I" },
      {
        property: "og:description",
        content: "Cadastro de usuários da empresa e gestão de SLA por contrato.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AreaEmpresa,
});

type Contract = {
  id: string;
  company: string;
  plan_name: string;
  critica_hours: number;
  alta_hours: number;
  media_hours: number;
  baixa_hours: number;
  contract_start: string | null;
  contract_end: string | null;
  notes: string | null;
};

type Invite = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  status: string;
  created_at: string;
};

type Member = { id: string; full_name: string | null; company: string | null };

const PRIORITY_FIELDS: Array<{ key: keyof Contract; priority: TicketPriority }> = [
  { key: "critica_hours", priority: "critica" },
  { key: "alta_hours", priority: "alta" },
  { key: "media_hours", priority: "media" },
  { key: "baixa_hours", priority: "baixa" },
];

function AreaEmpresa() {
  const { user, hasAnyRole, hasRole } = useAuth();
  const allowed = hasAnyRole(["empresa", "admin"]);
  const isAdmin = hasRole("admin");

  const [company, setCompany] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [draft, setDraft] = useState<Partial<Contract>>({});
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("cliente");

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const profile = await supabase
      .from("profiles")
      .select("company")
      .eq("id", user.id)
      .maybeSingle();
    const comp = profile.data?.company?.trim() || null;
    setCompany(comp);

    if (comp) {
      const [c, m, i] = await Promise.all([
        supabase.from("company_sla_contracts").select("*").eq("company", comp).maybeSingle(),
        supabase.from("profiles").select("id, full_name, company").eq("company", comp),
        supabase
          .from("company_invites")
          .select("id, email, full_name, role, status, created_at")
          .eq("company", comp)
          .order("created_at", { ascending: false }),
      ]);
      setContract((c.data as Contract) ?? null);
      setDraft((c.data as Contract) ?? {});
      setMembers((m.data ?? []) as Member[]);
      setInvites((i.data ?? []) as Invite[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (allowed && user?.id) void load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, user?.id]);

  const sendInvite = async () => {
    if (!company) return;
    if (!name.trim() || !email.trim()) {
      toast.error("Informe nome e e-mail do usuário");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("company_invites").insert({
      company,
      email: email.trim().toLowerCase(),
      full_name: name.trim(),
      role,
      invited_by: user?.id as string,
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível cadastrar o usuário", { description: error.message });
      return;
    }
    toast.success("Usuário cadastrado", {
      description: `Peça a ${name.trim()} para criar a conta no portal com o e-mail ${email.trim()}.`,
    });
    setName("");
    setEmail("");
    setRole("cliente");
    void load();
  };

  const updateInvite = async (id: string, status: string) => {
    const { error } = await supabase.from("company_invites").update({ status }).eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar", { description: error.message });
      return;
    }
    void load();
  };

  const saveContract = async () => {
    if (!company) return;
    setSaving(true);
    const payload = {
      company,
      plan_name: draft.plan_name ?? "Padrão",
      critica_hours: Number(draft.critica_hours ?? 2),
      alta_hours: Number(draft.alta_hours ?? 4),
      media_hours: Number(draft.media_hours ?? 8),
      baixa_hours: Number(draft.baixa_hours ?? 24),
      contract_start: draft.contract_start || null,
      contract_end: draft.contract_end || null,
      notes: draft.notes || null,
    };
    const { error } = await supabase
      .from("company_sla_contracts")
      .upsert(payload, { onConflict: "company" });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar o contrato", { description: error.message });
      return;
    }
    toast.success("Contrato de SLA atualizado");
    void load();
  };

  const activeMembers = useMemo(() => members.length, [members]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-2xl font-bold text-primary">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta área é exclusiva para contas Empresa e Gestores.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-primary">Área da empresa</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {company ? (
          <>
            Empresa vinculada: <strong>{company}</strong> · {activeMembers} usuário(s) no portal
          </>
        ) : (
          "Sua conta ainda não tem empresa vinculada. Informe a empresa no seu perfil para liberar esta área."
        )}
      </p>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Carregando…</p>
      ) : !company ? null : (
        <>
          <section className="mt-10 rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center gap-2">
              <MailPlus className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-display text-xl font-semibold text-primary">
                Cadastrar usuário da empresa
              </h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="inv-nome">Nome</Label>
                <Input
                  id="inv-nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maria Souza"
                />
              </div>
              <div>
                <Label htmlFor="inv-email">E-mail</Label>
                <Input
                  id="inv-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria@empresa.com.br"
                />
              </div>
              <div>
                <Label htmlFor="inv-papel">Perfil</Label>
                <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                  <SelectTrigger id="inv-papel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">{ROLE_LABELS.cliente}</SelectItem>
                    <SelectItem value="empresa">{ROLE_LABELS.empresa}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="hero" className="mt-4" disabled={saving} onClick={() => void sendInvite()}>
              Cadastrar usuário
            </Button>

            <ul className="mt-6 divide-y divide-border">
              {invites.length === 0 && (
                <li className="py-3 text-sm text-muted-foreground">Nenhum usuário cadastrado ainda.</li>
              )}
              {invites.map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium">{inv.full_name ?? inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.email} · {ROLE_LABELS[inv.role]} · {formatDateTime(inv.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={inv.status === "aceito" ? "default" : "secondary"}>
                      {inv.status}
                    </Badge>
                    {inv.status === "pendente" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void updateInvite(inv.id, "cancelado")}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-display text-xl font-semibold text-primary">
                Usuários ativos no portal
              </h2>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {members.length === 0 && (
                <li className="py-3 text-sm text-muted-foreground">Nenhum usuário ativo.</li>
              )}
              {members.map((m) => (
                <li key={m.id} className="py-3 text-sm">
                  {m.full_name ?? "Sem nome"}
                  {m.id === user?.id && (
                    <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-display text-xl font-semibold text-primary">SLA do contrato</h2>
            </div>
            {!isAdmin && (
              <p className="mt-2 text-xs text-muted-foreground">
                Somente a AguiarT.I altera os prazos contratados. Fale com seu gestor de conta para
                revisar o plano.
              </p>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="plan">Plano</Label>
                <Input
                  id="plan"
                  disabled={!isAdmin}
                  value={draft.plan_name ?? ""}
                  placeholder="Padrão"
                  onChange={(e) => setDraft({ ...draft, plan_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ini">Início</Label>
                  <Input
                    id="ini"
                    type="date"
                    disabled={!isAdmin}
                    value={draft.contract_start ?? ""}
                    onChange={(e) => setDraft({ ...draft, contract_start: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fim">Término</Label>
                  <Input
                    id="fim"
                    type="date"
                    disabled={!isAdmin}
                    value={draft.contract_end ?? ""}
                    onChange={(e) => setDraft({ ...draft, contract_end: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              {PRIORITY_FIELDS.map((f) => (
                <div key={f.priority}>
                  <Label htmlFor={`sla-${f.priority}`}>{PRIORITY_LABELS[f.priority]} (h)</Label>
                  <Input
                    id={`sla-${f.priority}`}
                    type="number"
                    min={1}
                    disabled={!isAdmin}
                    value={String(draft[f.key] ?? "")}
                    onChange={(e) => setDraft({ ...draft, [f.key]: Number(e.target.value) })}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Label htmlFor="notas">Observações do contrato</Label>
              <Textarea
                id="notas"
                disabled={!isAdmin}
                value={draft.notes ?? ""}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </div>

            {isAdmin && (
              <Button
                variant="hero"
                className="mt-4"
                disabled={saving}
                onClick={() => void saveContract()}
              >
                {contract ? "Salvar contrato" : "Criar contrato"}
              </Button>
            )}
          </section>
        </>
      )}
    </div>
  );
}
