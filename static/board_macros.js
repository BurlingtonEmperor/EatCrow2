// const freeEEPROM = document.getElementById("free-eeprom");
let board_macro_filename = '';

const board_macro_cache = localStorage.getItem("board-macro-cache");
if (board_macro_cache == null || board_macro_cache == undefined || board_macro_cache == "") {
  localStorage.setItem("board-macro-cache", "[]");
  checkHardMacroCache();
}

function setBMConnection (filename) {
  board_macro_filename = String(filename);
  checkForBM_Connection();
}

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