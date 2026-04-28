// DO NOT COMPILE!!

int convertCharToInt (char& char_to_convert) {
  if (char_to_convert == 's') return 1; // emergency stop.
  if (char_to_convert == '*') return 2; // switch read mode
  if (char_to_convert == 'c') return 3; // comm check
  if (char_to_convert == '!') return 4; // heater on
  if (char_to_convert == '~') return 5; // heater off
  if (char_to_convert == '@') return 6; // inlet solenoid on
  if (char_to_convert == '#') return 7; // inlet solenoid off
  if (char_to_convert == '$') return 8; // outlet solenoid on
  if (char_to_convert == '%') return 9; // outlet solenoid off
  if (char_to_convert == 'z') return 10; // requesting another sram check
  if (char_to_convert == '+') return 11; // changing temperature
  if (char_to_convert == 'o') return 11;
  if (char_to_convert == 'p') return 12; // changing pressure
  if (char_to_convert == 'k') return 12;
  if (char_to_convert == '>') return 13; // change tune value
  if (char_to_convert == '<') return 14; // read file (WIP)
  return 0; // default
}

int convertCharToInt_bytecode (char char_to_convert) {
  
}