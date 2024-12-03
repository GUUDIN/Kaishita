idf_component_register(SRCS "main.cpp"
                            "3Cell.cpp"
                            "mqtt.cpp"
                    INCLUDE_DIRS "${CMAKE_CURRENT_LIST_DIR}/../include"
                    REQUIRES arduino WiFiManager)