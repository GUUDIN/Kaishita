#include <Arduino.h>
#include "mqtt.h"
#include "3Cell.h"
#include <WiFiManager.h>
#include <PubSubClient.h>

// MQTT Configuration
const char* mqtt_server = "andromeda.lasdpc.icmc.usp.br";
const int mqtt_port = 5012;

WiFiClient espClient;
PubSubClient client(espClient);

// Function to reconnect to the MQTT Broker
void reconnect() {
    while (!client.connected()) {
        Serial.print("Attempting MQTT connection...");
        if (client.connect("ESP32-Scales")) {
            Serial.println("Connected to MQTT Broker");
            client.subscribe("tara");  // Subscribe to commands topic (optional)
        } else {
            Serial.print("Failed, rc=");
            Serial.print(client.state());
            Serial.println(" Retrying in 5 seconds...");
            vTaskDelay(5000 / portTICK_PERIOD_MS); // Avoid using delay in FreeRTOS tasks
        }
    }
}

// Function to publish weight data
void publishWeight() {
    if (!client.connected()) {
        reconnect();
    }
    client.loop();

    //float totalWeight = getTotalWeight();  // Get weight data from the sensor logic
    float totalWeight = getSmoothedWeight(getTotalWeight());
    if (fabs(totalWeight) < 0.2) totalWeight = 0.0;
    String message = String(totalWeight, 2) + "g";  // Format the weight as a string with 2 decimals
    client.publish("peso", message.c_str());
    Serial.print("Published Weight: ");
    Serial.println(message);
}

void callback(char* topic, byte* payload, unsigned int length) {
    String message;
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }

    if (String(topic) == "tara" && message == "ON") {
        Serial.println("Tara command received!");
        tareScales(); // Call the tare function from 3Cell.cpp
    }
}

// MQTT Setup function
void setupMQTT() {
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback); // Register the callback function
    Serial.println("MQTT setup completed");
}