const allowed_raider_rash_commands = ["CALL", "RUN", "LOG", "WAIT", "SET", "STOP", "", "\n"];
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
        case "MACRO":
          
          break;
        default:
          raise_raider_rash_error = 1;
          return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" CALLS AN INVALID TYPE';
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

    switch (raise_raider_rash_error) {
      case 1:
        return check_if_commandParametersAreValid(unparsed_text, i);
        break;
    }
  }
}