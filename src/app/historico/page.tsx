"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  History,
  Loader2,
  Plus,
  Trash2
} from "lucide-react";
import { UserBadge } from "@/components/UserBadge";
import { formatDate, type AppUser, type SerializedStudyPlan } from "@/lib/types";

const USER_STORAGE_KEY = "studyplanner:user";

export default function HistoryPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [plans, setPlans] = useState<SerializedStudyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPlans = useCallback(async (userId: string) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/study-plans?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel carregar o historico.");
      }

      setPlans(data.studyPlans);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);

    if (!storedUser) {
      setIsLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(storedUser) as AppUser;
      setUser(parsed);
      void loadPlans(parsed.id);
    } catch {
      window.localStorage.removeItem(USER_STORAGE_KEY);
      setIsLoading(false);
    }
  }, [loadPlans]);

  async function deletePlan(planId: string) {
    if (!user) return;
    const confirmed = window.confirm("Excluir este cronograma do historico?");

    if (!confirmed) return;

    setDeletingId(planId);
    setMessage(null);

    try {
      const response = await fetch(`/api/study-plans/${planId}?userId=${user.id}`, {
        method: "DELETE"
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel excluir o cronograma.");
      }

      setPlans((current) => current.filter((plan) => plan.id !== planId));
      setMessage("Cronograma excluido.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link className="flex items-center gap-3 text-sm font-semibold text-slate-700" href="/">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <UserBadge user={user} />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              <History className="h-4 w-4" />
              Historico
            </p>
            <h1 className="text-4xl font-black text-slate-950">Cronogramas gerados</h1>
            <p className="mt-2 text-slate-500">Consulte, abra detalhes ou exclua planos salvos.</p>
          </div>
          <Link className="primary-button" href="/">
            <Plus className="h-4 w-4" />
            Abrir dashboard
          </Link>
        </div>

        {message ? (
          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700">
            {message}
          </div>
        ) : null}

        {!user && !isLoading ? (
          <div className="panel text-center">
            <h2 className="text-2xl font-bold text-slate-950">Identificacao necessaria</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              Para ver o historico, informe nome e e-mail na tela inicial. O usuario fica salvo no navegador.
            </p>
            <Link className="primary-button mt-6" href="/">
              Entrar
            </Link>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center rounded-lg border border-slate-200 bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : null}

        {user && !isLoading && plans.length === 0 ? (
          <div className="panel text-center">
            <h2 className="text-2xl font-bold text-slate-950">Nenhum cronograma ainda</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              Gere seu primeiro plano para que ele apareca aqui automaticamente.
            </p>
            <Link className="primary-button mt-6" href="/">
              Criar meu cronograma
            </Link>
          </div>
        ) : null}

        {plans.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {plans.map((plan) => (
              <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft" key={plan.id}>
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      <CalendarDays className="h-4 w-4" />
                      Criado em {formatDate(plan.createdAt)}
                    </p>
                    <h2 className="text-2xl font-bold text-slate-950">{plan.objective}</h2>
                    <p className="mt-1 text-sm text-slate-500">Prazo: {formatDate(plan.deadline)}</p>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {plan.level}
                  </span>
                </div>

                <p className="line-clamp-3 text-sm leading-6 text-slate-600">{plan.aiResponse.summary}</p>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-600">Andamento</span>
                    <span className="font-bold text-slate-950">{plan.progressPercent}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${plan.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link className="secondary-button flex-1" href={`/historico/${plan.id}`}>
                    <ExternalLink className="h-4 w-4" />
                    Abrir detalhes
                  </Link>
                  <button
                    className="secondary-button border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
                    disabled={deletingId === plan.id}
                    type="button"
                    onClick={() => deletePlan(plan.id)}
                  >
                    {deletingId === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
