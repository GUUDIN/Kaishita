// import { tare } from "../tare"
import { subscribeToWeightChange, unsubscribeFromWeightChange, getMqttWeightWithRetry } from "../mqttWeight"
import { Buy } from "~/classes/buy"
import { getBuyWeight } from "./productManager"
import { sendMessageToClient } from "./communication";
import config from "../config/config";

const tolerance = config.constants.targetWeightTolerance;

function isTargetWeight(weight: number, target: number): { result: boolean, difference: number } {
    const difference = weight - target;
    const result = Math.abs(difference) <= tolerance;
    return { result: result, difference: difference };
}

function manageWithdrawal(buy: Buy, clientId: string, weight: number) {
    const targetWeight = weight - getBuyWeight(buy);
    const validateBuy = (newWeight: number) => {
        let statusMessage: string;
        let status: string;
        console.log(`target: ${targetWeight}`);
        console.log(`weight: ${newWeight}`);
        const { result, difference } = isTargetWeight(newWeight, targetWeight);
        console.log(`difference: ${difference}`);
        if (result) {
            statusMessage = "Retirada realizada com sucesso!";
            status = "success";
            unsubscribeFromWeightChange(validateBuy);
            processNextWithdrawal(clientId);
        } else {
            statusMessage = `Atenção: ${difference > 0 ? "falta retirar produtos" : "produtos a mais foram retirados"}!`;
            status = "fail";
        }

        sendMessageToClient(clientId, { type: "withdrawalResult", status: status, message: statusMessage });
    };

    subscribeToWeightChange(validateBuy);
}

let witgdrawalList = new Map<string, Buy>();
let clientList = new Array<string>();
let withdrawalStart = false;

export function getWithdrawal(clientId: string) {
    const position = clientList.indexOf(clientId);
    let status: string;
    let message: string;
    if (position > 0) {
        status = "waiting";
        message = "Esperando outros pegarem a compra";
    }
    else if(position == 0) {
        status = "ongoing";
        message = "Pegue a compra";
    }
    else{
        status = "buying";
        message = "Esperando a compra dos produtos";
    }
    return { type: "withdrawal", status: status, message: message, position: position, Buy: witgdrawalList.get(clientId) };
}

export function clientHasWithdrawal(clientId: string) {
    return witgdrawalList.has(clientId);
}

export function addWithdrawal(clientId: string, buy: Buy) {
    console.log(`Adding ${clientId} withdrawal`);
    witgdrawalList.set(clientId, buy);
    clientList.push(clientId);
    
    sendMessageToClient(clientId, getWithdrawal(clientId));
    if (!withdrawalStart) {
        withdrawalStart = true;
        startWithdrawal(buy, clientId);
    }
}

function updateClientsWithdrawal() {
    clientList.forEach(clientId => {
        sendMessageToClient(clientId, getWithdrawal(clientId));
    });
}

function processNextWithdrawal(clientId: string) {
    witgdrawalList.delete(clientId);
    const clientIndex = clientList.indexOf(clientId);
    if (clientIndex > -1) {
        clientList.splice(clientIndex, 1);
    }
    if (witgdrawalList.size !== clientList.length) {
        throw new Error("Withdrawal list and client list are not the same size");
    }
    else if (witgdrawalList.size > 0 && clientList.length > 0) {
        const nextClientId = clientList[0];
        const nextBuy = witgdrawalList.get(nextClientId);
        if (nextBuy) {
            startWithdrawal(nextBuy, nextClientId);
        }
        else {
            console.error("Buy not found of client: ", nextClientId);
            processNextWithdrawal(nextClientId);
        }
    } else {
        withdrawalStart = false;
    }

    updateClientsWithdrawal();
}

function startWithdrawal(buy: Buy, clientId: string) {
    //tare();
    getMqttWeightWithRetry(5, 2000) // Try 5 times and wait 2 seconds each time
        .then((weight) => {
            manageWithdrawal(buy, clientId, weight);
        })
        .catch((error) => {
            console.error("Error:", error.message);
        });
}