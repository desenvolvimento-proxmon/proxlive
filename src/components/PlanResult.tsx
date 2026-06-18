"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  History,
  Square,
  SquareCheckBig,
  RefreshCw,
  Sparkles
} from "lucide-react";
import {
  buildDatedStudyCalendar,
  calculateCalendarProgress,
  calculatePlanMetrics,
  formatDate,
  type AiStudyPlan,
  type SerializedStudyPlan,
  type StudyPlanFormValues
} from "@/lib/types";

type PlanResultProps = {
  plan: AiStudyPlan;
  source: Pick<
    StudyPlanFormValues,
    "deadline" | "subjects" | "availableDays" | "hoursPerDay"
  > & {
    objective?: string;
  };
  studyPlanId?: string;
  createdAt?: string;
  showActions?: boolean;
  completedSessionKeys?: string[];
  isUpdatingProgress?: boolean;
  onRegenerate?: () => void;
  onToggleSession?: (sessionKey: string) => void;
};

export function PlanResult({
  plan,
  source,
  studyPlanId,
  createdAt,
  showActions = true,
  completedSessionKeys = [],
  isUpdatingProgress = false,
  onRegenerate,
  onToggleSession
}: PlanResultProps) {
  const metrics = calculatePlanMetrics(source);
  const calendar = buildDatedStudyCalendar(
    plan,
    source.deadline,
    source.availableDays,
    createdAt,
    source.subjects,
    source.objective
  );
  const progress = calculateCalendarProgress(calendar, completedSessionKeys);
  const completedSet = new Set(completedSessionKeys);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [visibleLimit, setVisibleLimit] = useState(16);
  const safeSelectedDayIndex = Math.min(selectedDayIndex, Math.max(0, calendar.length - 1));
  const selectedDay = calendar[safeSelectedDayIndex];
  const visibleDays = calendar.slice(0, visibleLimit);

  return (
    <section className="space-y-6" aria-live="polite">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            <Sparkles className="h-4 w-4" />
            Plano gerado por IA
          </p>
          <h2 className="text-2xl font-bold text-slate-950 md:text-3xl">Seu cronograma personalizado</h2>
          {createdAt ? (
            <p className="mt-2 text-sm text-slate-500">Criado em {formatDate(createdAt)}</p>
          ) : null}
        </div>

        {showActions ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="secondary-button" type="button" onClick={onRegenerate}>
              <RefreshCw className="h-4 w-4" />
              Gerar novamente
            </button>
            <Link className="primary-button" href="/historico">
              <History className="h-4 w-4" />
              Ir ao historico
            </Link>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricTile
          icon={<Clock className="h-5 w-5" />}
          label="Horas semanais"
          value={`${metrics.totalWeeklyHours}h`}
        />
        <MetricTile
          icon={<BookOpen className="h-5 w-5" />}
          label="Materias"
          value={String(metrics.subjectCount)}
        />
        <MetricTile
          icon={<CalendarDays className="h-5 w-5" />}
          label="Dias/semana"
          value={String(metrics.availableDaysCount)}
        />
        <MetricTile
          icon={<BarChart3 className="h-5 w-5" />}
          label="Dias ate a prova"
          value={String(metrics.daysUntilDeadline)}
        />
        <MetricTile
          icon={<Sparkles className="h-5 w-5" />}
          label="Intensidade"
          value={metrics.intensity}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-950">Andamento do plano</h3>
            <p className="text-sm text-slate-500">
              {progress.completedSessionsCount} de {progress.totalSessions} sessoes concluidas
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-800">
            {progress.progressPercent}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <InfoBlock title="Resumo do plano" body={plan.summary} />
        <InfoBlock title="Analise da carga horaria" body={plan.workloadAnalysis} />
      </div>

      <section className="space-y-5">
        <div>
          <h3 className="text-2xl font-bold text-slate-950">Calendario de estudos</h3>
          <p className="mt-1 text-sm text-slate-500">
            {calendar.length} dias de estudo planejados ate a prova. Cada data tem seu proprio
            checklist e evolui por fases.
          </p>
        </div>

        {calendar.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {visibleDays.map((day, dayIndex) => {
              const completedInDay = day.sessions.filter((session) =>
                completedSet.has(session.sessionKey)
              ).length;
              const isSelected = dayIndex === safeSelectedDayIndex;

              return (
                <button
                  className={`rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDayIndex(dayIndex)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{day.label}</p>
                      <p className={`mt-1 text-sm ${isSelected ? "text-slate-200" : "text-slate-500"}`}>
                        {day.day}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${
                        isSelected ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {day.phase}
                    </span>
                  </div>
                  <p className={`mt-3 text-sm ${isSelected ? "text-slate-200" : "text-slate-500"}`}>
                    {completedInDay}/{day.sessions.length} sessoes concluidas
                  </p>
                  <div
                    className={`mt-3 h-2 overflow-hidden rounded-full ${
                      isSelected ? "bg-white/20" : "bg-slate-100"
                    }`}
                  >
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${day.sessions.length ? Math.round((completedInDay / day.sessions.length) * 100) : 0}%`
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            Nao foi possivel montar o calendario com os dias e o prazo informados.
          </div>
        )}

        {visibleLimit < calendar.length ? (
          <button
            className="secondary-button"
            type="button"
            onClick={() => setVisibleLimit((current) => current + 16)}
          >
            Carregar mais dias
          </button>
        ) : null}

        {selectedDay ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase text-emerald-700">Dia selecionado</p>
                <h4 className="mt-1 text-2xl font-black text-slate-950">
                  {selectedDay.day}, {selectedDay.label}
                </h4>
                <p className="mt-1 text-sm font-semibold text-slate-500">{selectedDay.phase}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                {selectedDay.sessions.length} sessoes
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {selectedDay.sessions.map((session, index) => {
                const sessionKey = session.sessionKey;
                const isCompleted = completedSet.has(sessionKey);

                return (
                  <article
                    className={`rounded-2xl border p-5 transition ${
                      isCompleted ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white"
                    }`}
                    key={`${selectedDay.date}-${session.subject}-${index}`}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h5 className="font-bold text-slate-950">{session.subject}</h5>
                        {session.topic ? (
                          <p className="mt-1 text-sm font-semibold text-emerald-700">{session.topic}</p>
                        ) : null}
                        <p className="mt-1 text-sm text-slate-500">{session.activityType}</p>
                      </div>
                      <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                        {session.duration}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{session.description}</p>
                    {session.studyRecommendation ? (
                      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="mb-1 text-xs font-bold uppercase text-emerald-700">
                          Recomendacao de estudo
                        </p>
                        <p className="text-sm leading-6 text-emerald-950">
                          {session.studyRecommendation}
                        </p>
                      </div>
                    ) : null}
                    <SessionResources
                      books={session.recommendedBooks}
                      quiz={session.quiz}
                      videos={session.recommendedVideos}
                    />
                    {onToggleSession ? (
                      <button
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-emerald-700 disabled:opacity-60"
                        disabled={isUpdatingProgress}
                        type="button"
                        onClick={() => onToggleSession(sessionKey)}
                      >
                        {isCompleted ? (
                          <SquareCheckBig className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                        {isCompleted ? "Concluida" : "Marcar como concluida"}
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <ListBlock title="Prioridades" items={plan.priorities} icon="priority" />
        <ListBlock title="Recomendacoes" items={plan.recommendations} icon="check" />
      </div>

      {plan.recommendedVideos?.length || plan.recommendedBooks?.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {plan.recommendedVideos?.length ? (
            <ListBlock title="Videos gerais recomendados" items={plan.recommendedVideos} icon="check" />
          ) : null}
          {plan.recommendedBooks?.length ? (
            <ListBlock title="Livros e materiais gerais" items={plan.recommendedBooks} icon="priority" />
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <InfoBlock title="Estrategia de revisao" body={plan.reviewStrategy} />
        <InfoBlock title="Estrategia de simulados" body={plan.simulationStrategy} />
      </div>

      {plan.warnings.length > 0 ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="mb-3 flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-bold">Alertas</h3>
          </div>
          <ul className="space-y-2 text-sm text-amber-900">
            {plan.warnings.map((warning) => (
              <li className="flex gap-2" key={warning}>
                <span aria-hidden="true">-</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {studyPlanId ? (
        <p className="text-xs text-slate-400">ID do cronograma: {studyPlanId}</p>
      ) : null}
    </section>
  );
}

export function sourceFromStoredPlan(plan: SerializedStudyPlan) {
  return {
    deadline: plan.deadline,
    subjects: plan.subjects.join(", "),
    availableDays: plan.availableDays,
    hoursPerDay: plan.hoursPerDay,
    objective: plan.objective
  };
}

function MetricTile({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="metric-tile">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="mb-3 text-lg font-bold text-slate-950">{title}</h3>
      <p className="text-sm leading-6 text-slate-600">{body}</p>
    </section>
  );
}

function SessionResources({
  books = [],
  quiz = [],
  videos = []
}: {
  books?: string[];
  quiz?: string[];
  videos?: string[];
}) {
  const hasResources = videos.length > 0 || books.length > 0 || quiz.length > 0;

  if (!hasResources) return null;

  return (
    <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4">
      {videos.length > 0 ? <MiniList linkType="youtube" title="Videos" items={videos} /> : null}
      {books.length > 0 ? <MiniList linkType="books" title="Materiais/livros" items={books} /> : null}
      {quiz.length > 0 ? <MiniList title="Mini questionario" items={quiz} /> : null}
    </div>
  );
}

function MiniList({
  title,
  items,
  linkType
}: {
  title: string;
  items: string[];
  linkType?: "youtube" | "books";
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase text-slate-500">{title}</p>
      <ul className="space-y-1 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span aria-hidden="true">-</span>
            {linkType ? (
              <a
                className="font-semibold text-emerald-700 underline-offset-4 hover:underline"
                href={buildResourceLink(item, linkType)}
                rel="noreferrer"
                target="_blank"
              >
                {item}
              </a>
            ) : (
              <span>{item}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function buildResourceLink(item: string, linkType: "youtube" | "books") {
  const query = item
    .replace(/^buscar:\s*/i, "")
    .replace(/^youtube:\s*/i, "")
    .replace(/^livro:\s*/i, "")
    .trim();

  if (linkType === "youtube") {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(`${query} livro material estudo`)}`;
}

function ListBlock({
  title,
  items,
  icon
}: {
  title: string;
  items: string[];
  icon: "priority" | "check";
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-lg font-bold text-slate-950">{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li className="flex gap-3 text-sm leading-6 text-slate-700" key={item}>
            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              {icon === "check" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
