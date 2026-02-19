const potential_faulty_parts = document.getElementById("potential-faulty-parts");

let faulty_session_temp = 0;
let faulty_session_psi = 0;
let faulty_session_pclimb = 0;
let faulty_session_tclimb = 0;
let faulty_session_pstall = 0;
let faulty_session_tstall = 0;
let faulty_session_vacuum = 0;

let last_warning_session_marker = "";

// localStorage path: warnings_catalogue
// format: 
// temp:0;psi:0;p-climb:0;t-climb:0;p-stall:0;t-stall:0;vacuum:0

function check_for_session_existence () {
  let session_to_check = localStorage.getItem("warnings_catalogue");
  switch (true) {
    case (session_to_check == null):
    case (session_to_check == undefined):
    case (session_to_check.replace(" ", "") == ""):
      localStorage.setItem("warnings_catalogue", "temp:0;psi:0;p-climb:0;t-climb:0;p-stall:0;t-stall:0;vacuum:0");
      break;
  }
}

function take_from_session (what_value) {
  let current_check_session = localStorage.getItem("warnings_catalogue");
  let current_check_session_split = String(current_check_session).split(";");

  let split_num_for_checking;

  switch (what_value.toLowerCase()) {
    case ("temperature"):
    //   let temp_card = current_check_session_split[0];
    //   let temp_value_temp_card = temp_card.split(":");
    //   let parsed_temp_value_temp_card = parseInt(temp_value_temp_card[1]);
      split_num_for_checking = 0;
      break;
    case ("pressure"):
      split_num_for_checking = 1;
      break;
    case ("p-climb"):
      split_num_for_checking = 2;
      break;
    case ("t-climb"):
      split_num_for_checking = 3;
      break;
    case ("p-stall"):
      split_num_for_checking = 4;
      break;
    case ("t-stall"):
      split_num_for_checking = 5;
      break;
    case ("vacuum"):
      split_num_for_checking = 6;
      break;
    default:
      return "not_found"
  }

  let session_card = current_check_session_split[split_num_for_checking];
  let session_card_val = session_card.split(":");
  return parseInt(session_card_val) + ":" + String(split_num_for_checking);
}

function insert_to_session (what_value_to_find, value_what) {
  let original_switcher_test = take_from_session(what_value_to_find);
  let original_switcher_pos_precheck = original_switcher_test.split(":");
  let original_switcher_pos = original_switcher_pos_precheck[1];

  let current_check_session = localStorage.getItem("warnings_catalogue");
  let current_check_session_split = String(current_check_session).split(";");

  let current_check_session_split_og = current_check_session_split[original_switcher_pos].split(":");
  current_check_session_split_og[1] = String(value_what);
  current_check_session_split_og = current_check_session_split_og.join(":");

  current_check_session_split[original_switcher_pos] = String(current_check_session_split_og);
  current_check_session_split = current_check_session_split.join(";");

  localStorage.setItem("warnings_catalogue", String(current_check_session_split));
}

function check_for_faulty_parts () {
  let warning_list_snapshot = warningArray;
  if (String(warning_list_snapshot) == last_warning_session_marker) {
    return false;
  }
  last_warning_session_marker = warning_list_snapshot;

  if (warning_list_snapshot.length < 1 || (!warning_list_snapshot.includes("TEMPERATURE") && !warning_list_snapshot.includes("PRESSURE") && !warning_list_snapshot.includes("T-CLIMB") && !warning_list_snapshot.includes("P-CLIMB") && !warning_list_snapshot.includes("T-STALL") && !warning_list_snapshot.includes("P-STALL") && !warning_list_snapshot.includes("VACUUM"))) {
    if (localStorage.getItem("fully_func") == null) {
      localStorage.setItem("fully_func", "0");
    }

    else {
      let current_fully_func_value = parseInt(String(localStorage.getItem("fully_func")));
      current_fully_func_value += 1;
      localStorage.setItem("fully_func", current_fully_func_value);
    }

    return false;
  }

  for (let i = 0; i < warning_list_snapshot.length; i++) {
    let taken_sesh_cosh = String(take_from_session(String(warning_list_snapshot[i])));
    if (taken_sesh_cosh !== "not_found") {
      let curr_warn_val = taken_sesh_cosh.split(":");
      curr_warn_val = parseInt(curr_warn_val[0]);
      curr_warn_val += 1;
    }
  }
}

check_for_session_existence();