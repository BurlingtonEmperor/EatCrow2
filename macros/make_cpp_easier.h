#ifndef MAKE_CPP_EASIER_H
#define MAKE_CPP_EASIER_H

#include <string>
#include <sstream>
#include <vector>

void replaceAll(std::string& str, const std::string& from, const std::string& to);
bool checkIncludes(std::string& text, const std::string& substring);
int convertBoolToInt(bool& bool_value);
std::vector<std::string> splitByString(const std::string& str, const std::string& delimiter);

#endif