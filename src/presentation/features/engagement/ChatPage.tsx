import { enumLabel, operationalMessage } from "@/shared/utils/enum-labels";
import { useEffect, useState } from "react";
import type { ChatInput } from "@/core/entities/engagement.entity";
import {
  useChatJob,
  useChatMessages,
  useChatSession,
  useChatSessions,
  useEngagementAction,
} from "@/infrastructure/hooks/use-engagement";
import {
  Field,
  Pager,
  PanelPage,
  QueryView,
} from "@/presentation/components/PanelControls";
import { errorMessage } from "@/shared/utils/panel-format";

function Conversation({ id }: { id: string }) {
  const [content, setContent] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [request, setRequest] = useState<ChatInput | null>(null);
  const [jobId, setJobId] = useState("");
  const session = useChatSession(id);
  const messages = useChatMessages(id);
  const job = useChatJob(jobId);
  const send = useEngagementAction("send");
  const close = useEngagementAction("close");
  const jobState = job.data?.status;
  const done = jobState === "COMPLETED";
  const refreshMessages = messages.refetch;
  useEffect(() => {
    if (done) void refreshMessages();
  }, [done, refreshMessages, jobId]);
  const waiting =
    !!jobId &&
    (!jobState || ["PENDING", "QUEUED", "PROCESSING"].includes(jobState));
  const dead = job.data?.dispatchStatus === "DEAD";
  const busy = send.isPending || close.isPending;
  return (
    <QueryView query={session}>
      {(conversation) => (
        <section className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold">
              {conversation.title ?? "Conversación"} ·{" "}
              {enumLabel(conversation.status, "conversation")}
            </h2>
            <div className="flex gap-2">
              <button
                className="btn btn-sm"
                onClick={() => void messages.refetch()}
              >
                Actualizar mensajes
              </button>
              {conversation.status === "ACTIVE" && (
                <button
                  className="btn btn-sm"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm("¿Cerrar esta conversación?"))
                      close.mutate([id]);
                  }}
                >
                  Cerrar conversación
                </button>
              )}
            </div>
          </div>
          <QueryView query={messages}>
            {({ pages }) => {
              const newestFirst = pages.flatMap((page) => page.items);
              const chronological = [
                ...new Map(
                  newestFirst.map((message) => [message.id, message]),
                ).values(),
              ].reverse();
              return (
                <>
                  {messages.hasNextPage && (
                    <button
                      type="button"
                      className="btn btn-sm w-fit"
                      disabled={messages.isFetchingNextPage}
                      onClick={() => void messages.fetchNextPage()}
                    >
                      {messages.isFetchingNextPage
                        ? "Cargando mensajes…"
                        : "Cargar mensajes anteriores"}
                    </button>
                  )}
                  <ol className="grid gap-3">
                    {chronological.map((x) => (
                      <li
                        key={x.id}
                        className={`rounded-xl border border-base-300 p-4 ${x.role === "USER" ? "bg-primary/10" : "bg-base-100"}`}
                      >
                        <strong>
                          {x.role === "USER" ? "Tú" : "Asistente"}
                        </strong>
                        <p className="whitespace-pre-wrap break-words">
                          {x.role === "ASSISTANT"
                            ? operationalMessage(x.content)
                            : x.content}
                        </p>
                        {!!x.metadata?.sources?.length && (
                          <ul
                            className="mt-2 border-t border-base-300 pt-2 text-sm"
                            aria-label="Fuentes"
                          >
                            {x.metadata.sources.map((source) => (
                              <li key={source.chunkId}>
                                [{source.ref}] {source.title} ·{" "}
                                {source.section.join(" › ") || "Documento"} ·
                                fragmento {source.chunkIndex + 1}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                </>
              );
            }}
          </QueryView>
          {jobId && (
            <p className="text-sm" aria-live="polite">
              Trabajo: {jobState ? enumLabel(jobState, "job") : "Consultando"}{" "}
              {job.data?.errorSummary &&
                `· ${enumLabel(job.data.errorSummary)}`}
            </p>
          )}
          {dead && request && conversation.status === "ACTIVE" && (
            <button
              className="btn"
              disabled={busy}
              onClick={() => send.mutate([id, request])}
            >
              Reactivar despacho
            </button>
          )}
          {(send.error || job.error || close.error) && (
            <p className="alert alert-error" role="alert">
              {errorMessage(send.error ?? job.error ?? close.error)}
            </p>
          )}
          {conversation.status === "ACTIVE" && (
            <form
              className="grid gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const text = content.trim();
                if (!text) return;
                const code = trackingCode.trim().toUpperCase() || undefined;
                const payload =
                  send.isError &&
                  request?.content === text &&
                  request.trackingCode === code
                    ? request
                    : {
                        clientRequestId: crypto.randomUUID(),
                        content: text,
                        trackingCode: code,
                      };
                setRequest(payload);
                send.mutate([id, payload], {
                  onSuccess: (value) => {
                    setJobId(value.job.id);
                    setContent("");
                    setTrackingCode("");
                  },
                });
              }}
            >
              <Field label="Pregunta o consulta de seguimiento">
                <textarea
                  className="textarea w-full"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  maxLength={4000}
                />
              </Field>
              <Field label="Código de incidencia opcional">
                <input
                  className="input"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  maxLength={30}
                />
              </Field>
              <button
                className="btn btn-primary justify-self-start"
                disabled={busy || waiting || !content.trim()}
              >
                Enviar pregunta
              </button>
            </form>
          )}
        </section>
      )}
    </QueryView>
  );
}
export default function ChatPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState("");
  const sessions = useChatSessions(page);
  const create = useEngagementAction("createSession");
  return (
    <PanelPage
      title="Prueba de chatbot"
      description="Consulta el conocimiento publicado o el estado de una incidencia accesible para tu cuenta."
    >
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const title = String(
            new FormData(e.currentTarget).get("title") ?? "",
          ).trim();
          create.mutate([title || undefined], {
            onSuccess: (value) => {
              setSelected(value.id);
              setPage(1);
            },
          });
        }}
      >
        <Field label="Título opcional">
          <input className="input" name="title" maxLength={180} />
        </Field>
        <button className="btn btn-primary" disabled={create.isPending}>
          Nueva conversación
        </button>
      </form>
      {create.error && (
        <p className="alert alert-error" role="alert">
          {errorMessage(create.error)}
        </p>
      )}
      <QueryView query={sessions}>
        {(data) => (
          <>
            <div className="flex flex-wrap gap-2">
              {data.items.map((session) => (
                <button
                  key={session.id}
                  className={`btn btn-sm ${selected === session.id ? "btn-primary" : ""}`}
                  onClick={() => setSelected(session.id)}
                >
                  {session.title ?? "Conversación"} ·{" "}
                  {enumLabel(session.status, "conversation")}
                </button>
              ))}
            </div>
            <Pager data={data} onPage={setPage} />
          </>
        )}
      </QueryView>
      {selected && <Conversation key={selected} id={selected} />}
    </PanelPage>
  );
}
