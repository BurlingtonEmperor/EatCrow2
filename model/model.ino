int tempPin = A0;
int pressurePin = A1;
int heaterPin = 11;
int inletPin = 10;
int outletPin = 9;

float setPressure = 14.7;
float setTemp = 70;

extern int __heap_start, *__brkval;

unsigned long previousMillis = 0; 
const long interval = 1000;  

int read_mode = 1;

int getFreeRam() {
  int v;
  return (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval);
}

int sumArray (int arr[], int size) {
  int s = 0;
  for (int i = 0; i < size; i++) {
    s += arr[i];
  }
  return s;
}

int tempData[20] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int pressureData[20] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int sample = 0;

void setup() {
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

  if (Serial.available() > 0) {
    char incomingByte = Serial.read(); 
    if (incomingByte == '\n' || incomingByte == '\r') {
      return;
    }

    Serial.println("Incoming signal: ");

    switch (incomingByte) {
      case 's':
        digitalWrite(heaterPin, LOW);
        digitalWrite(inletPin, LOW);
        Serial.println("Emergency stop.");
        while(1);
        break;
      case 'c':
        Serial.println("comm");
        break;
      case '!':
        digitalWrite(heaterPin, HIGH);
        break;
      case '~':
        digitalWrite(heaterPin, LOW);
        break;
      case '@':
        digitalWrite(inletPin, HIGH);
        break;
      case '#':
        digitalWrite(inletPin, LOW);
        break;
      case '$':
        digitalWrite(outletPin, HIGH);
        break;
      case '%':
        digitalWrite(outletPin, LOW);
        break;
      case '*':
        switch (read_mode) {
          case 1:
            read_mode = 0;
            break;
          case 0:
            read_mode = 1;
            break;
        }
        Serial.println("Read mode switched");
        break;
    }

    switch (read_mode) {
      case 0:
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
        break;

      case 1:
        if (incomingByte == '+' || incomingByte == 'p') {
          delay(10);
          float controls_value = Serial.parseFloat(); 
      
          if (incomingByte == '+') {
            setTemp = controls_value;
            Serial.println("Setting temperature...");
          }
          if (incomingByte == 'p') {
            setPressure = controls_value;
            Serial.println("Setting pressure...");
          }
      
          Serial.print("Updated. Next in buffer: ");
          Serial.println(Serial.available()); 
        }

        else if (incomingByte != '\n' && incomingByte != '\r') {
          Serial.println("Invalid Mode 1 command");
        }

        else {
          Serial.println("Unknown character: ");
          Serial.println(incomingByte);
        }
        break;
    }
  }

  if (sample < 20) { 
    tempData[sample] = analogRead(tempPin);
    pressureData[sample] = analogRead(pressurePin);
    sample++;
  }
  
  if (currentMillis - previousMillis >= interval) {
    if (sample > 0) {
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

      Serial.println("Desired States:");
      if (temperatureF < setTemp) {
        Serial.print("Heater: ON, ");
        digitalWrite(heaterPin, HIGH);
      }  else {
        Serial.print("Heater: OFF, ");
        digitalWrite(heaterPin, LOW);
      }

      if (pressure + 2 < setPressure) {
        Serial.print("Inlet Solenoid: ON, ");
        digitalWrite(inletPin, HIGH);
      } else {
        Serial.print("Inlet Solenoid: OFF, ");
        digitalWrite(inletPin, LOW);
      }

      if (pressure - 2 > setPressure) {
        Serial.println("Outlet Solenoid: ON, ");
        digitalWrite(outletPin, HIGH);
      } else {
        Serial.println("Outlet Solenoid: OFF, ");
        digitalWrite(outletPin, LOW);
      }

      Serial.println();
      Serial.print("FREE SRAM: ");
      Serial.println(getFreeRam());
    }
      
    previousMillis = currentMillis;
    sample = 0;
  }
}