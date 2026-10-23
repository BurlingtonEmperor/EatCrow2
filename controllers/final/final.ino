// thermistors
const int thermistorPin1 = A0;
const int thermistorPin2 = A1;

const float R1 = 10000;         // Fixed resistor value: 10k ohms
const float RT0 = 10000;        // Thermistor nominal resistance at 25°C
const float B = 3977;           // Beta value of thermistor
const float T0 = 25.0 + 273.15; // 25°C in Kelvin

float return thermistor1Value (int Vo) {
  float RT = R1 * ((1023.0 / (float)Vo) - 1.0);
  float ln = log(RT / RT0);

  float tempK = 1.0 / ((ln / B) + (1.0 / T0));
  float tempC = tempK - 273.15;
  float tempF = (tempC * 9.0 / 5.0) + 32.0;

  return tempF; // units: *F
}

// end thermistor code

// pressure sensor (500 PSI)
const int sensorPin_P500 = A2;

const int adcMin = 102; 
const int adcMax = 921; 
const float psiMax = 500.0;

float returnP500Value (int sensorData) {
  float pressure = (float)(sensorData - adcMin) * psiMax / (adcMax - adcMin);

  if (pressure < 0) {
    pressure = 0.0;
  }

  return pressure; // units: PSI
}

// end pressure sensor (500 PSI) code

void loop () {
  int Vo1 = analogRead(thermistorPin1);
  int Vo2 = analogRead(thermistorPin2);

  int sensorValue_P500 = analogRead(sensorPin_P500);
}