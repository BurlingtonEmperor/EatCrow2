#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>
#include <algorithm>

#include "starforge_decipher.h"
#include "make_cpp_easier.h"

std::string string_to_decipher;

int convertCommandToInt(std::string& cmd_string) {
  std::string uppercase_cmd_string = toUpperCase(cmd_string);
  if (uppercase_cmd_string == "CALL") return 1;
  if (uppercase_cmd_string == "RUN") return 1;
  if (uppercase_cmd_string == "LOG") return 2;
  if (uppercase_cmd_string == "DISPLAY") return 2;
  if (uppercase_cmd_string == "WAIT") return 3;
  if (uppercase_cmd_string == "SET") return 4;
  if (uppercase_cmd_string == "COMMENT") return 5;
  return 0;
}

int main() {
  std::ifstream file("decipher.txt");
  std::string line;

  if (file.is_open()) {
    while (std::getline(file, line)) {
      // std::cout << line << "\n"; <-- testing
      string_to_decipher += line;
    }
    file.close();

    // std::cout << "Test"; <-- more testing.
    // std::cin.get();

    // std::stringstream ss(string_to_decipher);
    // std::string segment_limiter;
    // std::vector<std::string> seglist;

    // while(std::getline(ss, segment, ',')) {
    //   seglist.push_back(segment);
    // }

    std::vector<std::string> seglist = splitByString(string_to_decipher, "**)");

    for (int i = 0; i < seglist.size(); i++) {
      std::string individual_line = seglist[i];

      replaceAll(individual_line, "**-)", "");
      replaceAll(individual_line, "%20", "");
      replaceAll(individual_line, "%-20", "");

      std::vector<std::string> space_limiter = splitBySpaces(individual_line);
      int converted_command_to_int = convertCommandToInt(space_limiter[0]);

      switch (converted_command_to_int) {
        case 0:
          break;
      } 
    }
  } else {
    std::cerr << "Unable to open file" << std::endl;
    std::cin.get();
  }
  return 0;
}