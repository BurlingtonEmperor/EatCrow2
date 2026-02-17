const potential_faulty_parts = document.getElementById("potential-faulty-parts");

let faulty_session_temp = 0;
let faulty_session_psi = 0;
let faulty_session_pclimb = 0;
let faulty_session_tclimb = 0;
let faulty_session_pstall = 0;
let faulty_session_tstall = 0;
let faulty_session_vacuum = 0;

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
  }

  let session_card = current_check_session_split[split_num_for_checking];
  let session_card_val = session_card.split(":");
  return parseFloat(session_card_val) + ":" + String(split_num_for_checking);
}

function insert_to_session (what_value, value_what) {
  
}

function check_for_faulty_parts () {
  let warning_list_snapshot = warningArray;
  for (let i = 0; i < warning_list_snapshot.length; i++) {
    switch (warning_list_snapshot[i]) {
      case ("TEMPERATURE"):
        
        break;
    }
  }
}

check_for_session_existence();