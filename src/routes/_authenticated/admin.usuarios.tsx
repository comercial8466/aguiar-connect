import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, ROLE_LABELS, type AppRole } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  head: () => ({
    meta: [
      { title: "Gestão de Usuários e Papéis | AguiarT.I" },
      {
        name: "description",
        content:
          "Promova ou rebaixe usuários entre Cliente, Empresa, Técnico e Gestor/Admin no portal AguiarT.I.",
      },
      { property: "og:title", content: "Gestão de Usuários | AguiarT.I" },
      { property: "og:description", content: "Controle de papéis do portal de suporte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminUsuarios,
});

const ROLES: AppRole[] = ["cliente", "empresa", "tecnico", "admin"];

type Row = { id: string; full_name: string | null; company: string | null; roles: AppRole[] };

function AdminUsuarios() {
  const { hasRole, user } = useAuth();
  const isAdmin = hasRole("admin");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    const [p, r] = await Promise.all([
      supabase.from("profiles").select("id, full_name, company"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (p.error) toast.error("Falha ao carregar perfis", { description: p.error.message });
    const roleMap = new Map<string, AppRole[]>();
    for (const item of r.data ?? []) {
      const list = roleMap.get(item.user_id) ?? [];
      list.push(item.role as AppRole);
      roleMap.set(item.user_id, list);
    }
    setRows(
      (p.data ?? []).map((profile) => ({
        id: profile.id,
        full_name: profile.full_name,
        company: profile.company,
        roles: roleMap.get(profile.id) ?? [],
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) void load();
    else setLoading(false);
  }, [isAdmin]);

  const setRole = async (userId: string, role: AppRole) => {
    const del = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (del.error) {
      toast.error("Falha ao atualizar papel", { description: del.error.message });
      return;
    }
    const ins = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (ins.error) {
      toast.error("Falha ao atribuir papel", { description: ins.error.message });
      return;
    }
    toast.success(`Papel atualizado para ${ROLE_LABELS[role]}`);
    void load();
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-2xl font-bold text-primary">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Somente Gestores/Admins podem gerenciar papéis de usuários.
        </p>
      </div>
    );
  }

  const filtered = rows.filter((r) =>
    `${r.full_name ?? ""} ${r.company ?? ""}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-primary">Usuários e papéis</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Promova ou rebaixe contas entre Cliente, Empresa, Técnico e Gestor/Admin. Toda alteração é
        registrada na auditoria.
      </p>

      <Input
        className="mt-6 max-w-sm"
        placeholder="Buscar por nome ou empresa"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
          {filtered.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-medium">
                  {row.full_name ?? "Sem nome"}
                  {row.id === user?.id && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
                </p>
                <p className="text-xs text-muted-foreground">{row.company ?? "—"}</p>
                <div className="mt-1 flex gap-1">
                  {row.roles.map((r) => (
                    <Badge key={r} variant="secondary">
                      {ROLE_LABELS[r]}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={row.roles[0] ?? ""} onValueChange={(v) => setRole(row.id, v as AppRole)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Definir papel" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-4 text-sm text-muted-foreground">Nenhum usuário encontrado.</li>
          )}
        </ul>
      )}

      <Button variant="outline" className="mt-6" onClick={() => void load()}>
        Atualizar lista
      </Button>
    </div>
  );
}
