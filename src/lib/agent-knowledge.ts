import { TicketPriority, SLA_HOURS, TICKET_CATEGORIES } from "./tickets";

export interface TroubleshootingTopic {
  id: string;
  title: string;
  category: typeof TICKET_CATEGORIES[number];
  defaultPriority: TicketPriority;
  shortDescription: string;
  quickChecks: string[];
  suggestedAction: string;
  keywords: string[];
}

export const AGENT_TOPICS: TroubleshootingTopic[] = [
  {
    id: "pdv-travado",
    title: "PDV / Frente de Caixa Travado",
    category: "PDV / Frente de caixa",
    defaultPriority: "critica",
    shortDescription: "O terminal de venda parou de responder durante a operação.",
    quickChecks: [
      "Verifique se o terminal está conectado à rede local / Wi-Fi.",
      "Tente fechar a aplicação pelo Gerenciador de Tarefas (Ctrl + Shift + Esc) e reiniciar o PDV.",
      "Confirme se a impressora térmica não travou o spooler do Windows.",
      "Reinicie o terminal caso a máquina esteja sem responder a comandos de teclado.",
    ],
    suggestedAction: "Se o caixa estiver parado com fila de clientes, acione o suporte imediato (SLA Crítico: 2h).",
    keywords: ["pdv", "caixa", "frente", "travou", "fechou", "congelou", "venda", "parou", "tela preta"],
  },
  {
    id: "erro-nfce-sefaz",
    title: "Erro de Emissão NFC-e / SAT / NF-e",
    category: "Fiscal (NFC-e, SAT, NF-e)",
    defaultPriority: "alta",
    shortDescription: "Rejeição SEFAZ, SAT sem comunicação ou erro de certificado digital.",
    quickChecks: [
      "Verifique se o Certificado Digital (A1 ou cartão/token A3) está conectado e dentro da validade.",
      "Cheque o portal de disponibilidade da SEFAZ para verificar se o webservice está instável.",
      "No caso de SAT (SP/CE), verifique os LEDs de rede e conexão no aparelho.",
      "Ative a Contingência Offline caso seu sistema suporte emissão temporária para não travar as vendas.",
    ],
    suggestedAction: "Abra um chamado informando o código da rejeição SEFAZ (ex.: 539, 696) ou o erro do SAT.",
    keywords: ["nfce", "nfc-e", "nfe", "nf-e", "sat", "sefaz", "rejeição", "fiscal", "xml", "certificado", "contingência"],
  },
  {
    id: "impressora-nao-imprime",
    title: "Impressora Térmica / Bobina Não Imprime",
    category: "Computador / Impressora",
    defaultPriority: "alta",
    shortDescription: "A impressora de cupons não responde ou parou de cortar a bobina.",
    quickChecks: [
      "Verifique se a bobina térmica está posicionada corretamente (lado correto do papel térmico).",
      "Cheque a tampa da impressora e veja se os LEDs estão verdes (sem indicação de erro ou falta de papel).",
      "Desconecte e reconecte o cabo USB / Serial e reinicie a impressora pelo botão power.",
      "No Windows, acesse 'Dispositivos e Impressoras' e limpe a fila de impressão travada.",
    ],
    suggestedAction: "Nossa equipe pode fazer acesso remoto rápido para reconfigurar a porta COM/Virtual.",
    keywords: ["impressora", "bobina", "cupom", "não imprime", "spooler", "epson", "bematech", "elgin", "daruma", "porta com"],
  },
  {
    id: "rede-terminal-offline",
    title: "Terminal Offline / Sem Conexão de Rede",
    category: "Rede e internet",
    defaultPriority: "alta",
    shortDescription: "Perda de comunicação entre o PDV e o servidor de retaguarda/banco de dados.",
    quickChecks: [
      "Cheque se o cabo de rede está conectado firmemente na traseira do computador e as luzes piscam.",
      "Verifique se outros computadores da loja estão com acesso à internet e ao servidor.",
      "Reinicie o switch ou modem de internet da loja.",
      "Confirme se o IP do servidor não foi alterado acidentalmente.",
    ],
    suggestedAction: "Caso a rede de toda a loja esteja fora, informe para priorização de urgência.",
    keywords: ["rede", "internet", "offline", "sem conexão", "cabo", "wifi", "ip", "servidor", "conexao"],
  },
  {
    id: "erp-backup-retaguarda",
    title: "ERP / Retaguarda & Banco de Dados",
    category: "ERP / Retaguarda",
    defaultPriority: "media",
    shortDescription: "Problemas na sincronização de produtos, estoque, relatórios ou backup.",
    quickChecks: [
      "Confirme se o serviço do banco de dados (PostgreSQL, SQL Server, Firebird) está em execução no servidor.",
      "Verifique se o espaço em disco no servidor não está esgotado.",
      "Certifique-se de que a rotina diária de backup automatizado foi concluída com sucesso.",
    ],
    suggestedAction: "Abra um chamado detalhando o módulo do ERP e anexando uma foto/captura da tela do erro.",
    keywords: ["erp", "retaguarda", "sistema", "estoque", "backup", "banco", "relatorio", "sincronização"],
  },
  {
    id: "consultoria-treinamento",
    title: "Consultoria, Treinamento & Novos Equipamentos",
    category: "Outros",
    defaultPriority: "baixa",
    shortDescription: "Instalação de novos terminais, balanças, leitores ou treinamento de operadores.",
    quickChecks: [
      "Mapeie a quantidade de terminais e modelos dos novos equipamentos a serem configurados.",
      "Agende o melhor horário com nossa equipe técnica para não impactar os horários de pico da loja.",
    ],
    suggestedAction: "Entre em contato para agendamento de implantação ou treinamento de equipe.",
    keywords: ["treinamento", "implantação", "consultoria", "instalação", "balança", "leitor", "novo equipamento", "duvida"],
  },
];

export interface TriageResult {
  category: typeof TICKET_CATEGORIES[number];
  suggestedPriority: TicketPriority;
  slaHours: number;
  matchedTopic?: TroubleshootingTopic;
  troubleshootingSteps: string[];
  summary: string;
}

export function analyzeProblem(text: string): TriageResult {
  const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let bestMatch: TroubleshootingTopic | undefined;
  let highestScore = 0;

  for (const topic of AGENT_TOPICS) {
    let score = 0;
    for (const kw of topic.keywords) {
      const cleanKw = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(cleanKw)) {
        score += 2;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = topic;
    }
  }

  // Verificar urgência explícita no texto
  const isUrgent =
    normalized.includes("urgente") ||
    normalized.includes("parado") ||
    normalized.includes("critico") ||
    normalized.includes("caixa travado") ||
    normalized.includes("loja parada") ||
    normalized.includes("emergencia");

  if (bestMatch && highestScore > 0) {
    const priority: TicketPriority = isUrgent
      ? "critica"
      : bestMatch.defaultPriority;

    return {
      category: bestMatch.category,
      suggestedPriority: priority,
      slaHours: SLA_HOURS[priority],
      matchedTopic: bestMatch,
      troubleshootingSteps: bestMatch.quickChecks,
      summary: `Identifiquei uma questão relacionada a **${bestMatch.title}** (Categoria: *${bestMatch.category}*).`,
    };
  }

  // Fallback geral
  const fallbackPriority: TicketPriority = isUrgent ? "alta" : "media";
  return {
    category: "Outros",
    suggestedPriority: fallbackPriority,
    slaHours: SLA_HOURS[fallbackPriority],
    troubleshootingSteps: [
      "Reinicie o aplicativo e verifique a conectividade de rede do equipamento.",
      "Anote ou tire uma foto de qualquer código ou mensagem de erro que apareça na tela.",
      "Verifique se o problema ocorre em apenas um terminal ou em toda a loja.",
    ],
    summary: "Entendi o seu relato. Vamos fazer a triagem para direcionar ao técnico especialista.",
  };
}

export function buildWhatsAppAgentMessage(data: {
  nome?: string;
  empresa?: string;
  categoria: string;
  prioridade: string;
  descricao: string;
  origem?: string;
}) {
  return [
    "🤖 *AguiarT.I — Triagem via Agente Virtual*",
    `👤 *Cliente:* ${data.nome?.trim() || "Não informado"}`,
    data.empresa?.trim() ? `🏢 *Empresa:* ${data.empresa.trim()}` : null,
    `🏷️ *Categoria:* ${data.categoria}`,
    `⚡ *Prioridade sugerida:* ${data.prioridade.toUpperCase()}`,
    `📝 *Relato / Problema:*`,
    data.descricao.trim(),
    "",
    "ℹ️ _Chamado encaminhado via Assistente Virtual do Portal AguiarT.I._",
  ]
    .filter(Boolean)
    .join("\n");
}
