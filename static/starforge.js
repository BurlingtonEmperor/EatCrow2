/*
Raider Aerospace Society Macro Scripting Language/RAS COBOL
Original name was Raider Rash, but it's going to have be called StarForge instead. I can't take the old name seriously.
This is a transpiler/interpreter that converts StarForge scripts into JavaScript. It's not super necessary but it 
is best for people who don't know how to navigate JavaScript or just want to make a curing process fast (or both)

The syntax is very similar to COBOL to the point where it can be considered a spiritual subset of COBOL. Thus, it can also be called RAS COBOL.
*/

const allowed_raider_rash_commands = [
  "CALL", "RUN", "LOG", "WAIT", "SET", "STOP", "", "\n", 
  "COMMENT", "VAR", "CHANGE_VAR", "REPEAT", "RUN_JS",
  "DISPLAY", "ACCEPT", "INPUT", "INPUT_VAR", "RUN_CPP",
  "IF", "ELSE", "PROGRAM-ID:", "MATH_DIVISION", "DIVIDE"
];
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

function genericStarForgeVariableCheck (possible_variable) {
  let firstTwoChars = String(possible_variable).slice(0, 2);
  if (firstTwoChars == "_v") {
    let starforge_possible_var_name = String(possible_variable).slice(2);
    if (checkIfStarForgeVariableExists(starforge_possible_var_name)) {
      let this_possible_variable = possible_variable;
      return checkVariables(this_possible_variable);
    } else {
      return possible_variable;
    }
  } else {
    return possible_variable;
  }
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

function check_Conditional_Statement (given_condition) {
  switch (true) {
    case (given_condition):
      return true;
    default:
      return false;
  }
}

function check_if_commandParametersAreValid (command_text, command_line) {
  command_text = command_text.replaceAll("**-)", "**)"); // make sure documentation command splitters aren't left out
  let command1 = command_text.split(" ");
  let first_word_of_command = String(command1[0]).toUpperCase();

  let logging_string = String(command1[1]);
  let logging_variable = checkVariables(logging_string);

  let macro_string = String(command1[2]);
  let macro_variable = checkVariables(macro_string);

  let firstTwoChars = String(logging_string).slice(0, 2);
  let is_null_var = 0;

  if (firstTwoChars == "_v") {
    switch (false) {
      case (logging_variable):
        // raise_raider_rash_error = 1;
        is_null_var = 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" CALLS A NON-EXISTENT VARIABLE "' + String(logging_string) + '"';
      default:
        logging_string = logging_variable;
        break;
    }

    // switch (false) {
    //   case (macro_variable):
    //     raise_raider_rash_error = 1;
    //     return '';
    // }
  }
  
  switch (first_word_of_command) {
    case "LOG":
    case "DISPLAY":
      switch (is_null_var) {
        case 0:
          break;
        default:
          raise_raider_rash_error = 1;
          return is_null_var;
      }
      return 'console.log("' + logging_string.replaceAll("%20", " ").replaceAll("%-20", "%20") + '")'; // did I turn my brain off when writing this piece of sh**?
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
        case (parseFloat(logging_string) == NaN):
        case (isNaN(parseFloat(logging_string))):
          raise_raider_rash_error = 1;
          return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '"; ' + '"' + String(command1[1]) + '" IS NOT A VALID NUMBER';
        default:
          return 'universal_delay_time = ' + parseFloat(parseFloat(logging_string) * 1000);
      }
    case "SET":
      let set_parse_preamble = genericStarForgeVariableCheck(String(command1[2]));
      let set_parse_num = parseFloat(set_parse_preamble);
      if (isNaN(set_parse_num)) {
        raise_raider_rash_error = 1;
        return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" SETS TO AN INVALID NUMBER';  
      }

      switch (String(command1[1])) {
        case "TEMP":
          if (isConnectedToBoard == false) {
            raise_raider_rash_error = 1;
            return 'CONNECTION IS IMPURE: DEVICE IS NOT CONNECTED TO BOARD';
          }
          return 'send_msg_to_board("o' + String(set_parse_num) + '")'; 
        case "PSI":
          if (isConnectedToBoard == false) {
            raise_raider_rash_error = 1;
            return 'CONNECTION IS IMPURE: DEVICE IS NOT CONNECTED TO BOARD';
          }
          return 'send_msg_to_board("k' + String(set_parse_num) + '")';
        case "MAX_TEMP_RATE":
          return 'temp_max_rate = ' + set_parse_num;
        case "MIN_TEMP_RATE":
          return 'temp_min_rate = ' + set_parse_num;
        case "MAX_PSI_RATE":
          return 'psi_max_rate = ' + set_parse_num;
        case "MIN_PSI_RATE":
          return 'psi_min_rate = ' + set_parse_num;
        case "TEMP_MAX":
          return 'temp_ceiling = ' + set_parse_num;
        case "PSI_MAX":
          return 'psi_ceiling = ' + set_parse_num;
        default:
          raise_raider_rash_error = 1;
          return 'COMMAND IS IMPURE: COMMAND ' +  String(command_line + 1) + ' "' + String(command_text) + '" SETS AN INVALID VARIABLE';
      }
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
      changeStarForgeVariable(cvar_string, genericStarForgeVariableCheck(command1[2]));
      return '// this is dummy code';
    case "RUN_JS":
      let run_js_general = command1;
      run_js_general.shift();
      let run_js_splitter = run_js_general;
      let run_js_joined = run_js_splitter.join(" ");
      let run_js_check = run_js_joined.split("|js|");

      switch (true) {
        case (run_js_check.length > 3):
          raise_raider_rash_error = 1;
          return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" ATTEMPTS TO RUN MORE THAN ONE PIECE OF JAVASCRIPT';
        case (run_js_check.length < 3):
          raise_raider_rash_error = 1;
          return 'SYNTAX IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" HAS AN INCOMPLETE INDICATION STRUCTURE';
      }
      return 'eval(`' + String(run_js_check[1]) + '`)';
    case "RUN_CPP":
      raise_raider_rash_error = 1;
      return 'USAGE IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" ATTEMPTS TO USE C++ IN A JAVASCRIPT CONTEXT';
    case "INPUT":
    case "ACCEPT":
      command1.shift();

      let accept_argument = command1.join(" ");
      return 'prompt("' + String(accept_argument) + '")'; // lazy way to do things but I want to get this done ASAP
    case "INPUT_VAR":
      command1.shift();
      let input_var = command1[0];
      command1.shift();

      if (checkIfStarForgeVariableExists(input_var)) {
        raise_raider_rash_error = 1;
        return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '"; VARIABLE CANNOT BE REDECLARED AS INPUT_VAR';
      }

      let accept_argument2 = command1.join(" ");
      return 'let prompt_var = prompt("' + accept_argument2 + '"); createStarForgeVariable("' + String(input_var) + '", String(prompt_var))';
    case "REPEAT":
      return 'is_repeating_macro = 1';
    case "STOP":
      return 'is_repeating_macro = 0; hard_stop_flag = 1';
    case "IF":
      let if_statement = command1;
      if_statement.shift();
      let if_statement_splitter = if_statement
      let join_if_statement = if_statement_splitter.join(" ");
      let if_statement_check = join_if_statement.split("|cond|");

      switch (true) {
        case (if_statement_check.length > 3):
          raise_raider_rash_error = 1;
          return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" ATTEMPTS TO CHECK FOR MORE THAN ONE CONDITIONAL';
        case (if_statement_check.length < 3):
          raise_raider_rash_error = 1;
          return 'SYNTAX IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" HAS AN INCOMPLETE INDICATION STRUCTURE';
      }
      
      let split_condition_text = if_statement_check[1].split(" ")
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0); // ex: [_vVar1, EQUALS, _vVar2]
      
      function check_IfStatementKeywords (given_keyword) {
        let allowed_if_statement_keywords = ["EQUALS", "MORE_THAN", "LESS_THAN", "IS_NOT", "INCLUDES"];
        for (let i = 0; i < allowed_if_statement_keywords.length; i++) {
          if (String(given_keyword) == allowed_if_statement_keywords[i]) {
            return true;
          }
        }
        return false;
      }

      if (check_IfStatementKeywords(split_condition_text[1])) {
        let if_statement_one = String(genericStarForgeVariableCheck(split_condition_text[0]));
        let if_statement_two = String(genericStarForgeVariableCheck(split_condition_text[2]));
        // let stat_result = "`" + if_statement_one + "` " + my_actual_statement + " `" + if_statement_two + "`";

        // if (my_actual_statement == "including") {
        //   stat_result = if_statement_one + ".includes(`" + if_statement_two + "`)"
        // }

        // let my_if_stat = JSON.stringify(stat_result);

        switch (math_division) {
          case 1:
            if_statement_one = parseFloat(if_statement_one);
            if_statement_two = parseFloat(if_statement_two);
            break;
        }
        
        let my_if_stat;
        switch (String(split_condition_text[1])) {
          case "EQUALS":
            my_if_stat = check_Conditional_Statement(if_statement_one == if_statement_two);
            break;
          case "MORE_THAN":
            my_if_stat = check_Conditional_Statement(if_statement_one > if_statement_two);
            break;
          case "LESS_THAN":
            my_if_stat = check_Conditional_Statement(if_statement_one < if_statement_two);
            break;
          case "IS_NOT":
            my_if_stat = check_Conditional_Statement(if_statement_one != if_statement_two);
            break;
          case "INCLUDES":
            my_if_stat = check_Conditional_Statement(if_statement_one.includes(if_statement_two));
            break;
        }
        
        if (my_if_stat) {
          let thing_to_parse = if_statement_check[2];
          let my_parser = thing_to_parse.split(" ")[1];
          if (my_parser == "THEN" || my_parser == " THEN" || my_parser == "THEN ") {} else {
            raise_raider_rash_error = 1;
            return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" USES AN INVALID IF-THEN KEYWORD';
          }
          
          let call_statement = thing_to_parse.split("THEN")[1].trim();
          if_statement_fufilled = 1;
          return check_if_commandParametersAreValid(call_statement, 0);
        } else {
          return '// dummy code';
        }
      } else {
        raise_raider_rash_error = 1;
        return 'COMMAND IS IMPURE: COMMAND ' + String(command_line + 1) + ' "' + String(command_text) + '" HAS AN INVALID OPERATOR';
      }
    case "ELSE":
      let else_if_statement_flag = if_statement_fufilled;
      if_statement_fufilled = 0;
       
      switch (else_if_statement_flag) {
        case 0:
          let else_call_statement = command_text.split("ELSE");
          let final_call_statement = else_call_statement[1].trim();
          
          return check_if_commandParametersAreValid(final_call_statement, 0);
        default:
          return '// dummy code';
      }

      break;
    case "MATH_DIVISION":
      math_division = 1;
      return '// why did I have to write it this way...'; // actually, what was the point of this again?!!
  }
}

let is_repeating_macro = 0; // if 1, it repeats
let hard_stop_flag = 0; // if 1 STOP!!!
let if_statement_fufilled = 0; // lets the program know if an if statement has been fufilled!
let math_division = 0; // lets the program know to start using numbers...

function parse_RAIDER_RASH (unparsed_text) {
  let starforge_run_eval = [];
  raise_raider_rash_error = 0;

  is_repeating_macro = 0;
  hard_stop_flag = 0;
  // let split_semicolon_text = String(unparsed_text).split("**)");
  let split_semicolon_text = unparsed_text.split("**)")
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0);

  switch (false) {
    case (unparsed_text.includes("**)") && unparsed_text.replace(" ", "").length > 1):
      return 'SYNTAX IS IMPURE: COMMAND IDENTIFIER "**)" MISSING';
  }
  
  for (let i = 0; i < split_semicolon_text.length; i++) {
    if (!split_semicolon_text[i].toUpperCase().startsWith("ELSE")) {
      if_statement_fufilled = 0; 
    }

    math_division = 0;

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
      switch (is_repeating_macro) {
        case 0:
          console.log("FINISHED RUNTIME");
          break;
        case 1:
          switch (hard_stop_flag) {
            case 1:
              return false;
          }
          starforge_run_eval_pos = 0;
          starforge_evaluationLoop();
          break;
      }
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