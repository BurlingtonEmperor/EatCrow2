#include <EEPROM.h>

int tempPin = A0; // these pin numbers are mere placeholders for now.
int pressurePin = A1;
int heaterPin = 11;
int inletPin = 10;
int outletPin = 9;

extern int __heap_start, *__brkval;

unsigned long previousMillis = 0; 
const long interval = 5000; 

unsigned long previousMeasurement = 0;
const long measurement_interval = 1000; // set to 1s because otherwise the mosfets may go haywire.
unsigned long measurement_total = 0;

float temp_to_set = 70.0f;
float psi_to_set = 14.7f;

float calibration_temp = 85.0f; // the temperature to raise to, in order to check...
float calibration_psi = 5.0f; // the psi to raise to, in order to check...

float increasing_temp_interval = 0.0f;
float decreasing_temp_interval = 0.0f;

int has_gotten_sram = 0;
int has_read_desired = 0; // has an operator set a desired temp/psi?

int has_calibrated = 0; // has the machine been calibrated?
int is_calibrating = 0; // is the machine in the process of calibrating?

int got_temp = 0;
int got_psi = 0;

float current_temp_error = 100.0f;
float current_psi_error = 100.0f;

float previous_temp_error = 0.0f;
float previous_psi_error = 0.0f;

unsigned long timingInterval_temp = 0; // no floats allowed, the mosfets will act up.
unsigned long timingInterval_psi = 0;

unsigned long usable_timingInterval_temp = 0;
unsigned long usable_timingInterval_psi = 0;

unsigned long usable_timingInterval_tempOFF = 0;
unsigned long usable_timingInterval_psiOFF = 0;

unsigned long previousIntervalMeasurement_temp = 0;
unsigned long previousIntervalMeasurement_psi = 0;

int is_emergency_stopped = 0;
int has_started_cure = 0;
int cure_active = 0; // is the machine actually going to cure?

int is_heater_on = 0;
int is_inlet_on = 0;
int is_outlet_on = 0;

// EEPROM storage (stores error percentages)
float temp_error_data[20] = {}; // address 0
float psi_error_data[20] = {}; // address 1

float timing_intervals_temp[20] = {}; // address 2
float timing_intervals_psi[20] = {}; // address 3

/*
-- BOARD MACRO MEMORY SLOTS --
memory address 4
memory address 5
memory address 6
memory address 7
*/

#define MAX_SIZE 64
byte buffer[MAX_SIZE];
int byte_index = 0;

int getFreeRam () {
  int v;
  return (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval);
}

int convertCharToInt (char& char_to_convert) {
  if (char_to_convert == 's') return 1; // emergency stop.
  if (char_to_convert == '*') return 2; // switch read mode
  if (char_to_convert == 'c') return 3; // comm check
  if (char_to_convert == '!') return 4; // heater on
  if (char_to_convert == '~') return 5; // heater off
  if (char_to_convert == '@') return 6; // inlet solenoid on
  if (char_to_convert == '#') return 7; // inlet solenoid off
  if (char_to_convert == '$') return 8; // outlet solenoid on
  if (char_to_convert == '%') return 9; // outlet solenoid off
  if (char_to_convert == 'z') return 10; // requesting another sram check
  if (char_to_convert == '+') return 11; // changing temperature
  if (char_to_convert == 'o') return 11;
  if (char_to_convert == 'p') return 12; // changing pressure
  if (char_to_convert == 'k') return 12;
  if (char_to_convert == '>') return 13; // change tune value
  if (char_to_convert == '<') return 14; // read file (WIP)
  if (char_to_convert == ']') return 15; // get all board macros
  if (char_to_convert == '[') return 16; // get free EEPROM
  return 0; // default
}

int findLowestInArray (float (&array_to_check)[20]) {
  float lowest_value = array_to_check[0];
  int lowest_position = 0;

  for (int i = 1; i < 20; i++) {
    if (array_to_check[i] < lowest_value) {
      lowest_value = array_to_check[i];
      lowest_position = i;
    }
  }
  return lowest_position;
}

int findFreeMemorySlot () {
  for (int i = 0; i < 11; i++) {
    if (EEPROM.read(i + 4) == 255) {
      return (i + 4); // board macro memory slots begin at 4 and end at 14.
    }
  }
  
  return 255; // every memory slot is taken. need to get rid of one!
}

int checkIfMemSlotFree (int mem_address) {
  if (EEPROM.read(mem_address) == 255) {
    return 0;
  } else {
    return 1;
  }
}

float absoluteValue (float value_to_check) {
  if (value_to_check < 0.0f) {
    return (value_to_check * (-1.0f));
  } else {
    return value_to_check;
  }
}

void shiftFloatArray(float (&array_to_shift)[20], float new_value) {
  for (int i = 19; i > 0; i--) {
    array_to_shift[i] = array_to_shift[i - 1];
  }
  array_to_shift[0] = new_value;
}

void recalculateTempError (float current_temperature) {
  current_temp_error = (absoluteValue(current_temperature - temp_to_set) / temp_to_set) * 100.0f;
}

void recalculatePsiError (float current_psi) {
  current_psi_error = (absoluteValue(current_psi - psi_to_set) / psi_to_set) * 100.0f;
}

void setup () {
  Serial.begin(9600); 

  for (int i = 0; i < 20; i++) {
    temp_error_data[i] = 100.0f; // 100% error to mark that these values are essentially empty.
    psi_error_data[i] = 100.0f;
  }

  if (EEPROM.read(0) == 255) {
    EEPROM.put(0, temp_error_data);
  } else {
    EEPROM.get(0, temp_error_data);
  }

  if (EEPROM.read(1) == 255) {
    EEPROM.put(1, psi_error_data);
  } else {
    EEPROM.get(1, psi_error_data);
  }

  if (EEPROM.read(2) == 255) { // no need to check psi because if temp is there, psi is most likely there too.
    EEPROM.put(2, timing_intervals_temp);
    EEPROM.put(3, timing_intervals_psi);
  } else {
    EEPROM.get(2, timing_intervals_temp);
    EEPROM.get(3, timing_intervals_psi);

    int lowest_temp_error_pos = findLowestInArray(temp_error_data);
    int lowest_psi_error_pos = findLowestInArray(psi_error_data);

    // float lowest_temp_error = temp_error_data[lowest_temp_error_pos];
    // float lowest_psi_error = psi_error_data[lowest_psi_error_pos];

    timingInterval_temp = timing_intervals_temp[lowest_temp_error_pos];
    timingInterval_psi = timing_intervals_psi[lowest_psi_error_pos];
  }

  pinMode(heaterPin, OUTPUT);
  pinMode(inletPin, OUTPUT);
  pinMode(outletPin, OUTPUT);

  digitalWrite(heaterPin, LOW);
  digitalWrite(inletPin, LOW);
  digitalWrite(outletPin, LOW);

  Serial.setTimeout(50);
}

void loop () {
  unsigned long currentMillis = millis(); 

  switch (has_gotten_sram) {
    case 0:
      has_gotten_sram = 1;

      Serial.print("FREE SRAM: ");
      Serial.println(getFreeRam());
      break;
  }

  int rawVt_temp = analogRead(tempPin);
  int rawVt_psi = analogRead(pressurePin);

  float voltageT = rawVt_temp * (5.0f / 1023.0f); // convert to volts.
  float temperatureC = (voltageT - 0.5f) * 100.0f; // TMP36 formula
  float temperatureF = ((temperatureC * 9.0f) / 5.0f) + 32.0f;

  current_temp_error = (absoluteValue(temperatureF - temp_to_set) / temp_to_set) * 100.0f;

  float voltageP = rawVt_psi * (5.0f / 1023.0f);   // Convert to volts
  float pressure = (((voltageP - 0.43f) / 4.0f) * 100.0f) + 14.7f;

  current_psi_error = (absoluteValue(pressure - psi_to_set) / psi_to_set) * 100.0f;

  switch (is_calibrating) {
    case 0: {
      int recheck_needed = 0;

      temp_to_set = calibration_temp;
      recalculateTempError(temperatureF);
      // current_temp_error = (absoluteValue(temperatureF - temp_to_set) / temp_to_set) * 100.0f;

      if ((temperatureF < calibration_temp) && (current_temp_error >= 5.0f)) {
        digitalWrite(heaterPin, HIGH);
      } else {
        calibration_temp += 10.0f;
        recheck_needed = 1;
      }

      psi_to_set = calibration_psi;
      recalculatePsiError(pressure);

      if ((pressure < calibration_psi) && (current_psi_error >= 5.0f)) {
        digitalWrite(inletPin, HIGH);
        digitalWrite(outletPin, LOW);
      } else {
        calibration_psi += 5.0f;
        recheck_needed = 1;
      }

      switch (recheck_needed) {
        case 0:
          is_calibrating = 1;
          Serial.println("<>Calibrating the autoclave...");
          break;
      }
      break;
    }
  }

  switch (has_calibrated) {
    case 0:
      if ((current_temp_error < 1.51f) && (got_temp == 0)) { // around 1% error
        // timingInterval_temp = measurement_total;
        shiftFloatArray(timing_intervals_temp, measurement_total);
        shiftFloatArray(temp_error_data, current_temp_error);

        EEPROM.put(0, temp_error_data);
        EEPROM.put(2, timing_intervals_temp);

        EEPROM.put(1, psi_error_data);
        EEPROM.put(3, timing_intervals_psi);

        int lowest_temp_error_pos = findLowestInArray(temp_error_data);
        timingInterval_temp = timing_intervals_temp[lowest_temp_error_pos];
        got_temp = 1;

        digitalWrite(heaterPin, LOW);
      }

      if ((current_psi_error < 1.51f) && (got_psi == 0)) {
        // timingInterval_psi = measurement_total;
        shiftFloatArray(timing_intervals_psi, measurement_total);
        shiftFloatArray(psi_error_data, current_psi_error);
        
        int lowest_psi_error_pos = findLowestInArray(psi_error_data);
        timingInterval_psi = timing_intervals_psi[lowest_psi_error_pos];
        got_psi = 1;

        digitalWrite(inletPin, LOW);
      }

      if ((got_temp == 1) && (got_psi == 1)) {
        has_calibrated = 1;
      }
      
      if ((currentMillis - previousMeasurement) >= measurement_interval) {
        previousMeasurement = currentMillis;
        measurement_total += measurement_interval;
      }
      break;
    case 1:
      // switch (has_calibrated) {
      //   case 0:
      //     has_calibrated = 1;
      //     break;
      //   case 1:
      //     break;
      // }
      switch (cure_active) {
        case 1:
          switch (has_started_cure) {
            case 0:
              if (temperatureF < temp_to_set) {
                digitalWrite(heaterPin, HIGH);
                is_heater_on = 1;
              }

              if (pressure < psi_to_set) {
                digitalWrite(inletPin, HIGH);
                is_inlet_on = 1;

                digitalWrite(outletPin, LOW);
                is_outlet_on = 0;
              }

              previous_temp_error = current_temp_error;
              previous_psi_error = current_psi_error;
              has_started_cure = 1;
              break;
            case 1:
              if ((currentMillis - previousIntervalMeasurement_temp) >= usable_timingInterval_temp) {
                switch (is_heater_on) {
                  case 0:
                    if (((current_temp_error < previous_temp_error) && (temperatureF < temp_to_set)) || ((current_temp_error > previous_temp_error) && (temperatureF < temp_to_set))) {
                      usable_timingInterval_temp = timingInterval_temp;
                      digitalWrite(heaterPin, HIGH);
                      is_heater_on = 1;
                    } else {
                      usable_timingInterval_temp = (timingInterval_temp / 2);
                      digitalWrite(heaterPin, LOW);
                      is_heater_on = 0;
                    }
                    break;
                  case 1:
                    usable_timingInterval_temp = (timingInterval_temp / 2);
                    digitalWrite(heaterPin, LOW);
                    is_heater_on = 0;
                    break;
                }
                previousIntervalMeasurement_temp = currentMillis;
              }

              if ((currentMillis - previousIntervalMeasurement_psi) >= usable_timingInterval_psi) {
                switch (is_inlet_on) {
                  case 0:
                    if (((current_psi_error < previous_psi_error) && (pressure < psi_to_set)) || ((current_psi_error > previous_psi_error) && (pressure < psi_to_set))) {
                      usable_timingInterval_psi = timingInterval_psi;

                      digitalWrite(inletPin, HIGH);
                      digitalWrite(outletPin, LOW);

                      is_inlet_on = 1;
                      is_outlet_on = 0;
                    } else {
                      usable_timingInterval_psi = (timingInterval_psi / 2);
                      digitalWrite(inletPin, LOW);
                      digitalWrite(outletPin, HIGH);

                      is_inlet_on = 0;
                      is_outlet_on = 1;
                    }
                    break;
                  case 1:
                    usable_timingInterval_psi = (timingInterval_psi / 2);
                    digitalWrite(inletPin, LOW);
                    digitalWrite(outletPin, HIGH);

                    is_inlet_on = 0;
                    is_outlet_on = 1;
                    break;
                }
                previousIntervalMeasurement_psi = currentMillis;
              }
              break;
          }
          break;
      }
      break;
  }

  if (Serial.available() > 0) {
    char incomingByte = Serial.read(); 

    Serial.println("Incoming Signal: ");
    switch (is_emergency_stopped) {
      case 1:
        if (incomingByte == 's') {
          is_emergency_stopped = 0;
          Serial.println("Calling off emergency stop.");
        }
        break;
      case 0:
        int convertToInt = convertCharToInt(incomingByte);
        switch (convertToInt) {
          case 1:
            Serial.println("Called an emergency stop.");

            digitalWrite(heaterPin, LOW);
            digitalWrite(inletPin, LOW);
            digitalWrite(outletPin, HIGH);

            is_emergency_stopped = 1;
            break;
          case 2:
            Serial.println("Read mode switches are not supported on the real autoclave...");
            break;
          case 3:
            Serial.println("comm");
            break;
          case 4:
            digitalWrite(heaterPin, HIGH);
            break;
          case 5:
            digitalWrite(heaterPin, LOW);
            break;
          case 6:
            digitalWrite(inletPin, HIGH);
            break;
          case 7:
            digitalWrite(inletPin, LOW);
            break;
          case 8:
            digitalWrite(outletPin, HIGH);
            break;
          case 9:
            digitalWrite(outletPin, LOW);
            break;
          case 10:
            has_gotten_sram = 0;
            break;
          case 11:
          case 12:
          case 13: {
            delay(10);
            float controls_value = Serial.parseFloat(); 

            if (incomingByte == '+' || incomingByte == 'o') {
              temp_to_set = controls_value;
              usable_timingInterval_temp = timingInterval_temp;
              previous_temp_error = 0.0f;
              has_started_cure = 0;
              Serial.println("Setting temperature...");
            } else if (incomingByte == 'p' || incomingByte == 'k') {
              psi_to_set = controls_value;
              usable_timingInterval_psi = timingInterval_psi;
              previous_psi_error = 0.0f;
              has_started_cure = 0;
              Serial.println("Setting pressure...");
            } else {
              // dummy code
            }
            break;
          }
          case 14: {
            if (Serial.find('<')) {
              int expectedSize = Serial.read();
              Serial.readBytes(buffer, expectedSize);
            }
            break;
          }
          case 15: {
            String string_to_send_back = "";
            for (int i = 4; i < 15; i++) {
              switch (checkIfMemSlotFree(i)) {
                case 1:
                  String i_string = String(i);
                  string_to_send_back += i_string + ";";
                  break;
              }
            }
            Serial.println("bm:" + string_to_send_back);
            break;
          }
          case 16: {
            unsigned int totalBytes = EEPROM.length();
            Serial.print("eb:");
            Serial.print(totalBytes);
            Serial.print("\n");
            break;
          }
        }
        break;
    }
  }

  if ((currentMillis - previousMillis) >= interval) {
    previousMillis = currentMillis;

    int heaterStatus = 0;
    int inletSolenoidStatus = 0;
    int outletSolenoidStatus = 0;

    if (temperatureF < temp_to_set) {
      heaterStatus = 1;
    }

    if (pressure < psi_to_set) {
      inletSolenoidStatus = 1;
    }

    if (pressure > psi_to_set) {
      outletSolenoidStatus = 1;
    }

    Serial.print("T:");
    Serial.print(temperatureF);
    Serial.print(";P:");
    Serial.print(pressure);
    Serial.print(";TD:");
    Serial.print(temp_to_set);
    Serial.print(";PD:");
    Serial.print(psi_to_set);
    Serial.print("\n");

    Serial.print("H:");
    Serial.print(heaterStatus);
    Serial.print(";I:");
    Serial.print(inletSolenoidStatus);
    Serial.print(";O:");
    Serial.print(outletSolenoidStatus);
    Serial.print("\n");
  }
}