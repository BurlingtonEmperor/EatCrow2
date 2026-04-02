#ifndef MAKE_CPP_EASIER_H
#define MAKE_CPP_EASIER_H

#include <string>
#include <sstream>
#include <vector>
#include <iostream>

void replaceAll(std::string& str, const std::string& from, const std::string& to);
void console_log(std::string& str);

bool checkIncludes(std::string& text, const std::string& substring);
int convertBoolToInt(bool& bool_value);

std::vector<std::string> splitByString(const std::string& str, const std::string& delimiter);
std::vector<std::string> splitBySpaces(const std::string& str);
std::string toUpperCase(std::string& str);

#endif