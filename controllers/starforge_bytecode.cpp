#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>
#include <algorithm>
#include <ranges>

#include "starforge_bytecode.h"
#include "make_cpp_easier.h"

// #include "httplib.h"

/*
Bytecode converter for StarForge
*/

std::string string_to_decipher;

int convertCommandToInt(std::string& cmd_string) {
  std::string uppercase_cmd_string = toUpperCase(cmd_string);
  if (uppercase_cmd_string == "CALL") return 1;
  if (uppercase_cmd_string == "RUN") return 1;
  if (uppercase_cmd_string == "LOG") return 2;
  if (uppercase_cmd_string == "DISPLAY") return 2;
  if (uppercase_cmd_string == "WAIT") return 3;
  // if (uppercase_cmd_string == "SET") return 4;
  if (uppercase_cmd_string == "COMMENT") return 5;
  if (uppercase_cmd_string == "STOP") return 6;
  if (uppercase_cmd_string == "VAR") return 7;
  if (uppercase_cmd_string == "CHANGE_VAR") return 8;
  if (uppercase_cmd_string == "REPEAT") return 9;
  if (uppercase_cmd_string == "RUN_JS") return 10;
  if (uppercase_cmd_string == "ACCEPT") return 11;
  if (uppercase_cmd_string == "INPUT") return 11;
  if (uppercase_cmd_string == "INPUT_VAR") return 12;
  // if (uppercase_cmd_string == "RUN_CPP") return 13;
  if (uppercase_cmd_string == "IF") return 13;
  if (uppercase_cmd_string == "ELSE") return 14;
  if (uppercase_cmd_string == "PROGRAM-ID:") return 15;
  if (uppercase_cmd_string == "PROGRAM-ID: ") return 15;
  if (uppercase_cmd_string == "SET") return 16;
  if (uppercase_cmd_string == "SET ") return 16;
  return 0;
}

int convertOperatorToInt(std::string& operator_string) {
  std::string uppercase_operator_string = toUpperCase(operator_string);
  if (uppercase_operator_string == "EQUALS") return 1;
  if (uppercase_operator_string == "MORE_THAN") return 2;
  if (uppercase_operator_string == "LESS_THAN") return 3;
  if (uppercase_operator_string == "IS_NOT") return 4;
  if (uppercase_operator_string == "INCLUDES") return 5; 
  return 0;
}

int convertSetToInt(std::string& set_string) {
  std::string uppercase_set_string = toUpperCase(set_string);
  if (uppercase_set_string == "TEMP") return 1;
  if (uppercase_set_string == "PSI") return 2;
  if (uppercase_set_string == "MAX_TEMP_RATE") return 3;
  if (uppercase_set_string == "MAX_PSI_RATE") return 4;
  if (uppercase_set_string == "MIN_TEMP_RATE") return 5;
  if (uppercase_set_string == "MIN_PSI_RATE") return 6;
  if (uppercase_set_string == "TEMP_MAX") return 7;
  if (uppercase_set_string == "PSI_MAX") return 8;
  return 0;
}

bool checkIfVariable(std::string& potential_variable) {
  if (potential_variable.length() > 2) {
    if (potential_variable[0] == '_' && potential_variable[1] == 'v') {
      return true;
    }
  } else {
    return false;
  }
  return false;
}

std::string returnCommandPrompt(std::string& command_string, const std::string& command_itself) {
  std::vector<std::string> splitter_vector = splitByString(command_string, command_itself);
  return splitter_vector[1];
}

int main() {
  std::ifstream file("to_convert.txt");
  std::string line;

  if (file.is_open()) {
    while (std::getline(file, line)) {
      string_to_decipher += line;
    }
    file.close();

    std::vector<std::string> seglist = splitByString(string_to_decipher, "**)");
    std::vector<std::string> vector_to_return;

    for (int i = 0; i < seglist.size(); i++) {
      std::string individual_line = seglist[i];
      if (individual_line.empty()) continue;

      replaceAll(individual_line, "**-)", "");
      replaceAll(individual_line, "%20", "&nbsp;");
      replaceAll(individual_line, "%-20", "");

      std::vector<std::string> space_limiter = splitBySpaces(individual_line);
      int converted_command_to_int = convertCommandToInt(space_limiter[0]);

      if (space_limiter.empty()) continue;

      std::string secondary_argument = (space_limiter.size() > 1) ? space_limiter[1] : "0";
      std::string third_condition = (space_limiter.size() > 2) ? space_limiter[2] : "0";
      if (space_limiter.size() > 2) {
        third_condition = space_limiter[2];

        if (checkIfVariable(third_condition)) {
          std::string variable_name = third_condition;
          variable_name.erase(0, 2);
          third_condition = "0";
        }
      } else {
        third_condition = "0";
      }

      if (checkIfVariable(secondary_argument)) {
        std::string variable_name = space_limiter[1];

        variable_name.erase(0, 2);
        secondary_argument = "0";
      }

      std::vector<std::string> delimit_storage;

      switch (converted_command_to_int) {
        case 3:
          vector_to_return.push_back("w:" + secondary_argument + ";");
          break;
        case 6:
          vector_to_return.push_back("s;");
          break;
        case 16: {
          int set_to_string = convertSetToInt(secondary_argument);

          switch (set_to_string) {
            case 1:
              vector_to_return.push_back("t:" + third_condition + ";");
              break;
            case 2:
              vector_to_return.push_back("p:" + third_condition + ";");
              break;
          }
          break;
        }
      }
    }

    std::ofstream outFile("bytecode_output.txt");

    if (outFile.is_open()) {
      for (int i = 0; i < vector_to_return.size(); i++) {
        outFile << vector_to_return[i] << std::endl;
      }
      outFile.close();
    } else {
      std::cerr << "Unable to open file" << std::endl;
    }

    // httplib::Client cli("http://localhost:5000");
    // auto res = cli.Post("/endpoint", "{\"key\":\"value\"}", "application/json");
  } else {
    std::cerr << "Unable to open file" << std::endl;
    std::cin.get();
  }
  return 0;
}