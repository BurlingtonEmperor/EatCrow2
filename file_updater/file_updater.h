#ifndef FILE_UPDATER_H
#define FILE_UPDATER_H

#include <string>
#include <sstream>
#include <vector>
#include <iostream>
#include <cstdlib>
#include <filesystem>
#include <chrono>
#include <thread>

#include "make_cpp_easier.h"

extern std::filesystem::path cwd;
extern std::string pathString;

int convertCommandToInt (std::string& str);
bool checkForError ();

#endif