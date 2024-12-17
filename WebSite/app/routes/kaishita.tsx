import type { MetaFunction, ActionFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { LoaderFunction, redirect } from "react-router";

import { ProductBuy, Buy } from "~/classes/buy";
import { Product } from "~/classes/product";

import ProductComponent from "~/components/product"

import { addWithdrawal, clientHasWithdrawal, getWithdrawal } from "~/.server/initializers/withdrawal"
import { saveBuyToCSV } from "~/.server/storeProductsBuy";
import { getClientEventId, validateClient } from "~/.server/initializers/communication";

export const meta: MetaFunction = () => {
    return [
        { title: "Kaishita" },
        { name: "description", content: "Kaishita home page!" },
    ];
};

async function callWithdrawal(clientId: string, buy: Buy) {
    addWithdrawal(clientId, buy);
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    let productsBuy = new Array();
    const date = new Date();
    const clientId = formData.get("clientId") as string;
    const hasWithdrawal = clientHasWithdrawal(clientId);

    if (hasWithdrawal) {
        return { success: false, message: "Cliente já possui uma retirada em andamento!" };
    }

    for (const [key, value] of formData.entries()) {
        if (key.includes("quantity_")) {
            const newProduct = new Product(key.replace("quantity_", ""), 20);
            const newProductBuy = new ProductBuy(newProduct, parseInt(value as string));
            if(newProductBuy.quantity > 0){
                productsBuy.push(newProductBuy);
            }
        }
    }

    // Fazer validacao
    console.log(`Compra de: ${clientId}`);
    console.log(productsBuy);

    if(productsBuy.length <= 0){
        return { success: false, message: "Escolha algum produto!" };
    }
    const buy = new Buy(productsBuy);

    // Armazenamento
    saveBuyToCSV(buy);

    // Iniciar retirada
    callWithdrawal(clientId, buy);

    return { success: true, message: "Retirada iniciada!" };
}

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const clientId = url.searchParams.get("clientId") || "none";

    if (validateClient(clientId)) {
        const event = getClientEventId(clientId);
        return Response.json({ clientId: clientId, emmiter: event, withdrawal: getWithdrawal(clientId) });
    }
    else {
        return redirect("/");
    }
}

export default function Kaishita() {
    const actionData = useActionData<{ success: boolean; message: string }>();
    const { clientId, emmiter, withdrawal } = useLoaderData<{ clientId: string, emmiter: string, withdrawal: any }>();

    const [buy, setBuy] = useState<Buy | undefined>(undefined);
    let [withdrawalMessage, setWithdrawalMessage] = useState("");
    let [withdrawalPosition, setWithdrawalPosition] = useState("");

    useEffect(() => {
        setWithdrawalMessage(withdrawal.message);
        if (withdrawal.status === "waiting") {
            setWithdrawalPosition(`posição ${withdrawal.position}`);
        }
        else {
            setWithdrawalPosition("");
        }
        setBuy(withdrawal.Buy);
    }, []);

    useEffect(() => {
        if (!clientId) {
            console.log("Loading clientId");
            return;
        }

        const eventSource = new EventSource(`/getStream?clientId=${clientId}`);
        if (!eventSource) {
            console.log("EventSource not available");
            return;
        }

        eventSource.addEventListener(emmiter, (event: MessageEvent) => {
            const parsedState = JSON.parse(event.data);
            console.log(parsedState);

            if (parsedState.type === "withdrawal") {
                // console.log(1);
                setBuy(parsedState.Buy);
                if (parsedState.status === "waiting") {
                    setWithdrawalPosition(`posição ${parsedState.position}`);
                }
                else {
                    setWithdrawalPosition("");
                }
                setWithdrawalMessage(parsedState.message);
            }
            else if (parsedState.type === "withdrawalResult") {
                // console.log(2);
                if (parsedState.status === "success") {
                    setBuy(undefined);
                    setWithdrawalPosition("");
                    setWithdrawalMessage("");
                    alert(parsedState.message);
                }
                else {
                    alert(parsedState.message);
                }
            }
        });

        return () => {
            eventSource.close();
        };
    }, [clientId, withdrawal]);

    useEffect(() => {
        if (actionData) {
            if (!actionData.success) {
                alert(actionData.message);
            }
        }
    }, [actionData]);

    return (
        <div style={styles.container}>
            <Form method="post">
                <input type="hidden" name="clientId" value={clientId || ""} />
                <ProductComponent name="Kit-Kat" image_href="kit-kat.png" />
                <ProductComponent name="Mentos" image_href="mentos.png" />
                <button style={styles.button} type="submit">Comprar</button>
            </Form>
            <h1>{withdrawalMessage}</h1>
            <h1>{withdrawalPosition}</h1>
        </div>
    )
}

const styles = {
    container: {
        display: "flex",
        flexDirection: "column" as "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
    },
    logo: {
        width: "100px",
        height: "100px",
    },
    title: {
        fontSize: "2rem",
        fontWeight: "bold",
        margin: "1rem",
    },
    description: {
        fontSize: "1.5rem",
        margin: "1rem",
    },
    button: {
        padding: "0.5rem 1rem",
        fontSize: "1.25rem",
        backgroundColor: "#333",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    }
}