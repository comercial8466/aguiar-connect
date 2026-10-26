<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Aguiar Connect — Diretrizes para Agentes de Desenvolvimento (AI Agents)

Este arquivo define os padrões de arquitetura, regras de negócio e boas práticas para agentes de IA (Antigravity, Cursor, Lovable, Claude) que atuam no desenvolvimento e manutenção do projeto **Aguiar Connect (AguiarT.I)**.

---

## 1. Visão Geral do Projeto

- **Negócio:** Portal institucional e sistema de suporte técnico remoto para **AguiarT.I** (especializada em automação comercial, frente de caixa/PDV, ERP, documentos fiscais e infraestrutura de TI).
- **Contato Oficial WhatsApp:** `+55 51 99666-8646` (`5551996668646`).
- **Público-alvo:** Comércio varejista, pequenas, médias e grandes empresas, operadores de caixa e gestores de TI.

---

## 2. Stack Tecnológica

- **Framework Frontend/Fullstack:** TanStack Start (SSR/Client com `@tanstack/react-router` e `@tanstack/react-query`).
- **Biblioteca UI:** React 19 + Lucide React + Radix UI Primitives + Tailwind CSS v4 (`@tailwindcss/vite`).
- **Estilização:** Paleta de cores em formato `oklch`:
  - Azul Marinho Principal: `#0B3B6F` (`--primary`)
  - Verde Neon Acento: `#00FF7A` (`--accent`)
  - Cinza Grafite: `#2F2F2F` (`--secondary` / `--graphite`)
- **Backend & Autenticação:** Supabase (Auth, PostgreSQL com RLS, Storage para anexos e Realtime).
- **Formulários & Validação:** `react-hook-form` + `zod`.

---

## 3. Estrutura de Diretórios

- `src/components/site` (público) e `src/components/ui` (design system); `src/hooks`; `src/integrations/supabase` (gerado).
- `src/lib`: `agent-knowledge.ts`, `site.ts` (WhatsApp), `tickets.ts` (SLA, anexos), `powerbi-export.ts`.
- `src/routes`: arquivos TanStack; rotas protegidas em `_authenticated/`. Migrações em `supabase/migrations/`.

---

## 4. Regras de Negócio de Suporte & SLA

### Matriz de SLA por Prioridade:
| Prioridade | Tempo Limite (SLA) | Cenários Típicos |
|---|---|---|
| **Crítica** | 2 horas | Frente de caixa/PDV parado, loja travada, perda total de faturamento |
| **Alta** | 4 horas | Falha na emissão fiscal (NFC-e/SAT/SEFAZ), impressora de cupons inoperante, rede do terminal offline |
| **Média** | 8 horas | Dúvidas operacionais no ERP, sincronização de estoque, lentidão geral |
| **Baixa** | 24 horas | Solicitação de treinamento, cotação de novos equipamentos, consultoria |

### Perfis de Usuário (RBAC):
- `cliente`: Consumidor final / operador de caixa que abre chamados para seu equipamento.
- `empresa`: Conta corporativa com múltiplos usuários vinculados e visão agregada.
- `tecnico`: Especialista de suporte que assume tickets, altera status e interage no chat.
- `admin`: Gestor com acesso completo a relatórios, KPIs de SLA e gestão de usuários.

---

## 5. Agente Virtual Inteligente (Aguiar AI Assistant)

O sistema conta com um agente virtual de autoatendimento e triagem localizado em:
- **Lógica e Conhecimento:** [`src/lib/agent-knowledge.ts`](file:///c:/Users/tarci/Downloads/aguiar-connect-main%20%281%29/aguiar-connect-main/src/lib/agent-knowledge.ts)
- **Interface Conversacional:** [`src/components/site/AguiarAgentModal.tsx`](file:///c:/Users/tarci/Downloads/aguiar-connect-main%20%281%29/aguiar-connect-main/src/components/site/AguiarAgentModal.tsx)
- **Disparador Flutuante:** [`src/components/site/WhatsAppFloat.tsx`](file:///c:/Users/tarci/Downloads/aguiar-connect-main%20%281%29/aguiar-connect-main/src/components/site/WhatsAppFloat.tsx)

Ao expandir o agente ou adicionar novos tópicos de suporte, atualize `AGENT_TOPICS` em `agent-knowledge.ts`.

---

## 6. Diretrizes de Código e Segurança

1. **Acessibilidade (WCAG AA):** Sempre inclua atributos `aria-label`, foco visível (`focus-visible:ring-*`) e suporte à navegação por teclado.
2. **Segurança & LGPD:** Validação rigorosa de anexos (MIME type e limite de 10MB definidos em `tickets.ts`). Nunca exponha senhas ou dados sensíveis em logs.
3. **Tailwind v4:** Não crie arquivos `tailwind.config.js` legados; utilize o `@theme inline` em `src/styles.css`.
4. **Sincronização com Lovable:** Mantenha os delimitadores `<!-- LOVABLE:BEGIN -->` intactos no topo deste arquivo.

5. **Testes:** `bun run test` (Vitest). Regras de exportação do Power BI ficam em `src/lib/powerbi-export.ts` para serem testáveis; testes de banco em `tests/db/` rodam em transação com ROLLBACK e são pulados quando a conexão não pode alterar chamados.
