int isHeaterOn = 0;
int read_mode = 1;

extern int __heap_start, *__brkval;

unsigned long previousMillis = 0; 
const long interval = 1000;  

float temp_to_set = 0;
float psi_to_set = 0;

int getFreeRam() {
  int v;
  return (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval);
}

void setup() {
  Serial.begin(9600); 
  Serial.setTimeout(50);
}

void loop() {
  if (Serial.available() > 0) {
    char incomingByte = Serial.read(); 
    Serial.print("Incoming signal: ");

    switch (incomingByte) {
      case 's':
        Serial.println("emergency_stop");
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
        return;
    }

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
        }
        break;
      
      case 1:
        // float controls_value = Serial.parseFloat();
        // Serial.println(controls_value);
        
        // switch (incomingByte) {
        //   case '+': // set temp to
        //     temp_to_set = controls_value;
        //     Serial.println("Setting temperature...");
        //     break;
        //   case 'p': // set psi to
        //     psi_to_set = controls_value;
        //     Serial.println("Setting pressure...");
        //     break;
        //   default:
        //     Serial.println("invalid msg char");
        //     break;
        // }

        if (incomingByte == '+' || incomingByte == 'p') {
          float controls_value = Serial.parseFloat(); 
      
          if (incomingByte == '+') {
            temp_to_set = controls_value;
            Serial.println("Setting temperature to ");
            Serial.print(controls_value);
            Serial.print("\n");
          }
          if (incomingByte == 'p') {
            psi_to_set = controls_value;
            Serial.println("Setting pressure to ");
            Serial.print(controls_value);
            Serial.print("\n");
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

  unsigned long currentMillis = millis(); 

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    Serial.print("FREE SRAM: ");
    Serial.println(getFreeRam());
  }
}