import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Shared Socket.IO connection (no auth — server gateway is public).
 * `autoConnect: false` so hooks own the connect/disconnect lifecycle.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL ?? "http://localhost:3000", {
      autoConnect: false,
      withCredentials: false,
    });
  }
  return socket;
}
