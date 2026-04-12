int tempPin = A0; // these pin numbers are mere placeholders for now.
int pressurePin = A1;
int heaterPin = 11;
int inletPin = 10;
int outletPin = 9;

int read_mode = 1;

extern int __heap_start, *__brkval;

unsigned long previousMillis = 0; 
const long interval = 5000;  

float temp_to_set = 0.0;
float psi_to_set = 0.0;

int has_gotten_sram = 0;

int temp_change_data[20] = {};
int psi_change_data[20] = {};

float change_temp_by = 1; // 1%
float change_psi_by = 1; // 1%

for (int i = 0; i < 20; i++) {
  temp_change_data[i] = 100;
  psi_change_data[i] = 100;
}

int getFreeRam () {
  int v;
  return (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval);
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

  if ((currentMillis - previousMillis) >= interval) {
    
  }
}