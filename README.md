# **IoT Weight Scale with MQTT Communication and Website Interface - Kaishita**

---

## **Overview**

<div align="center">
    <img src="./Images/Kaishita.jpeg" alt="Kashita Vending Machine" width="200"/>
</div>

This branch of the Kaishita project focuses on a technical implementation of an IoT-enabled weight measurement system integrated with MQTT communication and a simple Flask-based website interface. While Kaishita's ultimate goal is to develop affordable and customizable vending machines, this branch serves as a foundational prototype, demonstrating how embedded systems, IoT, and web technologies can converge.

---

## **Table of Contents**

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Features](#features)
4. [Hardware Requirements](#hardware-requirements)
5. [Setup Instructions](#setup-instructions)
6. [How It Works](#how-it-works)
7. [ESP32 Task Management with FreeRTOS](#esp32-task-management-with-freertos)
8. [Arduino Component Integration](#arduino-component-integration)
9. [MQTT Topics and Payloads](#mqtt-topics-and-payloads)
10. [Next Steps](#next-steps)
11. [Development Environment](#development-environment)
12. [Credits](#credits)

---

## **Project Structure**

```
Hardware_Firmware/   # ESP32 firmware code for the weight scale
├── components/    # External libraries and Arduino component
│    ├── arduino/         # Arduino libraries for ESP-IDF compatibility
│    ├── WiFiManager/     # Wi-Fi management library
│    ├── pubsubclient/    # MQTT library for Arduino
├── include/       # Header files for MQTT and weight scale management
├── main/          # Source code for firmware logic
│    ├── 3Cell.cpp         # HX711 scale logic
│    ├── mqtt.cpp          # MQTT communication
│    ├── main.cpp          # App entry point
├── CMakeLists.txt  # Build configuration
└── .gitmodules     # Submodule configurations

Website/             # Raspberry Pi website code
├── requirements.txt  # Python dependencies
├── site.py           # Flask-based web server
└── README.md         # Documentation for the web interface
```
---

## **Features**

### **ESP32 Firmware**
- **Weight Measurement**:
  - Interfaces with up to 3 HX711 load cells using the Arduino HX711 library.
  - Real-time weight data processing and MQTT publishing.
  - Auto-tare functionality triggered remotely via MQTT.
- **FreeRTOS Integration**:
  - Manages independent tasks for weight measurement and MQTT communication.

### **Website (Raspberry Pi)**
- Flask-based web server for:
  - Real-time weight visualization via MQTT subscriptions.
  - Basic control commands (e.g., tare).

---

## **Hardware Requirements**
- **ESP32-S3 Development Board**
- **HX711 Modules** (up to 3)
- **Load Cells**
- **Raspberry Pi 4**
- **Power Supply**
- **Wi-Fi Router**

---

## **Setup Instructions**

This current state of the the project is *only* available at the _feature/mqtt-weight-sending_ branch for now.

### **ESP32 Firmware**
1. Clone the repository:
    ```bash
    git clone --branch feature/mqtt-weight-sending https://github.com/GUUDIN/Kaishita.git
    git checkout feature/mqtt-weight-sending
    cd Hardware_Firmware
    cd src
    ```

2. Add Arduino as a component (Check Expressif Documentation for that [here](https://docs.espressif.com/projects/arduino-esp32/en/latest/esp-idf_component.html)):
    ```bash
    git submodule add https://github.com/espressif/arduino-esp32.git components/arduino
    cd components/arduino
    git submodule update --init --recursive
    ```

3. Install required Arduino libraries:
    ```bash
    idf.py add-dependency "tzapu/WiFiManager"
    idf.py add-dependency "knolleary/pubsubclient"
    ```
4. Configure Wi-Fi and MQTT broker details in `main/mqtt.cpp`.
    ```Cpp
    const char* mqtt_server = "YOUR_MQTT_BROKER_ADDRESS"; // e.g: EMQX broker
    const int mqtt_port = YOUR_MQTT_BROKER_PORT;
    ```
5. Build and flash the firmware:
    ```bash
    idf.py build
    idf.py flash
    ```
### **Raspberry Pi Website**
1. Open the Website folder:
    ```bash
    cd Website
    ```
2. Install Python and Flask (if not installed):
    ```bash
    sudo apt update
    sudo apt install python3 python3-pip
    pip install -r requirements.txt
    ```
3. Run the website:
    ```bash
    python3 site.py
    ```

---

## **How It Works**

1. **Weight Measurement**:
   - The ESP32 reads data from up to 3 HX711 modules.
   - Raw data is processed, calibrated, and converted into grams.
2. **MQTT Communication**:
   - The ESP32 uses the PubSubClient library to:
     - Publish real-time weight data to the MQTT broker.
     - Subscribe to commands (e.g., tare) from the Raspberry Pi.
3. **Website Interface**:
   - The Raspberry Pi runs a Flask server that:
     - Visualizes weight data in real-time.
     - Sends control commands to the ESP32 via MQTT.

---

## **ESP32 Task Management with FreeRTOS**

FreeRTOS enables multitasking on the ESP32, allowing separate tasks for weight measurement and MQTT communication.

### Key Tasks
1. **Weight Measurement Task**: Continuously reads weight data from the HX711 modules and computes the total weight.
2. **MQTT Publishing Task**: Sends the computed weight to the MQTT broker every second.

### Implementation
```cpp
xTaskCreate([](void*) {
    while (true) {
        publishWeight();
        vTaskDelay(1000 / portTICK_PERIOD_MS); // Publish every second
    }
}, "MQTT Publish Task", 4096, NULL, 1, NULL);

The tasks operate independently, ensuring timely data processing and transmission without interference.

# Arduino Component Integration and Project Next Steps

## Arduino Component Integration

The ESP32 firmware leverages the Arduino component within the ESP-IDF framework for seamless integration of libraries:

- **HX711 Library**: Interfaces with the HX711 load cell amplifier for precise weight measurements.
- **WiFiManager**: Simplifies Wi-Fi provisioning and management for the ESP32.
- **PubSubClient**: Manages efficient MQTT communication for publishing and subscribing to topics.

## MQTT Topics and Payloads

- **`peso`** (ESP32 → Broker → Website):
  - Payload: Total weight in grams (e.g., `"12.34g"`).

- **`tara`** (Website → Broker → ESP32):
  - Payload: `"ON"` to zero the scale.

  ## **Images and Outputs**

### Serial Monitor Output

<details>
<summary>Click to view Serial Monitor Output</summary>
<img src="./Images/SerialMonitorOutput.png" alt="Serial Monitor Output" width="500"/>
</details>

### Website UI

<details>
<summary>Click to view Website UI</summary>
<img src="./Images/WebsiteUI.png" alt="Website UI" width="500"/>
</details>

### Project Setup

<details>
<summary>Click to view Project Setup</summary>
<img src="./Images/ProjectSetup.png" alt="Project Setup" width="500"/>
</details>

## Next Steps

### Firmware Improvements

- Implement advanced filtering algorithms (e.g., Kalman filters) to stabilize weight readings.
- Enhance MQTT security by integrating TLS for encrypted communication.

### Website Enhancements

- Develop an interface allowing users to:
  - Select the number of items (e.g., candy bars).
  - Verify that the weight withdrawn matches the selection.
- Add sales trend analysis with AI-based recommendations, such as:
  - Optimal stock levels based on sales patterns.
  - Identifying peak sales times and popular products.
- Integrate secure payment options (e.g., Pix, Stripe, PayPal).

## Development Environment

- **ESP-IDF Version**: v5.1.4
- **Python Flask**: v2.2
- **Arduino Component**: v2.0+
- **MQTT Broker**: andromeda.lasdpc.icmc.usp.br
- **MQTT Port**: 5012

## Credits

- **ESP32 Firmware Development**: Pedro Gudin & Mateus Messias
- **Website Development**: Mateus Messias
- **Documentation**: Pedro Gudin

