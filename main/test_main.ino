int read_mode = 1;

extern int __heap_start, *__brkval;

unsigned long previousMillis = 0; 
const long interval = 1000;  

float temp_to_set = 0.0;
float psi_to_set = 0.0;

int has_gotten_sram = 0;

int getFreeRam () {
  int v;
  return (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval);
}

void setup () {
  Serial.begin(9600); 
  Serial.setTimeout(50);
}

void loop () {
  switch (has_gotten_sram) {
    case 0:
      has_gotten_sram = 1;

      Serial.print("FREE SRAM: ");
      Serial.println(getFreeRam());
      break;
  }
}