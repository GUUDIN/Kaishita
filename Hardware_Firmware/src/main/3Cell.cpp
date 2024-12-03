#include <Arduino.h>
#include "HX711.h"
#include "3Cell.h"

// Define pins for each HX711
#define LOADCELL1_DOUT_PIN 9
#define LOADCELL1_SCK_PIN 10

#define LOADCELL2_DOUT_PIN 11
#define LOADCELL2_SCK_PIN 12

// #define LOADCELL3_DOUT_PIN 13
// #define LOADCELL3_SCK_PIN 14

// Number of samples to average for smoothing
#define NUM_SAMPLES 3

// HX711 objects for each load cell
HX711 scale1;
HX711 scale2;
//HX711 scale3;

// Calibration factors for each load cell
float calibration_factor1 = 2380;
float calibration_factor2 = 2340;
//float calibration_factor3 = 2038;

// Buffer to store the last NUM_SAMPLES weights for smoothing
float weightBuffer[NUM_SAMPLES];
int bufferIndex = 0;

// Initialize scales (pin configuration + initial calibration)
void init_scales() {
    // Initialize each HX711
    scale1.begin(LOADCELL1_DOUT_PIN, LOADCELL1_SCK_PIN);
    scale2.begin(LOADCELL2_DOUT_PIN, LOADCELL2_SCK_PIN);
    //scale3.begin(LOADCELL3_DOUT_PIN, LOADCELL3_SCK_PIN);

    // Check if scales are ready
    // add || !scale3.is_ready() if you have 3 load cells
    while (!scale1.is_ready() || !scale2.is_ready() ) {
        printf("Waiting for HX711 modules to become ready...\n");
        vTaskDelay(500 / portTICK_PERIOD_MS);
    }

    // Apply calibration factors
    scale1.set_scale(calibration_factor1);
    scale2.set_scale(calibration_factor2);
    //scale3.set_scale(calibration_factor3);

    // Tare scales to zero
    scale1.tare();
    scale2.tare();
    //scale3.tare();

    printf("Scales initialized and tared successfully.\n");
}

// Function to tare (zero out) all scales
void tareScales() {
    scale1.tare();
    scale2.tare();
    //scale3.tare();
    Serial.println("Scales tared successfully!");
}

// Function to get the smoothed weight given 3 samples
float getSmoothedWeight(float currentWeight) {
    weightBuffer[bufferIndex] = currentWeight;
    bufferIndex = (bufferIndex + 1) % NUM_SAMPLES;

    float total = 0.0;
    for (int i = 0; i < NUM_SAMPLES; i++) {
        total += weightBuffer[i];
    }

    return total / NUM_SAMPLES;
}

// Function to calculate the total weight
float getTotalWeight() {
    float weight1 = scale1.get_units();
    float weight2 = scale2.get_units();
    //float weight3 = 0;

    // if (scale3.is_ready()) {
    //     weight3 = scale3.get_units();
    // }

    return weight1 + weight2;
    // return weight1 + weight2 + weight3;
}