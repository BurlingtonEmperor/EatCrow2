// thermistors
const int thermistorPin1 = A0;
const int thermistorPin2 = A1;

float R1 = 10000; // Fixed resistor value in ohms (10k)

// Steinhart-Hart coefficients
float c1 = 1.129241e-03;
float c2 = 2.341077e-04;
float c3 = 8.775468e-08;

float return thermistor1Value (int Vo) {
  if (Vo == 0 || Vo == 1023) {
    Serial.println("Error: Sensor reading out of bounds");
    delay(1000);
    return;
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

void loop () {
  int Vo1 = analogRead(thermistorPin1);
  int Vo2 = analogRead(thermistorPin2);

  int sensorValue_P500 = analogRead(sensorPin_P500);
}