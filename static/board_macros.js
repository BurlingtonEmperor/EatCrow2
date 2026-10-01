// const freeEEPROM = document.getElementById("free-eeprom");
let board_macro_filename = '';

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
    return "filename";
  }
}