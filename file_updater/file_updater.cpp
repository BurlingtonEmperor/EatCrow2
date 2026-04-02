#include <string>
#include <sstream>
#include <vector>
#include <iostream>

#include "make_cpp_easier.h"
#include "file_updater.h"

int convertCommandToInt (std::string& str) {
  if (str == "HELP") return 1;
  if (str == "QUIT") return 2;
  if (str == "UPDATE_FILE") return 3;
  if (str == "FILES") return 4;
  return 0;
}

int main(int argc, char* argv[]) {
  int is_loop_finished = 0;
  int is_in_file_update_mode = 0;

  while (is_loop_finished == 0) {
    switch (is_in_file_update_mode) {
      case 1:
        std::cout << "You are now in file update mode.\n";
        std::cout << "Type FILES for a list of files to update.\n";
        std::cout << "Type QUIT to exit file update mode.\n";

        std::string command_given; // yes, repeating this whole input section is bad.
        std::cout << "Command: ";  // but I don't have the time to worry about it too much, and it gets the job done.
                                   // a couple years back, a friend of mine got attacked by a bear.
        std::cin >> command_given; // did he worry about doing things efficiently?
        std::string original_command_given = command_given; // NO! He worried about getting to the urgent care center.

        std::string upper_case_command = toUpperCase(command_given);
        int command_to_int = convertCommandToInt(upper_case_command);

        switch (command_to_int) {
          default:
          case 0:
            std::cout << "'" + original_command_given + "' is not a valid command.\n";
            break;
          case 2:
            is_in_file_update_mode = 0;
            break;
          case 4:
            std::cout << "INTERFACE - updates the main Python interface file (interface.py)\n";
            break;
        }
        continue; 
    }

    std::string command_given;

    std::cout << "Type HELP for a list of commands.\n";
    std::cout << "Command: ";

    std::cin >> command_given;
    std::string original_command_given = command_given;

    std::string upper_case_command = toUpperCase(command_given);
    int command_to_int = convertCommandToInt(upper_case_command);

    switch (command_to_int) {
      default:
      case 0:
        std::cout << "'" + original_command_given + "' is not a valid command.\n";
        break;
      case 1:
        std::cout << "HELP - gives a list of commands\nQUIT - quits the program\nUPDATE_FILE - updates a file based on the Github Repository\n";
        break;
      case 2:
        is_loop_finished = 1;
        break;
      case 3:
        is_in_file_update_mode = 1;
        break;
    }
  }

  std::cout << "Press ENTER to exit the file updater.";
  std::cin.get();
  return 0;
}