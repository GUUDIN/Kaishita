# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.5)

file(MAKE_DIRECTORY
  "/Users/pedro/esp/v5.1.4/esp-idf/components/bootloader/subproject"
  "/Users/pedro/development/Kaishita/Hardware_Firmware/src/build/bootloader"
  "/Users/pedro/development/Kaishita/Hardware_Firmware/src/build/bootloader-prefix"
  "/Users/pedro/development/Kaishita/Hardware_Firmware/src/build/bootloader-prefix/tmp"
  "/Users/pedro/development/Kaishita/Hardware_Firmware/src/build/bootloader-prefix/src/bootloader-stamp"
  "/Users/pedro/development/Kaishita/Hardware_Firmware/src/build/bootloader-prefix/src"
  "/Users/pedro/development/Kaishita/Hardware_Firmware/src/build/bootloader-prefix/src/bootloader-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "/Users/pedro/development/Kaishita/Hardware_Firmware/src/build/bootloader-prefix/src/bootloader-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "/Users/pedro/development/Kaishita/Hardware_Firmware/src/build/bootloader-prefix/src/bootloader-stamp${cfgdir}") # cfgdir has leading slash
endif()
