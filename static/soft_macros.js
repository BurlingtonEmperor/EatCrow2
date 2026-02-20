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

const soft_macros_btn = document.getElementById("soft-macros-btn");
const soft_macro_content = document.getElementById("soft-macro-content");

soft_macros_btn.onclick = function () {
  macro_default.style.display = "none";
  soft_macro_content.style.display = "block";
}