#include <string>
#include <sstream>
#include <vector>
#include <iostream>
#include <fstream>
#include <chrono>
#include <ranges>

#include "make_cpp_easier.h"

void console_log(std::string& str) { // this function mimics the JavaScript console.log() function
  std::cout << str;
}

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

std::vector<std::string> splitBySpaces(const std::string& str) { // this function splits a string using spaces, but ignores extra whitespace!
  std::stringstream ss(str);
  std::string word;
  std::vector<std::string> words;

  while (ss >> word) {
    words.push_back(word);
  }

  return words;
}

std::string joinVectorItems_string(std::vector<std::string>& str_vector) {
  std::string joined = str_vector | std::views::join_with(' ') | std::ranges::to<std::string>();
  return joined;
}

std::string toUpperCase(std::string& str) { // this function converts a string to all uppercase and returns it.
  for (char &c : str) {
    c = std::toupper(static_cast<unsigned char>(c));
  }
  return str;
}

std::string get_file_contents(const std::string& filename) { // gets file contents and puts it all into one string, then returns it.
  std::ifstream file(filename);
  if (!file.is_open()) return ""; 

  std::stringstream buffer;
  buffer << file.rdbuf();
  return buffer.str();
}