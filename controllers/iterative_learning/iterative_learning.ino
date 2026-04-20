#include <EEPROM.h>

int tempPin = A0; // these pin numbers are mere placeholders for now.
int pressurePin = A1;
int heaterPin = 11;
int inletPin = 10;
int outletPin = 9;

extern int __heap_start, *__brkval;

unsigned long previousMillis = 0; 
const long interval = 5000; 

float temp_to_set = 70.0f;
float psi_to_set = 14.7f;

int has_gotten_sram = 0;
int has_read_desired = 0; // has an operator set a desired temp/psi?
int has_calibrated = 0; // has the machine been calibrated?

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

void setup () {
  Serial.begin(9600); 

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
}