const macroPlacerWindow = document.getElementById("macro-placer-window");
const starforgeFuncValue = document.getElementById("starforge-func");
const starforgeUserValue = document.getElementById("starforge-value");
const placerAdvice = document.getElementById("placer-advice");

let starforge_cmd_num_to_add = 0;

function show_macroPlacer () {
  macroPlacerWindow.style.display = "block";
  starforgeUserValue.value = "";
  placerAdvice.innerText = "";
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
  starforgeFuncValue.innerText = "JAVASCRIPT CODE TO RUN: ";
  starforge_cmd_num_to_add = 3;
}

document.getElementById("run-cpp-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "C++ CODE TO RUN: ";
  starforge_cmd_num_to_add = 4;
}

document.getElementById("macro-log-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "CONSOLE OUTPUT: ";
  starforge_cmd_num_to_add = 5;
}

document.getElementById("macro-wait-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "SECONDS TO WAIT: ";
  starforge_cmd_num_to_add = 6;
}

document.getElementById("macro-set-temp-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "SET TEMPERATURE TO (*F): ";
  starforge_cmd_num_to_add = 7;
}

document.getElementById("macro-set-psi-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "SET PRESSURE TO (PSI): ";
  starforge_cmd_num_to_add = 8;
}

document.getElementById("macro-set-temp-max-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "SET MAXIMUM TEMPERATURE INCREASE RATE TO (*F/SEC): ";
  starforge_cmd_num_to_add = 9;

  placerAdvice.innerText = "Sets the maximum temperature increase rate threshold before the system gives a warning.";
}

document.getElementById("macro-set-temp-min-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "SET MINIMUM TEMPERATURE INCREASE RATE TO (*F/SEC): ";
  starforge_cmd_num_to_add = 10;

  placerAdvice.innerText = "Sets the minimum temperature increase rate threshold before the system gives a warning.";
}

document.getElementById("macro-set-psi-max-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "SET MAXIMUM PRESSURE INCREASE RATE TO (PSI/SEC): ";
  starforge_cmd_num_to_add = 11;

  placerAdvice.innerText = "Sets the maximum pressure increase rate threshold before the system gives a warning.";
}

document.getElementById("macro-set-psi-min-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "SET MINIMUM PRESSURE INCREASE RATE TO (PSI/SEC): ";
  starforge_cmd_num_to_add = 12;

  placerAdvice.innerText = "Sets the minimum pressure increase rate threshold before the system gives a warning.";
}

document.getElementById("macro-set-temp-ceiling-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "SET TEMPERATURE CEILING (*F): ";
  starforge_cmd_num_to_add = 13;

  placerAdvice.innerText = "Sets the maximum temperature ceiling threshold before the system gives a warning.";
}

document.getElementById("macro-set-psi-ceiling-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "SET PRESSURE CEILING (PSI): ";
  starforge_cmd_num_to_add = 14;

  placerAdvice.innerText = "Sets the maximum pressure ceiling threshold before the system gives a warning.";
}

document.getElementById("macro-comment-btn").onclick = function () {
  show_macroPlacer();
  starforgeFuncValue.innerText = "COMMENT: ";
  starforge_cmd_num_to_add = 15;
}

document.getElementById("macro-stop-btn").onclick = function () {
  let newline = "\n";
  if (default_textbox_input.value == "") {
    newline = "";
  }

  default_textbox_input.value += (newline + "STOP**)");
}

document.getElementById("macro-repeat-btn").onclick = function () {
  let newline = "\n";
  if (default_textbox_input.value == "") {
    newline = "";
  }

  default_textbox_input.value += (newline + "REPEAT**)");
}

document.getElementById("close-macro-placer").onclick = function () {
  macroPlacerWindow.style.display = "none";
}

document.getElementById("add-starforge-cmd").onclick = function () {
  let newline = "\n";
  if (default_textbox_input.value == "") {
    newline = "";
  } else {
    newline = "\n";
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
    case 4:
      default_textbox_input.value += (newline + "RUN_CPP |cpp|" + String(starforgeUserValue.value) + "|cpp|**)");
      break;
    case 5:
      default_textbox_input.value += (newline + "DISPLAY " + String(starforgeUserValue.value.replaceAll(" ", "%20")) + "**)");
      break;
    case 6:
      default_textbox_input.value += (newline + "WAIT " + String(starforgeUserValue.value) + "**)");
      break;
    case 7:
      default_textbox_input.value += (newline + "SET TEMP " + String(starforgeUserValue.value) + "**)");
      generateAnalysisWindow(parseFloat(starforgeUserValue.value), 0);
      break;
    case 8:
      default_textbox_input.value += (newline + "SET PSI " + String(starforgeUserValue.value) + "**)");
      generateAnalysisWindow(0, parseFloat(starforgeUserValue.value));
      break;
    case 9:
      default_textbox_input.value += (newline + "SET MAX_TEMP_RATE " + String(starforgeUserValue.value) + "**)");
      break;
    case 10:
      default_textbox_input.value += (newline + "SET MIN_TEMP_RATE " + String(starforgeUserValue.value) + "**)");
      break;
    case 11:
      default_textbox_input.value += (newline + "SET MAX_PSI_RATE " + String(starforgeUserValue.value) + "**)");
      break;
    case 12:
      default_textbox_input.value += (newline + "SET MIN_PSI_RATE " + String(starforgeUserValue.value) + "**)");
      break;
    case 13:
      default_textbox_input.value += (newline + "SET TEMP_MAX " + String(starforgeUserValue.value) + "**)");
      break;
    case 14:
      default_textbox_input.value += (newline + "SET PSI_MAX " + String(starforgeUserValue.value) + "**)");
      break;
    case 15:
      default_textbox_input.value += (newline + "COMMENT " + String(starforgeUserValue.value) + "**)");
      break;
  }
}

document.getElementById("close-predictor-graph").onclick = function () {
  document.getElementById("fancy-predictor-graph").style.display = "none";
}