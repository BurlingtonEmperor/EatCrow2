#include <EEPROM.h>

int tempPin = A0; // these pin numbers are mere placeholders for now.
int pressurePin = A1;
int heaterPin = 11;
int inletPin = 10;
int outletPin = 9;

// int read_mode = 1;

extern int __heap_start, *__brkval;

unsigned long previousMillis = 0; 
const long interval = 5000;  

float temp_to_set = 0.0f;
float psi_to_set = 0.0f;

int has_gotten_sram = 0;

// EEPROM storage
int temp_change_data[20] = {}; // address 0
int psi_change_data[20] = {}; // address 1

float change_temp_by = 0.5f; // Starts out at 0.5%.
float change_psi_by = 0.5f;
float tune_value = 5.0f // 5%

float prev_temp_error = 0.00f;
float prev_psi_error = 0.00f;

int is_emergency_stopped = 0;

for (int i = 0; i < 20; i++) {
  temp_change_data[i] = 100;
  psi_change_data[i] = 100;
}

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
}

float absoluteValue (float& value_to_check) {
  if (value_to_check < 1.0) {
    return (value_to_check * (-1.0f));
  } else {
    return value_to_check;
  }
}

void setup () {
  Serial.begin(9600); 

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
        int convertToInt = convertByteToInt(incomingByte);
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
            break
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
          case 12: {
            delay(10);
            float controls_value = Serial.parseFloat(); 

            if (incomingByte == '+' || incomingByte == 'o') {
              temp_to_set = controls_value;
              Serial.println("Setting temperature...");
            } else if (incomingByte == 'p' || incomingByte == 'k') {
              psi_to_set = controls_value;
              Serial.println("Setting pressure...");
            } else {
              // dummy code
            }
            break;
          }
        }
        break;
    }
  }

  if ((currentMillis - previousMillis) >= interval) {
    int rawVt_temp = analogRead(tempPin);
    int rawVt_psi = analogRead(pressurePin);

    float voltageT = rawVT * (5.0 / 1023.0); // convert to volts.
    float temperatureC = (voltageT - 0.5) * 100.0; // TMP36 formula
    float temperatureF = temperatureC * 9.0 / 5.0 + 32.0;

    float current_temp_error = (absoluteValue(temperatureF - temp_to_set) / temp_to_set) * 100;
    if ((current_temp_error > prev_temp_error) && (temperatureF < temp_to_set)) {
      
    }
  }
}