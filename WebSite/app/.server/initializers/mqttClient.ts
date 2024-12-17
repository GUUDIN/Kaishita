import mqtt from "mqtt";
import config from "~/.server/config/config";
// MQTT config
// const brokerUrl = "mqtt://studas.duckdns.org:1883";
const brokerUrl = config.address.brokerUrl;

// Connect to MQTT
export const client = mqtt.connect(brokerUrl);

// MQTT events
// Connect
client.on("connect", () => {
  console.log(`Conecting to broaker : ${brokerUrl}`);
});

// Subscrible
export function subscribe(topic: string) {
  client.subscribe(topic, (err) => {
    if (err) {
      console.error(`Error while trying to subscribe to topic ${topic}:`, err);
    }
    else {
      console.log(`Listenig to topic: ${topic}`);
    }
  });
}

// Publish
export function publish(topic: string, message: any) {
  client.publish(topic, message);
}

// Error
client.on("error", (err) => {
  console.error("Error on conection MQTT:", err);
});