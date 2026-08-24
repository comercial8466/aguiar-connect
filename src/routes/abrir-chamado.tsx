import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
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
import { whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/abrir-chamado")({
  head: () => ({
    meta: [
      { title: "Abrir Chamado — Suporte Técnico | AguiarT.I" },
      {
        name: "description",
        content:
          "Abra um chamado de suporte técnico da AguiarT.I informando categoria, urgência e descrição do problema.",
      },
      { property: "og:title", content: "Abrir Chamado | AguiarT.I" },
      {
        property: "og:description",
        content: "Registre seu chamado e receba atendimento remoto dentro do SLA contratado.",
      },
    ],
  }),
  component: AbrirChamado;
});

const categorias = ["PDV / Frente de caixa", "ERP / Retaguarda", "Fiscal (NFC-e, SAT, NF-e)", "Rede e internet", "Computador / Impressora", "Outros"];
const urgencias = ["Baixa", "Média", "Alta", "Crítica"];

function AbrirChamado() {
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [categoria, setCategoria] = useState(categorias[0]);
  const [urgencia, setUrgencia] = useState(urgencias[1]);
  const [descricao, setDescricao] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = [
      "*Novo chamado — AguiarT.I*",
      `Nome: ${nome}`,
      empresa ? `Empresa: ${empresa}` : null,
      `E-mail: ${email}`,
      `Categoria: ${categoria}`,
      `Urgência: ${urgencia}`,
      `Descrição: ${descricao}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <PageHero
        title="Abrir chamado"
        subtitle="Preencha os dados abaixo. Seu chamado é encaminhado imediatamente à nossa mesa de suporte."
      />
      <div className="mx-auto max-w-2xl px-4 py-16">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa (opcional)</Label>
              <Input id="empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger id="categoria">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgencia">Urgência</Label>
              <Select value={urgencia} onValueChange={setUrgencia}>
                <SelectTrigger id="urgencia">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {urgencias.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descreva o problema *</Label>
            <Textarea
              id="descricao"
              required
              rows={6}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Inclua mensagens de erro, equipamento envolvido e desde quando ocorre."
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Ao enviar, você concorda com o tratamento dos seus dados conforme nossa Política de
            Privacidade (LGPD) e autoriza contato por WhatsApp e e-mail sobre este chamado.
          </p>

          <Button type="submit" variant="hero" size="lg" className="w-full">
            <MessageCircle aria-hidden="true" /> Enviar chamado pelo WhatsApp
          </Button>
        </form>
      </div>
    </>
  );
}
