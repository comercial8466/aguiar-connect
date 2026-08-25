# Aguiar Connect

— AguiarT.I (automação comercial e suporte técnico remoto)

Visão geral

Projeto: Site institucional + portal de suporte para AguiarT.I.

Público‑alvo: usuários finais/consumidores, pequenas e médias e grandes empresas, gestores de TI.

Objetivo: apresentar serviços de automação comercial e oferecer suporte técnico remoto com abertura de chamados, acompanhamento via dashboard com níveis de atendimento (SLA), e integração com WhatsApp +55 51 99666‑8646.

Requisitos de conteúdo e páginas

Home

Cabeçalho com logo, menu, CTA (Solicitar Suporte / Abrir Chamado), número WhatsApp clicável.

Hero com proposta de valor: automação comercial e suporte remoto.

Blocos: serviços principais, diferenciais (atendimento remoto, SLA, experiência), depoimentos, certificados/Clientes.

Serviços

Páginas detalhadas: Automação Comercial (PDV, ERP, integração fiscal), Suporte Técnico Remoto, Consultoria e Treinamento.

Portal de Suporte (login)

Painel para Usuário Comum (consumidor) e Conta Corporativa (empresa).

Funcionalidade para abrir chamado, visualizar histórico, chat com técnico, anexar arquivos, priorizar.

Dashboard de Atendimento (para clientes e para equipe interna)

Cliente: visão de chamados em aberto, status, tempo estimado de resolução, SLA aplicável.

Equipe interna/gestores: visão com filtros (status, prioridade, cliente, técnico), KPIs e níveis de atendimento (SLA).

Página Sobre / Time / Contato / FAQ / Blog / Política de Privacidade (LGPD) / Termos.

Footer com contatos, endereço, integração WhatsApp, links legais e redes sociais.

Fluxo do Portal de Suporte

Registro/Autenticação: e‑mail + senha, opção OAuth (Google), verificação por e‑mail.

Níveis de usuário: Cliente Final, Empresa (conta corporativa com múltiplos usuários), Técnico, Gestor/Admin.

Abertura de chamado: categoria, urgência (baixo/médio/alto/critico), descrição, anexos.

SLA: regras por tipo de cliente/contrato (ex.: resposta inicial 2h, resolução 48h), cálculo automático de tempo restante e escalonamento.

Notificações: e‑mail + push web + WhatsApp (quando aplicável) para atualizações de status, atribuições e encerramento.

Chat em tempo real: integração com sistema de tickets, gravação de histórico.

SLA Dashboard (para gestores): número de chamados por SLA (em risco, violado), tempo médio de resposta/solução, tempo por técnico, satisfação pós‑atendimento (NPS/CSAT).

Integração WhatsApp (+55 51 99666‑8646)

Objetivo: permitir contato rápido do site para o número via click‑to‑chat e enviar notificações automatizadas de tickets.

Implementação recomendada: WhatsApp Business API (via Meta) ou provedor aprovado (ex.: Twilio, Zenvia, Take Blip).

Funcionalidades:

Bot de triagem (opcional): coletar nome, e‑mail, tipo de problema e gerar ticket automaticamente com confirmação por WhatsApp.

Notificações transacionais: número do chamado, mudanças de status, lembretes SLA, solicitação de feedback.

Link click‑to‑chat no site (wa.me/5551996668646) + botão flutuante.

Template de mensagens aprovadas para notificações (conformes com regras do WhatsApp Business).

Registro de conversas no ticket correspondente no portal.

Requisitos de segurança e privacidade para mensagens (LGPD).

Requisitos técnicos

Frontend: React (Next.js) ou equivalente SSR para SEO; responsivo (mobile first).

Backend: Node.js (Express/Nest) ou Python (Django/FastAPI) com API REST/GraphQL.

Banco de dados: PostgreSQL (tickets, usuários, SLAs), Redis (fila / cache, sessões).

Mensageria: RabbitMQ / AWS SQS para filas de notificação e jobs.

Autenticação: JWT + refresh tokens, roles/permissions.

Integrações: WhatsApp Business API (provedor), SMTP (e‑mail), serviço de storage para anexos (S3 compatível).

Telemetria: logs centralizados, Sentry para erros, analytics (Google Analytics / Matomo).

Deploy: containerização (Docker), CI/CD (GitHub Actions/GitLab CI), cloud (AWS/GCP/DigitalOcean).

Escalabilidade: considerar microserviços para módulo de tickets e notificações.

Segurança: HTTPS, OWASP, XSS/CSRF proteção, backup diário, criptografia para dados sensíveis.

UX/UI e acessibilidade

Design profissional, limpo, identidade visual compatível com logo AguiarT.I.

Componentes reutilizáveis e sistema de design.

Acessibilidade (WCAG AA), contraste, navegação por teclado.

Botão WhatsApp flutuante visível em mobile/desktop.

Métricas e KPIs

Tempo médio de primeira resposta, tempo médio de resolução, % SLA cumprido, volume de tickets, CSAT/NPS, taxa de reabertura.

Requisitos legais e conformidade

Política de Privacidade compatível com LGPD (tratamento de dados e armazenamento de mensagens).

Consentimento para envio de mensagens via WhatsApp.

Armazenamento de logs por período definido (ex.: 6 meses / conforme contrato).

Entregáveis

Wireframes (desktop + mobile) e protótipos navegáveis (Figma).

Design final (UI kit, assets, ícones) e especificações CSS.

API spec (OpenAPI/Swagger), documentação de endpoints.

Implementação frontend + backend + infra (ambiente de staging e produção).

Integração funcional com WhatsApp e documentação de templates aprovados.

Testes: unitários, integração, testes de carga básicos (simular X tickets/segundo).

Manual de operação e guia para suporte (como criar templates WhatsApp, escalonamento SLA).

Deploy automatizado e instruções de rollback.

Critérios de aceite

Fluxo de abertura de chamado funcionando e salvo na base.

Notificação por WhatsApp acionada conforme workflow (com templates aprovados).

Dashboard apresenta KPIs em tempo real e filtros básicos.

Autenticação, roles e permissões funcionando.

Responsividade e conformidade básica com WCAG AA.

Documentação entregue (Figma, OpenAPI, README), deploy em ambiente de produção funcional.

Sugestão de roadmap (mínimo viável)

Semana 1–2: discovery, wireframes e definição de SLA/fluxos.

Semana 3–5: design UI e protótipos.

Semana 6–10: desenvolvimento backend + frontend do portal de tickets básico + integração click‑to‑chat WhatsApp.

Semana 11–13: dashboard SLA, notificações automatizadas WhatsApp, testes e ajustes.

Semana 14: deploy, documentação e handover.

Observações técnicas para o número WhatsApp

Formato internacional: 5551996668646 (já pronto para wa.me/5551996668646).

Para uso em escala (templates e envio automático) é necessária conta WhatsApp Business API aprovada pelo Meta e um provider ou número hospedado; prever verificação de número e aprovação de template antes de envio de notificações.

seguem modelos de templates prontos para submissão ao WhatsApp Business (formatados com nome do template, categoria, idioma, componente de mensagem e texto com placeholders). Use os nomes como sugestão única por conta do provedor; ajuste se necessário.

Nome: ticket_confirmation_pt_br

Categoria: TRANSACTIONAL

Idioma: pt_BR

Componentes:

Header: none

Body: Olá {{1}}, seu chamado #{{2}} foi recebido pela AguiarT.I. Categoria: {{3}} Prioridade: {{4}} Em breve nossa equipe fará o primeiro contato. Mais informações: {{5}}

Footer: Obrigado por escolher a AguiarT.I.

Placeholder explicação:

{{1}} = Nome do cliente

{{2}} = ID do chamado

{{3}} = Categoria (ex.: PDV, ERP, Rede)

{{4}} = Prioridade (Baixa/Média/Alta/Crítica)

{{5}} = Link para visualização do chamado (ou prazo estimado)

Nome: ticket_status_update_pt_br

Categoria: TRANSACTIONAL

Idioma: pt_BR

Componentes:

Header: none

Body: Olá {{1}}, atualização sobre o chamado #{{2}}: {{3}}. Técnico responsável: {{4}} Observação: {{5}} Visualize detalhes: {{6}}

Footer: AguiarT.I — suporte técnico remoto.

Placeholder explicação:

{{1}} = Nome do cliente

{{2}} = ID do chamado

{{3}} = Novo status (ex.: Em atendimento, Aguardando peça, Resolvido)

{{4}} = Nome do técnico

{{5}} = Mensagem curta do técnico

{{6}} = Link para o ticket

Nome: ticket_assigned_pt_br

Categoria: TRANSACTIONAL

Idioma: pt_BR

Componentes:

Header: none

Body: Olá {{1}}, o chamado #{{2}} foi atribuído ao técnico {{3}}. Prazo estimado para primeiro contato: {{4}} Se precisar, responda esta mensagem ou acesse: {{5}}

Footer: Equipe AguiarT.I

Placeholder explicação:

{{1}} = Nome do cliente

{{2}} = ID do chamado

{{3}} = Nome do técnico

{{4}} = Prazo estimado (ex.: 2 horas)

{{5}} = Link do ticket

Nome: ticket_sla_reminder_pt_br

Categoria: TRANSACTIONAL

Idioma: pt_BR

Componentes:

Header: none

Body: Atenção {{1}}, o chamado #{{2}} está com SLA em risco — tempo restante: {{3}}. Recomendamos enviar informações adicionais para acelerar a resolução. Ver chamado: {{4}}

Footer: AguiarT.I — suporte

Placeholder explicação:

{{1}} = Nome do cliente

{{2}} = ID do chamado

{{3}} = Tempo restante (ex.: 1h30)

{{4}} = Link do ticket

Nome: ticket_resolved_pt_br

Categoria: TRANSACTIONAL

Idioma: pt_BR

Componentes:

Header: none

Body: Olá {{1}}, o chamado #{{2}} foi marcado como Resolvido. Resumo da solução: {{3}} Se o problema persistir, reabra o chamado ou responda aqui. Visualize: {{4}}

Footer: Obrigado — AguiarT.I

Placeholder explicação:

{{1}} = Nome do cliente

{{2}} = ID do chamado

{{3}} = Texto curto com resumo da ação

{{4}} = Link para feedback/reabertura

Nome: ticket_feedback_request_pt_br

Categoria: MARKETING (pode também ser TRANSACTIONAL, verificar política do provedor)

Idioma: pt_BR

Componentes:

Header: none

Body: Olá {{1}}, tudo certo com o chamado #{{2}}? Por favor avalie nosso atendimento: 1- ótimo 2- bom 3- regular 4- ruim Responda com o número correspondente ou clique: {{3}}

Footer: Sua opinião nos ajuda a melhorar.

Placeholder explicação:

{{1}} = Nome do cliente

{{2}} = ID do chamado

{{3}} = Link direto para formulário de feedback (ou botão com resposta rápida implementada)

Observações importantes para submissão

Mensagens com variáveis devem usar placeholders numerados ({{1}}, {{2}}, ...).

Se usar header com mídia (imagem/documento), declare o tipo no cadastro do template conforme a API do provedor.

Para notificações transacionais, prefira categoria TRANSACTIONAL ou ACCOUNT_UPDATE; verifique as políticas do provedor (Meta/Business API).

Templates com opções rápidas (quick reply) ou botões exigem componentes de botão separados no cadastro (se desejar, eu gero exemplos com botões).

Garanta que os textos estejam conformes com LGPD e que haja consentimento do usuário para receber mensagens.

Prompt para Claude IA: Crie um site corporativo moderno e responsivo para a empresa "AguiarT.I" (Automação Comercial e Suporte Técnico). Objetivo: transmitir confiança, tecnologia e agilidade para usuários domésticos e empresas, com foco em conversão para abertura de chamados e acesso ao Dashboard de atendimento. Tom: técnico porém acessível (claro, direto, profissional).

Identidade visual e estilo

Paleta de cores: Azul Marinho (#0B3B6F), Cinza Grafite (#2F2F2F), detalhes em Verde Neon (#00FF7A) e Branco (#FFFFFF).

Tipografia: sans-serif moderna (ex.: Inter, Poppins). Títulos fortes, corpo legível.

Estilo: clean, layout tipo SaaS, bastante espaçamento, ícones lineares, botões com cantos levemente arredondados e efeitos hover sutis.

Estrutura / páginas e seções A. Home (Landing Principal)

Header fixo: logo à esquerda, menu (Serviços, Portal do Cliente, Preços, Sobre, Blog, Contato) e botão “Abrir Chamado Agora” destacado.

Hero: título: “AguiarT.I: Tecnologia que impulsiona o seu negócio”. Subtítulo: “Especialistas em Automação Comercial e Suporte Técnico Remoto com gestão por Dashboard”. CTA primário: “Abrir Chamado Agora” (cor Verde Neon) e CTA secundário: “Fale pelo WhatsApp”.

Imagem/ilustração à direita: mockup de dashboard + atendimento remoto (estilo flat/3D mínimo).

Trust bar: logos de clientes/selos ou texto “Atendimento 24/7 · SLA garantido · +X clientes atendidos”.

B. Seção Serviços (cards)

Título: “Nossos Serviços”

Cards (3 colunas em desktop, empilhamento mobile):

Automação Comercial — descrição curta: “PDV, impressoras fiscais, balanças, integração de sistemas de vendas.” Ícone: caixa registradora/PDV.

Suporte Técnico Remoto — “Atendimento ágil para usuários e empresas, diagnóstico remoto, suporte por ticket.” Ícone: headset/teclado.

Gestão de Infraestrutura — “Redes, servidores, backup e monitoramento.” Ícone: servidor/rede.

Cada card com CTA “Saiba Mais” levando à página de serviço detalhada.

C. Diferenciais / Portal do Cliente (chave)

Título: “Portal do Cliente — Acompanhe seus atendimentos em tempo real”

Texto explicativo: sistema de abertura de chamados com Dashboard integrado, visualização de SLA, prioridade, status, histórico e relatórios.

Lista de funcionalidades do Dashboard: criação/atualização de chamados, tags, SLA por tipo de atendimento, nível do atendimento (N1/N2/N3), tempo médio de resolução, gráficos de desempenho, exportação de relatórios, notificações por e-mail/WhatsApp.

Mockups do Dashboard em 3 cartões (Visão geral, Gráficos SLA, Lista de Chamados).

CTA: “Acessar Portal / Abrir Chamado”.

D. Integração WhatsApp

Texto: “Fale conosco pelo WhatsApp”. Incluir botão flutuante no canto inferior direito vinculado ao numero 5551996668646

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e0dae372-607e-481b-b5aa-092d3b116d31).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
