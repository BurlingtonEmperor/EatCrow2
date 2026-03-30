#include <iostream>
#include <fstream>
#include <string>

#include "starforge_decipher.h"

std::string string_to_decipher;

int main() {
  std::ifstream file("decipher.txt");
  std::string line;

  if (file.is_open()) {
    while (std::getline(file, line)) {
    //   std::cout << line << "\n"; <-- testing
      string_to_decipher += line;
    }
    file.close();
  } else {
    std::cerr << "Unable to open file" << std::endl;
    std::cin.get();
  }
  return 0;
}