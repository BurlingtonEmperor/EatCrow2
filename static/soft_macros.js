// macro window

$(function () {
  $(".draggable").draggable();
});

const macro_window = document.getElementById("macro-window");
const close_window_macro_window = document.getElementById("close-window-macro-window");
const open_macros_btn = document.getElementById("open-macros-btn");

let macro_to_run = "";

close_window_macro_window.onclick = function () {
  macro_window.style.display = "none";
}

open_macros_btn.onclick = function () {
  macro_window.style.display = "block";
}

const macro_default = document.getElementById("macro-default");
const macro_status_msgs = document.getElementById("macro_status_msgs");

const soft_macro_btns = document.getElementById("soft-macro-btns");
const soft_macros_btn = document.getElementById("soft-macros-btn");
const soft_macro_content = document.getElementById("soft-macro-content");
const return_soft_macro_btn = document.getElementById("return-soft-macro-btn");
const create_new_soft_macro_btn = document.getElementById("create-new-soft-macro-btn");

const hard_macros_btn = document.getElementById("hard-macros-btn");

soft_macros_btn.onclick = function () {
  macro_default.style.display = "none";
  soft_macros_btn.style.display = "none";
  hard_macros_btn.style.display = "none";

  soft_macro_content.style.display = "block";
}

return_soft_macro_btn.onclick = function () {
  macro_default.style.display = "block";
  soft_macros_btn.style.display = "block";
  hard_macros_btn.style.display = "block";

  soft_macro_content.style.display = "none";
}

const create_macrosoft = document.getElementById("create-macrosoft");
const cancel_create_soft = document.getElementById("cancel-create-soft-macro");
create_new_soft_macro_btn.onclick = function () {
  create_macrosoft.style.display = "block";
  soft_macro_btns.style.display = "none";
}

cancel_create_soft.onclick = function () {
  create_macrosoft.style.display = "none";
  soft_macro_btns.style.display = "block";
}

function checkIfMacroExists (macro_name) {
  let current_macro_array = JSON.parse(JSON.stringify(localStorage.getItem("soft-macros")));
  for (let i = 0; i < current_macro_array.length; i++) {
    if (current_macro_array[i].split("||{}||")[0] == macro_name) {
      return true;
    }
  }
  return false;
}

function createSoftMacro (macro_name, macro_content) {
  let soft_macro_name_to_create = macro_name
  let current_macro_array = JSON.parse(JSON.stringify(localStorage.getItem("soft-macros")));

  if (checkIfMacroExists(soft_macro_name_to_create)) {
    macro_status_msgs.innerText = "A soft macro with the name '" + String(macro_name) + "' already exists.";
  }

  else {
    current_macro_array.push(soft_macro_name_to_create + "||{}||" + macro_content);
    localStorage.setItem("soft-macros", JSON.stringify(current_macro_array));
  }
}

function readSoftMacro (macro_name) {
  let soft_macro_name_to_read = macro_name
  let current_macro_array = JSON.parse(JSON.stringify(localStorage.getItem("soft-macros")));

  if (checkIfMacroExists(soft_macro_name_to_read)) {
    for (let i = 0; i < current_macro_array.length; i++) {
      if (current_macro_array[i].split("||{}||")[0] == macro_name) {
        return current_macro_array[i].split("||{}||")[1];
      }
    }
  }
  
  else {
    macro_status_msgs.innerText = "'" + String(macro_name) + "' does not exist as a soft macro.";
  }
}

if (localStorage.getItem("soft-macros") == null) {
  localStorage.setItem("soft-macros", "[]");
}