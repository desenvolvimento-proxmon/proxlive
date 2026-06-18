import type { AiStudyPlan, StudyPlanFormValues } from "@/lib/types";

export class OpenAIConfigError extends Error {}
export class OpenAIJsonError extends Error {}
export class OpenAIAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
  }
}

const STUDY_PLANNER_PROMPT = `Voce e um especialista em planejamento de estudos. Gere um cronograma personalizado, pratico e bem estruturado considerando objetivo, prazo, materias/assuntos, nivel, dias disponiveis, horas por dia e estilo de aprendizado. Retorne apenas JSON valido no formato:

{
  "summary": "Resumo do plano",
  "workloadAnalysis": "Analise da carga horaria",
  "weeklySchedule": [
    {
      "day": "Segunda-feira",
      "sessions": [
        {
          "subject": "Matematica",
          "topic": "Funcoes do 1 grau",
          "duration": "1h30",
          "activityType": "Teoria + exercicios",
          "description": "Estudar funcoes e resolver questoes",
          "studyRecommendation": "Assistir uma aula curta, fazer um resumo de 5 linhas e resolver 8 questoes.",
          "recommendedVideos": ["Buscar: funcoes matematica basica Professor Ferretto"],
          "recommendedBooks": ["Topico correspondente em livro didatico de Matematica do ensino medio"],
          "quiz": ["O que e dominio de uma funcao?", "Resolva f(x)=2x+3 para x=4"]
        }
      ]
    }
  ],
  "priorities": ["Matematica", "Redacao"],
  "reviewStrategy": "Estrategia de revisao",
  "simulationStrategy": "Estrategia de simulados",
  "recommendedVideos": ["Buscar: revisao ENEM matematica funcoes"],
  "recommendedBooks": ["Livro ou material recomendado"],
  "recommendations": ["Revisar conteudos dificeis", "Fazer exercicios diariamente"],
  "warnings": ["Carga horaria baixa para o prazo informado"]
}

Inclua em cada sessao um topico especifico, uma recomendacao pratica de como estudar, pelo menos um video recomendado como termo de busca, um material/livro recomendado e 2 mini perguntas de quiz sobre o assunto do dia. Varie os topicos entre as materias; nao repita o mesmo conteudo em todos os dias. Nao invente links especificos. Use termos de busca ou nomes de canais/livros conhecidos quando fizer sentido. Nao use markdown. Retorne somente JSON valido.`;

type GenerateInput = StudyPlanFormValues & {
  userName: string;
  userEmail: string;
};

export async function generateStudyPlanWithOpenAI(input: GenerateInput): Promise<AiStudyPlan> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new OpenAIConfigError("OPENAI_API_KEY nao foi configurada.");
  }

  const response = await callOpenAI({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: STUDY_PLANNER_PROMPT
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            estudante: {
              nome: input.userName,
              email: input.userEmail
            },
            objetivo: input.objective,
            prazoFinal: input.deadline,
            materias: input.subjects,
            nivelAtual: input.level,
            diasDisponiveis: input.availableDays,
            horasDisponiveisPorDia: input.hoursPerDay,
            preferenciaDeEstudo: input.preference,
            observacoesAdicionais: input.notes
          },
          null,
          2
        )
      }
    ]
  });

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new OpenAIJsonError("A OpenAI nao retornou conteudo.");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new OpenAIJsonError("A OpenAI retornou um JSON invalido.");
  }

  assertAiStudyPlan(parsed);
  return parsed;
}

export async function askQuestionAboutStudyPlan(input: {
  question: string;
  userName: string;
  objective: string;
  deadline: string;
  subjects: string[];
  level: string;
  preference: string;
  aiResponse: AiStudyPlan;
  completedSessions: string[];
  calendarContext?: Array<{
    date: string;
    day: string;
    phase: string;
    sessions: Array<{
      subject: string;
      topic?: string;
      activityType: string;
      description: string;
      completed: boolean;
    }>;
  }>;
  conversationHistory?: Array<{
    question: string;
    answer: string;
  }>;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new OpenAIConfigError("OPENAI_API_KEY nao foi configurada.");
  }

  const currentQuestion = looksLikeAnswerAttempt(input.question)
    ? `Estou respondendo a ultima pergunta ou exercicio que voce me fez. Minha resposta foi: "${input.question}". Corrija minha resposta de forma direta, diga se esta certa ou errada e mostre o raciocinio.`
    : input.question;
  const conversationMessages = (input.conversationHistory ?? []).flatMap((item) => [
    {
      role: "user" as const,
      content: item.question
    },
    {
      role: "assistant" as const,
      content: item.answer
    }
  ]);

  const response = await callOpenAI({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.25,
    messages: [
      {
        role: "system",
        content:
          "Voce e um mentor de estudos. Responda em portugues do Brasil, de forma pratica, curta e contextualizada ao plano do aluno. Nao invente dados fora do plano; quando faltar informacao, diga o que precisaria saber."
          + " Use tom natural e humano, como um orientador falando direto com o aluno. Nao use markdown, asteriscos, titulos longos ou listas gigantes. Se o aluno pedir mudanca no plano, explique brevemente que voce vai ajustar a organizacao."
          + " Use o historico da conversa para entender referencias como primeira questao, segunda, essa resposta, aquilo, a atividade de hoje ou o assunto anterior. Se o aluno enviar uma resposta curta, numero, alternativa ou expressao como '2', 'letra c', 'x=5' ou '100?', trate como resposta da ultima pergunta/exercicio que voce fez e corrija com objetividade."
      },
      {
        role: "user",
        content:
          "Contexto fixo do plano do aluno. Use isto como referencia, mas responda a proxima mensagem como uma conversa normal:\n" +
          JSON.stringify(
            {
              aluno: input.userName,
              plano: {
                objetivo: input.objective,
                prazoFinal: input.deadline,
                materias: input.subjects,
                nivel: input.level,
                preferencia: input.preference,
                cronograma: input.aiResponse,
                proximosDiasDoCalendario: input.calendarContext ?? [],
                sessoesConcluidas: input.completedSessions
              }
            },
            null,
            2
          )
      },
      {
        role: "assistant",
        content:
          "Entendido. Vou usar esse plano como contexto e manter continuidade com as mensagens anteriores."
      },
      ...conversationMessages,
      {
        role: "user",
        content: currentQuestion
      }
    ]
  });

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const answer = cleanAssistantText(data.choices?.[0]?.message?.content);

  if (!answer) {
    throw new OpenAIJsonError("A OpenAI nao retornou resposta.");
  }

  return answer;
}

export async function evaluateLastExerciseAnswerWithOpenAI(input: {
  studentAnswer: string;
  userName: string;
  conversationHistory: Array<{
    question: string;
    answer: string;
  }>;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new OpenAIConfigError("OPENAI_API_KEY nao foi configurada.");
  }

  const historyMessages = input.conversationHistory.flatMap((item) => [
    {
      role: "user" as const,
      content: item.question
    },
    {
      role: "assistant" as const,
      content: item.answer
    }
  ]);

  const response = await callOpenAI({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content:
          "Voce e um corretor de exercicios. Use a ultima pergunta/exercicio feita por voce no historico. A mensagem atual do aluno e uma tentativa de resposta. Diga se esta certa ou errada, mostre a resolucao curta e, se estiver errada, diga qual seria a resposta correta. Nao peca mais contexto se houver uma pergunta anterior clara."
      },
      ...historyMessages,
      {
        role: "user",
        content: `Minha resposta para a ultima pergunta foi: ${input.studentAnswer}`
      }
    ]
  });

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const answer = cleanAssistantText(data.choices?.[0]?.message?.content);

  if (!answer) {
    throw new OpenAIJsonError("A OpenAI nao retornou resposta.");
  }

  return answer;
}

export function isShortExerciseAnswer(text: string) {
  return looksLikeAnswerAttempt(text);
}

function looksLikeAnswerAttempt(text: string) {
  const normalized = text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.length === 0 || normalized.length > 45) return false;

  if (/^[a-e]([).])?$/i.test(normalized)) return true;
  if (/^[\d\s.,+\-*/=xX()?:]+$/.test(normalized)) return true;
  if (/^(sim|nao|não|certo|errado|verdadeiro|falso)$/i.test(normalized)) return true;

  const questionStarters = [
    "como",
    "qual",
    "quando",
    "onde",
    "por que",
    "porque",
    "quero",
    "gere",
    "gera",
    "mude",
    "muda",
    "explique",
    "me ajuda"
  ];

  return !questionStarters.some((starter) => normalized.startsWith(starter)) && normalized.length <= 18;
}

export async function reviseStudyPlanWithOpenAI(input: {
  changeRequest: string;
  userName: string;
  objective: string;
  deadline: string;
  subjects: string[];
  level: string;
  preference: string;
  aiResponse: AiStudyPlan;
  completedSessions: string[];
}) {
  const response = await callOpenAI({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.25,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          STUDY_PLANNER_PROMPT +
          "\n\nVoce recebera um plano existente e um pedido de alteracao. Reescreva o plano completo em JSON valido, preservando o formato exigido. Mantenha o que ainda faz sentido, aplique a mudanca solicitada e mantenha videos, livros/materiais e quizzes por sessao."
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            aluno: input.userName,
            pedidoDeAlteracao: input.changeRequest,
            contexto: {
              objetivo: input.objective,
              prazoFinal: input.deadline,
              materias: input.subjects,
              nivel: input.level,
              preferencia: input.preference,
              sessoesConcluidas: input.completedSessions
            },
            planoAtual: input.aiResponse
          },
          null,
          2
        )
      }
    ]
  });

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new OpenAIJsonError("A OpenAI nao retornou conteudo.");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new OpenAIJsonError("A OpenAI retornou um JSON invalido.");
  }

  assertAiStudyPlan(parsed);
  return parsed;
}

async function callOpenAI(payload: Record<string, unknown>) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new OpenAIConfigError("OPENAI_API_KEY nao foi configurada.");
  }

  let response: Response;

  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new OpenAIAPIError(
      "Nao foi possivel conectar com a OpenAI. Verifique sua internet e tente novamente.",
      0
    );
  }

  if (!response.ok) {
    const errorBody = await readOpenAIError(response);
    throw new OpenAIAPIError(errorBody.message, response.status, errorBody.code);
  }

  return response;
}

async function readOpenAIError(response: Response) {
  try {
    const data = (await response.json()) as {
      error?: {
        message?: string;
        code?: string;
        type?: string;
      };
    };
    const message = data.error?.message ?? `OpenAI retornou erro ${response.status}.`;

    return {
      message,
      code: data.error?.code ?? data.error?.type
    };
  } catch {
    return {
      message: `OpenAI retornou erro ${response.status}.`,
      code: undefined
    };
  }
}

function assertAiStudyPlan(value: unknown): asserts value is AiStudyPlan {
  if (!value || typeof value !== "object") {
    throw new OpenAIJsonError("A resposta da IA nao tem o formato esperado.");
  }

  const candidate = value as Partial<AiStudyPlan>;
  const requiredStrings = [
    candidate.summary,
    candidate.workloadAnalysis,
    candidate.reviewStrategy,
    candidate.simulationStrategy
  ];

  if (requiredStrings.some((field) => typeof field !== "string")) {
    throw new OpenAIJsonError("A resposta da IA veio sem campos de texto obrigatorios.");
  }

  if (
    !Array.isArray(candidate.weeklySchedule) ||
    !Array.isArray(candidate.priorities) ||
    !Array.isArray(candidate.recommendations) ||
    !Array.isArray(candidate.warnings)
  ) {
    throw new OpenAIJsonError("A resposta da IA veio sem listas obrigatorias.");
  }
}

export function cleanAssistantText(value?: string) {
  if (!value) return "";

  return value
    .replace(/\*\*/g, "")
    .replace(/#{1,6}\s?/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s*[-*]\s+/gm, "- ")
    .replace(/\s+$/g, "")
    .trim();
}
