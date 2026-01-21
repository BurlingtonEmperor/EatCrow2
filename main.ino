void setup() {
  Serial.begin(9600); 
}

void loop() {
  if (Serial.available() > 0) {
    char incomingByte = Serial.read(); 

    if (incomingByte == '0') {
      Serial.println("raising temperature"); // raising temperature    
    }

    if (incomingByte == '1') {
      Serial.println("raising pressure"); // raising pressure      
    }

    if (incomingByte == '2') {
      Serial.println("")
    }
  }
}