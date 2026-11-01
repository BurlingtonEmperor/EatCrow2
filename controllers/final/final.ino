// thermistors
const int thermistorPin1 = A0;
const int thermistorPin2 = A1;

float R1 = 10000; // Fixed resistor value in ohms (10k)

// Steinhart-Hart coefficients
float c1 = 1.129241e-03;
float c2 = 2.341077e-04;
float c3 = 8.775468e-08;

float thermistor1Value (int Vo) {
  if (Vo == 0 || Vo == 1023) {
    Serial.println("Error: Sensor reading out of bounds");
    delay(1000);
    return 0;
  }

  float RT = R1 * ((1023.0 / (float)Vo) - 1.0);
  float logRT = log(RT);
  float invT = c1 + (c2 * logRT) + (c3 * logRT * logRT * logRT);

  float tempK = 1.0 / invT;
  float tempC = tempK - 273.15;
  float tempF = (tempC * 9.0 / 5.0) + 32.0;

  return tempF; // units: *F
}

// end thermistor code

// pressure sensors
const int sensorPin_P500 = A2;
const int sensorPin_P100 = A3;

const int adcMin = 102; 
const int adcMax = 921; 
const float psiMax = 500.0;

const int adcMinAlt = 102; 
const int adcMaxAlt = 921; 
const float psiMaxAlt = 100.0;

float returnP500Value (int sensorData) {
  float pressure = (float)(sensorData - adcMin) * psiMax / (adcMax - adcMin);

  if (pressure < 0) {
    pressure = 0.0;
  }

  return pressure; // units: PSI
}

float returnP100Value (int sensorData) {
  float pressure = (float)(sensorData - adcMinAlt) * psiMaxAlt / (adcMaxAlt - adcMinAlt);

  if (pressure < 0) {
    pressure = 0.0;
  }

  return pressure; // units: PSI
}

// end pressure sensor code

// measurement 
extern int __heap_start, *__brkval;

unsigned long previousMillis = 0; 
const long interval = 5000; 

int getFreeRam () {
  int v;
  return (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval);
}

int has_gotten_sram = 0;
int has_read_desired = 0; // has an operator set a desired temp/psi?

int is_emergency_stopped = 0;

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
  if (char_to_convert == '<') return 14; // set board macro address
  if (char_to_convert == ']') return 15; // get all board macros
  if (char_to_convert == '[') return 16; // get free EEPROM
  if (char_to_convert == '}') return 17; // set board macro
  return 0; // default
}

void setup () {
  Serial.begin(9600); 

  pinMode(2, OUTPUT);    // Sets digital pin 2 as an output. temporary code to measure thermistor readings
  digitalWrite(2, HIGH);

  Serial.setTimeout(50);
}

void loop () {
  int Vo1 = analogRead(thermistorPin1);
  int Vo2 = analogRead(thermistorPin2);

  float tempVo1 = thermistor1Value(Vo1);

  int sensorValue_P500 = analogRead(sensorPin_P500);
  int sensorValue_P100 = analogRead(sensorPin_P100);

  float psiP500 = returnP500Value(sensorValue_P500);
  float psiP100 = returnP100Value(sensorValue_P100);

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

            // emergency stop code goes here...

            is_emergency_stopped = 1;
            break;
          case 2:
            Serial.println("Read mode switches are not supported on the real autoclave...");
            break;
          case 3:
            Serial.println("comm");
            break;
          case 4:
            // digitalWrite(heaterPin, HIGH);
            break;
          case 5:
            // digitalWrite(heaterPin, LOW);
            break;
          case 6:
            // digitalWrite(inletPin, HIGH);
            break;
          case 7:
            // digitalWrite(inletPin, LOW);
            break;
          case 8:
            // digitalWrite(outletPin, HIGH);
            break;
          case 9:
            // digitalWrite(outletPin, LOW);
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
              // temp_to_set = controls_value;
              // usable_timingInterval_temp = timingInterval_temp;
              // previous_temp_error = 0.0f;
              // has_started_cure = 0;
              Serial.println("Setting temperature...");
            } else if (incomingByte == 'p' || incomingByte == 'k') {
              // psi_to_set = controls_value;
              // usable_timingInterval_psi = timingInterval_psi;
              // previous_psi_error = 0.0f;
              // has_started_cure = 0;
              Serial.println("Setting pressure...");
            } else {
              // dummy code
            }
            break;
          }
          case 14:
          case 15:
          case 16: 
          case 17: {
            Serial.println("True board macros are not supported by this autoclave.");
          }
        }
        break;
    }
  }

  if ((currentMillis - previousMillis) >= interval) {
    previousMillis = currentMillis;

    // int heaterStatus = 0;
    // int inletSolenoidStatus = 0;
    // int outletSolenoidStatus = 0;

    // if (temperatureF < temp_to_set) {
    //   heaterStatus = 1;
    // }

    // if (pressure < psi_to_set) {
    //   inletSolenoidStatus = 1;
    // }

    // if (pressure > psi_to_set) {
    //   outletSolenoidStatus = 1;
    // }

    Serial.print("T:");
    Serial.print(tempVo1);
    Serial.print(";PF:");
    Serial.print(psiP500);
    Serial.print(";TD:");
    Serial.print("0");
    Serial.print(";PD:");
    Serial.print("0");
    Serial.print("\n");

    Serial.print("H:");
    Serial.print("0");
    Serial.print(";I:");
    Serial.print("0");
    Serial.print(";O:");
    Serial.print("0");
    Serial.print("\n");
  }
}