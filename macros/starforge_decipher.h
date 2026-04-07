#ifndef STARFORGE_DECIPHER_H
#define STARFORGE_DECIPHER_H

#include <string>

extern std::string string_to_decipher;

int convertCommandToInt(std::string& cmd_string);
int convertOperatorToInt(std::string& operator_string);

bool checkIfVariable(std::string& potential_variable);

std::string returnCommandPrompt(std::string& command_string, const std::string& command_itself);

#endif