"use client";

type RealtimeCommand =
  | { type: "typing.set"; conversation_id: string; is_typing: boolean }
  | { type: "presence.set"; conversation_id: string; status: "available" | "away" };

let connection: WebSocket | null = null;

export function setRealtimeConnection(next: WebSocket | null) {
  connection = next;
}

export function sendRealtimeCommand(command: RealtimeCommand) {
  if (connection?.readyState === WebSocket.OPEN) connection.send(JSON.stringify(command));
}
