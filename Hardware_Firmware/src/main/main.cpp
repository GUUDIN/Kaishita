#include "3Cell.h"
#include "mqtt.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

extern "C" void app_main(void) {
    // Initialize Arduino runtime
    initArduino();
    
    // Initialize scales
    init_scales();

    // Initialize MQTT
    setupMQTT();

    // Create a task to publish weight periodically
    xTaskCreate([](void*) {
        while (true) {
            publishWeight();
            vTaskDelay(1000 / portTICK_PERIOD_MS);  // Publish every second
        }
    }, "MQTT Publish Task", 4096, NULL, 1, NULL);

    // Main loop for debugging
    while (true) {
        float weight = getTotalWeight();
        printf("Current Weight: %.2f grams\n", weight);
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}