int tempPin = A0;
int pressurePin = A1;
int heaterPin = 11;
int inletPin = 10;
int outletPin = 9;

int setPressure = 14.7;
int setTemp = 70;

int sumArray(int arr[], int size) {
  int s = 0;
  for (int i = 0; i < size; i++) {
    s += arr[i];
  }
  return s;
}

void setup() {
  Serial.begin(9600);
  pinMode(heaterPin, OUTPUT);
  pinMode(inletPin, OUTPUT);
  pinMode(outletPin, OUTPUT);
  digitalWrite(heaterPin, LOW);
  digitalWrite(inletPin, LOW);
  digitalWrite(outletPin, LOW);
}

int tempData[20] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int pressureData[20] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int sample = 0;

void loop() {

  if (Serial.available > 0) {
    char incomingByte = Serial.read(); 
    switch (incomingByte) {
      case '0': // raise temperature
        setTemp += 1;
        break;
      case '1': // raise psi
        setPressure += 1;
        break;
      case '2': // raise temp and psi
        setTemp += 1;
        setPressure += 1;
        break;
      case '3': // decrease temperature
        setTemp -= 1;
        break;
      case '4': // decrease psi
        setPressure -= 1;
        break;
      case '5': // decrease temp and psi
        setTemp -= 1;
        setPressure -= 1;
        break;
    }
  }

  tempData[sample] = analogRead(tempPin);
  pressureData[sample] = analogRead(pressurePin);
  sample = sample + 1;

  if (sample == 15) {
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
      digitalWrite(heaterPin, HIGH);
    }
    else {
      Serial.print("Heater: OFF, ");
      digitalWrite(heaterPin, LOW);
    }

    if (pressure + 2 < setPressure) {
      Serial.print("Inlet Solenoid: ON, ");
      digitalWrite(inletPin, HIGH);
    }
    else {
      Serial.print("Inlet Solenoid: OFF, ");
      digitalWrite(inletPin, LOW);
    }

    if (pressure - 2 > setPressure) {
      Serial.println("Outlet Solenoid: ON, ");
      digitalWrite(outletPin, HIGH);
    }
    else {
      Serial.println("Outlet Solenoid: OFF, ");
      digitalWrite(outletPin, LOW);
      
    }

    Serial.println();
  }
  

  delay(50);
}
