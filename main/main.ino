#include <EEPROM.h>

/*
Pins that allow percentages:
3, 5, 6, 9, 10, and 11 (Perfect!) 
*/
int tempPin = A0; // these pin numbers are mere placeholders for now.
int pressurePin = A1;
int heaterPin = 11;
int inletPin = 10;
int outletPin = 9;

// int read_mode = 1;

extern int __heap_start, *__brkval;

unsigned long previousMillis = 0; 
const long interval = 5000;  

float temp_to_set = 70.0f;
float psi_to_set = 14.7f;

int has_gotten_sram = 0;

// EEPROM storage (stores error percentages)
float temp_change_data[20] = {}; // address 0
float psi_change_data[20] = {}; // address 1

float change_temp_by = 0.0f; // Starts out at 0.0%.
float change_psi_by = 0.0f;

float tune_value = 50.0f; // 50% 
float usable_temp_tune = tune_value;
float usable_psi_tune = tune_value;

float old_tune_values[20] = {}; // address 2

float prev_temp_error = 0.00f;
float prev_psi_error = 0.00f;

int is_emergency_stopped = 0;

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
  return 0; // default
}

float absoluteValue (float value_to_check) {
  if (value_to_check < 0.0f) {
    return (value_to_check * (-1.0f));
  } else {
    return value_to_check;
  }
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

void shiftFloatArray(float (&array_to_shift)[20], float new_value) {
  for (int i = 19; i > 0; i--) {
    array_to_shift[i] = array_to_shift[i - 1];
  }
  array_to_shift[0] = new_value;
}

void setup () {
  Serial.begin(9600); 

  for (int i = 0; i < 20; i++) {
    temp_change_data[i] = 100.0f;
    psi_change_data[i] = 100.0f;

    old_tune_values[i] = 50.0f;
  }

  pinMode(heaterPin, OUTPUT);
  pinMode(inletPin, OUTPUT);
  pinMode(outletPin, OUTPUT);

  digitalWrite(heaterPin, LOW);
  digitalWrite(inletPin, LOW);
  digitalWrite(outletPin, LOW);

  if (EEPROM.read(0) != 255) {
    EEPROM.put(0, temp_change_data);
  }
  if (EEPROM.read(1) != 255) {
    EEPROM.put(1, psi_change_data);
  }
  if (EEPROM.read(2) != 255) {
    EEPROM.put(2, old_tune_values);
  } else {
    int lowest_temp_error_pos = findLowestInArray(temp_change_data);
    int lowest_psi_error_pos = findLowestInArray(psi_change_data);

    float lowest_temp_error = temp_change_data[lowest_temp_error_pos];
    float lowest_psi_error = psi_change_data[lowest_psi_error_pos];

    int using_which = 0; // default is temp error

    if (lowest_psi_error < lowest_temp_error) {
      using_which = 1;
    } else {
      using_which = 0;
    }

    switch (using_which) {
      case 0:
        tune_value = old_tune_values[lowest_temp_error_pos];
        break;
      case 1:
        tune_value = old_tune_values[lowest_psi_error_pos];
        break;
    }

    usable_psi_tune = tune_value;
    usable_temp_tune = tune_value;
  }

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
            digitalWrite(outletPin, LOW);

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
              Serial.println("Setting temperature...");
            } else if (incomingByte == 'p' || incomingByte == 'k') {
              psi_to_set = controls_value;
              Serial.println("Setting pressure...");
            } else if (incomingByte == '>') {
              tune_value = controls_value;
              usable_psi_tune = tune_value;
              usable_temp_tune = tune_value;
            } else {
              // dummy code
            }
            break;
          }
        }
        break;
    }
  }
  
  int rawVt_temp = analogRead(tempPin);
  int rawVt_psi = analogRead(pressurePin);

  float voltageT = rawVt_temp * (5.0f / 1023.0f); // convert to volts.
  float temperatureC = (voltageT - 0.5f) * 100.0f; // TMP36 formula
  float temperatureF = ((temperatureC * 9.0f) / 5.0f) + 32.0f;

  float current_temp_error = (absoluteValue(temperatureF - temp_to_set) / temp_to_set) * 100.0f;

  float voltageP = rawVt_psi * (5.0f / 1023.0f);   // Convert to volts
  float pressure = (((voltageP - 0.43f) / 4.0f) * 100.0f) + 14.7f;

  float current_psi_error = (absoluteValue(pressure - psi_to_set) / psi_to_set) * 100.0f;

  int use_outlet_or_inlet = 0; // using inlet
    
  if ((current_temp_error > prev_temp_error) && (temperatureF < temp_to_set)) { // temp
    if (change_temp_by == 0.0) {
      change_temp_by += usable_temp_tune;
    } 
    // else {
    //  change_temp_by += usable_temp_tune;
    // }
  } 
  else if ((current_temp_error < prev_temp_error) && (temperatureF < temp_to_set)) {
    usable_temp_tune = usable_temp_tune / 2;
    change_temp_by += usable_temp_tune;
  } 
  else if ((current_temp_error > prev_temp_error) && (temperatureF > temp_to_set)) {
    change_temp_by -= usable_temp_tune;
  } 
  else if ((current_temp_error < prev_temp_error) && (temperatureF > temp_to_set)) {
    usable_temp_tune = usable_temp_tune / 2;
    change_temp_by -= usable_temp_tune;
  }

  if ((current_psi_error > prev_psi_error) && (pressure < psi_to_set)) { // pressure
    use_outlet_or_inlet = 0;

    if (change_psi_by == 0.0) {
      change_psi_by += usable_psi_tune;
    } 
    // else {
    //   change_psi_by += usable_psi_tune;
    // }
  } 
  else if ((current_psi_error < prev_psi_error) && (pressure < psi_to_set)) {
    use_outlet_or_inlet = 0;

    usable_psi_tune = usable_psi_tune / 2;
    change_psi_by += usable_psi_tune;
  } 
  else if ((current_psi_error > prev_psi_error) && (pressure > psi_to_set)) {
    change_psi_by -= usable_psi_tune;
    use_outlet_or_inlet = 1;
  } 
  else if ((current_psi_error < prev_psi_error) && (pressure > psi_to_set)) {
    usable_psi_tune = usable_psi_tune / 2;
    change_psi_by -= usable_psi_tune;
    use_outlet_or_inlet = 1;
  }

  if (change_temp_by > 100.0f) {
    change_temp_by = 100.0f;
  } 

  if (change_psi_by > 100.0f) {
    change_psi_by = 100.0f;
  }

  if (current_temp_error < 1.1 && current_psi_error < 1.1) {
    shiftFloatArray(temp_change_data, current_temp_error);
    shiftFloatArray(psi_change_data, current_psi_error);

    shiftFloatArray(old_tune_values, tune_value);
  }

  analogWrite(heaterPin, change_temp_by * 2.55);
  switch (use_outlet_or_inlet) {
    case 0:
      analogWrite(inletPin, change_psi_by * 2.55);
      break;
    case 1:
      analogWrite(outletPin, change_psi_by * 2.55);
      break;
  }

  if ((currentMillis - previousMillis) >= interval) {
    previousMillis = currentMillis;
    
    // String tempString = String(temperatureF, 2);
    // String psiString = String(pressure, 2);
    
    // String desiredTemp = String(temp_to_set, 2);
    // String desiredPSI = String(psi_to_set, 2);

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