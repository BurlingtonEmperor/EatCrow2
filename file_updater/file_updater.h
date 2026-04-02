#ifndef FILE_UPDATER_H
#define FILE_UPDATER_H

#include <string>
#include <sstream>
#include <vector>
#include <iostream>
#include <cstdlib>
#include <filesystem>

#include "make_cpp_easier.h"

std::filesystem::path cwd;
std::string pathString;

int convertCommandToInt (std::string& str);

#endif