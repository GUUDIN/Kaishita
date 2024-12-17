import { client, subscribe, publish } from "./initializers/mqttClient"
import config from "~/.server/config/config";
import { saveValueToFile } from "~/.server/writeFile";

// MQTT config
const topic = config.address.weightTopic;
subscribe(topic);
console.log("load weigth");

// Weight variable
let weight: number | undefined;
const historySize = config.constants.weightHistorySize;
const sameWeightTolerance = config.constants.sameWeightTolerance;
const stableWeight = config.constants.stableWeight;
let history = new Array<number>(0);

// Weight change
function isSameWeight(w1: number, w2: number): boolean {
  const difference = Math.abs(w1 - w2);
  return difference <= sameWeightTolerance;
}

function cleanUpArray(array: Array<number>, changeRate: number, avarege: number) {
  const limitUp = avarege + changeRate;
  const limitDown = avarege - changeRate;

  array.forEach(element => {
    if (element > limitUp || element < limitDown) {
      const index = array.indexOf(element);
      array.splice(index, 1);
    }
  });
}

function getAvarege(array: Array<number>) {
  let sum = 0;
  array.forEach(e => {
    sum += e;
  });

  return sum / array.length;
}

function getChangeRate(array: Array<number> = history) {
  const avarege = getAvarege(array);
  let head = 0;
  array.forEach(w => {
    head += Math.pow(w - avarege, 2);
  });

  return Math.sqrt(head / array.length);
}

function isStable(changeRate: number) {
  return changeRate <= stableWeight;
}

function addWeightToHistory(weight: number, limit = historySize) {
  if (history.length >= limit) {
    history.shift(); // Remove o elemento mais antigo
  }
  history.push(weight);
}

// Callback
type WeightChangeCallback = (newWeight: number) => void;
const listeners: WeightChangeCallback[] = [];

function onWeightChange(newWeight: number) {
  listeners.forEach((listener) => listener(newWeight));
}

// Add listener
export function subscribeToWeightChange(listener: WeightChangeCallback) {
  listeners.push(listener);
  console.log("Listener registrado.");
}

// Remove listener
export function unsubscribeFromWeightChange(listener: WeightChangeCallback) {
  const index = listeners.indexOf(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
    console.log("Listener removido.");
  }
}

// MQTT events
// Message
client.on("message", (receivedTopic, message) => {
  if (receivedTopic === topic) {
    const newWeight = parseInt(message.toString());
    addWeightToHistory(newWeight);
    saveValueToFile(config.paths.mqttLogPath, `Received message on topic ${receivedTopic}: ${newWeight}`);
    let avarege = getAvarege(history);
    if (weight == undefined) {
      weight = avarege;
    }

    if ((history.length > 0.8 * historySize && !isSameWeight(avarege, weight))) {
      const changeRate = getChangeRate();

      if (isStable(changeRate)) {
        weight = avarege;
        cleanUpArray(history, changeRate, avarege);
        avarege = getAvarege(history);
        onWeightChange(avarege);
        saveValueToFile(config.paths.weightFilePath, weight.toString());
      }
    }
  }
});

export function getMqttWeight(): number | undefined {
  return weight;
}

export function getMqttWeightWithRetry(maxRetries: number, retryDelay: number): Promise<number> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    function tryFetch() {
      attempts++;
      const weight = getMqttWeight();

      //console.log(`Try ${attempts}:`, weight);

      if (weight !== undefined) {
        // Valid weight obtained
        resolve(weight);
      } else if (attempts >= maxRetries) {
        // Too many attempts
        reject(new Error("Não foi possível obter o peso após várias tentativas."));
      } else {
        // Try again
        setTimeout(tryFetch, retryDelay);
      }
    }

    tryFetch();
  });
}

export { onWeightChange };