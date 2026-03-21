const macroPlacerWindow = document.getElementById("macro-placer-window");
const starforgeFuncValue = document.getElementById("starforge-func");
const starforgeUserValue = document.getElementById("starforge-value");
const placerAdvice = document.getElementById("placer-advice");

let starforge_cmd_num_to_add = 0;
let newline = "\n";

function show_macroPlacer () {
  macroPlacerWindow.style.display = "block";
  starforgeUserValue.value = "";
  setTimeout(function () {
    macroPlacerWindow.click();
  }, 50);
}

document.getElementById("call-soft_macro-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "CALL SOFT-MACRO:";
  starforge_cmd_num_to_add = 0;
}

document.getElementById("call-hard_macro-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "CALL HARD-MACRO:";
  starforge_cmd_num_to_add = 1;
}

document.getElementById("call-curing_process-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "CALL CURING-PROCESS:";
  starforge_cmd_num_to_add = 2;
}

document.getElementById("run-js-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "JAVASCRIPT TO RUN: ";
  starforge_cmd_num_to_add = 3;
}

document.getElementById("close-macro-placer").onclick = function () {
  macroPlacerWindow.style.display = "none";
}

document.getElementById("add-starforge-cmd").onclick = function () {
  if (default_textbox_input.value == "") {
    newline = "";
  }
  macroPlacerWindow.style.display = "none";

  switch (starforge_cmd_num_to_add) {
    case 0:
      default_textbox_input.value += (newline + "CALL SOFT_MACRO " + String(starforgeUserValue.value) + "**)");
      break;
    case 1:
      default_textbox_input.value += (newline + "CALL HARD_MACRO " + String(starforgeUserValue.value) + "**)");
      break;
    case 2:
      default_textbox_input.value += (newline + "CALL BOARD_MACRO " + String(starforgeUserValue.value) + "**)");
      break;
    case 3:
      default_textbox_input.value += (newline + "RUN_JS |js|" + String(starforgeUserValue.value) + "|js|**)");
      break;
  }
}