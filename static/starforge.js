/*
Raider Aerospace Society Hash File 
Original name was Raider Rash, but it's going to have be called StarForge instead. I can't take the old name seriously.
*/

const allowed_raider_rash_commands = ["CALL", "RUN", "LOG", "WAIT", "SET", "STOP", "", "\n", "COMMENT"];
let raise_raider_rash_error = 0;

function check_if_commandIsValid (command_text) {
  let first_word_of_command1 = command_text.split(" ");
  let first_word_of_command2 = first_word_of_command1[0];
  let first_word_of_command3 = String(first_word_of_command2).toUpperCase();

  for (let i = 0; i < allowed_raider_rash_commands.length; i++) {
    if (first_word_of_command3 == allowed_raider_rash_commands[i]) {
      return true;
    }
  }
  return false;
}

function check_if_commandParametersAreValid (command_text, command_line) {
  let command1 = command_text.split(" ");
  let first_word_of_command = String(command1[0]).toUpperCase();
  
  switch (first_word_of_command) {
    case "LOG":
      return String(command1[1]);
    case "CALL":
      switch (String(command1[1].toUpperCase())) {
        case "SOFT_MACRO":
          if (!checkIfMacroExists(String(command1[2]))) {
            raise_raider_rash_error = 1;
            return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" CALLS A NON-EXISTENT SOFT MACRO';
          }
          break;
        case "HARD_MACRO":
          if (!checkIfHardMacroExists(String(command1[2]))) {
            raise_raider_rash_error = 1;
            return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" CALLS A NON-EXISTENT HARD MACRO';
          }
          break;
        case "CURING_PROCESS":
        case "BOARD_MACRO":
          break;
        default:
          raise_raider_rash_error = 1;
          return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" CALLS AN INVALID TYPE';
      }
      break;
    case "WAIT":
      switch (true) {
        case (parseFloat(command1[1]) == NaN):
          raise_raider_rash_error = 1;
          return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '"; ' + '"' + String(command1[1]) + '" IS NOT A VALID NUMBER';
      }
      break;
  }
}

function parse_RAIDER_RASH (unparsed_text) {
  let split_semicolon_text = String(unparsed_text).split("**)");

  switch (false) {
    case (unparsed_text.includes("**)") && unparsed_text.replace(" ", "").length > 1):
      return 'SYNTAX IS IMPURE: COMMAND IDENTIFIER "**)" MISSING';
  }
  
  for (let i = 0; i < split_semicolon_text.length; i++) {
    switch (false) {
      case (check_if_commandIsValid(split_semicolon_text[i])):
        return 'SYNTAX IS IMPURE: COMMAND ' + String(i + 1) + ' "' + split_semicolon_text[i] + '" IS NOT A VALID COMMAND';
    }

    let potential_error = check_if_commandParametersAreValid(unparsed_text, i);

    switch (raise_raider_rash_error) {
      case 1:
        return potential_error;
    }
  }
}