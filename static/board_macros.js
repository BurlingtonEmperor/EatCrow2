// const freeEEPROM = document.getElementById("free-eeprom");
let board_macro_filename = '';

const board_macro_cache = localStorage.getItem("board-macro-cache");
if (board_macro_cache == null || board_macro_cache == undefined || board_macro_cache == "") {
  localStorage.setItem("board-macro-cache", "[]");
  checkHardMacroCache();
}

// function setBMConnection (filename) {
//   board_macro_filename = String(filename);
//   checkForBM_Connection();
// }

function checkForBM_Connection () {
  let saved_board_macro_filename = localStorage.getItem("board_macro_filename");
  if (saved_board_macro_filename == null || saved_board_macro_filename == undefined) {
    if (board_macro_filename == '') {
      return "no_filename";
    } else {
      localStorage.setItem("board_macro_filename", board_macro_filename);
      return "filename";
    }
  } else {
    if (board_macro_filename == '') {
      board_macro_filename = saved_board_macro_filename;
    } else {
      localStorage.setItem("board_macro_filename", board_macro_filename);
    }
    return "filename";
  }
}

async function retrieveBM_Data() {
  try {
    const response1 = await fetch("/board_macro_get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board_macro_filename_r: board_macro_filename })
    });
    const data1 = await response1.text();

    if (String(data1) === "No board macro file found in any flash drive.") {
      console.log(data1);
      return null; 
    }

    const temp_filepath = String(data1);
    console.log("Board macro filepath at: " + temp_filepath);

    const response2 = await fetch("/read_file_bm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filepath: temp_filepath })
    });
    const finalData = await response2.text();
    
    return finalData; 

  } catch (error) {
    console.error(error);
    throw error; 
  }
}

async function getContentsOfAllBoardMacros () {
  return fetch("/get_bmacro")
  .then(response => response.text())
  .then(data => {
    const firstElements = String(data).slice(0, 11); 
    switch (true) {
      case (firstElements.includes("File error:")):
        console.error(data);
        macro_status_msgs.innerText = "FILE ERROR WHEN RETRIEVING MACROS";
        return "error";
      // default:
      //   let current_macro_array = JSON.parse(data);
      //   console.log(current_macro_array);
      //   return current_macro_array;
    }

    return JSON.parse(data);
  })
  .catch(error => {
    console.error(error);
    macro_status_msgs.innerText = "COMMUNICATION WITH THE SERVER IS FAULTY";
    return "error";
  });
}

let is_board_macro_cache_empty = 0;
async function checkBoardMacroCache () {
  return fetch ("/get_bmacro") // yes these fetch requests are redundant but I ALSO need to get this done ASAP
  .then(response => response.text())
  .then(data => {
    let check_two = data;
    if (JSON.stringify(JSON.parse(check_two)) == JSON.stringify(JSON.parse(localStorage.getItem("board-macro-cache")))) {
      // do nothing
    } else {
      if (JSON.parse(check_two).length < JSON.parse(localStorage.getItem("board-macro-cache"))) {
        return fetch ("/create_bmacro", {
          method : "POST",
          headers : {
            "Content-Type" : "application/json"
          },
          body : JSON.stringify({
            macro_name : "CREATE",
            macro_content : localStorage.getItem("board-macro-cache")
          })
        })
        .then(response => response.text())
        .then(data_two => {
          return data_two;
        })
        .catch(error => {
          console.error(error);
          return error;
        });
      } else {
        localStorage.setItem("board-macro-cache", check_two);
        is_hard_macro_cache_empty = 1;
        location = ""; // refresh for good measure
        return "Updated board macro cache, " + String(data) + ", " + String(localStorage.getItem("board-macro-cache"));
      }
    }
    return "No new board macro cache needed";
  })
  .catch(error => {
    console.error(error);
    return error;
  });
}

function checkIfBoardMacroExists (macro_name) {
  let current_macro_array = JSON.parse(localStorage.getItem("board-macro-cache"));
  for (let i = 0; i < current_macro_array.length; i++) {
    if (current_macro_array[i].split("||{}||")[0] == macro_name) {
      return true;
    }
  }
  return false;
}

function deleteBoardMacro (macro_name) { // NOTE: this doesn't *actually* delete a hard macro. What this does is delete it from the cache, so that
  let board_macro_to_delete = macro_name; // later on the update function sees that macros.txt needs to be more like the cache when needed.
  let current_macro_array = JSON.parse(localStorage.getItem("board-macro-cache"));

  if (checkIfBoardMacroExists(board_macro_to_delete)) {
    is_board_macro_cache_empty = 0;
    if (current_macro_array.length < 2) {
      localStorage.setItem("board-macro-cache", "[]");  
      return false;
    }

    for (let i = 0; i < current_macro_array.length; i++) {
      if (current_macro_array[i].split("||{}||")[0] == macro_name) {
        let saved_alpha = current_macro_array[i];
        let last_pos = current_macro_array.length - 1;
        let save_last_pos = current_macro_array[last_pos];

        current_macro_array[last_pos] = saved_alpha;
        current_macro_array[i] = save_last_pos;

        current_macro_array.pop();
        localStorage.setItem("board-macro-cache", JSON.stringify(current_macro_array));
      }
    }
  }
  
  else {
    macro_status_msgs.innerText = "'" + String(macro_name) + "' does not exist as a board macro.";
  }
}

function createNewBoardMacro (macro_name, macro_content) {
  let board_macro_name_to_create = macro_name;
  let current_macro_array = JSON.parse(localStorage.getItem("board-macro-cache")); 

  is_board_macro_cache_empty = 0; // this lets the updater know that the permanent file needs to be more like the cache

  if (checkIfBoardMacroExists(board_macro_name_to_create)) { 
    deleteBoardMacro(board_macro_name_to_create);
    current_macro_array = JSON.parse(localStorage.getItem("board-macro-cache")); // no idea why I put this here, either!
    current_macro_array.push(board_macro_name_to_create + "||{}||" + macro_content + "||{}||" + macro_mode + "||{}||" + macro_run_cycle);
    localStorage.setItem("board-macro-cache", JSON.stringify(current_macro_array));
  }

  else {
    current_macro_array = JSON.parse(localStorage.getItem("board-macro-cache")); // no idea why I put this here.
    current_macro_array.push(board_macro_name_to_create + "||{}||" + macro_content + "||{}||" + macro_mode + "||{}||" + macro_run_cycle);
    localStorage.setItem("board-macro-cache", JSON.stringify(current_macro_array));
  }
}

async function updateBoardMacros () { // this will happen every 1 minute and will create macros from the cache IF the cache isn't empty
  switch (is_board_macro_cache_empty) {
    case 0:
    //   if (localStorage.getItem("hard_macro_cache") == null || localStorage.getItem("hard_macro_cache") == "[]") {
    //     return false;
    //   }
      fetch ("/create_bmacro", {
        method : "POST",
        headers : {
          "Content-Type" : "application/json"
        },
        body : JSON.stringify({
          macro_name : "CREATE",
          macro_content : localStorage.getItem("board-macro-cache")
        })
      })
      .then(response => response.text())
      .then(data => {
        console.log(data);
        is_board_macro_cache_empty = 1;
      })
      .catch(error => {
        console.error(error);
      });
      break;
  }
}

function runBoardMacro (macro_name) {
  let board_macro_name_to_read = macro_name;
  let current_macro_array = JSON.parse(localStorage.getItem("board-macro-cache"));

  if (checkIfBoardMacroExists(board_macro_name_to_read)) {
    for (let i = 0; i < current_macro_array.length; i++) {
      if (current_macro_array[i].split("||{}||")[0] == macro_name) {
        let read_array_macro = current_macro_array[i].split("||{}||");

        switch (parseInt(read_array_macro[2])) {
          case 0:
            if (safetyTimeProtocol) {
              return false;
            }
            checkForSafety();
            console.log("STARFORGE SET");
            starforge_global_variables = [];
            let temp_run_cycle = parse_RAIDER_RASH(read_array_macro[1]);
            console.log(temp_run_cycle);
            switch (raise_raider_rash_error) {
              case 1:
                console.error(temp_run_cycle);
                break;
            }
            break;
          case 1:
            try {
              eval(read_array_macro[1]);
            }
            catch (error) {
              console.error(error);
            };
            break;
        }
      }
    }
  }
  
  else {
    macro_status_msgs.innerText = "'" + String(macro_name) + "' does not exist as a board macro.";
  }
}