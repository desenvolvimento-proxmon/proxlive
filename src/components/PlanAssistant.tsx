"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bot, Loader2, SendHorizonal } from "lucide-react";
import type { PlanQuestion, SerializedStudyPlan } from "@/lib/types";

type PlanAssistantProps = {
  planId: string;
  userId: string;
  onPlanUpdated?: (plan: SerializedStudyPlan) => void;
};

export function PlanAssistant({ planId, userId, onPlanUpdated }: PlanAssistantProps) {
  const [questions, setQuestions] = useState<PlanQuestion[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      setIsLoading(true);
      setMessage(null);

      try {
        const response = await fetch(`/api/study-plans/${planId}/ask?userId=${userId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Nao foi possivel carregar a conversa.");
        }

        setQuestions(data.questions);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro inesperado.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadQuestions();
  }, [planId, userId]);

  async function askQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) return;

    setIsSending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/study-plans/${planId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          question: trimmedQuestion
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel responder agora.");
      }

      setQuestions((current) => [...current, data.question]);
      setQuestion("");
      if (data.studyPlan) {
        onPlanUpdated?.(data.studyPlan);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
          <Bot className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-slate-950">Conversa sobre o plano</h3>
          <p className="text-sm leading-6 text-slate-500">
            Pode perguntar ou pedir mudancas. Se for algo que altera o cronograma, eu atualizo o plano para voce.
          </p>
        </div>
      </div>

      {message ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {message}
        </div>
      ) : null}

      <div className="mb-4 max-h-96 space-y-4 overflow-y-auto rounded-2xl bg-slate-50 p-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando conversa...
          </div>
        ) : null}

        {!isLoading && questions.length === 0 ? (
          <div className="max-w-[92%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
            Me diga o que voce precisa. Pode ser uma duvida ou um ajuste, por exemplo: sabado nao consigo estudar, joga essa parte para domingo.
          </div>
        ) : null}

        {questions.map((item) => (
          <div className="space-y-3" key={item.id}>
            <div className="ml-auto max-w-[88%] rounded-2xl bg-slate-950 px-4 py-3 text-sm leading-6 text-white">
              {item.question}
            </div>
            <div className="max-w-[92%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
              <FormattedAnswer text={item.answer} />
            </div>
          </div>
        ))}
      </div>

      <form className="flex flex-col gap-3 md:flex-row" onSubmit={askQuestion}>
        <input
          className="form-input"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Escreva como voce falaria comigo..."
        />
        <button className="primary-button px-4" disabled={isSending} type="submit">
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
          Enviar
        </button>
      </form>
    </section>
  );
}

function FormattedAnswer({ text }: { text: string }) {
  const cleaned = text.replace(/\*\*/g, "").replace(/#{1,6}\s?/g, "").trim();
  const lines = cleaned
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return <p>{cleaned}</p>;
  }

  return (
    <div className="space-y-2">
      {lines.map((line) => (
        <p key={line}>{line.replace(/^[-*]\s+/, "")}</p>
      ))}
    </div>
  );
}
