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

```
aguiar-connect-main/
├── src/
│   ├── assets/              # Logos, ícones e imagens estáticas
│   ├── components/
│   │   ├── site/            # Componentes públicos (Header, Footer, AguiarAgentModal, WhatsAppFloat)
│   │   └── ui/              # Componentes de design system (Button, Badge, Input, Dialog, etc.)
│   ├── hooks/               # Custom hooks (useAuth, use-mobile)
│   ├── integrations/
│   │   └── supabase/        # Cliente Supabase, tipos TypeScript e helpers de autenticação
│   ├── lib/
│   │   ├── agent-knowledge.ts # Base de conhecimento e motor de triagem do Agente Virtual
│   │   ├── site.ts          # Constantes globais do site e link do WhatsApp
│   │   ├── tickets.ts       # Regras de negócio de tickets, matriz de SLA e anexos
│   │   └── utils.ts         # Utilitários de classes Tailwind (cn)
│   ├── routes/              # Rotas baseadas em arquivo TanStack Router
│   │   ├── _authenticated/  # Rotas protegidas (painel, chamados, admin)
│   │   ├── __root.tsx       # Layout raiz da aplicação
│   │   ├── abrir-chamado.tsx
│   │   ├── auth.tsx
│   │   └── index.tsx
│   ├── styles.css           # Configurações de tema Tailwind v4 (@theme inline)
├── supabase/
│   ├── migrations/          # Migrações SQL e políticas de RLS
└── AGENTS.md                # Este documento de referência
```

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
