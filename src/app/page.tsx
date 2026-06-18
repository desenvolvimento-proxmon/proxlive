"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Plus,
  SendHorizonal,
  Trash2
} from "lucide-react";
import { PlanAssistant } from "@/components/PlanAssistant";
import { PlanResult, sourceFromStoredPlan } from "@/components/PlanResult";
import { UserBadge } from "@/components/UserBadge";
import {
  WEEK_DAYS,
  formatDate,
  splitSubjects,
  type AppUser,
  type Level,
  type Preference,
  type SerializedStudyPlan,
  type StudyPlanFormValues
} from "@/lib/types";

const USER_STORAGE_KEY = "studyplanner:user";

type ViewMode = "plans" | "new" | "detail";

type PlanSetupAnswers = {
  objective: string;
  subjects: string;
  level: Level | "";
  deadline: string;
  availableDays: string[];
  weeklyHours: string;
  learningStyle: string;
};

type PlanSetupStepId = keyof PlanSetupAnswers;

const initialSetupAnswers: PlanSetupAnswers = {
  objective: "",
  subjects: "",
  level: "",
  deadline: "",
  availableDays: [],
  weeklyHours: "",
  learningStyle: ""
};

const setupSteps: Array<{
  id: PlanSetupStepId;
  question: string;
  helper?: string;
  inputType: "text" | "date" | "number" | "level" | "days" | "style";
}> = [
  {
    id: "objective",
    question: "Vamos comecar pelo principal: para que voce esta estudando?",
    helper: "Pode responder do seu jeito. Exemplo: ENEM, concurso, uma prova da faculdade, certificacao.",
    inputType: "text"
  },
  {
    id: "subjects",
    question: "Boa. Agora me diz quais materias ou assuntos entram nesse plano.",
    helper: "Pode separar por virgula. Exemplo: matematica, quimica, redacao.",
    inputType: "text"
  },
  {
    id: "level",
    question: "E hoje, como voce sente seu nivel nesses assuntos?",
    inputType: "level"
  },
  {
    id: "deadline",
    question: "Ate quando esse plano precisa estar cumprido?",
    inputType: "date"
  },
  {
    id: "availableDays",
    question: "Quais dias da semana normalmente cabem na sua rotina?",
    inputType: "days"
  },
  {
    id: "weeklyHours",
    question: "Pensando numa semana normal, quantas horas voce consegue estudar no total?",
    helper: "Pode ser uma estimativa honesta. Exemplo: 8, 12, 20.",
    inputType: "number"
  },
  {
    id: "learningStyle",
    question: "Para fechar: voce aprende melhor de que jeito?",
    inputType: "style"
  }
];

export default function Home() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [userForm, setUserForm] = useState({ email: "", password: "" });
  const [plans, setPlans] = useState<SerializedStudyPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SerializedStudyPlan | null>(null);
  const [setupAnswers, setSetupAnswers] = useState<PlanSetupAnswers>(initialSetupAnswers);
  const [setupStepIndex, setSetupStepIndex] = useState(0);
  const [setupInput, setSetupInput] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("plans");
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadPlans = useCallback(async (userId: string) => {
    setIsLoadingPlans(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/study-plans?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel carregar seus planos.");
      }

      setPlans(data.studyPlans);
      setSelectedPlan((current) => current ?? data.studyPlans[0] ?? null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setIsLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);

    if (!storedUser) return;

    try {
      const parsed = JSON.parse(storedUser) as AppUser;
      setUser(parsed);
      setUserForm({ email: parsed.email, password: "" });
      void loadPlans(parsed.id);
    } catch {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [loadPlans]);

  const dashboardStats = useMemo(() => {
    const averageProgress =
      plans.length === 0
        ? 0
        : Math.round(plans.reduce((total, plan) => total + plan.progressPercent, 0) / plans.length);
    const nextDeadline = plans
      .map((plan) => plan.deadline)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];

    return {
      plansCount: plans.length,
      averageProgress,
      nextDeadline
    };
  }, [plans]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsIdentifying(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel entrar.");
      }

      setUser(data.user);
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      await loadPlans(data.user.id);
      setViewMode("plans");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setIsIdentifying(false);
    }
  }

  async function generatePlanFromConversation(finalAnswers: PlanSetupAnswers) {
    if (!user) {
      setMessage("Entre com e-mail e senha antes de criar planos.");
      return;
    }

    const form = buildPlanForm(finalAnswers);
    const localError = validatePlanForm(form);

    if (localError) {
      setMessage(localError);
      return;
    }

    setIsGenerating(true);
    setMessage(null);

    try {
      const response = await fetch("/api/study-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...form
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel gerar o cronograma.");
      }

      setPlans((current) => [data.studyPlan, ...current]);
      setSelectedPlan(data.studyPlan);
      resetSetup();
      setViewMode("detail");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function toggleSession(sessionKey: string) {
    if (!user || !selectedPlan) return;

    const nextCompletedSessions = selectedPlan.completedSessions.includes(sessionKey)
      ? selectedPlan.completedSessions.filter((item) => item !== sessionKey)
      : [...selectedPlan.completedSessions, sessionKey];

    setUpdatingProgress(true);

    try {
      const response = await fetch(`/api/study-plans/${selectedPlan.id}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          completedSessions: nextCompletedSessions
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel atualizar o progresso.");
      }

      updatePlanInState(data.studyPlan);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setUpdatingProgress(false);
    }
  }

  async function deletePlan(planId: string) {
    if (!user) return;
    const confirmed = window.confirm("Excluir este plano de estudos?");

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/study-plans/${planId}?userId=${user.id}`, {
        method: "DELETE"
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel excluir o plano.");
      }

      setPlans((current) => current.filter((plan) => plan.id !== planId));
      setSelectedPlan((current) => (current?.id === planId ? null : current));
      setViewMode("plans");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado.");
    }
  }

  function updatePlanInState(plan: SerializedStudyPlan) {
    setSelectedPlan(plan);
    setPlans((current) => current.map((item) => (item.id === plan.id ? plan : item)));
  }

  function selectPlan(plan: SerializedStudyPlan) {
    setSelectedPlan(plan);
    setViewMode("detail");
  }

  function resetSetup() {
    setSetupAnswers(initialSetupAnswers);
    setSetupStepIndex(0);
    setSetupInput("");
  }

  function logout() {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setPlans([]);
    setSelectedPlan(null);
    setViewMode("plans");
    setMessage(null);
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto grid min-h-screen max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1fr_400px] lg:items-center">
          <section>
            <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-7xl">
              Estude com um plano acompanhado por IA.
            </h1>
          </section>

          <section className="rounded-3xl border border-white/15 bg-white p-6 text-slate-950 shadow-soft">
            <div className="mb-6">
              <h2 className="text-2xl font-black">Entrar</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Use seu e-mail e senha para acessar.</p>
            </div>

            {message ? (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                {message}
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={handleLogin}>
              <label>
                <span className="field-label">E-mail</span>
                <input
                  className="form-input"
                  type="email"
                  value={userForm.email}
                  onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="voce@email.com"
                  required
                />
              </label>

              <label>
                <span className="field-label">Senha</span>
                <input
                  className="form-input"
                  type="password"
                  value={userForm.password}
                  onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Sua senha"
                  required
                />
              </label>

              <button className="primary-button w-full" disabled={isIdentifying} type="submit">
                {isIdentifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Acessar
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-5 py-4">
          <UserBadge user={user} />
          <button className="icon-button" type="button" onClick={logout} title="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <button
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
              viewMode === "plans" ? "bg-slate-950 text-white" : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
            type="button"
            onClick={() => setViewMode("plans")}
          >
            <LayoutDashboard className="h-4 w-4" />
            Meus planos
          </button>
          <button
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
              viewMode === "new" ? "bg-slate-950 text-white" : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
            type="button"
            onClick={() => setViewMode("new")}
          >
            <Plus className="h-4 w-4" />
            Novo plano
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-500">Resumo</p>
            <div className="mt-4 space-y-4">
              <StatLine label="Planos" value={String(dashboardStats.plansCount)} />
              <StatLine label="Progresso medio" value={`${dashboardStats.averageProgress}%`} />
              <StatLine
                label="Proximo prazo"
                value={dashboardStats.nextDeadline ? formatDate(dashboardStats.nextDeadline) : "-"}
              />
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          {message ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {message}
            </div>
          ) : null}

          {viewMode === "plans" ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-2 text-sm font-bold uppercase text-emerald-700">Area interna</p>
                  <h1 className="text-3xl font-black text-slate-950">Meus planos de estudo</h1>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Acompanhe andamento, abra detalhes ou crie um novo plano em conversa com a IA.
                  </p>
                </div>
                <button className="primary-button" type="button" onClick={() => setViewMode("new")}>
                  <Plus className="h-4 w-4" />
                  Criar plano
                </button>
              </div>

              {isLoadingPlans ? (
                <div className="flex min-h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : null}

              {!isLoadingPlans && plans.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-emerald-600" />
                  <h2 className="mt-4 text-2xl font-black text-slate-950">Nenhum plano ainda</h2>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Converse com a IA para montar seu primeiro cronograma estruturado.
                  </p>
                  <button className="primary-button mt-6" type="button" onClick={() => setViewMode("new")}>
                    Criar meu primeiro plano
                  </button>
                </div>
              ) : null}

              {plans.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {plans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onDelete={() => deletePlan(plan.id)}
                      onOpen={() => selectPlan(plan)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {viewMode === "new" ? (
            <PlanSetupConversation
              answers={setupAnswers}
              currentStepIndex={setupStepIndex}
              input={setupInput}
              isGenerating={isGenerating}
              onAnswersChange={setSetupAnswers}
              onGenerate={generatePlanFromConversation}
              onInputChange={setSetupInput}
              onReset={resetSetup}
              onStepChange={setSetupStepIndex}
            />
          ) : null}

          {viewMode === "detail" && selectedPlan ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase text-emerald-700">Plano aberto</p>
                  <h1 className="mt-2 text-3xl font-black text-slate-950">{selectedPlan.objective}</h1>
                </div>
                <button className="secondary-button" type="button" onClick={() => setViewMode("plans")}>
                  Voltar aos planos
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <PlanResult
                  plan={selectedPlan.aiResponse}
                  source={sourceFromStoredPlan(selectedPlan)}
                  studyPlanId={selectedPlan.id}
                  createdAt={selectedPlan.createdAt}
                  completedSessionKeys={selectedPlan.completedSessions}
                  isUpdatingProgress={updatingProgress}
                  showActions={false}
                  onToggleSession={toggleSession}
                />
              </div>

              <PlanAssistant planId={selectedPlan.id} userId={user.id} onPlanUpdated={updatePlanInState} />
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function PlanSetupConversation({
  answers,
  currentStepIndex,
  input,
  isGenerating,
  onAnswersChange,
  onGenerate,
  onInputChange,
  onReset,
  onStepChange
}: {
  answers: PlanSetupAnswers;
  currentStepIndex: number;
  input: string;
  isGenerating: boolean;
  onAnswersChange: React.Dispatch<React.SetStateAction<PlanSetupAnswers>>;
  onGenerate: (answers: PlanSetupAnswers) => Promise<void>;
  onInputChange: (value: string) => void;
  onReset: () => void;
  onStepChange: (index: number) => void;
}) {
  const currentStep = setupSteps[currentStepIndex];
  const isComplete = currentStepIndex >= setupSteps.length;
  const completedEntries = setupSteps
    .slice(0, currentStepIndex)
    .map((step) => ({
      question: step.question,
      answer: formatSetupAnswer(step.id, answers[step.id])
    }))
    .filter((entry) => entry.answer);

  function submitCurrentStep(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!currentStep) return;

    const value = getStepValue(currentStep, input, answers);
    submitStepValue(value);
  }

  function submitStepValue(value: string | string[]) {
    if (!currentStep) return;

    if (!isValidStepValue(currentStep, value)) return;

    const nextAnswers = { ...answers, [currentStep.id]: value } as PlanSetupAnswers;
    onAnswersChange(nextAnswers);
    onInputChange("");

    const nextIndex = currentStepIndex + 1;
    onStepChange(nextIndex);

    if (nextIndex >= setupSteps.length) {
      void onGenerate(nextAnswers);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="mb-6 border-b border-slate-200 pb-6">
        <p className="text-sm font-bold uppercase text-emerald-700">Novo plano</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Vamos montar seu plano</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Responda como se estivesse conversando. Eu organizo as informacoes e gero o cronograma no final.
        </p>
      </div>

      <div className="space-y-4">
        <AssistantBubble>
          Oi. Vou te fazer poucas perguntas, uma por vez, para montar um plano que faca sentido para sua rotina.
        </AssistantBubble>

        {completedEntries.map((entry) => (
          <div className="space-y-2" key={entry.question}>
            <AssistantBubble>{entry.question}</AssistantBubble>
            <UserBubble>{entry.answer}</UserBubble>
          </div>
        ))}

        {!isComplete && currentStep ? (
          <div className="space-y-4">
            <AssistantBubble>
              {currentStep.question}
              {currentStep.helper ? <span className="mt-1 block text-xs text-slate-500">{currentStep.helper}</span> : null}
            </AssistantBubble>
            <StepInput
              answers={answers}
              input={input}
              step={currentStep}
              onAnswersChange={onAnswersChange}
              onInputChange={onInputChange}
              onQuickAnswer={submitStepValue}
              onSubmit={submitCurrentStep}
            />
          </div>
        ) : null}

        {isComplete ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            {isGenerating ? "Perfeito. Estou montando o plano agora..." : "Plano enviado para geracao."}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
        <button className="secondary-button" type="button" onClick={onReset}>
          Comecar de novo
        </button>
        <span className="text-sm font-semibold text-slate-500">
          {setupSteps.length - Math.min(currentStepIndex, setupSteps.length)} respostas ate o plano
        </span>
      </div>
    </section>
  );
}

function StepInput({
  answers,
  input,
  step,
  onAnswersChange,
  onInputChange,
  onQuickAnswer,
  onSubmit
}: {
  answers: PlanSetupAnswers;
  input: string;
  step: (typeof setupSteps)[number];
  onAnswersChange: React.Dispatch<React.SetStateAction<PlanSetupAnswers>>;
  onInputChange: (value: string) => void;
  onQuickAnswer: (value: string | string[]) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
}) {
  if (step.inputType === "level") {
    return (
      <OptionGrid
        options={[
          ["iniciante", "Iniciante"],
          ["intermediario", "Intermediario"],
          ["avancado", "Avancado"]
        ]}
        onSelect={(value) => onQuickAnswer(value)}
      />
    );
  }

  if (step.inputType === "style") {
    return (
      <OptionGrid
        options={[
          ["visual", "Vendo exemplos e videos"],
          ["exercicios", "Fazendo exercicios"],
          ["leitura", "Lendo e anotando"],
          ["simulados", "Fazendo simulados"],
          ["equilibrado", "Misturando um pouco de tudo"]
        ]}
        onSelect={(value) => onQuickAnswer(value)}
      />
    );
  }

  if (step.inputType === "days") {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WEEK_DAYS.map((day) => {
            const checked = answers.availableDays.includes(day);
            return (
              <button
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  checked
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                }`}
                key={day}
                type="button"
                onClick={() =>
                  onAnswersChange((current) => ({
                    ...current,
                    availableDays: current.availableDays.includes(day)
                      ? current.availableDays.filter((item) => item !== day)
                      : [...current.availableDays, day]
                  }))
                }
              >
                <span className="flex items-center justify-between gap-3">
                  {day}
                  {checked ? <Check className="h-4 w-4" /> : null}
                </span>
              </button>
            );
          })}
        </div>
        <button className="primary-button" type="button" onClick={() => onQuickAnswer(answers.availableDays)}>
          Continuar
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
      <input
        className="form-input"
        min={step.inputType === "number" ? 1 : undefined}
        type={step.inputType === "date" ? "date" : step.inputType === "number" ? "number" : "text"}
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        placeholder="Escreva aqui..."
      />
      <button className="primary-button px-4" type="submit">
        <SendHorizonal className="h-4 w-4" />
        Enviar
      </button>
    </form>
  );
}

function OptionGrid({
  options,
  onSelect
}: {
  options: Array<[string, string]>;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {options.map(([value, label]) => (
        <button
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          key={value}
          type="button"
          onClick={() => onSelect(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex max-w-3xl gap-3">
      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
        IA
      </span>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
        {children}
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-auto max-w-2xl rounded-2xl bg-slate-950 px-4 py-3 text-sm leading-6 text-white">
      {children}
    </div>
  );
}

function PlanCard({
  plan,
  onOpen,
  onDelete
}: {
  plan: SerializedStudyPlan;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-700">Criado em {formatDate(plan.createdAt)}</p>
          <h2 className="text-xl font-black text-slate-950">{plan.objective}</h2>
          <p className="mt-1 text-sm text-slate-500">Prazo: {formatDate(plan.deadline)}</p>
        </div>
        <button
          className="icon-button border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
          type="button"
          onClick={onDelete}
          title="Excluir plano"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <p className="line-clamp-2 text-sm leading-6 text-slate-600">{plan.aiResponse.summary}</p>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-600">Andamento</span>
          <span className="font-bold text-slate-950">{plan.progressPercent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${plan.progressPercent}%` }} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <PreviewItem label="Sessoes" value={`${plan.completedSessionsCount}/${plan.totalSessions}`} />
        <PreviewItem label="Materias" value={String(plan.subjects.length)} />
        <PreviewItem label="Dias" value={String(plan.availableDays.length)} />
      </div>

      <button className="secondary-button mt-5 w-full" type="button" onClick={onOpen}>
        Abrir plano
        <ChevronRight className="h-4 w-4" />
      </button>
    </article>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-black text-slate-950">{value}</span>
    </div>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}

function getStepValue(step: (typeof setupSteps)[number], input: string, answers: PlanSetupAnswers) {
  if (step.inputType === "days") return answers.availableDays;
  if (step.inputType === "level") return answers.level;
  if (step.inputType === "style") return answers.learningStyle;
  return input.trim();
}

function isValidStepValue(step: (typeof setupSteps)[number], value: string | string[]) {
  if (step.inputType === "days") return Array.isArray(value) && value.length > 0;
  return typeof value === "string" && value.trim().length > 0;
}

function formatSetupAnswer(id: PlanSetupStepId, value: PlanSetupAnswers[PlanSetupStepId]) {
  if (Array.isArray(value)) return value.join(", ");
  if (id === "weeklyHours" && value) return `${value} horas por semana`;
  return value;
}

function buildPlanForm(answers: PlanSetupAnswers): StudyPlanFormValues {
  const weeklyHours = Math.max(1, Number(answers.weeklyHours));
  const daysCount = Math.max(1, answers.availableDays.length);
  const hoursPerDay = Number((weeklyHours / daysCount).toFixed(1));
  const preference = mapLearningStyleToPreference(answers.learningStyle);

  return {
    objective: answers.objective,
    deadline: answers.deadline,
    subjects: answers.subjects,
    level: answers.level || "iniciante",
    availableDays: answers.availableDays,
    hoursPerDay,
    preference,
    notes: `Tempo disponivel na semana: ${weeklyHours}h. Estilo de aprendizado: ${answers.learningStyle}. Gere videos recomendados, materiais/livros e mini questionarios por sessao.`
  };
}

function mapLearningStyleToPreference(style: string): Preference {
  if (style === "exercicios") return "exercicios";
  if (style === "simulados") return "simulados";
  if (style === "leitura") return "teoria";
  if (style === "visual") return "teoria";
  return "equilibrado";
}

function validatePlanForm(form: StudyPlanFormValues) {
  if (!form.objective.trim()) return "Informe o objetivo do estudo.";
  if (!form.deadline) return "Informe a data da prova ou prazo final.";
  if (splitSubjects(form.subjects).length === 0) return "Informe pelo menos uma materia.";
  if (form.availableDays.length === 0) return "Selecione ao menos um dia disponivel.";
  if (!form.hoursPerDay || Number(form.hoursPerDay) <= 0) return "Informe horas por dia validas.";
  return null;
}
