import { remember } from "@epic-web/remember";
import { randomBytes } from "crypto";
import { timeout } from "remix-utils/promise";

import { emitter } from "~/emitter";

const clients = new Map<string, { eventId: string; timeout: NodeJS.Timeout }>();
const timeoutTime = 15 * 60 * 1000; // 15 minutes

function random(): string {
  return randomBytes(16).toString("hex");
}

export function getClientEventId(clientId: string): string | undefined {
  if (validateClient(clientId)) {
    const clientData = getClientData(clientId);
    return `${clientData?.eventId}`;
  } else {
    return undefined;
  }
}

function clientEventId(clientId: string): string {
  return `event_${clientId}`;
}

export function validateClient(clientId: string): boolean {
  return clients.has(clientId);
}

export function addClient(): string {
  let clientId: string;
  do {
    clientId = random();
  } while (clients.has(clientId) || clientId === "none");

  const eventId = clientEventId(clientId);

  const timeout = setTimeout(() => {
    removeClient(clientId);
  }, timeoutTime);

  clients.set(clientId, { eventId, timeout });
  console.log(`Cliente ${clientId} conectado`);

  return clientId;
}

function getClientData(clientId: string) {
  const clientData = clients.get(clientId);
  if (clientData) {
    clearTimeout(clientData.timeout);
    clientData.timeout = setTimeout(() => {
      removeClient(clientId);
    }, timeoutTime);

    return clientData;
  }
  else {
    return undefined;
  }
}

export function sendMessageToClient(clientId: string, message: any) {
  const clientData = getClientData(clientId);
  if (clientData) {
    emitter.emit(clientData.eventId, message);
    console.log(`Mensage send to client ${clientId}:`, message);
  } else {
    console.error(`Client ${clientId} isn't connected`);
  }
}

function removeClient(clientId: string) {
  if (clients.has(clientId)) {
    clients.delete(clientId);
    console.log(`Client ${clientId} was removed due to inativity`);
  }
}
