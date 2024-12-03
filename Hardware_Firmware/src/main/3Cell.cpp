#include "HX711.h"
#include "arduino.h"

extern "C" {
#include <stdio.h>
#include <inttypes.h>
#include "sdkconfig.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/uart.h"  // Required for UART input
}

// Define pins for each HX711
#define LOADCELL1_DOUT_PIN 9
#define LOADCELL1_SCK_PIN 10

#define LOADCELL2_DOUT_PIN 11
#define LOADCELL2_SCK_PIN 12

#define LOADCELL3_DOUT_PIN 13
#define LOADCELL3_SCK_PIN 14

// HX711 objects for each load cell
HX711 scale1;
HX711 scale2;
HX711 scale3;

// Initial calibration factors for each load cell
float calibration_factor1 = 2380;
float calibration_factor2 = 2340;
float calibration_factor3 = 2038;

// UART configuration
#define UART_NUM UART_NUM_0
#define UART_BUF_SIZE 1024

void calibrate_scales() {
    // Set calibration for each scale
    scale1.set_scale(calibration_factor1);
    scale2.set_scale(calibration_factor2);
    scale3.set_scale(calibration_factor3);

    // Tare each scale with small delays to allow FreeRTOS scheduling
    scale1.tare();
    vTaskDelay(500 / portTICK_PERIOD_MS);
    scale2.tare();
    vTaskDelay(500 / portTICK_PERIOD_MS);
    scale3.tare();
    vTaskDelay(500 / portTICK_PERIOD_MS);

    // Print initial zero factors for each scale
    printf("Scale 1 Zero factor: %ld\n", scale1.read_average());
    printf("Scale 2 Zero factor: %ld\n", scale2.read_average());
    printf("Scale 3 Zero factor: %ld\n", scale3.read_average());

    printf("Calibration started. Place a known weight on each scale.\n");
    printf("Use '+' or '-' to adjust all calibration factors.\n");
}

void handle_calibration_input() {
    uint8_t data[UART_BUF_SIZE];
    int len = uart_read_bytes(UART_NUM, data, UART_BUF_SIZE, 20 / portTICK_PERIOD_MS);

    if (len > 0) {
        for (int i = 0; i < len; i++) {
            if (data[i] == '+' || data[i] == 'a') {
                calibration_factor1 += 10;
                calibration_factor2 += 10;
                calibration_factor3 += 10;
            } else if (data[i] == '-' || data[i] == 'z') {
                calibration_factor1 -= 10;
                calibration_factor2 -= 10;
                calibration_factor3 -= 10;
            }

            // Apply updated calibration factors
            scale1.set_scale(calibration_factor1);
            scale2.set_scale(calibration_factor2);
            scale3.set_scale(calibration_factor3);

            printf("Updated calibration factors: %.2f, %.2f, %.2f\n", calibration_factor1, calibration_factor2, calibration_factor3);
        }
    }
}

extern "C" void app_main(void) {
    // Initialize UART for calibration input
    uart_config_t uart_config = {
        .baud_rate = 115200,
        .data_bits = UART_DATA_8_BITS,
        .parity = UART_PARITY_DISABLE,
        .stop_bits = UART_STOP_BITS_1,
        .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
    };
    uart_param_config(UART_NUM, &uart_config);
    uart_driver_install(UART_NUM, UART_BUF_SIZE, 0, 0, NULL, 0);

    // Initialize each HX711
    scale1.begin(LOADCELL1_DOUT_PIN, LOADCELL1_SCK_PIN);
    scale2.begin(LOADCELL2_DOUT_PIN, LOADCELL2_SCK_PIN);
    scale3.begin(LOADCELL3_DOUT_PIN, LOADCELL3_SCK_PIN);

    // Perform initial calibration for each scale
    calibrate_scales();

    // Main loop for continuous weight measurement
    while (true) {
        handle_calibration_input();  // Check for user input on calibration

        // Display current reading for each scale
        float weight1 = scale1.get_units();
        float weight2 = scale2.get_units();
        float weight3 = scale3.get_units();
        float totalWeight = weight1 + weight2 + weight3;

        printf("Weight 1: %.2f grams, Weight 2: %.2f grams, Weight 3: %.2f grams, Total Weight: %.2f grams\n",
               weight1, weight2, weight3, totalWeight);

        // Adding delay to prevent watchdog timer trigger
        vTaskDelay(1000 / portTICK_PERIOD_MS);  // Delay between readings
    }
}