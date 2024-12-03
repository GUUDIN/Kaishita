#include "HX711.h"
#include "3Cell.h"

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

// Calibration factors for each load cell
float calibration_factor1 = 2380;
float calibration_factor2 = 2340;
float calibration_factor3 = 2038;

// Initialize and calibrate the scales
void calibrate_scales() {
    // Set calibration for each scale
    scale1.set_scale(calibration_factor1);
    scale2.set_scale(calibration_factor2);
    scale3.set_scale(calibration_factor3);

    // Tare each scale
    scale1.tare();
    scale2.tare();
    scale3.tare();
}

// Function to calculate the total weight
float getTotalWeight() {
    float weight1 = scale1.get_units();
    float weight2 = scale2.get_units();
    float weight3 = 0;

    if (scale3.is_ready()) {
        weight3 = scale3.get_units();
    }

    return weight1 + weight2 + weight3;
}