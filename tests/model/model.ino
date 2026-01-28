int tempPin = A0;
int pressurePin = A1;
int setPressure = 20;
int setTemp = 120;

int sumArray(int arr[], int size) {
  int s = 0;
  for (int i = 0; i < size; i++) {
    s += arr[i];
  }
  return s;
}

void setup() {
  Serial.begin(9600);
}

int tempData[20] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int pressureData[20] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int sample = 0;

void loop() {

  tempData[sample] = analogRead(tempPin);
  pressureData[sample] = analogRead(pressurePin);
  sample = sample + 1;

  if (sample == 20) {
    int rawVT = sumArray(tempData, sample)/sample;
    int rawVP = sumArray(pressureData, sample)/sample;

    float voltageT = rawVT * (5.0 / 1023.0);   // Convert to volts
    float temperatureC = (voltageT - 0.5) * 100.0;   // TMP36 formula
    float temperatureF = temperatureC * 9.0 / 5.0 + 32.0;

    float voltageP = rawVP * (5.0 / 1023.0);   // Convert to volts
    float pressure = (voltageP - 0.43)/4*100 + 14.7;
    Serial.print("Pressure: ");
    Serial.print(pressure);
    Serial.println(" psi");

    Serial.print("Temp: ");
    Serial.print(temperatureC);
    Serial.print(" °C   (");
    Serial.print(temperatureF);
    Serial.println(" °F)");
    sample = 0;

    Serial.println("Desired States:");
    if (temperatureF < setTemp) {
      Serial.print("Heater: ON, ");
    }
    else {
      Serial.print("Heater: OFF, ");
    }

    if (pressure + 2 < setPressure) {
      Serial.print("Inlet Solenoid: ON, ");
    }
    else {
      Serial.print("Inlet Solenoid: OFF, ");
    }

    if (pressure - 2 > setPressure) {
      Serial.println("Outlet Solenoid: ON, ");
    }
    else {
      Serial.println("Outlet Solenoid: OFF, ");
    }

    Serial.println();
  }
  

  delay(200);
}
