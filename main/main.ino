int isHeaterOn = 0;
int read_mode = 0;

void setup() {
  Serial.begin(9600); 
}

void loop() {
  // Serial.print("running");
  if (Serial.available() > 0) {
    char incomingByte = Serial.read(); 
    Serial.print("Incoming signal: ");

    // if (incomingByte == '0') {
    //   Serial.println("raising temperature"); // raising temperature    
    // }

    // if (incomingByte == '1') {
    //   Serial.println("raising pressure"); // raising pressure      
    // }

    // if (incomingByte == '2') {
    //   Serial.println("lowering temperature"); //
    // }

    switch (read_mode) {
      case 0:
        switch (incomingByte) {
          case '0':
            Serial.println("temp_raise");
            break;
          case '1':
            Serial.println("temp_decrease");
            break;
          case '2':
            Serial.println("psi_raise");
            break;
          case '3':
            Serial.println("psi_decrease");
            break;
          case '4':
            Serial.println("heater_on");
            break;
          case '5':
            Serial.println("heater_off");
            break;
          case '6':
            Serial.println("psi_tank_on");
            break;
          case '7':
            Serial.println("psi_tank_off");
            break;
          case '8':
            Serial.println("emergency_stop");
            break;
          case 's':
            while(true);
            break;
          case 't':
            Serial.println("TEMP CEILING");
            break;
          default:
            Serial.print("Received unknown character: ");
            Serial.println(incomingByte);
            break;
        }
        break;
    }
  }
}