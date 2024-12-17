import { LoaderFunction } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import { emitter } from "~/emitter";
import { getClientEventId } from "~/.server/initializers/communication";

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const clientId = url.searchParams.get("clientId") || "none";
    const eventId = getClientEventId(clientId);

    if (eventId != undefined) {
        return eventStream(request.signal, (send) => {
            // Função que será chamada toda vez que o emitter disparar um evento "update"
            const onUpdate = (data: any) => {
                send({
                    event: eventId,
                    data: JSON.stringify(data),
                });
            };

            // Adiciona o listener ao emitter
            emitter.on(eventId, onUpdate);

            // Retorna função de limpeza para remover o listener quando o cliente desconectar
            return () => {
                emitter.off(eventId, onUpdate);
            };
        });
    }
    else {
        console.log(`Client ${clientId} doesn't have an event id`);
        return null;
    }
};
