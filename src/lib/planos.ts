export const HORA_TECNICA = 140;

export type Combo = {
  slug: string;
  nome: string;
  horas: number;
  desconto: number;
  publico: string;
  destaque?: boolean;
  inclui: string[];
  sla: string;
};

export const COMBOS: Combo[] = [
  {
    slug: "avulso",
    nome: "Atendimento avulso",
    horas: 1,
    desconto: 0,
    publico: "Usuário final e autônomos",
    sla: "Resposta em até 24h úteis",
    inclui: [
      "1 hora técnica remota",
      "Diagnóstico e correção pontual",
      "Relatório do atendimento",
    ],
  },
  {
    slug: "essencial",
    nome: "Combo Essencial",
    horas: 5,
    desconto: 0.1,
    publico: "Pequenos comércios",
    sla: "Resposta em até 8h úteis",
    inclui: [
      "5 horas técnicas mensais",
      "Suporte a PDV, ERP e impressora fiscal",
      "Atendimento remoto e por WhatsApp",
      "Portal de chamados com histórico",
    ],
  },
  {
    slug: "avancado",
    nome: "Combo Avançado",
    horas: 12,
    desconto: 0.18,
    publico: "Médias empresas com múltiplos caixas",
    destaque: true,
    sla: "Resposta em até 4h úteis",
    inclui: [
      "12 horas técnicas mensais",
      "Automação comercial e integrações fiscais",
      "Monitoramento de rede e backups",
      "Prioridade na fila de atendimento",
      "Relatórios mensais de SLA",
    ],
  },
  {
    slug: "gestao",
    nome: "Combo Gestão TI",
    horas: 25,
    desconto: 0.25,
    publico: "Grandes empresas e gestores de TI",
    sla: "Resposta em até 2h · plantão crítico",
    inclui: [
      "25 horas técnicas mensais",
      "Técnico dedicado e gestor de conta",
      "Plantão para incidentes críticos",
      "Consultoria de infraestrutura e segurança",
      "Painel de indicadores (TMA, TMR e SLA)",
    ],
  },
];

export function comboPrice(combo: Combo) {
  const bruto = combo.horas * HORA_TECNICA;
  const total = Math.round(bruto * (1 - combo.desconto));
  return { bruto, total, hora: Math.round(total / combo.horas) };
}

export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
