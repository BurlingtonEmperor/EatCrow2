#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>
#include <algorithm>

#include "starforge_decipher.h"
#include "make_cpp_easier.h"

std::string string_to_decipher;

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
    }
  } else {
    std::cerr << "Unable to open file" << std::endl;
    std::cin.get();
  }
  return 0;
}