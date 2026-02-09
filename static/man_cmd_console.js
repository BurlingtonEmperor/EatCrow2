function console_help () {
  console.log('console_help(); - returns a list of commands');
  console.log('console_clear(); - clears the console');
  console.log('periodic_clearing([0 or 1]); - if 1, periodically clears the console, if 0, shuts off interval');
  console.log('send_signal_to_board([YOUR SIGNAL NUMBER]); - sends signal to board');
  console.log('set_compatible([0 or 1]); - sets compatibility with other board software');
  console.log('compatible_heater([HEATER SIGNAL]); - read from heater (other board software)');
  console.log('compatible_solenoid([PSI SIGNAL]); - read from solenoid (other board software)');
  console.log('compatible_solenoid2([PSI SIGNAL 2]); - read from a secondary solenoid (other board software)');
  console.log('compatible_temp([TEMP SIGNAL]); - read temp (other board software)');
  console.log('compatible_psi([PSI SIGNAL]); - read psi (other board software)');
  console.log('single_read = [true or false]; - read from single line or read from multiple lines');
  console.log('solenoid_2 = [true or false]; - read for a second solenoid');
  console.log('ignore_errors = [true or false]; - ignores console errors if true');
  console.log('is_using_modelclave = [true or false]; - uses modelclave for alternate program if true');
  console.log('speech_command_pointer = [speech command pointer]; - switches speech command pointer');
  console.log('continue_parsing_speech = [true or false]; - if true, continues to parse speech commands');
}

function console_clear () {
  manualCommandConsole.innerHTML = "";
}

function escapeHtml (unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function set_compatible (comp_value) {
  switch (comp_value) {
    case 0:
      console.log("Compatibility has been turned off.");
      can_read_from_others = 0;
      break;
    case 1:
      console.log("Compatibility has been turned on.");
      can_read_from_others = 1;
      break;
    default:
      console.log("0 - turn off compatibility; 1 - turn on compatibility");
      break;
  }
}

function compatible_heater (heater_reader) {
  localStorage.setItem("compatible_heater", heater_reader);
}

function compatible_solenoid (solenoid_reader) {
  localStorage.setItem("compatible_solenoid", solenoid_reader);
}

function compatible_solenoid2 (solenoid_reader) {
  localStorage.setItem("compatible_solenoid2", solenoid_reader);
}

function compatible_temp (temp_reader) {
  localStorage.setItem("compatible_temp", temp_reader);
}

function compatible_psi (psi_reader) {
  localStorage.setItem("compatible_psi", psi_reader);
}

let periodic_clearing_interval = 0;
function periodic_clearing (clear_yes_or_no) {
  switch (clear_yes_or_no) {
    case 1:
      periodic_clearing_interval = setInterval(function () {
        console_clear();
      }, 30000);
      break;
    case 0:
      clearInterval(periodic_clearing_interval);
      break;
  }
}

// setInterval(function () {
//   if (manualCommandConsole.scrollHeight > 1000000) {
//     manAutoArray = String(manualCommandConsole.innerHTML).split("</p>");
//   }
// }, 10000);