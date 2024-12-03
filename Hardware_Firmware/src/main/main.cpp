#include "3Cell.h"
#include "mqtt.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include <Arduino.h>
#include <WiFiManager.h>

extern "C" void app_main(void) {
    // Initialize Arduino runtime
    initArduino();

    // Initialize HX711 scales
    init_scales();

        // Connect to Wi-Fi
    WiFiManager wifiManager;
    wifiManager.autoConnect("ESP32-Scales");

    // Setup MQTT
    setupMQTT();

    // Create a FreeRTOS task for publishing weight data
    xTaskCreate([](void*) {
        while (true) {
            publishWeight();
            vTaskDelay(1000 / portTICK_PERIOD_MS); // Publish every second
        }
    }, "MQTT Publish Task", 4096, NULL, 1, NULL);

    // Main loop
    while (true) {
        float totalWeight = getTotalWeight();
        // float totalWeight = getSmoothedWeight(getTotalWeight());
        // if (fabs(totalWeight) < 0.2) totalWeight = 0.0;
        printf("Current Total Weight: %.2f grams\n", totalWeight);
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}