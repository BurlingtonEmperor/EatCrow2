/*
Raider Aerospace Society Hash File 
Original name was Raider Rash, but it's going to have be called StarForge instead. I can't take the old name seriously.
This is a transpiler/interpreter that converts StarForge scripts into JavaScript. It's not super necessary but it 
is best for people who don't know how to navigate JavaScript or just want to make a curing process fast (or both)
*/

const allowed_raider_rash_commands = ["CALL", "RUN", "LOG", "WAIT", "SET", "STOP", "", "\n", "COMMENT", "VAR", "CHANGE_VAR"];
let raise_raider_rash_error = 0;
let universal_delay_time = 0; // in ms. bad way to make delays but what can I do?

let starforge_global_variables = []; // in StarForge, EVERY variable is global. 
// They are also stored in one array. Bad way to do things but don't really have a choice

function checkVariables (possible_variable) {
  let firstTwoChars = String(possible_variable).slice(0, 2);
  switch (firstTwoChars) {
    case ("_v"):
      let starforge_possible_var_name = String(possible_variable).slice(2);
      for (let i = 0; i < starforge_global_variables.length; i++) {
        switch (true) {
          case (starforge_possible_var_name == starforge_global_variables[i][0]):
            return String(starforge_global_variables[i][1]);
        }
      }
      return false;
    default:
      return false;
  }
}

function createStarForgeVariable (possible_variable, var_value) { // this hurts my head
  let this_instance_of_possible_variable = possible_variable;
  switch (false) {
    case (checkVariables(this_instance_of_possible_variable)):
      break;
    default:
      return false; // variable already exists
  }

  let variable_array = [];
  variable_array.push(possible_variable);
  variable_array.push(var_value);

  starforge_global_variables.push(variable_array);
  return true;
}

function changeStarForgeVariable (possible_variable, var_value) {
  let this_instance_of_possible_variable = possible_variable;
  switch (false) {
    // case (checkVariables(this_instance_of_possible_variable)):
    case (checkIfStarForgeVariableExists(this_instance_of_possible_variable)):
      return false;
  }

  // let starforge_possible_var_name = String(possible_variable).slice(2);

  for (let i = 0; i < starforge_global_variables.length; i++) {
    switch (true) {
      case (this_instance_of_possible_variable == starforge_global_variables[i][0]):
        starforge_global_variables[i][1] = var_value;
        return true;
    }
  }
  return false;
}

function checkIfStarForgeVariableExists (possible_variable) {
  // let exists = starforge_global_variables.some(v => v[0] === possible_variable);
  // return exists;
  for (let i = 0; i < starforge_global_variables.length; i++) {
    if (String(possible_variable) == starforge_global_variables[i][0]) {
      return true;
    }
  }
  return false;
}

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
      let logging_string = String(command1[1]);
      let logging_variable = checkVariables(logging_string);

      let firstTwoChars = String(logging_string).slice(0, 2);

      if (firstTwoChars == "_v") {
        switch (false) {
          case (logging_variable):
            raise_raider_rash_error = 1;
            return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" CALLS A NON-EXISTENT VARIABLE "' + String(logging_string) + '"';
          default:
            logging_string = logging_variable;
            break;
        }
      }

      return 'console.log("' + logging_string + '")';
    case "CALL":
      switch (String(command1[1].toUpperCase())) {
        case "SOFT_MACRO":
          if (!checkIfMacroExists(String(command1[2]))) {
            raise_raider_rash_error = 1;
            return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" CALLS A NON-EXISTENT SOFT MACRO';
          }
          return 'runSoftMacro("' + String(command1[2]) + '")';
        case "HARD_MACRO":
          if (!checkIfHardMacroExists(String(command1[2]))) {
            raise_raider_rash_error = 1;
            return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" CALLS A NON-EXISTENT HARD MACRO';
          }
          return 'runHardMacro("' + String(command1[2]) + '")';
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
        case (isNaN(parseFloat(command1[1]))):
          raise_raider_rash_error = 1;
          return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '"; ' + '"' + String(command1[1]) + '" IS NOT A VALID NUMBER';
        default:
          return 'universal_delay_time = ' + parseFloat(parseFloat(command1[1]) * 1000);
      }
    case "SET":
      switch (String(command1[1])) {
        case "TEMP":
          break;
        case "PSI":
          break;
        case "MAX_TEMP_RATE":
          break;
        case "MIN_TEMP_RATE":
          break;
        case "MAX_PSI_RATE":
          break;
        case "MIN_PSI_RATE":
          break;
        default:
          raise_raider_rash_error = 1;
          return 'COMMAND IS IMPURE: COMMAND ' +  String(command_line + 1) + ' "' + String(command_text) + '" SETS AN INVALID VARIABLE';
      }
      break;
    case "VAR":
      let var_string = String(command1[1]);

      if (checkIfStarForgeVariableExists(var_string) == true) {
        raise_raider_rash_error = 1;
        return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '"; VARIABLE CANNOT BE REDECLARED AS VAR';
      } else {
        createStarForgeVariable(var_string, command1[2]);
        return '// this is dummy code';
      }
    case "CHANGE_VAR":
      let cvar_string = String(command1[1]);
      switch (false) {
        case (checkIfStarForgeVariableExists(cvar_string)):
          raise_raider_rash_error = 1;
          return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '"; A NON-EXISTENT VARIABLE CANNOT BE CHANGED';
      }
      changeStarForgeVariable(cvar_string, command1[2]);
      return '// this is dummy code';
  }
}

function parse_RAIDER_RASH (unparsed_text) {
  let starforge_run_eval = [];
  // let split_semicolon_text = String(unparsed_text).split("**)");
  let split_semicolon_text = unparsed_text.split("**)")
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0);

  switch (false) {
    case (unparsed_text.includes("**)") && unparsed_text.replace(" ", "").length > 1):
      return 'SYNTAX IS IMPURE: COMMAND IDENTIFIER "**)" MISSING';
  }
  
  for (let i = 0; i < split_semicolon_text.length; i++) {
    switch (false) {
      case (check_if_commandIsValid(split_semicolon_text[i])):
        return 'SYNTAX IS IMPURE: COMMAND ' + String(i + 1) + ' "' + split_semicolon_text[i] + '" IS NOT A VALID COMMAND';
    }

    let potential_error = check_if_commandParametersAreValid(split_semicolon_text[i], i);

    switch (raise_raider_rash_error) {
      case 1:
        return potential_error;
      default:
        starforge_run_eval.push(potential_error); // this means that we can now run it later instead of getting an error
        break;
    }
  }
  
  let starforge_run_eval_pos = 0;
  function starforge_evaluationLoop () {
    universal_delay_time = 0; // reset timer
    if (starforge_run_eval_pos == (starforge_run_eval.length)) {
      console.log("FINISHED RUNTIME");
    } else {
      eval(starforge_run_eval[starforge_run_eval_pos]);
      starforge_run_eval_pos++;

      setTimeout(function () {
        starforge_evaluationLoop();
      }, universal_delay_time);
    }
  }
  starforge_evaluationLoop();
}