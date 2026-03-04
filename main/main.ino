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
        // String msg_data = Serial.readStringUntil('\n'); 
        // Serial.println(msg_data);
        // // char first_msg_char = msg_data[0];
        
        // String msg_release = msg_data.substring(1);
        // Serial.println(msg_release);

        float controls_value = Serial.parseFloat();
        Serial.println(controls_value);
        
        switch (incomingByte) {
          case '+': // set temp to
            temp_to_set = controls_value;
            Serial.println("Setting temperature...");
            break;
          case '-':
            psi_to_set = controls_value;
            Serial.println("Setting pressure...");
            break;
          default:
            Serial.println("invalid msg char");
            break;
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