var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, redirect as redirect$1 } from "@remix-run/node";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, useActionData, useLoaderData, Form } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { eventStream } from "remix-utils/sse/server";
import { EventEmitter } from "events";
import { remember } from "@epic-web/remember";
import { randomBytes } from "crypto";
import { useState, useEffect } from "react";
import { redirect } from "react-router";
import mqtt from "mqtt";
import * as fs from "fs";
import fs__default from "fs";
import * as path from "path";
import path__default from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path__default.dirname(__filename);
const configPath = path__default.resolve(__dirname, "config.json");
const config = JSON.parse(fs__default.readFileSync(configPath, "utf-8"));
const brokerUrl = config.address.brokerUrl;
const client = mqtt.connect(brokerUrl);
client.on("connect", () => {
  console.log(`Conecting to broaker : ${brokerUrl}`);
});
function subscribe(topic2) {
  client.subscribe(topic2, (err) => {
    if (err) {
      console.error(`Error while trying to subscribe to topic ${topic2}:`, err);
    } else {
      console.log(`Listenig to topic: ${topic2}`);
    }
  });
}
client.on("error", (err) => {
  console.error("Error on conection MQTT:", err);
});
function getBuyWeight(buy) {
  let totalWeight = 0;
  buy.productsBuy.forEach((product) => {
    totalWeight += product.product.weight * product.quantity;
  });
  return totalWeight;
}
const productsCsvFilepath = config.paths.productListPath;
let products = parseCSVToProductList(productsCsvFilepath);
console.log("Product list");
console.log(products);
function parseCSVToProductList(csvFilePath) {
  var _a;
  const csvContent = fs.readFileSync(path.resolve(csvFilePath), "utf-8");
  const lines = csvContent.split("\n").map((line) => line.trim()).filter((line) => line);
  const header = (_a = lines.shift()) == null ? void 0 : _a.split(",").map((col) => col.trim());
  if (!header) {
    throw new Error(`Arquivo CSV ${productsCsvFilepath} vazio ou inválido`);
  }
  const products2 = lines.map((line) => {
    const values = line.split(",").map((value) => value.trim());
    const product = {
      name: values[header.indexOf("name")],
      weight: parseFloat(values[header.indexOf("weight")]),
      price: parseFloat(values[header.indexOf("price")]),
      image_href: values[header.indexOf("image_href")] || void 0,
      description: values[header.indexOf("description")] || void 0
    };
    return product;
  });
  return products2;
}
const emitter = remember("emitter", () => new EventEmitter());
const clients = /* @__PURE__ */ new Map();
const timeoutTime = 15 * 60 * 1e3;
function random() {
  return randomBytes(16).toString("hex");
}
function getClientEventId(clientId) {
  if (validateClient(clientId)) {
    const clientData = getClientData(clientId);
    return `${clientData == null ? void 0 : clientData.eventId}`;
  } else {
    return void 0;
  }
}
function clientEventId(clientId) {
  return `event_${clientId}`;
}
function validateClient(clientId) {
  return clients.has(clientId);
}
function addClient() {
  let clientId;
  do {
    clientId = random();
  } while (clients.has(clientId) || clientId === "none");
  const eventId = clientEventId(clientId);
  const timeout2 = setTimeout(() => {
    removeClient(clientId);
  }, timeoutTime);
  clients.set(clientId, { eventId, timeout: timeout2 });
  console.log(`Cliente ${clientId} conectado`);
  return clientId;
}
function getClientData(clientId) {
  const clientData = clients.get(clientId);
  if (clientData) {
    clearTimeout(clientData.timeout);
    clientData.timeout = setTimeout(() => {
      removeClient(clientId);
    }, timeoutTime);
    return clientData;
  } else {
    return void 0;
  }
}
function sendMessageToClient(clientId, message) {
  const clientData = getClientData(clientId);
  if (clientData) {
    emitter.emit(clientData.eventId, message);
    console.log(`Mensage send to client ${clientId}:`, message);
  } else {
    console.error(`Client ${clientId} isn't connected`);
  }
}
function removeClient(clientId) {
  if (clients.has(clientId)) {
    clients.delete(clientId);
    console.log(`Client ${clientId} was removed due to inativity`);
  }
}
function saveValueToFile(filePath, value) {
  if (!fs__default.existsSync(filePath)) {
    fs__default.writeFileSync(filePath, "");
  }
  const existingContent = fs__default.readFileSync(filePath, "utf-8");
  const newContent = `${value}
${existingContent}`;
  fs__default.writeFileSync(filePath, newContent, "utf-8");
}
const topic = config.address.weightTopic;
subscribe(topic);
console.log("load weigth");
let weight;
const historySize = config.constants.weightHistorySize;
const sameWeightTolerance = config.constants.sameWeightTolerance;
const stableWeight = config.constants.stableWeight;
let history = new Array(0);
function isSameWeight(w1, w2) {
  const difference = Math.abs(w1 - w2);
  return difference <= sameWeightTolerance;
}
function cleanUpArray(array, changeRate, avarege) {
  const limitUp = avarege + changeRate;
  const limitDown = avarege - changeRate;
  array.forEach((element) => {
    if (element > limitUp || element < limitDown) {
      const index = array.indexOf(element);
      array.splice(index, 1);
    }
  });
}
function getAvarege(array) {
  let sum = 0;
  array.forEach((e) => {
    sum += e;
  });
  return sum / array.length;
}
function getChangeRate(array = history) {
  const avarege = getAvarege(array);
  let head = 0;
  array.forEach((w) => {
    head += Math.pow(w - avarege, 2);
  });
  return Math.sqrt(head / array.length);
}
function isStable(changeRate) {
  return changeRate <= stableWeight;
}
function addWeightToHistory(weight2, limit = historySize) {
  if (history.length >= limit) {
    history.shift();
  }
  history.push(weight2);
}
const listeners = [];
function onWeightChange(newWeight) {
  listeners.forEach((listener) => listener(newWeight));
}
function subscribeToWeightChange(listener) {
  listeners.push(listener);
  console.log("Listener registrado.");
}
function unsubscribeFromWeightChange(listener) {
  const index = listeners.indexOf(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
    console.log("Listener removido.");
  }
}
client.on("message", (receivedTopic, message) => {
  if (receivedTopic === topic) {
    const newWeight = parseInt(message.toString());
    addWeightToHistory(newWeight);
    saveValueToFile(config.paths.mqttLogPath, `Received message on topic ${receivedTopic}: ${newWeight}`);
    let avarege = getAvarege(history);
    if (weight == void 0) {
      weight = avarege;
    }
    if (history.length > 0.8 * historySize && !isSameWeight(avarege, weight)) {
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
function getMqttWeight() {
  return weight;
}
function getMqttWeightWithRetry(maxRetries, retryDelay) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    function tryFetch() {
      attempts++;
      const weight2 = getMqttWeight();
      if (weight2 !== void 0) {
        resolve(weight2);
      } else if (attempts >= maxRetries) {
        reject(new Error("Não foi possível obter o peso após várias tentativas."));
      } else {
        setTimeout(tryFetch, retryDelay);
      }
    }
    tryFetch();
  });
}
const tolerance = config.constants.targetWeightTolerance;
function isTargetWeight(weight2, target) {
  const difference = weight2 - target;
  const result = Math.abs(difference) <= tolerance;
  return { result, difference };
}
function manageWithdrawal(buy, clientId, weight2) {
  const targetWeight = weight2 - getBuyWeight(buy);
  const validateBuy = (newWeight) => {
    let statusMessage;
    let status;
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
    sendMessageToClient(clientId, { type: "withdrawalResult", status, message: statusMessage });
  };
  subscribeToWeightChange(validateBuy);
}
let witgdrawalList = /* @__PURE__ */ new Map();
let clientList = new Array();
let withdrawalStart = false;
function getWithdrawal(clientId) {
  const position = clientList.indexOf(clientId);
  let status;
  let message;
  if (position > 0) {
    status = "waiting";
    message = "Esperando outros pegarem a compra";
  } else if (position == 0) {
    status = "ongoing";
    message = "Pegue a compra";
  } else {
    status = "buying";
    message = "Esperando a compra dos produtos";
  }
  return { type: "withdrawal", status, message, position, Buy: witgdrawalList.get(clientId) };
}
function clientHasWithdrawal(clientId) {
  return witgdrawalList.has(clientId);
}
function addWithdrawal(clientId, buy) {
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
  clientList.forEach((clientId) => {
    sendMessageToClient(clientId, getWithdrawal(clientId));
  });
}
function processNextWithdrawal(clientId) {
  witgdrawalList.delete(clientId);
  const clientIndex = clientList.indexOf(clientId);
  if (clientIndex > -1) {
    clientList.splice(clientIndex, 1);
  }
  if (witgdrawalList.size !== clientList.length) {
    throw new Error("Withdrawal list and client list are not the same size");
  } else if (witgdrawalList.size > 0 && clientList.length > 0) {
    const nextClientId = clientList[0];
    const nextBuy = witgdrawalList.get(nextClientId);
    if (nextBuy) {
      startWithdrawal(nextBuy, nextClientId);
    } else {
      console.error("Buy not found of client: ", nextClientId);
      processNextWithdrawal(nextClientId);
    }
  } else {
    withdrawalStart = false;
  }
  updateClientsWithdrawal();
}
function startWithdrawal(buy, clientId) {
  getMqttWeightWithRetry(5, 2e3).then((weight2) => {
    manageWithdrawal(buy, clientId, weight2);
  }).catch((error) => {
    console.error("Error:", error.message);
  });
}
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  }
];
function Layout({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: App,
  links
}, Symbol.toStringTag, { value: "Module" }));
const loader$2 = async ({ request }) => {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId") || "none";
  const eventId = getClientEventId(clientId);
  if (eventId != void 0) {
    return eventStream(request.signal, (send) => {
      const onUpdate = (data) => {
        send({
          event: eventId,
          data: JSON.stringify(data)
        });
      };
      emitter.on(eventId, onUpdate);
      return () => {
        emitter.off(eventId, onUpdate);
      };
    });
  } else {
    console.log(`Client ${clientId} doesn't have an event id`);
    return null;
  }
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
class ProductBuy {
  constructor(product, quantity) {
    this.product = product;
    this.quantity = quantity;
  }
}
class Buy {
  constructor(productsBuy) {
    __publicField(this, "time");
    this.productsBuy = productsBuy;
    this.time = /* @__PURE__ */ new Date();
  }
}
class Product {
  constructor(name, weight2, price, image_href, description) {
    this.name = name;
    this.weight = weight2;
    this.price = price;
    this.image_href = image_href;
    this.description = description;
  }
}
function ProductComponent({ name, image_href }) {
  let [quantityValue, setQuantityValue] = useState(0);
  function ChangeQuantityBy(value) {
    setQuantityValue((prev) => Math.max(0, prev + value));
  }
  const AddButton = () => /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      style: { ...styles$2.btn, ...styles$2.btnMore, ...styles$2.btnHover },
      onMouseOver: (e) => e.currentTarget.style.backgroundColor = "#388e3c",
      onMouseOut: (e) => e.currentTarget.style.backgroundColor = "#4caf50",
      onClick: (e) => {
        e.preventDefault();
        ChangeQuantityBy(1);
      },
      children: "+"
    }
  );
  const SubtractButton = () => /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      style: { ...styles$2.btn, ...styles$2.btnLess, ...styles$2.btnHover },
      onMouseOver: (e) => e.currentTarget.style.backgroundColor = "#d32f2f",
      onMouseOut: (e) => e.currentTarget.style.backgroundColor = "#f44336",
      onClick: () => {
        ChangeQuantityBy(-1);
      },
      children: "-"
    }
  );
  return /* @__PURE__ */ jsxs("div", { className: "Product", style: styles$2.productCard, children: [
    /* @__PURE__ */ jsx("img", { src: image_href, alt: name, style: styles$2.productImage }),
    /* @__PURE__ */ jsx("h2", { style: styles$2.productName, children: name }),
    /* @__PURE__ */ jsxs("div", { style: styles$2.productControls, children: [
      /* @__PURE__ */ jsx(SubtractButton, {}),
      /* @__PURE__ */ jsx(
        "input",
        {
          inputMode: "numeric",
          name: `quantity_${name}`,
          style: styles$2.quantityInput,
          min: "0",
          placeholder: "0",
          value: quantityValue,
          onChange: (e) => {
            const value = parseInt(e.target.value, 10);
            setQuantityValue(isNaN(value) ? 0 : Math.max(0, value));
          }
        }
      ),
      /* @__PURE__ */ jsx(AddButton, {})
    ] })
  ] });
}
const styles$2 = {
  productCard: {
    width: "300px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif"
  },
  productImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "4px"
  },
  productName: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#333",
    margin: "16px 0"
  },
  productControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  quantityInput: {
    width: "60px",
    height: "36px",
    textAlign: "center",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem"
  },
  btn: {
    padding: "8px 16px",
    fontSize: "1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#fff"
  },
  btnLess: {
    backgroundColor: "#f44336"
  },
  btnMore: {
    backgroundColor: "#4caf50"
  },
  btnHover: {
    transition: "background-color 0.3s ease"
  }
};
function saveBuyToCSV(buy, filePath = config.paths.buyHistoryPath) {
  const header = !fs__default.existsSync(filePath) ? "Date,Time,Product Name,Quantity\n" : "";
  const rows = buy.productsBuy.map((productBuy) => {
    const date = buy.time.toISOString().split("T")[0];
    const time = buy.time.toISOString().split("T")[1].split(".")[0];
    return `${date},${time},${productBuy.product.name},${productBuy.quantity}`;
  });
  const csvContent = header + rows.join("\n") + "\n";
  fs__default.appendFileSync(filePath, csvContent, { encoding: "utf-8" });
  console.log(`Compra salva em ${filePath}`);
}
const meta$1 = () => {
  return [
    { title: "Kaishita" },
    { name: "description", content: "Kaishita home page!" }
  ];
};
async function callWithdrawal(clientId, buy) {
  addWithdrawal(clientId, buy);
}
const action = async ({ request }) => {
  const formData = await request.formData();
  let productsBuy = new Array();
  const clientId = formData.get("clientId");
  const hasWithdrawal = clientHasWithdrawal(clientId);
  if (hasWithdrawal) {
    return { success: false, message: "Cliente já possui uma retirada em andamento!" };
  }
  for (const [key, value] of formData.entries()) {
    if (key.includes("quantity_")) {
      const newProduct = new Product(key.replace("quantity_", ""), 20);
      const newProductBuy = new ProductBuy(newProduct, parseInt(value));
      if (newProductBuy.quantity > 0) {
        productsBuy.push(newProductBuy);
      }
    }
  }
  console.log(`Compra de: ${clientId}`);
  console.log(productsBuy);
  if (productsBuy.length <= 0) {
    return { success: false, message: "Escolha algum produto!" };
  }
  const buy = new Buy(productsBuy);
  saveBuyToCSV(buy);
  callWithdrawal(clientId, buy);
  return { success: true, message: "Retirada iniciada!" };
};
const loader$1 = async ({ request }) => {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId") || "none";
  if (validateClient(clientId)) {
    const event = getClientEventId(clientId);
    return Response.json({ clientId, emmiter: event, withdrawal: getWithdrawal(clientId) });
  } else {
    return redirect("/");
  }
};
function Kaishita() {
  const actionData = useActionData();
  const { clientId, emmiter, withdrawal } = useLoaderData();
  const [buy, setBuy] = useState(void 0);
  let [withdrawalMessage, setWithdrawalMessage] = useState("");
  let [withdrawalPosition, setWithdrawalPosition] = useState("");
  useEffect(() => {
    setWithdrawalMessage(withdrawal.message);
    if (withdrawal.status === "waiting") {
      setWithdrawalPosition(`posição ${withdrawal.position}`);
    } else {
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
    eventSource.addEventListener(emmiter, (event) => {
      const parsedState = JSON.parse(event.data);
      console.log(parsedState);
      if (parsedState.type === "withdrawal") {
        setBuy(parsedState.Buy);
        if (parsedState.status === "waiting") {
          setWithdrawalPosition(`posição ${parsedState.position}`);
        } else {
          setWithdrawalPosition("");
        }
        setWithdrawalMessage(parsedState.message);
      } else if (parsedState.type === "withdrawalResult") {
        if (parsedState.status === "success") {
          setBuy(void 0);
          setWithdrawalPosition("");
          setWithdrawalMessage("");
          alert(parsedState.message);
        } else {
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
  return /* @__PURE__ */ jsxs("div", { style: styles$1.container, children: [
    /* @__PURE__ */ jsxs(Form, { method: "post", children: [
      /* @__PURE__ */ jsx("input", { type: "hidden", name: "clientId", value: clientId || "" }),
      /* @__PURE__ */ jsx(ProductComponent, { name: "Kit-Kat", image_href: "kit-kat.png" }),
      /* @__PURE__ */ jsx(ProductComponent, { name: "Mentos", image_href: "mentos.png" }),
      /* @__PURE__ */ jsx("button", { style: styles$1.button, type: "submit", children: "Comprar" })
    ] }),
    /* @__PURE__ */ jsx("h1", { children: withdrawalMessage }),
    /* @__PURE__ */ jsx("h1", { children: withdrawalPosition })
  ] });
}
const styles$1 = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh"
  },
  logo: {
    width: "100px",
    height: "100px"
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    margin: "1rem"
  },
  description: {
    fontSize: "1.5rem",
    margin: "1rem"
  },
  button: {
    padding: "0.5rem 1rem",
    fontSize: "1.25rem",
    backgroundColor: "#333",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  }
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: Kaishita,
  loader: loader$1,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
const meta = () => {
  return [
    { title: "Index" },
    { name: "description", content: "Getting client" }
  ];
};
const loader = async () => {
  const clientId = addClient();
  return redirect$1(`/kaishita?clientId=${clientId}`);
};
function Index() {
  return /* @__PURE__ */ jsx("div", { style: styles.container, children: /* @__PURE__ */ jsx("h1", { children: "Loading client..." }) });
}
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh"
  }
};
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index,
  loader,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-B2U-CkaC.js", "imports": ["/assets/jsx-runtime-56DGgGmo.js", "/assets/components-D6ZdaWVw.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-Cj1juNp2.js", "imports": ["/assets/jsx-runtime-56DGgGmo.js", "/assets/components-D6ZdaWVw.js"], "css": ["/assets/root-CHD7MpYg.css"] }, "routes/getStream": { "id": "routes/getStream", "parentId": "root", "path": "getStream", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/getStream-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/kaishita": { "id": "routes/kaishita", "parentId": "root", "path": "kaishita", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/kaishita-vm01YcIW.js", "imports": ["/assets/jsx-runtime-56DGgGmo.js", "/assets/components-D6ZdaWVw.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-D9Eurtwq.js", "imports": ["/assets/jsx-runtime-56DGgGmo.js"], "css": [] } }, "url": "/assets/manifest-253ada12.js", "version": "253ada12" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": false, "v3_singleFetch": true, "v3_lazyRouteDiscovery": true, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/getStream": {
    id: "routes/getStream",
    parentId: "root",
    path: "getStream",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/kaishita": {
    id: "routes/kaishita",
    parentId: "root",
    path: "kaishita",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route3
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
