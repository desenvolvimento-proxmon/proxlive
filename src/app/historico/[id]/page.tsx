"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PlanAssistant } from "@/components/PlanAssistant";
import { PlanResult, sourceFromStoredPlan } from "@/components/PlanResult";
import { formatDate, type AppUser, type SerializedStudyPlan } from "@/lib/types";

const USER_STORAGE_KEY = "studyplanner:user";

export default function StudyPlanDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<AppUser | null>(null);
  const [plan, setPlan] = useState<SerializedStudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlan() {
      setIsLoading(true);
      setMessage(null);

      try {
        const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);

        if (!storedUser) {
          throw new Error("Entre no dashboard antes de abrir detalhes do cronograma.");
        }

        const parsedUser = JSON.parse(storedUser) as AppUser;
        setUser(parsedUser);

        const response = await fetch(`/api/study-plans/${params.id}?userId=${parsedUser.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Nao foi possivel carregar o cronograma.");
        }

        setPlan(data.studyPlan);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro inesperado.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadPlan();
  }, [params.id]);

  async function toggleSession(sessionKey: string) {
    if (!user || !plan) return;

    const nextCompletedSessions = plan.completedSessions.includes(sessionKey)
      ? plan.completedSessions.filter((item) => item !== sessionKey)
      : [...plan.completedSessions, sessionKey];

    setIsUpdatingProgress(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/study-plans/${plan.id}/progress`, {
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

      setPlan(data.studyPlan);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setIsUpdatingProgress(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link className="flex items-center gap-3 text-sm font-semibold text-slate-700" href="/historico">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao historico
          </Link>
          {plan ? (
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
              Criado em {formatDate(plan.createdAt)}
            </span>
          ) : null}
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10">
        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center rounded-lg border border-slate-200 bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : null}

        {message ? (
          <div className="panel text-center">
            <h1 className="text-2xl font-bold text-slate-950">Nao deu para abrir este cronograma</h1>
            <p className="mt-3 text-slate-500">{message}</p>
            <Link className="primary-button mt-6" href="/historico">
              Voltar ao historico
            </Link>
          </div>
        ) : null}

        {plan ? (
          <div className="space-y-6">
            <div className="panel">
            <div className="mb-8 border-b border-slate-200 pb-6">
              <p className="text-sm font-semibold uppercase text-emerald-700">Detalhes do cronograma</p>
              <h1 className="mt-2 text-4xl font-black text-slate-950">{plan.objective}</h1>
              <p className="mt-2 text-slate-500">Prazo: {formatDate(plan.deadline)}</p>
            </div>
            <PlanResult
              plan={plan.aiResponse}
              source={sourceFromStoredPlan(plan)}
              studyPlanId={plan.id}
              createdAt={plan.createdAt}
              completedSessionKeys={plan.completedSessions}
              isUpdatingProgress={isUpdatingProgress}
              showActions={false}
              onToggleSession={toggleSession}
            />
            </div>
            {user ? <PlanAssistant planId={plan.id} userId={user.id} onPlanUpdated={setPlan} /> : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
