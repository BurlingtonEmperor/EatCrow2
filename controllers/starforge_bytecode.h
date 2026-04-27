#ifndef STARFORGE_BYTECODE_H
#define STARFORGE_BYTECODE_H

#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <sstream>
#include <vector>
#include <algorithm>
#include <ranges>

extern std::string string_to_decipher;

int convertCommandToInt(std::string& cmd_string);
int convertSetToInt(std::string& set_string);

bool checkIfVariable(std::string& potential_variable);

#endif