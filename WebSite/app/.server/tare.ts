import { client, subscribe, publish} from "./initializers/mqttClient"

// MQTT config
const topic = "tara";
const state = "ON"; 

export function tare(){
    publish(topic, state);
}