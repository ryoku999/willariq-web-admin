import { useQueryClient } from "@tanstack/react-query";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { operationsService } from "@/infrastructure/services/operations.service";
import { roleBase } from "@/shared/utils/operations-path";

type IncidentEvent = { id: string; version: number; isNew: boolean };

export function IncidentAlerts({
  userId,
  role,
}: {
  userId: string;
  role: string;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const preferenceKey = "willariq.incident-sound." + userId;
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(preferenceKey) === "on",
  );
  const [blocked, setBlocked] = useState(false);
  const [connected, setConnected] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    const api = new URL(
      import.meta.env.VITE_API_URL || "/",
      window.location.origin,
    );
    const socket = io(api.origin + "/incidents", {
      transports: ["websocket"],
      withCredentials: true,
    });
    let disposed = false;
    let refreshing = false;

    const refresh = () =>
      void queryClient.invalidateQueries({ queryKey: ["operations"] });
    socket.on("connect", () => {
      setConnected(true);
      refresh();
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("incident.changed", ({ id, isNew }: IncidentEvent) => {
      refresh();
      if (!isNew || seen.current.has(id)) return;
      if (seen.current.size >= 100) seen.current.clear();
      seen.current.add(id);
      toast.info("Nueva incidencia recibida", {
        id: "incident:" + id,
        action: {
          label: "Ver reporte",
          onClick: () => void navigate(roleBase(role) + "/incidents/" + id),
        },
      });
      if (role !== "OPERATOR") return;
      const play = async () => {
        if (
          disposed ||
          !audio.current ||
          localStorage.getItem(preferenceKey) !== "on"
        )
          return;
        const marker = preferenceKey + ".last";
        if (localStorage.getItem(marker) === id) return;
        try {
          await audio.current.play();
          localStorage.setItem(marker, id);
          if (!disposed) setBlocked(false);
        } catch {
          if (!disposed) setBlocked(true);
        }
      };
      if (navigator.locks) void navigator.locks.request(preferenceKey, play);
      else void play();
    });

    // A namespace rejection or server-side disconnect requires an explicit reconnect.
    // Use an authenticated HTTP call first so expired session cookies can be renewed.
    const retry = window.setInterval(async () => {
      if (socket.connected || socket.active || refreshing) return;
      refreshing = true;
      try {
        await operationsService.summary();
        if (!disposed) socket.connect();
      } catch {
        // The HTTP client handles session expiration. Network failures retry later.
      } finally {
        refreshing = false;
      }
    }, 10000);

    return () => {
      disposed = true;
      window.clearInterval(retry);
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [navigate, preferenceKey, queryClient, role]);

  async function toggleSound() {
    if (enabled && !blocked) {
      audio.current?.pause();
      localStorage.setItem(preferenceKey, "off");
      setEnabled(false);
      return;
    }
    const player = audio.current;
    if (!player) return;
    try {
      player.currentTime = 0;
      await player.play();
      localStorage.setItem(preferenceKey, "on");
      setEnabled(true);
      setBlocked(false);
    } catch {
      toast.error("No se pudo reproducir el sonido de aviso.");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={
          connected
            ? "badge badge-success badge-xs"
            : "badge badge-warning badge-xs"
        }
        role="status"
        aria-label={
          connected ? "Conectado en tiempo real" : "Actualización periódica"
        }
      />
      {role === "OPERATOR" && (
        <>
          <audio
            ref={audio}
            src={import.meta.env.BASE_URL + "nueva-incidencia.mp3"}
            preload="auto"
          />
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            aria-pressed={enabled && !blocked}
            onClick={() => void toggleSound()}
          >
            {enabled && !blocked ? (
              <Volume2 size={16} />
            ) : (
              <VolumeX size={16} />
            )}
            <span>{enabled && !blocked ? "Silenciar" : "Activar sonido"}</span>
          </button>
        </>
      )}
    </div>
  );
}
