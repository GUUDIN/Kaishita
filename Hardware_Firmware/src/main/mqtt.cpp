#include "mqtt.h"
#include "3Cell.h"
#include <WiFiManager.h>
#include <PubSubClient.h>

// MQTT configuration
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

// Connect to MQTT broker
void reconnect() {
    while (!client.connected()) {
        Serial.print("Attempting MQTT connection...");
        if (client.connect("ESP32-Scales")) {
            Serial.println("Connected to MQTT Broker");
        } else {
            Serial.print("Failed, rc=");
            Serial.print(client.state());
            Serial.println(" Retrying in 5 seconds...");
            delay(5000);
        }
    }
}

// Publish weight data
void publishWeight() {
    if (!client.connected()) {
        reconnect();
    }
    client.loop();

    float totalWeight = getTotalWeight();
    String message = String(totalWeight, 2);  // Format the weight as a string with 2 decimals
    client.publish("scale/weight", message.c_str());
    Serial.print("Published Weight: ");
    Serial.println(message);
}

// Setup MQTT
void setupMQTT() {
    client.setServer(mqtt_server, mqtt_port);
}