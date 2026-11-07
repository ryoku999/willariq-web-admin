import { useState } from "react";
import {
  useEngagementAction,
  useNotifications,
  useUnreadCount,
} from "@/infrastructure/hooks/use-engagement";
import {
  Pager,
  PanelPage,
  PanelTable,
  QueryView,
} from "@/presentation/components/PanelControls";
import { errorMessage, formatDate } from "@/shared/utils/panel-format";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [unread, setUnread] = useState(false);
  const query = useNotifications(page, unread);
  const count = useUnreadCount();
  const read = useEngagementAction("read");
  const readAll = useEngagementAction("readAll");
  const busy = read.isPending || readAll.isPending;
  return (
    <PanelPage title="Notificaciones">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={unread}
            onChange={(e) => {
              setUnread(e.target.checked);
              setPage(1);
            }}
          />
          Solo sin leer
        </label>
        <button
          className="btn"
          disabled={busy || count.data?.count === 0}
          onClick={() => readAll.mutate([], { onSuccess: () => setPage(1) })}
        >
          Marcar todas como leídas
        </button>
        {count.data && (
          <span className="badge">{count.data.count} sin leer</span>
        )}
      </div>
      {(read.error || readAll.error || count.error) && (
        <p role="alert" className="alert alert-error">
          {errorMessage(read.error ?? readAll.error ?? count.error)}
        </p>
      )}
      <QueryView query={query}>
        {(data) => (
          <>
            <PanelTable headers={["Fecha", "Aviso", "Acción"]}>
              {data.items.map((x) => (
                <tr key={x.id}>
                  <td>{formatDate(x.createdAt)}</td>
                  <td>
                    <strong>{x.title}</strong>
                    <p>{x.body}</p>
                  </td>
                  <td>
                    {x.readAt ? (
                      "Leída"
                    ) : (
                      <button
                        className="btn btn-sm"
                        disabled={busy}
                        onClick={() =>
                          read.mutate([x.id], {
                            onSuccess: () => {
                              if (unread && data.items.length === 1)
                                setPage(Math.max(1, page - 1));
                            },
                          })
                        }
                      >
                        Marcar leída
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </PanelTable>
            <Pager data={data} onPage={setPage} />
          </>
        )}
      </QueryView>
    </PanelPage>
  );
}
