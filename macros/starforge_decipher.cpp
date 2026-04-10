#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>
#include <algorithm>
#include <ranges>

#include "starforge_decipher.h"
#include "make_cpp_easier.h"

/*
A "Translator" for StarForge scripts. Turns StarForge into VERY readable human instructions. 
*/

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
  if (uppercase_cmd_string == "PROGRAM-ID") return 15;
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
    std::vector<std::string> vector_to_return;

    for (int i = 0; i < seglist.size(); i++) {
      std::string individual_line = seglist[i];
      if (individual_line.empty()) continue;

      replaceAll(individual_line, "**-)", "");
      replaceAll(individual_line, "%20", "");
      replaceAll(individual_line, "%-20", "");

      std::vector<std::string> space_limiter = splitBySpaces(individual_line);
      int converted_command_to_int = convertCommandToInt(space_limiter[0]);

      if (space_limiter.empty()) continue;

      std::string secondary_argument = (space_limiter.size() > 1) ? space_limiter[1] : "";
      std::string third_condition = (space_limiter.size() > 2) ? space_limiter[2] : "(This value is undefined.)";
      if (space_limiter.size() > 2) {
        third_condition = space_limiter[2];

        if (checkIfVariable(third_condition)) {
          std::string variable_name = third_condition;
          variable_name.erase(0, 2);
          third_condition = "(A value assigned to the variable " + variable_name + ").";
        }
      } else {
        third_condition = "(This value is undefined.)";
      }

      if (checkIfVariable(secondary_argument)) {
        std::string variable_name = space_limiter[1];

        variable_name.erase(0, 2);
        secondary_argument = "(A value assigned to the variable " + variable_name + ").";
      }

      std::vector<std::string> delimit_storage;

      switch (converted_command_to_int) {
        case 0:
          vector_to_return.push_back("An invalid command was given here.");
          break;
        case 1:
          vector_to_return.push_back("This program is calling another program: " + secondary_argument);
          break;
        case 2:
          vector_to_return.push_back("Displaying to console: " + secondary_argument);
          break;
        case 3:
          vector_to_return.push_back("Waiting for " + secondary_argument + " seconds.");
          break;
        case 6:
          vector_to_return.push_back("Stopping the program here.");
          break;
        case 7:
          vector_to_return.push_back("Declared a variable with the name " + secondary_argument);
          break;
        case 8:
          vector_to_return.push_back("Changing variable " + secondary_argument + " to " + third_condition);
          break;
        case 9:
          vector_to_return.push_back("Repeating the program here.");
          break;
        case 10:
          delimit_storage = splitByString(individual_line, "|js|");
          vector_to_return.push_back("Running JavaScript here: " + delimit_storage[1]);
          break;
        case 11: {
          std::string input_command;
          if (space_limiter[0] == "ACCEPT") {
            input_command = "ACCEPT";
          } else{
            input_command = "INPUT";
          }

          std::string input_ask = returnCommandPrompt(individual_line, input_command);
          vector_to_return.push_back("Accepting input, " + input_ask);
          break;
        }
        case 12: {
          delimit_storage = splitByString(individual_line, secondary_argument);
          std::string rest_of_input_var = delimit_storage[1];
          vector_to_return.push_back("Assigning value to the variable " + secondary_argument + " by accepting input, " + rest_of_input_var);
          break;
        }
        case 13: {
          delimit_storage = splitByString(individual_line, "|cond|");

          std::vector<std::string> conditional_splitter = splitBySpaces(delimit_storage[1]);
          std::string selected_operator = conditional_splitter[1];

          int operator_to_int = convertOperatorToInt(selected_operator);
          if (delimit_storage.size() < 3 || delimit_storage.size() > 3) {
            vector_to_return.push_back("An if statement was attempted here, but too many conditional delimiters were given.");
          } else {
            std::string cond_split_zero = conditional_splitter[0];
            std::string cond_split_two = conditional_splitter[2];
            
            if (checkIfVariable(cond_split_zero)) {
              std::string variable_name = cond_split_zero;

              variable_name.erase(0, 2);
              cond_split_zero = "(A value assigned to the variable " + variable_name + ").";
            }

            if (checkIfVariable(cond_split_two)) {
              std::string variable_name = cond_split_two;

              variable_name.erase(0, 2);
              cond_split_two = "(A value assigned to the variable " + variable_name + ").";
            }

            switch (operator_to_int) {
              case 0:
                vector_to_return.push_back("An if statement was attempted here, but an invalid operator was used.");
                break;
              case 1:
                vector_to_return.push_back("Checking if (" + cond_split_zero + ") is equal to (" + cond_split_two + ").");
                break;
              case 2:
                vector_to_return.push_back("Checking if (" + cond_split_zero + ") is greater than (" + cond_split_two + ").");
                break;
              case 3:
                vector_to_return.push_back("Checking if (" + cond_split_zero + ") is less than (" + cond_split_two + ").");
                break;
              case 4:
                vector_to_return.push_back("Checking if (" + cond_split_zero + ") is not (" + cond_split_two + ").");
                break;
              case 5:
                vector_to_return.push_back("Checking if (" + cond_split_zero + ") includes (" + cond_split_two + ").");
                break;
            }
            vector_to_return.push_back("Then..." + delimit_storage[2]);
          }
          break;
        }
        case 14: {
          std::vector<std::string> else_argument;
          for (int i = 0; i < space_limiter.size(); i++) {
            else_argument.push_back(space_limiter[i]);
          }

          std::string joined_else_argument = joinVectorItems_string(else_argument);
          vector_to_return.push_back("Else, then " + joined_else_argument);
        }
        case 15:
          vector_to_return.push_back("This program's ID is '" + secondary_argument + "'");
          break;
      } 
    }

    std::ofstream outFile("../static/translated.txt");

    if (outFile.is_open()) {
      for (int i = 1; i < vector_to_return.size(); i++) {
        outFile << vector_to_return[i] << std::endl;
      }
      outFile.close();
    } else {
      std::cerr << "Unable to open file" << std::endl;
    }
  } else {
    std::cerr << "Unable to open file" << std::endl;
    std::cin.get();
  }
  return 0;
}