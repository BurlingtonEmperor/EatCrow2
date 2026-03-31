#include <string>
#include <sstream>
#include <vector>

#include "make_cpp_easier.h"

// this function is basically the JavaScript .replaceAll function
/*
Usage: replaceAll(myString, substringToReplace, newSubstring);
*/
void replaceAll(std::string& str, const std::string& from, const std::string& to) {
  size_t start_pos = 0;
  while((start_pos = str.find(from, start_pos)) != std::string::npos) {
    str.replace(start_pos, from.length(), to);
    start_pos += to.length(); 
  }
}

bool checkIncludes(std::string& text, const std::string& substring) { // this function checks to see if a string contains a substring.
  return text.find(substring) != std::string::npos;
}

int convertBoolToInt(bool& bool_value) { // this function converts a boolean to an integer (for switch statements); 1 = true and 0 = false
  if (bool_value) {
    return 1;
  } else {
    return 0;
  }
}

std::vector<std::string> splitByString(const std::string& str, const std::string& delimiter) { // this function splits a string using a delimiter and returns a vector
  std::vector<std::string> tokens;
  size_t start = 0;
  size_t end = str.find(delimiter);

  while (end != std::string::npos) {
    tokens.push_back(str.substr(start, end - start));
    start = end + delimiter.length(); // Move start past the delimiter
    end = str.find(delimiter, start);
  }

  tokens.push_back(str.substr(start));
  return tokens;
}