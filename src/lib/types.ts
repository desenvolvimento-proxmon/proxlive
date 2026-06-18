export const WEEK_DAYS = [
  "Segunda-feira",
  "Terca-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sabado",
  "Domingo"
] as const;

export const LEVELS = ["iniciante", "intermediario", "avancado"] as const;

export const PREFERENCES = [
  "teoria",
  "exercicios",
  "revisao",
  "simulados",
  "equilibrado"
] as const;

export type Level = (typeof LEVELS)[number];
export type Preference = (typeof PREFERENCES)[number];

export type AppUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type StudySession = {
  subject: string;
  topic?: string;
  duration: string;
  activityType: string;
  description: string;
  studyRecommendation?: string;
  recommendedVideos?: string[];
  recommendedBooks?: string[];
  quiz?: string[];
};

export type DatedStudySession = StudySession & {
  calendarDate: string;
  calendarDay: string;
  sessionKey: string;
  sequence: number;
  phase: string;
};

export type WeeklyScheduleDay = {
  day: string;
  sessions: StudySession[];
};

export type DatedStudyDay = {
  date: string;
  day: string;
  label: string;
  phase: string;
  sessions: DatedStudySession[];
};

export type AiStudyPlan = {
  summary: string;
  workloadAnalysis: string;
  weeklySchedule: WeeklyScheduleDay[];
  priorities: string[];
  reviewStrategy: string;
  simulationStrategy: string;
  recommendedVideos?: string[];
  recommendedBooks?: string[];
  recommendations: string[];
  warnings: string[];
};

export type StudyPlanFormValues = {
  objective: string;
  deadline: string;
  subjects: string;
  level: Level;
  availableDays: string[];
  hoursPerDay: number;
  preference: Preference;
  notes: string;
};

export type SerializedStudyPlan = {
  id: string;
  userId: string;
  objective: string;
  deadline: string;
  subjects: string[];
  availableDays: string[];
  hoursPerDay: number;
  level: string;
  preference: string;
  aiResponse: AiStudyPlan;
  completedSessions: string[];
  progressPercent: number;
  totalSessions: number;
  completedSessionsCount: number;
  createdAt: string;
};

export type PlanQuestion = {
  id: string;
  userId: string;
  studyPlanId: string;
  question: string;
  answer: string;
  createdAt: string;
};

export function splitSubjects(subjects: string): string[] {
  return subjects
    .split(/[,;\n]/)
    .map((subject) => subject.trim())
    .filter(Boolean);
}

export function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function parseAiStudyPlan(value: string): AiStudyPlan {
  return JSON.parse(value) as AiStudyPlan;
}

export function calculatePlanMetrics(input: {
  deadline: string;
  subjects: string[] | string;
  availableDays: string[];
  hoursPerDay: number;
}) {
  const subjects =
    typeof input.subjects === "string" ? splitSubjects(input.subjects) : input.subjects;
  const totalWeeklyHours = Number((input.availableDays.length * input.hoursPerDay).toFixed(1));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(`${input.deadline.slice(0, 10)}T00:00:00`);
  const daysUntilDeadline = Math.max(
    0,
    Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  let intensity = "Leve";
  if (totalWeeklyHours >= 20) {
    intensity = "Intensa";
  } else if (totalWeeklyHours >= 12) {
    intensity = "Forte";
  } else if (totalWeeklyHours >= 6) {
    intensity = "Moderada";
  }

  return {
    totalWeeklyHours,
    subjectCount: subjects.length,
    availableDaysCount: input.availableDays.length,
    daysUntilDeadline,
    intensity
  };
}

export function getSessionKey(dayIndex: number, sessionIndex: number) {
  return `${dayIndex}:${sessionIndex}`;
}

export function getDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

export function getWeekdayName(date: Date) {
  const weekdays = [
    "Domingo",
    "Segunda-feira",
    "Terca-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sabado"
  ];

  return weekdays[date.getDay()] ?? "Dia";
}

export function buildDatedStudyCalendar(
  plan: AiStudyPlan,
  deadline: string,
  availableDays: string[],
  createdAt?: string,
  subjectsInput?: string[] | string,
  objective?: string
): DatedStudyDay[] {
  const startDate = parseLocalDate(createdAt);
  const deadlineDate = parseLocalDate(deadline);

  if (!deadlineDate || !startDate || deadlineDate.getTime() < startDate.getTime()) {
    return [];
  }

  const validDays = new Set(
    (availableDays.length ? availableDays : plan.weeklySchedule.map((day) => day.day)).map(normalizeDay)
  );
  const studyDates: Date[] = [];

  for (
    let current = new Date(startDate);
    current.getTime() <= deadlineDate.getTime();
    current.setDate(current.getDate() + 1)
  ) {
    if (validDays.has(normalizeDay(getWeekdayName(current)))) {
      studyDates.push(new Date(current));
    }
  }

  const subjects = getPlanSubjects(subjectsInput, plan);
  const fallbackSessions = subjects.slice(0, Math.max(1, Math.min(2, subjects.length))).map((subject) =>
    createFallbackSession(subject)
  );
  const templateDays = plan.weeklySchedule.filter((day) => day.sessions.length > 0);
  const studyDayTemplates =
    templateDays.length > 0
      ? templateDays
      : [
          {
            day: "Plano",
            sessions: fallbackSessions
          }
        ];

  if (studyDates.length === 0 || studyDayTemplates.length === 0) {
    return [];
  }

  const availableDaysPerWeek = Math.max(1, validDays.size);
  const topicCounters = new Map<string, number>();
  let globalSessionIndex = 0;

  return studyDates.map((date, studyDateIndex) => {
    const templateDay = studyDayTemplates[studyDateIndex % studyDayTemplates.length]!;
    const phase = getStudyPhase(studyDateIndex, studyDates.length);
    const weekNumber = Math.floor(studyDateIndex / availableDaysPerWeek) + 1;
    const dateKey = getDateKey(date);
    const sessions = templateDay.sessions.map((template, sessionIndex) => {
      const subject = subjects[globalSessionIndex % subjects.length] ?? template.subject;
      const subjectKey = getSubjectKey(subject);
      const topicIndex = topicCounters.get(subjectKey) ?? 0;
      const topic = getTopicForSubject(subject, topicIndex);
      const studyRecommendation = buildStudyRecommendation(phase, subject, topic, objective);
      const recommendedVideos = mergeUnique([
        ...buildRecommendedVideos(subject, topic, objective),
        ...(template.recommendedVideos ?? [])
      ], 4);
      const recommendedBooks = mergeUnique([
        ...buildRecommendedMaterials(subject, topic, objective),
        ...(template.recommendedBooks ?? [])
      ], 4);
      const quiz = mergeUnique([
        ...buildMiniQuiz(subject, topic, phase),
        ...(template.quiz ?? [])
      ], 4);

      topicCounters.set(subjectKey, topicIndex + 1);
      globalSessionIndex += 1;

      return {
        ...template,
        subject,
        topic,
        activityType: buildActivityType(phase),
        description: buildProgressiveDescription(subject, topic, phase, weekNumber, objective),
        studyRecommendation,
        recommendedVideos,
        recommendedBooks,
        quiz,
        calendarDate: dateKey,
        calendarDay: getWeekdayName(date),
        sessionKey: `${dateKey}:${sessionIndex}`,
        sequence: studyDateIndex + 1,
        phase
      };
    });

    return {
      date: dateKey,
      day: getWeekdayName(date),
      label: formatDate(dateKey),
      phase,
      sessions
    };
  });
}

export function getTotalCalendarSessionCount(calendar: DatedStudyDay[]) {
  return calendar.reduce((total, day) => total + day.sessions.length, 0);
}

export function getTotalSessionCount(plan: AiStudyPlan) {
  return plan.weeklySchedule.reduce((total, day) => total + day.sessions.length, 0);
}

export function calculateProgress(plan: AiStudyPlan, completedSessions: string[]) {
  const totalSessions = getTotalSessionCount(plan);
  const completedSessionsCount = completedSessions.length;
  const progressPercent =
    totalSessions === 0 ? 0 : Math.min(100, Math.round((completedSessionsCount / totalSessions) * 100));

  return {
    totalSessions,
    completedSessionsCount,
    progressPercent
  };
}

export function calculateCalendarProgress(
  calendar: DatedStudyDay[],
  completedSessions: string[]
) {
  const validKeys = new Set(calendar.flatMap((day) => day.sessions.map((session) => session.sessionKey)));
  const totalSessions = getTotalCalendarSessionCount(calendar);
  const completedSessionsCount = completedSessions.filter((sessionKey) =>
    validKeys.has(sessionKey)
  ).length;
  const progressPercent =
    totalSessions === 0 ? 0 : Math.min(100, Math.round((completedSessionsCount / totalSessions) * 100));

  return {
    totalSessions,
    completedSessionsCount,
    progressPercent
  };
}

export function normalizeCompletedCalendarSessions(
  calendar: DatedStudyDay[],
  completedSessions: string[]
) {
  const validKeys = new Set(calendar.flatMap((day) => day.sessions.map((session) => session.sessionKey)));

  return Array.from(
    new Set(
      completedSessions.filter((sessionKey) => typeof sessionKey === "string" && validKeys.has(sessionKey))
    )
  );
}

export function formatDate(value: string) {
  const date = parseLocalDate(value);

  if (!date) return value;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function parseLocalDate(value?: string) {
  if (!value) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  const dateOnly = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);

  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return null;

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function normalizeDay(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getStudyPhase(index: number, total: number) {
  const ratio = total <= 1 ? 1 : (index + 1) / total;

  if (ratio >= 0.9) return "Reta final";
  if (ratio >= 0.72) return "Revisao";
  if (ratio >= 0.45) return "Aprofundamento";
  return "Base";
}

function buildActivityType(phase: string) {
  const activityByPhase: Record<string, string> = {
    Base: "Base: aula + resumo + exercicios guiados",
    Aprofundamento: "Aprofundamento: exercicios + correcao de erros",
    Revisao: "Revisao: revisao ativa + questoes anteriores",
    "Reta final": "Reta final: bloco cronometrado + analise de erros"
  };

  return activityByPhase[phase] ?? "Estudo orientado";
}

function buildProgressiveDescription(
  subject: string,
  topic: string,
  phase: string,
  weekNumber: number,
  objective?: string
) {
  const phaseInstruction: Record<string, string> = {
    Base: "Entenda os conceitos centrais, veja exemplos resolvidos e monte um resumo curto.",
    Aprofundamento: "Resolva questoes mais completas, corrija os erros e anote padroes de cobranca.",
    Revisao: "Revise seu resumo, refaca questoes erradas e teste se consegue explicar o conteudo sem olhar.",
    "Reta final": "Treine com tempo marcado, revise erros recorrentes e priorize o que mais aparece na prova."
  };
  const objectiveText = objective ? ` pensando em ${objective}` : "";

  return `Semana ${weekNumber} - ${phase}. Estude ${topic} em ${subject}${objectiveText}. ${
    phaseInstruction[phase] ?? ""
  }`.trim();
}

function buildStudyRecommendation(phase: string, subject: string, topic: string, objective?: string) {
  const objectiveText = objective ? ` para ${objective}` : "";
  const recommendations: Record<string, string> = {
    Base: `Assista uma aula curta sobre ${topic}, escreva um resumo de 5 linhas e resolva 5 questoes faceis de ${subject}${objectiveText}.`,
    Aprofundamento: `Resolva 10 a 15 questoes sobre ${topic}, corrija cada erro e transforme os erros em uma lista de revisao.`,
    Revisao: `Revise ${topic} sem reler tudo: tente explicar em voz alta, refaca questoes antigas e marque o que ainda travar.`,
    "Reta final": `Faca um bloco cronometrado sobre ${topic}, confira o gabarito e revise apenas os erros que se repetirem.`
  };

  return recommendations[phase] ?? `Estude ${topic} em ${subject} com foco em pratica e correcao.`;
}

function getPlanSubjects(subjectsInput: string[] | string | undefined, plan: AiStudyPlan) {
  const directSubjects = Array.isArray(subjectsInput)
    ? subjectsInput
    : typeof subjectsInput === "string"
      ? splitSubjects(subjectsInput)
      : [];
  const aiSubjects = plan.weeklySchedule.flatMap((day) => day.sessions.map((session) => session.subject));

  const subjects = mergeUnique([...directSubjects, ...plan.priorities, ...aiSubjects])
    .map((subject) => subject.trim())
    .filter(Boolean);

  return subjects.length > 0 ? subjects : ["Estudo geral"];
}

function createFallbackSession(subject: string): StudySession {
  return {
    subject,
    duration: "1h",
    activityType: "Estudo orientado",
    description: `Estudar ${subject} com teoria, pratica e revisao.`
  };
}

function getSubjectKey(subject: string) {
  const normalized = normalizeDay(subject);

  if (normalized.includes("matemat")) return "matematica";
  if (normalized.includes("redacao") || normalized.includes("redaçao")) return "redacao";
  if (normalized.includes("quim")) return "quimica";
  if (normalized.includes("fisic")) return "fisica";
  if (normalized.includes("biolog")) return "biologia";
  if (normalized.includes("histor")) return "historia";
  if (normalized.includes("geograf")) return "geografia";
  if (normalized.includes("portugues") || normalized.includes("gramatica")) return "portugues";
  if (normalized.includes("literatura")) return "literatura";
  if (normalized.includes("ingles")) return "ingles";
  if (normalized.includes("espanhol")) return "espanhol";
  if (normalized.includes("informatica")) return "informatica";
  if (normalized.includes("direito")) return "direito";
  if (normalized.includes("administracao")) return "administracao";

  return normalized || "geral";
}

function getTopicForSubject(subject: string, index: number) {
  const subjectKey = getSubjectKey(subject);
  const topics = TOPICS_BY_SUBJECT[subjectKey] ?? buildGenericTopics(subject);
  const topic = topics[index % topics.length]!;
  const cycle = Math.floor(index / topics.length);

  return cycle === 0 ? topic : `${topic} - rodada ${cycle + 1}`;
}

const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  matematica: [
    "operacoes basicas e ordem de grandeza",
    "porcentagem e variacao percentual",
    "razao, proporcao e regra de tres",
    "equacoes do 1 grau",
    "equacoes do 2 grau",
    "funcoes do 1 grau",
    "funcoes do 2 grau",
    "graficos e interpretacao",
    "sistemas lineares",
    "progressao aritmetica",
    "progressao geometrica",
    "geometria plana: areas",
    "geometria plana: triangulos",
    "geometria espacial",
    "trigonometria basica",
    "estatistica: media, mediana e moda",
    "probabilidade",
    "analise combinatoria",
    "matematica financeira",
    "interpretacao de problemas"
  ],
  redacao: [
    "estrutura da dissertacao",
    "tese clara e recorte do tema",
    "repertorio sociocultural",
    "argumento 1 com causa e consequencia",
    "argumento 2 com exemplo concreto",
    "coesao entre paragrafos",
    "proposta de intervencao",
    "competencia 1: norma culta",
    "competencia 2: compreensao do tema",
    "competencia 3: projeto de texto",
    "competencia 4: conectivos",
    "competencia 5: agente, acao e meio",
    "analise de redacao nota alta",
    "reescrita de introducao",
    "reescrita de desenvolvimento",
    "reescrita de conclusao"
  ],
  quimica: [
    "estrutura atomica",
    "tabela periodica",
    "ligacoes quimicas",
    "funcoes inorganicas",
    "reacoes quimicas",
    "estequiometria",
    "solucoes",
    "termoquimica",
    "eletroquimica",
    "equilibrio quimico",
    "pH e pOH",
    "quimica organica: hidrocarbonetos",
    "funcoes organicas",
    "isomeria",
    "polimeros"
  ],
  fisica: [
    "cinematica",
    "leis de Newton",
    "trabalho e energia",
    "quantidade de movimento",
    "hidrostatica",
    "termologia",
    "calorimetria",
    "ondas",
    "optica geometrica",
    "eletricidade basica",
    "circuitos eletricos",
    "magnetismo"
  ],
  biologia: [
    "citologia",
    "bioquimica celular",
    "genetica mendeliana",
    "evolucao",
    "ecologia",
    "cadeias alimentares",
    "fisiologia humana",
    "botanica",
    "microbiologia",
    "biotecnologia",
    "saneamento e saude publica"
  ],
  historia: [
    "Brasil colonia",
    "Brasil imperio",
    "Republica Velha",
    "Era Vargas",
    "Ditadura militar",
    "redemocratizacao",
    "Idade Media",
    "Revolucao Francesa",
    "Revolucao Industrial",
    "guerras mundiais",
    "Guerra Fria"
  ],
  geografia: [
    "cartografia",
    "climatologia",
    "relevo e solos",
    "hidrografia",
    "urbanizacao",
    "populacao",
    "agropecuaria",
    "industria",
    "globalizacao",
    "meio ambiente",
    "geopolitica"
  ],
  portugues: [
    "interpretacao de texto",
    "generos textuais",
    "funcoes da linguagem",
    "morfologia",
    "sintaxe",
    "concordancia",
    "regencia",
    "crase",
    "pontuacao",
    "coesao e coerencia",
    "figuras de linguagem"
  ],
  literatura: [
    "escolas literarias",
    "Quinhentismo e Barroco",
    "Arcadismo",
    "Romantismo",
    "Realismo e Naturalismo",
    "Parnasianismo e Simbolismo",
    "Modernismo",
    "literatura contemporanea",
    "analise de poema",
    "analise de narrativa"
  ],
  ingles: [
    "reading strategies",
    "cognatos e falsos cognatos",
    "skimming e scanning",
    "tempos verbais",
    "modal verbs",
    "pronomes e referencia textual",
    "vocabulario contextual"
  ],
  espanhol: [
    "interpretacao de texto",
    "cognatos e falsos cognatos",
    "pronomes",
    "tempos verbais",
    "conectores",
    "vocabulario contextual"
  ],
  informatica: [
    "conceitos de hardware",
    "sistemas operacionais",
    "redes de computadores",
    "seguranca da informacao",
    "pacote Office",
    "internet e navegadores",
    "computacao em nuvem"
  ],
  direito: [
    "principios constitucionais",
    "direitos e garantias fundamentais",
    "organizacao do Estado",
    "administracao publica",
    "atos administrativos",
    "responsabilidade civil",
    "processo legislativo"
  ],
  administracao: [
    "planejamento",
    "organizacao",
    "direcao",
    "controle",
    "gestao de pessoas",
    "processos organizacionais",
    "indicadores de desempenho"
  ]
};

function buildGenericTopics(subject: string) {
  return [
    `fundamentos de ${subject}`,
    `conceitos principais de ${subject}`,
    `exercicios basicos de ${subject}`,
    `exercicios intermediarios de ${subject}`,
    `questoes aplicadas de ${subject}`,
    `revisao dos erros em ${subject}`,
    `simulado curto de ${subject}`,
    `resumo final de ${subject}`
  ];
}

function buildRecommendedVideos(subject: string, topic: string, objective?: string) {
  const target = objective ? `${objective} ` : "";

  return [
    `Buscar: ${subject} ${topic} aula ${target}`.trim(),
    `Buscar: ${subject} ${topic} exercicios resolvidos ${target}`.trim()
  ];
}

function buildRecommendedMaterials(subject: string, topic: string, objective?: string) {
  const target = objective ? `${objective} ` : "";

  return [
    `Buscar: ${subject} ${topic} resumo PDF ${target}`.trim(),
    `Buscar: ${subject} ${topic} lista de exercicios ${target}`.trim()
  ];
}

function buildMiniQuiz(subject: string, topic: string, phase: string) {
  if (phase === "Reta final") {
    return [
      `Resolva uma questao cronometrada de ${subject} sobre ${topic}.`,
      `Qual erro voce mais precisa evitar em ${topic}?`
    ];
  }

  if (phase === "Revisao") {
    return [
      `Explique ${topic} sem consultar o resumo.`,
      `Refaca uma questao que voce errou sobre ${topic} e anote o motivo do erro.`
    ];
  }

  return [
    `Qual e a ideia principal de ${topic}?`,
    `Resolva uma questao basica de ${subject} usando ${topic}.`
  ];
}

function mergeUnique(items: string[], limit?: number) {
  const uniqueItems = Array.from(
    new Set(
      items
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

  return typeof limit === "number" ? uniqueItems.slice(0, limit) : uniqueItems;
}
