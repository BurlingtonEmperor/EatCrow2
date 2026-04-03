#include <string>
#include <sstream>
#include <vector>
#include <iostream>
#include <cstdlib>
#include <filesystem>
#include <chrono>
#include <thread>

#include "make_cpp_easier.h"
#include "file_updater.h"

std::filesystem::path cwd = std::filesystem::current_path();
std::string pathString = cwd.string();

std::string webscrapePathString = pathString + "/webscraper/webscrape.exe";
std::string webscrapeOutputPath = pathString + "/webscraper/webscrape_output.txt";

bool checkForError () {
  std::string output_file_contents = get_file_contents("/webscraper/webscrape_output.txt");
  if (checkIncludes(output_file_contents, "There was an error when trying to fetch the remote file:")) {
    return false; // error detected
  } else {
    return true; // error not detected!
  }
}

int convertCommandToInt (std::string& str) {
  if (str == "HELP") return 1;
  if (str == "QUIT") return 2;
  if (str == "UPDATE_FILE") return 3;
  if (str == "FILES") return 4;
  if (str == "INTERFACE") return 5;
  if (str == "CHECK_ERR") return 6;
  if (str == "HTML") return 7;
  if (str == "DISPLAY_CALCULATIONS") return 8;
  return 0;
}

void writeToFile (std::string& file_dir, std::string& file_content) {
  std::ofstream mFile(file_dir);
  if (mFile.is_open()) {
    mFile << file_content + "\n";
    mFile.close();
  } else {
    std::cerr << "Unable to open file. \n";
  }
}

int main(int argc, char* argv[]) {
  int is_loop_finished = 0;
  int is_in_file_update_mode = 0;

  std::string currentSysCommand;

  while (is_loop_finished == 0) {
    switch (is_in_file_update_mode) {
      case 1:
        std::cout << "You are now in file update mode.\n";
        std::cout << "Type FILES for a list of files to update.\n";
        std::cout << "Type CHECK_ERR to check for errors.\n";
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
            std::cout << "INTERFACE - updates the main Python interface file (interface.py)\nHTML - updates the HTML file where everything is displayed.";
            break;
          case 5:
            currentSysCommand = "powershell -Command \"& '" + webscrapePathString + "' https://github.com/BurlingtonEmperor/EatCrow2/raw/refs/heads/main/interface.py";
            system(currentSysCommand.c_str());
            std::this_thread::sleep_for(std::chrono::seconds(3));
            if (checkForError() == true) {
              std::cout << "Updated interface.py.\n";

              std::string output_file_contents = get_file_contents("webscrape_output.txt");
              std::string needed_file_dir = "../interface.py";
              writeToFile(needed_file_dir, output_file_contents);
            } else {
              std::cout << "Encountered an error. Please check webscrape_output.txt \n";
            }
            break;
          case 6:
            if (checkForError() == true) {
              std::cout << "No errors found.\n";
            } else {
              std::cout << "Found an error. Please check webscrape_output.txt \n";
            }
            break;
          case 7:
            currentSysCommand = "powershell -Command \"& '" + webscrapePathString + "' https://github.com/BurlingtonEmperor/EatCrow2/raw/refs/heads/main/templates/index.html";
            system(currentSysCommand.c_str());
            std::this_thread::sleep_for(std::chrono::seconds(3));
            if (checkForError() == true) {
              std::cout << "Updated index.html.\n";

              std::string output_file_contents = get_file_contents("webscrape_output.txt");
              std::string needed_file_dir = "../templates/index.html";
              writeToFile(needed_file_dir, output_file_contents);
            } else {
              std::cout << "Encountered an error. Please check webscrape_output.txt \n";
            }
            break;
          case 8:
            currentSysCommand = "powershell -Command \"& '" + webscrapePathString + "' https://github.com/BurlingtonEmperor/EatCrow2/raw/refs/heads/main/static/index.js";
            system(currentSysCommand.c_str());
            std::this_thread::sleep_for(std::chrono::seconds(3));
            if (checkForError() == true) {
              std::cout << "Updated index.js.\n";

              std::string output_file_contents = get_file_contents("webscrape_output.txt");
              std::string needed_file_dir = "../static/index.js";
              writeToFile(needed_file_dir, output_file_contents);
            } else {
              std::cout << "Encountered an error. Please check webscrape_output.txt \n";
            }
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