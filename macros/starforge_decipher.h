#ifndef STARFORGE_DECIPHER_H
#define STARFORGE_DECIPHER_H

#include <string>

extern std::string string_to_decipher;

int convertCommandToInt(std::string& cmd_string);
bool checkIfVariable(std::string& potential_variable);

#endif