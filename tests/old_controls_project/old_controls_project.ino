#include "max6675.h"

//test code for verifying flow and heating conditions of an autoclave
//inlet assembly for the Raider Aerospace Society
//Includes code for controlled visual indicators, monitoring thermocouples, and cycling a full flow heater
int heatOnLED = 8;//red LED to visually show heater is on
int heatOffLED = 9;//blue LED to visually show heater is off
int heaterRelay = 6;//pin used to energize
//input pins for 1st thermocouple
int thermoDO1 = 2;
int thermoCS1 = 3;
//input pins for 2nd thermocouple
int thermoDO2 = 4;
int thermoCS2 = 5;
//shared timing pin for both thermocouples, wired together on board
int thermoCLK = 13;
int T_desired = 100;//target temperature, set low for demo
MAX6675 thermocouple1(thermoCLK, thermoCS1, thermoDO1);
MAX6675 thermocouple2(thermoCLK, thermoCS2, thermoDO2);
void setup() {
  // startup code for visual checks and pin allocation
  Serial.begin(9600);
  //set digital pins used as analog to correct type
  pinMode(heatOnLED,OUTPUT);
  pinMode(heatOffLED,OUTPUT);
  pinMode(heaterRelay,OUTPUT);
  //test lights on startup, confirm they are working
  digitalWrite(heatOnLED,HIGH);
  digitalWrite(heatOffLED,HIGH);
} 

void loop() {
  //setup serial monitor to display current temperatures for calibration and troubleshooting
  Serial.print("T1: F = ");
  Serial.println(thermocouple1.readFahrenheit());
  Serial.print("T2: F = ");
  Serial.println(thermocouple2.readFahrenheit());
  //read thermocouple data using library and store it in a usable form
  int T1 = thermocouple1.readFahrenheit();
  int T2 = thermocouple2.readFahrenheit();
  //delta will be the foundation of logic on whether to turn heater on/off
  int delta = thermocouple2.readFahrenheit() - T_desired;
  //if outlet is hotter than desired temperature turn heater off and cycle air for 10 seconds to cool off
  if (delta > 0){
    Serial.println("Heater turning off");
    digitalWrite(heatOnLED,LOW);
    digitalWrite(heatOffLED,HIGH);
    digitalWrite(heaterRelay,LOW);
    delay(10000);
  }
  //if outlet is cooler than desired temperature turn heater on and run for 400 ms then check again
  if (delta < 0);{
    Serial.print("Increase Still Needed: ");
    Serial.println(delta*(-1));
    Serial.println("Keeping heater on / turning on again");
    digitalWrite(heatOnLED,HIGH);
    digitalWrite(heatOffLED,LOW);
    digitalWrite(heaterRelay,HIGH);
    delay(400);
  }
}