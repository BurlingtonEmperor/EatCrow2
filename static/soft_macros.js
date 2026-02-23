// macro window

$(function () {
  $(".draggable").draggable();
});

const macro_window = document.getElementById("macro-window");
const close_window_macro_window = document.getElementById("close-window-macro-window");
const open_macros_btn = document.getElementById("open-macros-btn");

let macro_to_run = "";
let current_macro_type = 0; 
let macro_mode = 0;
let macro_run_cycle = 0;

/*
Macro Types:
0 - Soft Macros
1 - Hard Macros 
2 - Board Macros

Macro Modes:
0 - Default
1 - JavaScript

Macro Run Cycles: (JavaScript)
0 - Run when called
1 - Run when interface starts
*/

close_window_macro_window.onclick = function () {
  macro_window.style.display = "none";
}

open_macros_btn.onclick = function () {
  macro_window.style.display = "block";
}

const macro_default = document.getElementById("macro-default");
const macro_status_msgs = document.getElementById("macro_status_msgs");
const main_macro_btns = document.getElementById("main-macro-btns");

const soft_macro_btns = document.getElementById("soft-macro-btns");
const soft_macros_btn = document.getElementById("soft-macros-btn");
const soft_macro_content = document.getElementById("soft-macro-content");
const return_soft_macro_btn = document.getElementById("return-soft-macro-btn");
const create_new_soft_macro_btn = document.getElementById("create-new-soft-macro-btn");
const edit_macro_btn = document.getElementById("edit-soft-macro-btn");
const delete_macro_btn = document.getElementById("delete-soft-macro-btn");

const more_macro_options = document.getElementById("more-macro-options");

const hard_macros_btn = document.getElementById("hard-macros-btn");
const board_macros_btn = document.getElementById("board-macros-btn");

soft_macros_btn.onclick = function () {
  macro_default.style.display = "none";
//   soft_macros_btn.style.display = "none";
//   hard_macros_btn.style.display = "none";
  main_macro_btns.style.display = "none";

  soft_macro_content.style.display = "block";
//   more_macro_options.style.display = "block";
  current_macro_type = 0;
}

hard_macros_btn.onclick = function () {
  macro_default.style.display = "none";
  main_macro_btns.style.display = "none";

  soft_macro_content.style.display = "block";
//   more_macro_options.style.display = "block";
  current_macro_type = 1;
}

board_macros_btn.onclick = function () {
  macro_default.style.display = "none";
  main_macro_btns.style.display = "none";

  soft_macro_content.style.display = "block";
//   more_macro_options.style.display = "block";
  current_macro_type = 2;
}

return_soft_macro_btn.onclick = function () {
  macro_default.style.display = "block";
//   soft_macros_btn.style.display = "block";
//   hard_macros_btn.style.display = "block";
  main_macro_btns.style.display = "block";

  soft_macro_content.style.display = "none";
//   more_macro_options.style.display = "none";
}

const edit_macro_select = document.getElementById("edit-macro-select");
const edit_macrosoft = document.getElementById("edit-macrosoft");
const cancel_edit_macro = document.getElementById("cancel-edit-macro");
const select_edit_macro = document.getElementById("select-edit-btn");

function populateEditOptions_macro () {
  let current_macro_array = JSON.parse(localStorage.getItem("soft-macros"));
  for (let i = 0; i < current_macro_array.length; i++) {
    let option_to_create = document.createElement("option");
    let parsed_item_array = current_macro_array[i].split("||{}||");

    option_to_create.value = parsed_item_array[0];
    option_to_create.innerText = parsed_item_array[0];

    edit_macro_select.appendChild(option_to_create);
  }
}

function clearEditOptions_macro () {
  edit_macro_select.innerHTML = "<option value=''>NONE</option>";
}

edit_macro_btn.onclick = function () {
  edit_macrosoft.style.display = "block";
  more_macro_options.style.display = "block";
  soft_macro_btns.style.display = "none";

  populateEditOptions_macro();
}

cancel_edit_macro.onclick = function () {
  edit_macrosoft.style.display = "none";
  more_macro_options.style.display = "none";
  soft_macro_btns.style.display = "block";

  clearEditOptions_macro();
  js_macro_mode.value = "";
  js_textbox_input.value = "";
}

let macro_select_value = "";
edit_macro_select.onclick = function () {
  if (edit_macro_select.value !== macro_select_value) {
    macro_select_value = edit_macro_select.value;
    // console.log("test");
    let current_macro_array = JSON.parse(localStorage.getItem("soft-macros"));

    for (let i = 0; i < current_macro_array.length; i++) {
      let split_parse_macro = current_macro_array[i].split("||{}||");
      if (split_parse_macro[0] == macro_select_value) {
        switch (parseInt(split_parse_macro[3])) {
          case 0:
            js_macro_mode.value = "";
            is_reading_js_for_macro = 1;
            break;
          case 1:
            js_macro_mode.value = "run-with-interface";
            is_reading_js_for_macro = 1;
            break;
          default:
            js_macro_mode.value = "";
            is_reading_js_for_macro = 0;
            break;
        }
      }
    }
  }
}

select_edit_macro.onclick = function () {
  if (edit_macro_select.value == "") {
    return false;
  }

  switch (current_macro_type) {
    case 0:
      let current_macro_array = JSON.parse(localStorage.getItem("soft-macros"));
      for (let i = 0; i < current_macro_array.length; i++) {
        let parsed_item_array = current_macro_array[i].split("||{}||");
        if (parsed_item_array[0] == edit_macro_select.value) {
          if (parsed_item_array[2] == 1) {
            set_mode_to_javascript.click();
            js_textbox_input.value = parsed_item_array[1];
          }
          macro_name_to_create.value = parsed_item_array[0];
        }
      }
      break;
  }

  macro_editor.style.display = "block";
  setTimeout(function () {
    macro_editor.click();
  }, 100);
}

const delete_macro_select = document.getElementById("delete-macro-select");
const delete_macrosoft = document.getElementById("delete-macrosoft");
const cancel_delete_macro = document.getElementById("cancel-delete-macro");
const select_delete_macro = document.getElementById("select-delete-btn");

function populateDeleteOptions_macro () {
  let current_macro_array = JSON.parse(localStorage.getItem("soft-macros"));
  for (let i = 0; i < current_macro_array.length; i++) {
    let option_to_create = document.createElement("option");
    let parsed_item_array = current_macro_array[i].split("||{}||");

    option_to_create.value = parsed_item_array[0];
    option_to_create.innerText = parsed_item_array[0];

    delete_macro_select.appendChild(option_to_create);
  }
}

function clearDeleteOptions_macro () {
  delete_macro_select.innerHTML = "<option value=''>NONE</option>";
}

delete_macro_btn.onclick = function () {
  delete_macrosoft.style.display = "block";
  more_macro_options.style.display = "block";
  soft_macro_btns.style.display = "none";

  populateDeleteOptions_macro();
}

cancel_delete_macro.onclick = function () {
  delete_macrosoft.style.display = "none";
  more_macro_options.style.display = "none";
  soft_macro_btns.style.display = "block";

  clearDeleteOptions_macro();
}

select_delete_macro.onclick = function () {
  if (delete_macro_select.value == "") {
    return false;
  }

  deleteSoftMacro(delete_macro_select.value);
  macro_status_msgs.innerText = "DELETED '" + delete_macro_select.value + "'.";
}

const create_macrosoft = document.getElementById("create-macrosoft");
const cancel_create_soft = document.getElementById("cancel-create-soft-macro");
const macro_name_to_create = document.getElementById("soft-macro-name-to-create");

create_new_soft_macro_btn.onclick = function () {
  create_macrosoft.style.display = "block";
  more_macro_options.style.display = "block";
  soft_macro_btns.style.display = "none";
}

cancel_create_soft.onclick = function () {
  create_macrosoft.style.display = "none";
  more_macro_options.style.display = "none";
  soft_macro_btns.style.display = "block";

  macro_status_msgs.innerText = "";
  js_macro_mode.value = "";
  macro_name_to_create.value = "";
  js_textbox_input.value = "";
}

const js_macro_mode = document.getElementById("js-macro-mode");

function checkIfMacroExists (macro_name) {
  let current_macro_array = JSON.parse(localStorage.getItem("soft-macros"));
  for (let i = 0; i < current_macro_array.length; i++) {
    if (current_macro_array[i].split("||{}||")[0] == macro_name) {
      return true;
    }
  }
  return false;
}

function createSoftMacro (macro_name, macro_content) {
  let soft_macro_name_to_create = macro_name;
  let current_macro_array = JSON.parse(localStorage.getItem("soft-macros"));

  if (checkIfMacroExists(soft_macro_name_to_create)) {
    // macro_status_msgs.innerText = "A soft macro with the name '" + String(macro_name) + "' already exists.";
    deleteSoftMacro(soft_macro_name_to_create);
    current_macro_array = JSON.parse(localStorage.getItem("soft-macros"));
    current_macro_array.push(soft_macro_name_to_create + "||{}||" + macro_content + "||{}||" + macro_mode + "||{}||" + macro_run_cycle);
    localStorage.setItem("soft-macros", JSON.stringify(current_macro_array));
  }

  else {
    current_macro_array = JSON.parse(localStorage.getItem("soft-macros"));
    current_macro_array.push(soft_macro_name_to_create + "||{}||" + macro_content + "||{}||" + macro_mode + "||{}||" + macro_run_cycle);
    localStorage.setItem("soft-macros", JSON.stringify(current_macro_array));
  }
}

let is_reading_js_for_macro = 0;
function readSoftMacro (macro_name) {
  let soft_macro_name_to_read = macro_name;
  let current_macro_array = JSON.parse(JSON.stringify(localStorage.getItem("soft-macros")));

  if (checkIfMacroExists(soft_macro_name_to_read)) {
    for (let i = 0; i < current_macro_array.length; i++) {
      if (current_macro_array[i].split("||{}||")[0] == macro_name) {
        let read_array_macro = current_macro_array[i].split("||{}||");

        switch (parseInt(read_array_macro[3])) {
          case 0:
            js_macro_mode.value = "";
            is_reading_js_for_macro = 1;
            break;
          case 1:
            js_macro_mode.value = "run-with-interface";
            is_reading_js_for_macro = 1;
            break;
          default:
            is_reading_js_for_macro = 0;
            break;
        }
        return current_macro_array[i].split("||{}||")[1];
      }
    }
  }
  
  else {
    macro_status_msgs.innerText = "'" + String(macro_name) + "' does not exist as a soft macro.";
  }
}

function deleteSoftMacro (macro_name) {
  let soft_macro_to_delete = macro_name;
  let current_macro_array = JSON.parse(localStorage.getItem("soft-macros"));

  if (checkIfMacroExists(soft_macro_to_delete)) {
    // console.log("macro exists!");
    if (current_macro_array.length < 2) {
      localStorage.setItem("soft-macros", "[]");  
    //   console.log("deleted macro 1");
      return false;
    }

    for (let i = 0; i < current_macro_array.length; i++) {
      if (current_macro_array[i].split("||{}||")[0] == macro_name) {
        // console.log("deleted macro 2");
        let saved_alpha = current_macro_array[i];
        let last_pos = current_macro_array.length - 1;
        let save_last_pos = current_macro_array[last_pos];

        current_macro_array[last_pos] = saved_alpha;
        current_macro_array[i] = save_last_pos;

        current_macro_array.pop();
        localStorage.setItem("soft-macros", JSON.stringify(current_macro_array));
      }
    }
  }
  
  else {
    macro_status_msgs.innerText = "'" + String(macro_name) + "' does not exist as a soft macro.";
  }
}

function checkForIllegalChars (content_to_check) {
  if (content_to_check.includes("||{}||")) {
    return true;
  }
  return false;
}

const actually_create_macro = document.getElementById("create-soft-macro-for-reals");
actually_create_macro.onclick = function () {
  if (macro_name_to_create.value == null || macro_name_to_create.value.replace(" ", "") == "") {
    return false;
  }

  if (checkIfMacroExists(macro_name_to_create.value.replace(" ", "%20")) && current_macro_type == 0) {
    macro_status_msgs.innerText = "A soft macro with the name '" + String(macro_name_to_create.value) + "' already exists.";
    return false;
  }

  macro_editor.style.display = "block";
  macro_status_msgs.innerText = "";
  js_macro_mode.value = "";
  js_textbox_input.value = "";

  setTimeout(function () {
    macro_editor.click();
  }, 100);
}

if (localStorage.getItem("soft-macros") == null) {
  localStorage.setItem("soft-macros", "[]");
}

else {
  let current_macro_array = JSON.parse(localStorage.getItem("soft-macros"));
  for (let i = 0; i < current_macro_array.length; i++) {
    let parsed_item_array = current_macro_array[i].split("||{}||");
    // switch (parseInt(parsed_item_array[3])) {
    //   case 1:
    //     eval(parsed_item_array[1]);
    //     break;
    // }
    if (parseInt(parsed_item_array[3]) == 1 && parseInt(parsed_item_array[2]) == 1) {
      eval(parsed_item_array[1]);
    }
  }
}

// macro editor
const macro_editor = document.getElementById("macro-editor");

const close_window_macro_editor = document.getElementById("close-window-macro-editor");
const set_mode_to_javascript = document.getElementById("set-mode-to-javascript");
const set_mode_to_default = document.getElementById("set-mode-to-default");

const js_textbox = document.getElementById("js-textbox");
const js_textbox_input = document.getElementById("js-textbox-input");

const save_macro_btn = document.getElementById("save-macro");

macro_editor.onclick = function () {
  macro_editor.style.zIndex = "102";
  macro_window.style.zIndex = "101";
}

macro_window.onclick = function () {
  macro_editor.style.zIndex = "101";
  macro_window.style.zIndex = "102";
}

close_window_macro_editor.onclick = function () {
  macro_editor.style.display = "none";
}

set_mode_to_javascript.onclick = function () {
  if (current_macro_type == 2) {
    macro_status_msgs.innerText = "JAVASCRIPT NOT SUPPORTED ON BOARD MACROS";
    return false;
  }

  macro_mode = 1;
  macro_status_msgs.innerText = "MODE SET TO JAVASCRIPT";
  js_textbox.style.display = "block";
}

set_mode_to_default.onclick = function () {
  macro_mode = 0;
  macro_status_msgs.innerText = "MODE SET TO DEFAULT";
}

save_macro_btn.onclick = function () {
  let spaceRemoverMacroName = macro_name_to_create.value.replace(" ", "%20");
  if (checkForIllegalChars(spaceRemoverMacroName)) {
    macro_status_msgs.innerText = "DO NOT INCLUDE '||{}||' IN MACRO NAME";
    return false;
  }

  let macro_real_content;

  switch (js_macro_mode.value) {
    case (""):
      macro_run_cycle = 0;
      break;
    default:
      if (macro_mode == 1) {
        macro_run_cycle = 1;
      }
      else {
        macro_run_cycle = 0;
      }
      break;
  }

  switch (macro_mode) {
    case 0:
      break;
    case 1:
      if (js_textbox_input.value.includes("||{}||")) {
        macro_status_msgs.innerText = "DO NOT INCLUDE '||{}||' IN MACRO CONTENT";
        return false;
      }
      macro_real_content = js_textbox_input.value;
      break;
  }

  switch (current_macro_type) {
    case 0:
      createSoftMacro(spaceRemoverMacroName, macro_real_content);
      break;
  }

  const now = new Date();
  const hours = now.getHours();         
  const minutes = now.getMinutes();       
  const seconds = now.getSeconds();    

  macro_status_msgs.innerText = "MACRO HAS BEEN SAVED AS '" + spaceRemoverMacroName + "' AT " + String(hours) + ":" + String(minutes) + ":" + String(seconds);
}