// macro window

$(function () {
  $(".draggable").draggable();
});

const macro_window = document.getElementById("macro-window");
const close_window_macro_window = document.getElementById("close-window-macro-window");
const open_macros_btn = document.getElementById("open-macros-btn");

close_window_macro_window.onclick = function () {
  macro_window.style.display = "none";
}

open_macros_btn.onclick = function () {
  macro_window.style.display = "block";
}