let warningArray = [];
let urgent_warningArray = [];
let isConnectedToBoard = false;

const warningDiv = document.getElementById("warnings");
const issueDiv = document.getElementById("issues");
const urgentWarningDiv = document.getElementById("urgent-warnings");

let last_maintained = localStorage.getItem("last_maintained");
const issue_resolve_msg = document.getElementById("issue-resolve-msg");
const device_battery_percent = document.getElementById("device-battery-percent");

const temp_ceiling = 300;
const psi_ceiling = 100;

// start precheck
const vendorID = localStorage.getItem("vendor_id");
function checkForVendorID () {
  if (vendorID === null || vendorID === "" || vendorID === undefined) {
    localStorage.setItem("vendor_id", "0x2341");
  }
}
const vend_id = document.getElementById("vend_id");
vend_id.innerText = localStorage.getItem("vendor_id");

const baudRate = localStorage.getItem("baud_rate");
function checkForBaudRate () {
  if (baudRate == null || baudRate == "" || baudRate == undefined) {
    localStorage.setItem("baud_rate", "9600");
  }
}
const baud_rate = document.getElementById("baud_rate");
baud_rate.innerText = localStorage.getItem("baud_rate");

const board_port = document.getElementById("board_port");
const boardPort = localStorage.getItem("board_port");
function checkForBoardPort () {
  if (boardPort == null || boardPort == "" || boardPort == undefined) {
    localStorage.setItem("board_port", "COM3");
  }
}
board_port.innerText = localStorage.getItem("board_port");
// end precheck

async function resolveIssue (issueCode) {
  switch (issueCode) {
    case "TEMPERATURE":
    case "PRESSURE":
    case "T-CLIMB":
    case "P-CLIMB":
      issue_resolve_msg.innerHTML = "<p>ISSUE CANNOT BE FIXED REMOTELY (" + issueCode + ")</p>";
      break;
    case "WEATHER":
      issue_resolve_msg.innerHTML = "<p>PREPARE FOR HEAVY WEATHER</p>";
      break;
    case "GB-FUNC":
      issue_resolve_msg.innerHTML = "<p>UPDATE DEFAULT BROWSER</p>";
      break;
    case "POWER":
      issue_resolve_msg.innerHTML = "<p>PLUG DEVICE IN TO POWER SUPPLY OR CHECK SOURCE</p>";
      break;
    case "BATTERY":
      issue_resolve_msg.innerHTML = "<p>ADVISED: PLUG DEVICE IN. LOWERING BATTERY CONSUMPTION</p>";
      
      batteryMSTATUS_int = 20000;
      batteryETEMP_int = 20000;

      reroute_bint_text.innerText = "BATTERY INTERVAL [BAT_INT2]";
      break;
    case "PRGM_ERR":
      issue_resolve_msg.innerHTML = "<p>SYSTEM REBOOT REQUIRED</p>";
      break;
    case "MAINTENANCE":
      issue_resolve_msg.innerHTML = "<p>UPDATED MAINTENANCE STATUS</p>";
      const maitDate = new Date();
      localStorage.setItem("last_maintained", maitDate);
      last_maintained = localStorage.getItem("last_maintained");
      break;
    case "BOARD":
      issue_resolve_msg.innerHTML = "<p>CONNECT BOARD TO DEVICE OR REROUTE BOARD CONNECTION</p>";
      break;
    case "PORT":
      issue_resolve_msg.innerHTML = "<p>PERMISSIONS ISSUE. SWITCH DEVICE OR REROUTE BOARD CONNECTION</p>";
      break;
    case "ACCESS":
      issue_resolve_msg.innerHTML = "<p>REROUTE BOARD CONNECTION</p>";
      break;
  }
}

// general display
const temp_gauge = document.getElementById("temp_gauge");
const psi_gauge = document.getElementById("psi_gauge");
const autoclave_diagram = document.getElementById("autoclave-diagram");
const autoclave_status = document.getElementById("autoclave-status");
const autoclave_plot = document.getElementById("autoclave-plot");
const interfaceSetTemp = document.getElementById("html-interface-set-temp");

async function generateWarnings () {
  warningArray = [];
  urgent_warningArray = []; 
  /*
  Warning List:
  <Temperature and Pressure>
  TEMPERATURE - Autoclave temperature is too high
  PRESSURE - Autoclave pressure is too high
  T-CLIMB - Autoclave temperature is increasing too quickly
  P-CLIMB - Autoclave pressure is increasing too quickly
  T-STALL - Autoclave temperature is increasing too slowly (when curing)
  P-STALL - Autoclave pressure is increasing too slowly (when curing)

  <Device and Interface>
  INTERNET - No internet connection
  WEATHER - Incoming storms which may affect power supply (NOT ADDED YET)
  GB-FUNC - Unknown battery status
  POWER - No power supply stream for device
  BATTERY - Low device power
  PRGM_ERR - Interface program may be faulty or corrupted

  <Autoclave>
  MAINTENANCE - Autoclave maintenance recommended

  <Board and Circuits>
  BOARD - Board connection not found
  PORT - Board port not found
  ACCESS - Port access denied to interface program
  */
  
  switch (true) {
    case (navigator.onLine == false):
      warningArray.push("INTERNET");
      break;
    // default:
    //   fetch ("/find_board", {
    //     method : "GET"
    //   })
    //   .then(response => response.text())
    //   .then(data => {
    //     if (data == "not_found") {
    //       warningArray.push("BOARD");
    //     }
    //   })
    //   .catch(error => {
    //     warningArray.push("PRGM_ERR");
    //   });
    //   break;
  }
  
  last_maintained = localStorage.getItem("last_maintained");
  switch (true) {
    case (last_maintained == undefined):
    case (last_maintained == null):
    case (last_maintained == ""):
    case (last_maintained == 'null'):
      warningArray.push("MAINTENANCE");
      break;
    default:
      const currentDate = new Date();
      const maitDate = Date.parse(localStorage.getItem("last_maintained"));

      const diffTime = Math.abs(maitDate - currentDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays > 30) {
        warningArray.push("MAINTENANCE");
      }
      break;
  }

  const asyncChecks = [];

  const batteryCheckPromise = new Promise((resolve) => {
    if (!("getBattery" in navigator)) {
      warningArray.push("GB-FUNC");
      resolve();
    } 
    
    else {
      navigator.getBattery().then(function (battery) {
        device_battery_percent.innerText = (battery.level * 100) + "%";
        // if (!battery.charging) {
        //   warningArray.push("POWER");
        //   device_battery_percent.style.color = "yellow";
        // }
        
        if (battery.level < 0.50) {
          warningArray.push("BATTERY");
          device_battery_percent.style.color = "orange";

          if (battery.level < 0.25) {
            urgent_warningArray.push("CONNECT TO POWER NOW");
            device_battery_percent.style.color = "red";
          }
        }

        else {
          device_battery_percent.style.color = "rgb(136, 238, 136);";
        }

        if (!battery.charging) {
          warningArray.push("POWER");
          device_battery_percent.style.color = "yellow";
        }

        resolve();
      });
    }
  });

  const boardCheckPromise = new Promise((resolve) => {
    if (localStorage.getItem("board_conn_route") == "0" || localStorage.getItem("board_conn_route") == undefined || localStorage.getItem("board_conn_route") == null || localStorage.getItem("board_conn_route") == "") {
      console.log("board check 1");
      fetch ("/find_board", {
        method : "GET"
      })
      .then(response => response.text())
      .then(data => {
        if (data == "not_found" || data.includes("The system cannot find the file specified")) {
          warningArray.push("BOARD");
          urgent_warningArray.push("CONNECT DEVICE TO BOARD");
          isConnectedToBoard = false;
          resolve();
        }

        else if (data == "port_not_found") {
          warningArray.push("PORT");
          urgent_warningArray.push("FIND CORRECT PORT");
          isConnectedToBoard = false;
          resolve();
        }

        else if (data.includes("Access is denied")) {
          warningArray.push("ACCESS");
          urgent_warningArray.push("ACCESS TO BOARD DENIED");
          isConnectedToBoard = false;
          resolve();
        }

        else if (data.includes("wsgi_app response")) {
          warningArray.push("ACCESS");
          urgent_warningArray.push("REBOOT SYSTEM");
          isConnectedToBoard = false;
          resolve();
        }

        else {
          isConnectedToBoard = true;
          fetch ("/read_signal_from_board", {
            method : "POST",
            headers : {
              "Content-Type" : "application/json"
            },
            body : JSON.stringify({
              baud_rater : parseInt(localStorage.getItem("baud_rate")),
              board_porter : String(localStorage.getItem("board_port"))
            })
          })
          .then(response => response.text())
          .then(data => {
            switch (data) {
              case "nothing":
                resolve();
                break;
              default:
                if (data.includes("Encountered an error: ")) {
                  if (ignore_errors == false) {
                    console.error(data);
                  }
                  resolve();
                }

                else {
                  switch (true) {
                    case (data.includes("wsgi_app response")):
                      if (ignore_errors == false) {
                        console.error(data);
                      }
                      resolve();
                      break;
                    default:
                      console.log(data);
                      getTemp_fromModel(data);
                      getPSI_fromModel(data);
                      // checkFor_other();
                      resolve();
                  }
                }
                break;
            }
          })
          .catch(error => {
            warningArray.push("PRGM_ERR");
            if (ignore_errors == false) {
              console.error(error);
            }
            urgent_warningArray.push("REBOOT SYSTEM");
            resolve();
          });
        }
        // resolve();
      })
      .catch(error => {
        warningArray.push("PRGM_ERR");
        if (ignore_errors == false) {
          console.error(error);
        }
        urgent_warningArray.push("REBOOT SYSTEM");
        isConnectedToBoard = false;
        resolve();
      });
    }

    else {
      // console.log("board check 2");
      fetch ("/afind_board", {
        method : "POST",
        headers : {
          "Content-Type" : "application/json"
        },
        body : JSON.stringify({
          vendor_id : vendorID
        })
      })
      .then(response => response.text())
      .then(data => {
        if (data == "None") {
          warningArray.push("BOARD");
          isConnectedToBoard = false;
          urgent_warningArray.push("CONNECT DEVICE TO BOARD");
          resolve();
        }

        else {
          // read_from_board();
          if (String(data).includes("The debugger caught an exception")) {
            isConnectedToBoard = false;
            warningArray.push("PRGM_ERR");
            urgent_warningArray.push("REBOOT SYSTEM");
          }

          else {
            isConnectedToBoard = true;
            if (localStorage.getItem("board_port") !== String(data)) {
              localStorage.setItem("board_port", String(data));
              board_port.innerText = String(data);
            }
          }

          fetch ("/read_signal_from_board", {
            method : "POST",
            headers : {
              "Content-Type" : "application/json"
            },
            body : JSON.stringify({
              baud_rater : parseInt(localStorage.getItem("baud_rate")),
              board_porter : String(localStorage.getItem("board_port"))
            })
          })
          .then(response => response.text())
          .then(data => {
            switch (data) {
              case "nothing":
                resolve();
                break;
              default:
                if (data.includes("Encountered an error: ")) {
                  if (ignore_errors == false) {
                    console.error(data);
                  }
                  resolve();
                }

                else {
                  switch (true) {
                    case (String(data).includes("The debugger caught an exception")):
                      if (ignore_errors == false) {
                        console.error(data);
                      }
                      warningArray.push("PRGM_ERR");
                      urgent_warningArray.push("REBOOT SYSTEM");
                      resolve();
                      break;
                    default:
                      console.log(data);
                      getTemp_fromModel(data);
                      getPSI_fromModel(data);
                      resolve();
                  }
                }
                break;
            }
          })
          .catch(error => {
            warningArray.push("PRGM_ERR");
            if (ignore_errors == false) {
              console.error(error);
            }
            urgent_warningArray.push("REBOOT SYSTEM");
            resolve();
          });
        }
      })
      .catch(error => {
        warningArray.push("PRGM_ERR");
        if (ignore_errors == false) {
          console.error(error);
        }
        urgent_warningArray.push("REBOOT SYSTEM");
        resolve();
      });
    }
  });


  const boardReturnErrPromise = new Promise((resolve) => {
    // let hasManConsoleChanged = false;
    // const resizeObserver = new ResizeObserver(entries => {
    //   for (const entry of entries) {
    //     hasManConsoleChanged = true;
    //   }
    // });

    // if (manualCommandConsole) {
    //   resizeObserver.observe(manualCommandConsole);
    // }

    // switch (true) {
    //   case (hasManConsoleChanged):
    //     let checkForErrs = manualCommandConsole.innerHTML;
    //     if (String(checkForErrs).includes("The debugger caught")) {
    //       warningArray.push("PRGM ERR");
    //       urgent_warningArray.push("REBOOT SYSTEM");
    //     }
    //     break;
    // }
    
    if (rate_of_change_temp_board > 2.49 || real_temp_change_rate_board > 2.49) {
      warningArray.push("T-CLIMB");
      urgent_warningArray.push("RAPID TEMPERATURE CLIMB");
      temp_gauge.style.color = "red";
      resolve();
    }
    
    else if (((rate_of_change_temp_board < 1.51 && is_actively_curing) || (real_temp_change_rate_board < 1.51 && is_actively_curing)) && time_values.length > 19) {
      warningArray.push("T-STALL");
      temp_gauge.style.color = "yellow";
      resolve();
    }

    else {
      temp_gauge.style.color = "rgb(136, 238, 136)";
      resolve();
    }
  });

  const pressureClimbOrStall = new Promise((resolve) => {
    if (psi_change_r > 0.17 || real_psi_change_rate_board > 0.17) {
      warningArray.push("P-CLIMB");
      urgent_warningArray.push("RAPID PRESSURE CLIMB");
      psi_gauge.style.color = "red";
      resolve();
    }

    else if (((psi_change_r < 0.08 && is_actively_curing) || (real_psi_change_rate_board < 0.08 && is_actively_curing)) && time_values.length > 19) {
      warningArray.push("P-STALL");
      temp_gauge.style.color = "yellow";
      resolve();
    }

    else {
      psi_gauge.style.color = "rgb(136, 238, 136)";
      resolve();
    }
  });

  const emergencyStopCheckPromise = new Promise((resolve) => {
    switch (true) {
      case (emergency_stopped):
        urgent_warningArray.push("AUTOCLAVE EMERGENCY");
        warningArray.push("PRGM_ERR");
        urgent_warningArray.push("REBOOT SYSTEM");
        isConnectedToBoard = false;
        is_actively_curing = false;
        resolve();
        break;
      default:
        resolve();
        break;
    }
  });

  const temperatureWarningPromise = new Promise((resolve) => {
    switch (true) {
      case (temp_values[temp_values.length - 1] >= temp_ceiling):
        warningArray.push("TEMPERATURE");
        urgent_warningArray.push("REDUCE TEMPERATURE");
        autoclave_diagram.style.border = "1px solid red";
        resolve();
        break;
      default:
        resolve();
        autoclave_diagram.style.border = "1px solid rgb(136, 238, 136)";
        break;
    }
  });

  const pressureWarningPromise = new Promise((resolve) => {
    switch (true) {
      case (pressure_values[pressure_values.length - 1] >= psi_ceiling):
        warningArray.push("PRESSURE");
        urgent_warningArray.push("REDUCE PRESSURE");
        autoclave_status.style.border = "1px solid red";
        resolve();
        break;
      default:
        autoclave_status.style.border = "1px solid rgb(136, 238, 136)";
        resolve();
        break;
    }
  });

  asyncChecks.push(batteryCheckPromise, boardCheckPromise, boardReturnErrPromise, emergencyStopCheckPromise, temperatureWarningPromise, pressureWarningPromise, pressureClimbOrStall);
  await Promise.all(asyncChecks);

  if (warningArray.length === 0) {
    warningDiv.innerHTML = "";
    issueDiv.innerHTML = "<p>NO ISSUES DETECTED</p>";
  } 

  else {
    let warningString = "";
    for (let i = 0; i < warningArray.length; i++) {
      warningString += " <a class='warning'>" + warningArray[i] + "</a>";
    }
    warningDiv.innerHTML = "<p>WARNINGS:" + warningString + "</p>";
    issueDiv.innerHTML = "<p>ISSUES: " + warningString + "</p>";

    let urgent_warningString = "";
    warning_space = "";
    for (let i = 0; i < urgent_warningArray.length; i++) {
      if (i > 0) {
        warning_space = " ";
      }
      urgent_warningString += (warning_space + "<div class='warning'>" + urgent_warningArray[i] + "</div>");
    }
    urgentWarningDiv.innerHTML = urgent_warningString;
  }
}

const warningInterval = setInterval(function () {
  generateWarnings();

  switch (false) {
    case (set_temp_amount_interface == 0):
      interfaceSetTemp.innerText = set_temp_amount_interface + " *F";
      break;
  }

  check_for_faulty_parts();
}, 1000);

const timeDOM = document.getElementById("clock");

function getTimeFunctions () {
  const localTime = new Date().toLocaleTimeString();
  
  timeDOM.innerText = localTime;
}

getTimeFunctions();
const timeInterval = setInterval(function () {
  getTimeFunctions();
}, 1000);

// start precheck 2

checkForVendorID();
checkForBaudRate();
checkForBoardPort();

// end precheck2

const last_maintained_status = document.getElementById("lm-status");
function checkMSTATUS () {
  switch (true) {
    case (localStorage.getItem("last_maintained") == null):
    case (localStorage.getItem("last_maintained") == undefined):
    case (localStorage.getItem("last_maintained") == ''):
      last_maintained_status.innerText = "NEW SYSTEM CHECK ADVISED";
      break;
    default:
      last_maintained_status.innerText = "LAST MAINTAINED: " + localStorage.getItem("last_maintained");
      break;
  }
}
checkMSTATUS();
let batteryMSTATUS_int = 5000;

setInterval(function () {
  checkMSTATUS();
}, batteryMSTATUS_int);

const external_temp_status = document.getElementById("etemp");
function checkETEMP () {
  fetch ("/get_tempat", {
    method : "GET"
  })
  .then(response => response.text())
  .then(data => {
    switch (true) {
      case (data == "loc_error"):
        external_temp_status.innerText = "LOCATION ERROR";
        break;
      case (data == "endpoint_error"):
        external_temp_status.innerText = "ENDPOINT ERROR";
        break;
      default:
        if (data.includes("Error") || data.includes("error")) {
          external_temp_status.innerText = "LONGITUDE ERROR";
          return false;
        }
        farenheitTemp = (parseInt(data) * 1.8) + 32;
        external_temp_status.innerText = String(data) + " * C" + " || " + farenheitTemp + " * F";
        break;
    }
  })
  .catch(error => {
    external_temp_status.innerText = "INTERNAL ERROR";
    throw error;
  });
}
checkETEMP();
let batteryETEMP_int = 5000;

setInterval(function () {
  checkETEMP();
}, batteryETEMP_int);

// subcontainers
const subcontainer_1 = document.getElementById("subcontainer");
const subcontainer_2 = document.getElementById("subcontainer2");
const subcontainer_3 = document.getElementById("subcontainer3");
const subcontainer_4 = document.getElementById("subcontainer4");
const subcontainer_5 = document.getElementById("subcontainer5");

const command_list_1 = document.getElementById("command-list-1");
const command_list_2 = document.getElementById("command-list-2");

// buttons
const autoclaveRepairBtn = document.getElementById("autoclave-repair-btn");
const repairBackBtn = document.getElementById("repair-back-btn");

const resolveAllBtn = document.getElementById("resolve-all-btn"); // this is actually the reroute systems button.
const resolveOneBtn = document.getElementById("resolve-one-btn");

const confirmBtns = document.getElementById("confirm-btns");
const endResolutionBtn = document.getElementById("end-resolution-btn");
const nextIssueBtn = document.getElementById("next-issue-btn");
const confirmIssueBtn = document.getElementById("confirm-issue-choice-btn");

const rerouteBackBtn = document.getElementById("reroute-back-btn");

const cmdBtn = document.getElementById("cmd-btn");
const commandBackBtn = document.getElementById("command-back-btn");

const refreshInterfaceBtn = document.getElementById("refresh-interface-btn");
const call_off_emergency_btn = document.getElementById("call-off-emergency-btn");
const ignore_errors_btn = document.getElementById("ignore-console-errors-btn");
const show_errors_btn = document.getElementById("show-console-errors-btn");
const use_modelclave_btn = document.getElementById("use-modelclave-btn");
const disconnect_modelclave_btn = document.getElementById("disconnect-modelclave-btn");
const periodic_clearing_btn = document.getElementById("periodic-clearing-btn");
const end_clearing_btn = document.getElementById("end-clearing-btn");
const clear_console_btn = document.getElementById("clear-console-btn");
const log_autoclave_btn = document.getElementById("log-autoclave-btn");
const cmd_list_1_btn = document.getElementById("cmd-list-1-btn");
const cmd_list_2_btn = document.getElementById("cmd-list-2-btn");
const enable_voice_commands_btn = document.getElementById("enable-voice-commands-btn");
const disable_voice_commands_btn = document.getElementById("disable-voice-commands-btn");
const switch_displays_btn = document.getElementById("switch-displays-btn");
const expand_graph_btn = document.getElementById("expand-graph-btn");
const shrink_graph_btn = document.getElementById("shrink-graph-btn");
const fullscreen_btn = document.getElementById("fullscreen-btn");
const quit_btn = document.getElementById("quit-btn");
const create_instant_log_btn = document.getElementById("create-instant-log-btn");
// const hide_x_gridlines_btn = document.getElementById("hide-x-gridlines-btn");
// const hide_y_gridlines_btn = document.getElementById("hide-y-gridlines-btn");
const hide_all_gridlines_btn = document.getElementById("hide-all-gridlines-btn");
const show_all_gridlines_btn = document.getElementById("show-all-gridlines-btn");
const hide_small_graphs_btn = document.getElementById("hide-small-graphs-btn");
const show_small_graphs_btn = document.getElementById("show-small-graphs-btn");
const delete_all_soft_macros_btn = document.getElementById("delete-all-soft-macros-btn");

autoclaveRepairBtn.onclick = function () {
  subcontainer_1.style.display = "none";
  subcontainer_2.style.display = "block";
}

repairBackBtn.onclick = function () {
  subcontainer_1.style.display = "block";
  subcontainer_2.style.display = "none";
}

let resolveReload = 0;
function reloadResolve () {
  switch (true) {
    case (warningArray.length < 1):
      issue_resolve_msg.innerHTML = "<p>NO ISSUES TO RESOLVE.</p>";
      break;
    default:
      if (resolveReload < (warningArray.length)) {
        issue_resolve_msg.innerHTML = "<p>SELECTED ISSUE: " + warningArray[resolveReload] + "</p>";
      }

      else {
        resolveReload = 0;
        issue_resolve_msg.innerHTML = "<p>SELECTED ISSUE: " + warningArray[resolveReload] + "</p>";
      }
      break;
  }
}

resolveOneBtn.onclick = function () {
  confirmBtns.style.display = "flex";
  reloadResolve();
  resolveReload++;
}

nextIssueBtn.onclick = function () {
  reloadResolve();
  resolveReload++;
}

endResolutionBtn.onclick = function () {
  confirmBtns.style.display = "none";
  issue_resolve_msg.innerHTML = "";
  resolveReload = 0;
}

confirmIssueBtn.onclick = function () {
  resolveIssue(warningArray[resolveReload - 1]);
}

resolveAllBtn.onclick = function () {
  subcontainer_2.style.display = "none";
  subcontainer_3.style.display = "block";
}

rerouteBackBtn.onclick = function () {
  subcontainer_2.style.display = "block";
  subcontainer_3.style.display = "none";
}

cmdBtn.onclick = function () {
  subcontainer_4.style.display = "block";
  subcontainer_1.style.display = "none";
}

commandBackBtn.onclick = function () {
  subcontainer_4.style.display = "none";
  subcontainer_1.style.display = "block";
}

refreshInterfaceBtn.onclick = function () {
  location = "";
}

call_off_emergency_btn.onclick = function () {
  emergency_stopped = false;
  console.warn("Emergency stop called off.");
}

ignore_errors_btn.onclick = function () {
  ignore_errors = true;
  console.log("Hiding console errors.");
}

show_errors_btn.onclick = function () {
  ignore_errors = false;
  console.log("Showing console errors.");
}

use_modelclave_btn.onclick = function () {
  set_compatible(1);
  is_using_modelclave = true;
  console.log("Using modelclave.");
  if (isConnectedToBoard) {
    usage_mode.innerText = "TRAINER";
  }
}

disconnect_modelclave_btn.onclick = function () {
  set_compatible(0);
  is_using_modelclave = false;
  console.log("Disconnecting from modelclave.");
  if (isConnectedToBoard) {
    usage_mode.innerText = "IDLE";
  }
}

periodic_clearing_btn.onclick = function () {
  periodic_clearing(1);
  console.log("Periodic clearing enabled.");
}

end_clearing_btn.onclick = function () {
  periodic_clearing(0);
  console.log("Periodic clearing disabled.");
}

clear_console_btn.onclick = function () {
  clear_console();
}

log_autoclave_btn.onclick = function () {
  createAutoclaveLog(
    temp_values, 
    pressure_values, 
    usage_mode.innerText, 
    external_temp_status.innerText, 
    device_battery_percent.innerText, 
    timeDOM.innerText, 
    warningArray, 
    time_values
  );
}

cmd_list_2_btn.onclick = function () {
  command_list_1.style.display = "none";
  command_list_2.style.display = "block";
}

cmd_list_1_btn.onclick = function () {
  command_list_1.style.display = "block";
  command_list_2.style.display = "none";
}

enable_voice_commands_btn.onclick = function () {
  if (continue_parsing_speech == false) {
    continue_parsing_speech = true;
    parseUserSpeech();
  }

  else if (is_actively_listening == false) {
    parseUserSpeech();
  }
}

disable_voice_commands_btn.onclick = function () {
  continue_parsing_speech = false;
}

switch_displays_btn.onclick = function () {
  switch_Displays_Graph();
}

expand_graph_btn.onclick = function () {
  autoclavePlot.style.width = "600px";
}

shrink_graph_btn.onclick = function () {
  autoclavePlot.style.width = "400px";
}

function fullscreenOption () {
  if (document.fullscreenElement) {
    document.exitFullscreen()
    .catch(err => console.error(err));
  } 
  
  else {
    document.documentElement.requestFullscreen()
    .catch(err => console.error(err)); 
  }
}

fullscreen_btn.onclick = function () {
  fullscreenOption();
}

quit_btn.onclick = function () {
  fetch ("/exit_system")
  .then(response => response.text())
  .then(data => {
    console.log("Disconnected interface." + String(data));
  })
  .catch(error => {
    console.error(error);
  });
}

create_instant_log_btn.onclick = function () {
  createInstantLog(
    temp_values, 
    pressure_values, 
    usage_mode.innerText, 
    external_temp_status.innerText, 
    device_battery_percent.innerText, 
    timeDOM.innerText, 
    warningArray, 
    time_values
  );
}

// let is_using_x_gridlines = true;
// let is_using_y_gridlines = true;
// hide_x_gridlines_btn.onclick = function () {
//   if (is_using_x_gridlines) {
//     is_using_x_gridlines = false;

//   }
// }

hide_all_gridlines_btn.onclick = function () {
  if (using_gridlines) {
    using_gridlines = false;
    gridline_usage = {display: false};
  }
}

show_all_gridlines_btn.onclick = function () {
  if (using_gridlines == false) {
    using_gridlines = true;
    gridline_usage = {color: "rgba(136,238,136,1.000)"};
  }
}

hide_small_graphs_btn.onclick = function () {
  hide_small_graphs = true;
}

show_small_graphs_btn.onclick = function () {
  hide_small_graphs = false;
}

delete_all_soft_macros_btn.onclick = function () {
  localStorage.setItem("soft-macros", "[]");
}

// manual command console

const manualCommandConsole = document.getElementById("manual-command-console");

const manualCommandConsoleBtn = document.getElementById("manual-command-console-btn");
const manualCommandConsoleBackBtn = document.getElementById("manual-command-console-back-btn");

const manualCommandConsoleInput = document.getElementById("manual-command-console-input");
const manualCommandConsoleInputFinish = document.getElementById("manual-command-console-input-submit");

function clearIfMore () {
  const MCC_array = String(manualCommandConsole.innerHTML).split('</p>').filter(item => item.trim() !== "").map(item => item + '</p>');
  if (MCC_array > 110) {
    manualCommandConsole.innerHTML = "";
    manualCommandConsole.innerHTML += MCC_array[MCC_array.length - 1];
  }
}

manualCommandConsoleBtn.onclick = function () {
  subcontainer_5.style.display = "block";
  subcontainer_4.style.display = "none";
}

manualCommandConsoleBackBtn.onclick = function () {
  subcontainer_5.style.display = "none";
  subcontainer_4.style.display = "block";
}

function clear_console () {
  manualCommandConsole.innerHTML = "";
}

function scrollToBottom_manualCommandConsole () {
  manualCommandConsole.scrollTop = manualCommandConsole.scrollHeight;
}

console.log = (...args) => {
  if (String(args).includes("The debugger caught an exception")) {
    if (ignore_errors == false) {
      manualCommandConsole.innerHTML += "<p class='error'>" + escapeHtml(String(args)) + "</p>"; 
    }
    isConnectedToBoard = false;
    warningArray.push("PRGM_ERR");
    urgent_warningArray.push("REBOOT SYSTEM");
  }

  else {
    manualCommandConsole.innerHTML += "<p>" + escapeHtml(String(args)) + "</p>";
  }
  scrollToBottom_manualCommandConsole();
  clearIfMore();
}

console.error = (...args) => {
  manualCommandConsole.innerHTML += "<p class='error'>" + escapeHtml(String(args)) + "</p>";
  scrollToBottom_manualCommandConsole();
  clearIfMore();
}

console.warn = (...args) => {
  manualCommandConsole.innerHTML += "<p class='warning-console'>" + escapeHtml(String(args)) + "</p>";
  scrollToBottom_manualCommandConsole();
  clearIfMore();
}

manualCommandConsoleInputFinish.onclick = function () {
  if (manualCommandConsoleInput.value !== "" || manualCommandConsoleInput.value !== null) {
    console.log("'" + manualCommandConsoleInput.value + "'");
    try {
      eval(manualCommandConsoleInput.value);
    }
    
    catch (error) {
      console.error(error);
    }
    manualCommandConsoleInput.value = "";
    scrollToBottom_manualCommandConsole();
  }
}

// scripting console
const scriptingConsoleButton = document.getElementById("scripting-console-btn");
scriptingConsoleButton.onclick = function () {
  fetch ("/open_eatcrow", {
    method : "GET"
  })
  .then(response => response.text())
  .then(data => {
    console.log("scripting console: " + data);
  })
  .catch(error => {
    console.error(error);
  });
}

// rerouting
const manualReroute = document.getElementById("manual-reroute");
const whichReroute = document.getElementById("which-reroute");
const manualRerouteInput = document.getElementById("manual-reroute-input");
const manualRerouteButton = document.getElementById("manual-reroute-button");
const manualRerouteCancel = document.getElementById("manual-reroute-cancel");
let reroute_which = "";

function resetManualReroute (which_route_name) {
  manualRerouteInput.value = "";
  whichReroute.innerText = String(which_route_name);
}

manualRerouteButton.onclick = function () {
  if (manualRerouteInput.value == "" || manualRerouteInput.value == undefined || manualRerouteInput.value == null) {
    return false;
  }

  switch (reroute_which) {
    case "vendor-id":
      vend_id.innerText = manualRerouteInput.value;
      localStorage.setItem("vendor_id", manualRerouteInput.value);

      reroute_vendor_id.style.display = "block";
      break;
    case "baud-rate":
      baud_rate.innerText = manualRerouteInput.value;
      localStorage.setItem("baud_rate", manualRerouteInput.value);

      reroute_baud_rate.style.display = "block";
      break;
    case "board-port":
      board_port.innerText = manualRerouteInput.value;
      localStorage.setItem("board_port", manualRerouteInput.value);

      reroute_board_port.style.display = "block";
      break;
  }
  manualRerouteInput.value = "";
  manualReroute.style.display = "none";
}

manualRerouteCancel.onclick = function () {
  manualReroute.style.display = "none";

  switch (reroute_which) {
    case "vendor-id":
      reroute_vendor_id.style.display = "block";
      break;
    case "baud-rate":
      reroute_baud_rate.style.display = "block";
      break;
    case "board-port":
      reroute_board_port.style.display = "block";
      break;
  }
}

const reroute_board_conn_button = document.getElementById("reroute-bc");
const reroute_board_conn_text = document.getElementById("reroute-bc-text");
reroute_board_conn_button.onclick = function () {
  switch (true) {
    case (localStorage.getItem("board_conn_route") == null):
    case (localStorage.getItem("board_conn_route") == undefined):
    case (localStorage.getItem("board_conn_route") == ""):
      localStorage.setItem("board_conn_route", "0");
      break;
  }

  const board_conn_route_parse = parseInt(localStorage.getItem("board_conn_route"));
  switch (board_conn_route_parse) {
    case 0:
      localStorage.setItem("board_conn_route", "1");
      reroute_board_conn_text.innerText = "BOARD CONNECTION CHECK [BC_CHECK2]";
      break;
    case 1:
      localStorage.setItem("board_conn_route", "0");
      reroute_board_conn_text.innerText = "BOARD CONNECTION CHECK [BC_CHECK1]";
      break;
  }
}

if (localStorage.getItem("board_conn_route") == null || localStorage.getItem("board_conn_route") == "0") {
  reroute_board_conn_text.innerText = "BOARD CONNECTION CHECK [BC_CHECK1]";
}

else {
  reroute_board_conn_text.innerText = "BOARD CONNECTION CHECK [BC_CHECK2]";
}

const reroute_bint = document.getElementById("reroute-bint");
const reroute_bint_text = document.getElementById("reroute-bint-text");
reroute_bint.onclick = function () {
  switch (batteryETEMP_int) {
    case 5000:
      batteryETEMP_int = 20000;
      batteryMSTATUS_int = 20000;
      reroute_bint_text.innerText = "BATTERY INTERVAL [BAT_INT2]";
      break;
    default:
      batteryETEMP_int = 5000;
      batteryMSTATUS_int = 5000;
      reroute_bint_text.innerText = "BATTERY INTERVAL [BAT_INT1]";
      break;
  }
}

const reroute_vendor_id = document.getElementById("reroute-vendid");
reroute_vendor_id.onclick = function () {
  resetManualReroute("VENDOR ID");

  reroute_vendor_id.style.display = "none";
  manualReroute.style.display = "flex";
  reroute_which = "vendor-id";
}

const reroute_baud_rate = document.getElementById("reroute-baud");
reroute_baud_rate.onclick = function () {
  resetManualReroute("BAUD RATE");

  reroute_baud_rate.style.display = "none";
  manualReroute.style.display = "flex";
  reroute_which = "baud-rate";
}

const reroute_board_port = document.getElementById("reroute-boardport");
reroute_board_port.onclick = function () {
  resetManualReroute("BOARD PORT")

  reroute_board_port.style.display = "none";
  manualReroute.style.display = "flex";
  reroute_which = "board-port";
}

// arduino board communication
const heater_status = document.getElementById("heater-status");
const pressure_tank_status = document.getElementById("pressure-tank-status");
const pressure_tank_status2 = document.getElementById("pressure-tank-status2");

const temp_gauge2 = document.getElementById("temp_gauge2");
const psi_gauge2 = document.getElementById("psi_gauge2");

const emergency_stop_btn = document.getElementById("emergency-stop-btn");

let lower_raise_value = 5; // lowers or raises temp or pressure by 5 degrees or psi
let is_actively_curing = false;
let emergency_stopped = false;

const modelclave_heat_limit = 120;
const modelclave_pressure_limit = 60;

function send_signal_to_board (boardSignal) {
  fetch ("/send_signal_to_board", {
    method : "POST",
    headers : {
      "Content-Type" : "application/json"
    },
    body : JSON.stringify({
      signal_num : String(boardSignal),
      baud_rater : parseInt(localStorage.getItem("baud_rate")),
      board_porter : String(localStorage.getItem("board_port"))
    })
  })
  .then(response => response.text())
  .then(data => {
    if (data == "sent") {
      console.log(String(boardSignal) + " was sent to the board.");
      switch (String(boardSignal)) {
        case "4":
        case "5":
          heater_status.innerText = "ACTION PENDING";
          break;
        case "6":
        case "7":
          pressure_tank_status.innerText = "ACTION PENDING"
          break;
        default:
          console.warn('"' + String(boardSignal) + '" is not a recognised board signal.');
          break;
      }
    }

    else {
      console.warn("Data has not been sent to the board.");  
    }
  })
  .catch(error => {
    warningArray.push("PRGM_ERR");
    if (ignore_errors == false) {
      console.error(error);
    }
    urgent_warningArray.push("REBOOT SYSTEM");
  });
}

function read_from_board () {
  fetch ("/read_signal_from_board", {
    method : "POST",
    headers : {
      "Content-Type" : "application/json"
    },
    body : JSON.stringify({
      baud_rater : parseInt(localStorage.getItem("baud_rate")),
      board_porter : String(localStorage.getItem("board_port"))
    })
  })
  .then(response => response.text())
  .then(data => {
    switch (data) {
      case "nothing":
        break;
      // case "unicode_error":
      //   console.warn("Unicode Error: Could not decode Arduino reply message.");
      //   break;
      default:
        if (data.includes("Encountered an error: ")) {
          if (ignore_errors == false) {
            console.error(data);
          }
        }

        else {
          switch (true) {
            case (data.includes("wsgi_app response")):
              if (ignore_errors == false) {
                console.error(data);
              }
              break;
            default:
              console.log(data);
              getTemp_fromModel(data);
              getPSI_fromModel(data);
          }
        }
        break;
    }
  })
  .catch(error => {
    warningArray.push("PRGM_ERR");
    if (ignore_errors == false) {
      console.error(error);
    }
    urgent_warningArray.push("REBOOT SYSTEM");
  });
}

emergency_stop_btn.onclick = function () {
  if (isConnectedToBoard == false) {
    return false;
  }

  send_signal_to_board('s');
  emergency_stopped = true;
  console.warn("Autoclave has been emergency stopped.");
}

const raiseTempManually = document.getElementById("raise-temp-manually");
const decreaseTempManually = document.getElementById("decrease-temp-manually");

const raisePSIManually = document.getElementById("raise-psi-manually");
const decreasePSIManually = document.getElementById("decrease-psi-manually");

const tempRaiseAmount = document.getElementById("temp-raise-amount");
const psiRaiseAmount = document.getElementById("psi-raise-amount");

function notifyActiveCureStatus () {
  if (is_using_modelclave == false) {
    usage_mode.innerText = "ACTIVE DEFAULT";
  }
}

function ceaseCuringStatus () {
  if (is_using_modelclave == false) {
    usage_mode.innerText = "IDLE";
  }
}

raiseTempManually.onclick = function () {
  if (tempRaiseAmount.value == null || isConnectedToBoard == false) {
    return false;
  }

  is_actively_curing = true;
  notifyActiveCureStatus();

  set_temp_amount_interface = parseInt(tempRaiseAmount.value) + temp_values[temp_values.length - 1];
  if (set_temp_amount_interface == NaN) {
    set_temp_amount_interface = parseInt(tempRaiseAmount.value);
  }

  for (let i = 0; i < parseInt(tempRaiseAmount.value); i++) {
    // switch (true) {
    //   case (is_using_modelclave):
    //     send_signal_to_board(0);
    //     break;
    //   default:
    //     break;
    // }
    send_signal_to_board(0);
  }
}

decreaseTempManually.onclick = function () {
  if (tempRaiseAmount.value == null || isConnectedToBoard == false) {
    return false;
  }

  is_actively_curing = false;
  ceaseCuringStatus();

  for (let i = 0; i < parseInt(tempRaiseAmount.value); i++) {
    switch (true) {
      case (is_using_modelclave):
        send_signal_to_board(3);
        break;
      default:
        send_signal_to_board(1);
        break;
    }
  }
}

raisePSIManually.onclick = function () {
  if (psiRaiseAmount.value == null || isConnectedToBoard == false) {
    return false;
  }

  is_actively_curing = true;
  notifyActiveCureStatus();

  for (let i = 0; i < parseInt(psiRaiseAmount.value); i++) {
    switch (true) {
      case (is_using_modelclave):
        // if (parseInt(psiRaiseAmount.value) >= modelclave_pressure_limit) {
        //   console.warn("PSI");
        //   return false;
        // }
        send_signal_to_board(1);
        break;
      default:
        send_signal_to_board(2);
        break;
    }
  }
}

decreasePSIManually.onclick = function () {
  if (psiRaiseAmount.value == null || isConnectedToBoard == false) {
    return false;
  }

  is_actively_curing = false;
  ceaseCuringStatus();

  for (let i = 0; i < parseInt(psiRaiseAmount.value); i++) {
    switch (true) {
      case (is_using_modelclave):
        send_signal_to_board(4);
        break;
      default:
        send_signal_to_board(3);
        break;
    }
  }
}

const bringToLevels = document.getElementById("start-autoclave-semi");
const stopAutoclaveSemi = document.getElementById("stop-autoclave-semi");

const tempSetAmount = document.getElementById("temp-set-amount");
const psiSetAmount = document.getElementById("psi-set-amount");

let set_temp_amount_interface = 0;

bringToLevels.onclick = function () {
  if (tempSetAmount.value == null || isConnectedToBoard == false || psiSetAmount.value == null || tempSetAmount.value < 0 || psiSetAmount.value < 0) {
    console.warn("Conditions have not been met.");
    return false;
  }

  console.log("Bringing to levels...");

  is_actively_curing = false;
  if (is_using_modelclave == false) {
    usage_mode.innerText = "IDLE";
  }

  // function notifyActiveCureStatus () {
  //   if (is_using_modelclave == false) {
  //     usage_mode.innerText = "ACTIVE DEFAULT";
  //   }
  // }

  let temp_and_set_diff = Math.abs(temp_values[temp_values.length - 1] - parseInt(tempSetAmount.value));
  let psi_and_set_diff = Math.abs(pressure_values[pressure_values.length - 1] - parseInt(psiSetAmount.value));

  if (parseInt(tempSetAmount.value) < temp_values[temp_values.length - 1] && parseInt(psiSetAmount.value) >= pressure_values[pressure_values.length - 1]) {
    is_actively_curing = false;
    ceaseCuringStatus();

    set_temp_amount_interface = parseInt(tempSetAmount.value);

    for (let i = 0; i < temp_and_set_diff; i++) {
      switch (true) {
        case (is_using_modelclave):
          send_signal_to_board(3);
          break;
        default:
          send_signal_to_board(1);
          break;
      }
    }

    for (let i = 0; i < psi_and_set_diff; i++) {
      switch (true) {
        case (is_using_modelclave):
          send_signal_to_board(1);
          break;
        default:
          send_signal_to_board(2);
          break;
      }
    }
  }

  else if (parseInt(tempSetAmount.value) >= temp_values[temp_values.length - 1] && parseInt(psiSetAmount.value) < pressure_values[pressure_values.length - 1]) {
    is_actively_curing = true;
    notifyActiveCureStatus();

    set_temp_amount_interface = parseInt(tempSetAmount.value);

    for (let i = 0; i < temp_and_set_diff; i++) {
      send_signal_to_board(0);
    }

    for (let i = 0; i < psi_and_set_diff; i++) {
      switch (true) {
        case (is_using_modelclave):
          send_signal_to_board(4);
          break;
        default:
          send_signal_to_board(3);
          break;
      }
    }
  }

  else if (parseInt(tempSetAmount.value) >= temp_values[temp_values.length - 1] && parseInt(psiSetAmount.value) >= pressure_values[pressure_values.length - 1]) {
    is_actively_curing = true;
    notifyActiveCureStatus();

    set_temp_amount_interface = parseInt(tempSetAmount.value);
    
    for (let i = 0; i < temp_and_set_diff; i++) {
      send_signal_to_board(0);
    }

    for (let i = 0; i < psi_and_set_diff; i++) {
      switch (true) {
        case (is_using_modelclave):
          send_signal_to_board(1);
          break;
        default:
          send_signal_to_board(2);
          break;
      }
    }
  }

  else if (parseInt(tempSetAmount.value) < temp_values[temp_values.length - 1] && parseInt(psiSetAmount.value) < pressure_values[pressure_values.length - 1]) {
    is_actively_curing = false;
    ceaseCuringStatus();

    set_temp_amount_interface = parseInt(tempSetAmount.value);

    for (let i = 0; i < temp_and_set_diff; i++) {
      switch (true) {
        case (is_using_modelclave):
          send_signal_to_board(3);
          break;
        default:
          send_signal_to_board(1);
          break;
      }
    }

    for (let i = 0; i < psi_and_set_diff; i++) {
      switch (true) {
        case (is_using_modelclave):
          send_signal_to_board(4);
          break;
        default:
          send_signal_to_board(3);
          break;
      }
    }
  }
}

stopAutoclaveSemi.onclick = function () {
  if (isConnectedToBoard == false) {
    return false;
  }

  is_actively_curing = false;
  if (is_using_modelclave == false) {
    usage_mode.innerText = "IDLE";
  }

  set_temp_amount_interface = parseInt(tempSetAmount.value);

  let temp_and_set_diff = Math.abs(70 - parseInt(tempSetAmount.value));
  let psi_and_set_diff = Math.abs(14.7 - parseInt(psiSetAmount.value));

  if (parseInt(tempSetAmount.value) < temp_values[temp_values.length - 1]) {
    for (let i = 0; i < temp_and_set_diff; i++) {
      switch (true) {
        case (is_using_modelclave):
          send_signal_to_board(3);
          break;
        default:
          send_signal_to_board(1);
          break;
      }
    }
  }

  else if (parseInt(tempSetAmount.value) > temp_values[temp_values.length - 1]) {
    for (let i = 0; i < temp_and_set_diff; i++) {
      send_signal_to_board(0);
    }
  }

  if (parseInt(psiSetAmount.value) < pressure_values[pressure_values.length - 1]) {
    for (let i = 0; i < psi_and_set_diff; i++) {
      switch (true) {
        case (is_using_modelclave):
          send_signal_to_board(4);
          break;
        default:
          send_signal_to_board(3);
          break;
      }
    }
  }

  else if (parseInt(psiSetAmount.value) > pressure_values[pressure_values.length - 1]) {
    for (let i = 0; i < psi_and_set_diff; i++) {
      switch (true) {
        case (is_using_modelclave):
          send_signal_to_board(1);
          break;
        default:
          send_signal_to_board(2);
          break;
      }
    }
  }
}

// charts
let time_values = [];

const chartRate = document.getElementById("chart-rate");
const pressureRate = document.getElementById("pressure-rate");
const autoclavePlot = document.getElementById("autoclave-plot");

let temp_values = [];
let pressure_values = [];

// let temp_change_r;
let psi_change_r;

const temp_change_rate = document.getElementById("temp-change-rate"); // average rates
const psi_change_rate = document.getElementById("psi-change-rate");

const real_temp_change_rate = document.getElementById("real-temp-change-rate"); // most recent rates
const real_psi_change_rate = document.getElementById("real-psi-change-rate");

let is_using_alternate_display = false;

let using_gridlines = true;
let gridline_usage = {color: "rgba(136,238,136,1.000)"};

let hide_small_graphs = false;

let set_temp_line_data = [];
let set_psi_line_data = [];

function switch_Displays_Graph () {
  switch (true) {
    case (is_using_alternate_display):
      is_using_alternate_display = false;
      autoclavePlot.style.display = "none";
      autoclave_diagram.style.display = "flex";
      break;
    default:
      is_using_alternate_display = true;
      autoclavePlot.style.display = "flex";
      autoclave_diagram.style.display = "none";
      break;
  }
}

setInterval(function () {
  const ctx = document.createElement('canvas');
  const ctx_double = document.createElement('canvas');
  let ctx_triple;

  const crossLinePlugin = {
    id: 'crossLinePlugin',
    afterDraw(chart) {
      const { ctx, chartArea: { top, bottom, left, right } } = chart;

      ctx.save();
      ctx.strokeStyle = "rgba(136,238,136,1.000)"; 
      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.moveTo(left, top);
      ctx.lineTo(right, bottom);
    
      ctx.moveTo(right, top);
      ctx.lineTo(left, bottom);
    
      ctx.stroke();
      ctx.restore();
    }
  };

  chartRate.appendChild(ctx);
  pressureRate.appendChild(ctx_double);

  switch (true) {
    case (is_using_alternate_display):
      ctx_triple = document.createElement('canvas');
      autoclavePlot.appendChild(ctx_triple);

      if (document.getElementById("main-plot-jarvis")) {
        document.getElementById("main-plot-jarvis").remove();
      }
      ctx_triple.id = "main-plot-jarvis";

      if ((time_values.length < 5 && temp_values.length < 5 && pressure_values.length < 5) || (isConnectedToBoard == false && is_using_modelclave == false)) {
        new Chart(ctx_triple, {
          type : "line",
          data : {
            labels : time_values,
            datasets : [
              {
                fill : false,
                lineTension : 0,
                backgroundColor : "rgba(136,238,136,1.000)",
                borderColor : "rgba(136,238,136,1.000)",
                data : temp_values
              },
              {
                fill : false,
                lineTension : 0,
                backgroundColor : "rgba(188, 155, 209, 0.8)",
                borderColor : "rgba(188, 155, 209, 0.8)",
                data : pressure_values
              }
            ]
          },
          options : {
            plugins : {
              legend : {
                display : false
              },
              title : {
                display : true,
                text : "GENERAL DISPLAY",
                color : "rgba(136,238,136,1.000)",
                font : {
                  family : "Hornet"
                }
              }
            },
            scales : {
              y : {
                ticks : {
                  display : false
                },
                grid : {
                  display : false
                }
              },
              x : {
                ticks : {
                  display: false
                },
                grid : {
                  display : false
                }
              }
            }
          },
          plugins: [crossLinePlugin]
        });
      }

      else {
        new Chart(ctx_triple, {
          type : "line",
          data : {
            labels : time_values,
            datasets : [
              {
                fill : false,
                lineTension : 0,
                backgroundColor : "rgba(136,238,136,1.000)",
                borderColor : "rgba(136,238,136,1.000)",
                data: temp_values
              },
              {
                fill : false,
                lineTension : 0,
                backgroundColor : "rgba(188, 155, 209, 0.8)",
                borderColor : "rgba(188, 155, 209, 0.8)",
                data : pressure_values
              },
              {
                fill : false,
                lineTension : 0,
                backgroundColor : "rgba(136,238,136,1.000)",
                borderColor : "rgba(136,238,136,1.000)",
                data : set_temp_amount_interface
              }
            ]
          },
          options : {
            plugins : {
              legend : {
                display : false
              },
              title : {
                display : true,
                text : "GENERAL DISPLAY",
                color : "rgba(136,238,136,1.000)",
                font : {
                  family : "Hornet"
                }
              }
            },
            scales : {
              y : {
                ticks : {
                  font : {
                    family : "Hornet"
                  },
                  color : "rgba(136,238,136,1.000)"
                },
                grid : gridline_usage,
                border : {
                  color : "rgba(136,238,136,1.000)"
                },
                title : {
                  display : true,
                  text : "FAREN. OR PSI",
                  font : {
                    family : "Hornet"
                  },
                  color : "rgba(136,238,136,1.000)"
                }
              },
              x : {
                ticks : {
                  font : {
                    family : "Hornet"
                  },
                  color : "rgba(136,238,136,1.000)"
                },
                grid : gridline_usage,
                border : {
                  color : "rgba(136,238,136,1.000)"
                },
                title : {
                  display : true,
                    text : "TIME (MIN.)",
                    font : {
                      family : "Hornet"
                    },
                    color : "rgba(136,238,136,1.000)"
                }
              }
            }
          }
        });
      }
      break;
  }
  
  if (document.getElementById("temp-chart")) {
    document.getElementById("temp-chart").remove();
  }
  ctx.id = "temp-chart";

  if (document.getElementById("pressure-chart")) {
    document.getElementById("pressure-chart").remove();
  }
  ctx_double.id = "pressure-chart";

  if (hide_small_graphs) {
    const canvas_elements_1 = chartRate.querySelectorAll("canvas");
    const canvas_elements_2 = pressureRate.querySelectorAll("canvas");

    canvas_elements_1.forEach(resultant_canvas => {
      resultant_canvas.remove();
    });
    canvas_elements_2.forEach(resultant_canvas => {
      resultant_canvas.remove();
    });
    return false;
  }

  // const crossLinePlugin = {
  //   id: 'crossLinePlugin',
  //   afterDraw(chart) {
  //     const { ctx, chartArea: { top, bottom, left, right } } = chart;

  //     ctx.save();
  //     ctx.strokeStyle = "rgba(136,238,136,1.000)"; 
  //     ctx.lineWidth = 2;

  //     ctx.beginPath();

  //     ctx.moveTo(left, top);
  //     ctx.lineTo(right, bottom);
    
  //     ctx.moveTo(right, top);
  //     ctx.lineTo(left, bottom);
    
  //     ctx.stroke();
  //     ctx.restore();
  //   }
  // };

  if (time_values.length < 5 || temp_values.length < 5 || (isConnectedToBoard == false && is_using_modelclave == false)) {
    new Chart(ctx, {
      type : "line",
      data : {
        labels : time_values,
        datasets : [{
          fill : false,
          lineTension : 0,
          backgroundColor : "rgba(136,238,136,1.000)",
          borderColor : "rgba(136,238,136,1.000)",
          data: temp_values
        }]
      },
      options : {
        plugins : {
          legend : {
            display : false
          },
          title : {
            display : true,
            text : "TEMPERATURE",
            color : "rgba(136,238,136,1.000)",
            font : {
              family : "Hornet"
            }
          }
        },
        scales : {
          y : {
            ticks : {
              display : false
            },
            grid : {
              display : false
            }
          },
          x : {
            ticks : {
              display: false
            },
            grid : {
              display : false
            }
          }
        }
      },
      plugins: [crossLinePlugin]
    });
  }

  else {
    new Chart(ctx, {
      type : "line",
      data : {
        labels : time_values,
        datasets : [{
          fill : false,
          lineTension : 0,
          backgroundColor : "rgba(136,238,136,1.000)",
          borderColor : "rgba(136,238,136,1.000)",
          data: temp_values
        }]
      },
      options : {
        plugins : {
          legend : {
            display : false
          },
          title : {
            display : true,
            text : "TEMPERATURE",
            color : "rgba(136,238,136,1.000)",
            font : {
              family : "Hornet"
            }
          }
        },
        scales : {
          y : {
            ticks : {
              font : {
                family : "Hornet"
              },
              color : "rgba(136,238,136,1.000)"
            },
            grid : {
              color : "rgba(136,238,136,1.000)"
            },
            border : {
              color : "rgba(136,238,136,1.000)"
            },
            title : {
              display : true,
              text : "FAREN.",
              font : {
                family : "Hornet"
              },
              color : "rgba(136,238,136,1.000)"
            }
          },
          x : {
            ticks : {
              font : {
                family : "Hornet"
              },
              color : "rgba(136,238,136,1.000)"
            },
            grid : {
              color : "rgba(136,238,136,1.000)"
            },
            border : {
              color : "rgba(136,238,136,1.000)"
            },
            title : {
              display : true,
              text : "TIME (MIN.)",
              font : {
                family : "Hornet"
              },
              color : "rgba(136,238,136,1.000)"
            }
          }
        }
      }
    });
  }

  if (time_values.length < 5 || pressure_values.length < 5 || (isConnectedToBoard == false && is_using_modelclave == false)) {
    new Chart(ctx_double, {
      type : "line",
      data : {
        labels : time_values,
        datasets : [{
          fill : false,
          lineTension : 0,
          backgroundColor : "rgba(136,238,136,1.000)",
          borderColor : "rgba(136,238,136,1.000)",
          data: pressure_values
        }]
      },
      options : {
        plugins : {
          legend : {
            display : false
          },
          title : {
            display : true,
            text : "PRESSURE",
            color : "rgba(136,238,136,1.000)",
            font : {
              family : "Hornet"
            }
          }
        },
        scales : {
          y : {
            ticks : {
              display : false
            },
            grid : {
              display : false
            }
          },
          x : {
            ticks : {
              display: false
            },
            grid : {
              display : false
            }
          }
        }
      },
      plugins: [crossLinePlugin]
    });
  }

  else {
    new Chart(ctx_double, {
      type : "line",
      data : {
        labels : time_values,
        datasets : [{
          fill : false,
          lineTension : 0,
          backgroundColor : "rgba(136,238,136,1.000)",
          borderColor : "rgba(136,238,136,1.000)",
          data: pressure_values
        }]
      },
      options : {
        plugins : {
          legend : {
            display : false
          },
          title : {
            display : true,
            text : "PRESSURE",
            color : "rgba(136,238,136,1.000)",
            font : {
              family : "Hornet"
            }
          }
        },
        scales : {
          y : {
            ticks : {
              font : {
                family : "Hornet"
              },
              color : "rgba(136,238,136,1.000)"
            },
            grid : {
              color : "rgba(136,238,136,1.000)"
            },
            border : {
              color : "rgba(136,238,136,1.000)"
            },
            title : {
              display : true,
              text : "PSI",
              font : {
                family : "Hornet"
              },
              color : "rgba(136,238,136,1.000)"
            }
          },
          x : {
            ticks : {
              font : {
                family : "Hornet"
              },
              color : "rgba(136,238,136,1.000)"
            },
            grid : {
              color : "rgba(136,238,136,1.000)"
            },
            border : {
              color : "rgba(136,238,136,1.000)"
            },
            title : {
              display : true,
              text : "TIME (MIN.)",
              font : {
                family : "Hornet"
              },
              color : "rgba(136,238,136,1.000)"
            }
          }
        }
      }
    });
  }

  checkFor_other();
}, 1000);
Chart.defaults.animation = false;

// board modes
const autoclaveMode = document.getElementById("autoclave-mode");
const usage_mode = document.getElementById("usage-mode");

const manualControls = document.getElementById("manual-controls");
const automaticControls = document.getElementById("automatic-controls");
const semiManualControls = document.getElementById("semi-manual-controls");

let ignore_errors = false;
let is_using_modelclave = false;

let modal_value = autoclaveMode.value;
setInterval(function () {
  if (autoclaveMode.value != modal_value) {
    modal_value = autoclaveMode.value;
    switch (modal_value) {
      case "manual":
        automaticControls.style.display = "none";
        semiManualControls.style.display = "none";
        manualControls.style.display = "block";
        break;
      case "semi-manual":
        automaticControls.style.display = "none";
        semiManualControls.style.display = "block";
        manualControls.style.display = "none";
        break;
      case "automatic":
        automaticControls.style.display = "flex";
        semiManualControls.style.display = "none";
        manualControls.style.display = "none";
        break;
    }
  }
}, 100);

// compatibility
let can_read_from_others = 0;
let single_read = false;
let solenoid_2 = false;

function checkFor_other () {
  if (can_read_from_others == 1) {
    fetch ("/read_signal_from_board", {
      method : "POST",
      headers : {
        "Content-Type" : "application/json"
      },
      body : JSON.stringify({
        baud_rater : parseInt(localStorage.getItem("baud_rate")),
        board_porter : String(localStorage.getItem("board_port"))
      })
    })
    .then(response => response.text())
    .then(data => {
      switch (data) {
        case "nothing":
          break;
        // case "unicode_error":
        //   console.warn("Unicode Error: Could not decode Arduino reply message.");
        //   break;
        default:
          if (data.includes("Encountered an error: ")) {
            if (ignore_errors == false) {
              console.error(data);
            }
          }

          else {
            switch (true) {
              case (data.includes("wsgi_app response")):
                if (ignore_errors == false) {
                  console.error(data);
                }
                break;
              default:
                console.log(data);
                getTemp_fromModel(data);
                getPSI_fromModel(data);

                if (single_read && isConnectedToBoard) {
                  switch (true) {
                    case (localStorage.getItem("compatible_heater") !== null):
                    case (localStorage.getItem("compatible_heater") !== ""):
                      // if (data.includes(localStorage.getItem("compatible_hea")))
                      heater_status_comp_check = String(data).split(localStorage.getItem("compatible_heater"))[1].slice(0, 4).toLowerCase();

                      if (heater_status_comp_check.includes("on")) {
                        heater_status.innerText = "ON";
                      }

                      else if (heater_status_comp_check.includes("off") || heater_status_comp_check.includes("of")) {
                        heater_status.innerText = "OFF";
                      }

                      else {
                        heater_status.innerText = "UNKNOWN";
                      }
                      break;
                    case (localStorage.getItem("compatible_solenoid") !== null):
                    case (localStorage.getItem("compatible_solenoid") !== ""):
                      ult_pressure_tank_status = "";
                      pressure_tank_status_comp_check1 = String(data).split(localStorage.getItem("compatible_solenoid"))[1].slice(0, 4).toLowerCase();

                      if (pressure_tank_status_comp_check1.includes("on")) {
                        pressure_tank_status_comp_check1 = "ON";
                      }

                      else if (pressure_tank_status_comp_check1.includes("off") || pressure_tank_status_comp_check1.includes("of")) {
                        pressure_tank_status_comp_check1 = "OFF";
                      }

                      else {
                        pressure_tank_status_comp_check1 = "UNKNOWN";
                      }
                      switch (true) {
                        case (localStorage.getItem("compatible_solenoid2") !== null):
                        case (localStorage.getItem("compatible_solenoid2") !== ""):
                          pressure_tank_status_comp_check2 = String(data).split(localStorage.getItem("compatible_solenoid2"))[1].slice(0, 4).toLowerCase();

                          if (pressure_tank_status_comp_check2.includes("on")) {
                            pressure_tank_status_comp_check2 = "ON";
                          }

                          else if (pressure_tank_status_comp_check2.includes("off") || pressure_tank_status_comp_check2.includes("of")) {
                            pressure_tank_status_comp_check2 = "OFF";
                          }

                          else {
                            pressure_tank_status_comp_check2 = "UNKNOWN";
                          }

                          ult_pressure_tank_status = pressure_tank_status_comp_check1 + "||" + pressure_tank_status_comp_check2;
                          pressure_tank_status.innerText = ult_pressure_tank_status; 
                          break;
                        default:
                          pressure_tank_status.innerText = pressure_tank_status_comp_check1;
                          break;                        
                      }
                      break;
                    case (localStorage.getItem("compatible_temp") !== null):
                    case (localStorage.getItem("compatible_temp") !== ""):
                      temp_comp_check = String(data).split(localStorage.getItem("compatible_temp"))[1].slice(0, 4).toLowerCase();
                      temp_comp_check = parseFloat(temp_comp_check);
                      temp_values.push(temp_comp_check);
                      console.log("Pushed 1 compatible temp value");
                      break;
                  }
                }
            }
          }
          break;
      }
    })
    .catch(error => {
      warningArray.push("PRGM_ERR");
      if (ignore_errors == false) {
        console.error(error);
      }
      urgent_warningArray.push("REBOOT SYSTEM");
    });
  } 
}

function getTemp_fromModel (data_log) {
  if (can_read_from_others == 1 && is_using_modelclave == true) {
    if (data_log.includes("Temp:") == false) {
      if (data_log.includes("Heater:")) {
        heater_comp_check = String(data_log).split("Heater: ")[1].slice(0, 4).toLowerCase();
        switch (true) {
          case (heater_comp_check.includes("on")):
            heater_status.innerText = "ON";
            break;
          default:
            heater_status.innerText = "OFF";
            
            let temp_cure_percent = Math.abs(parseInt(temp_values[temp_values.length - 1]) / set_temp_amount_interface);
            if (temp_cure_percent < 1.5) {
              is_actively_curing = false;
              ceaseCuringStatus();
            }
            break;
        } 
      }
      return false;
    }
    temp_comp_check = String(data_log).split("Temp: ")[1]; //.slice(0, 4).toLowerCase();
    // temp_comp_check = parseInt(temp_comp_check);
    temp_gauge2.innerText = temp_comp_check;

    temp_comp_check2 = String(temp_comp_check).split(" °C   (");
    temp_comp_check2 = temp_comp_check2[1];
    temp_comp_check2 = temp_comp_check2.split(" °F)");
    temp_comp_check2 = temp_comp_check2[0];
    temp_comp_check2 = parseInt(temp_comp_check2);

    temp_values.push(temp_comp_check2);
  } 
}

function getPSI_fromModel (data_log) {
  if (can_read_from_others == 1 && is_using_modelclave == true) {
    if (data_log.includes("Pressure: ") == false) {
      if (data_log.includes("Inlet Solenoid:")) {
        psi_comp_check = String(data_log).split("Inlet Solenoid: ")[1].slice(0, 4).toLowerCase();
        switch (true) {
          case (psi_comp_check.includes("on")):
            pressure_tank_status.innerText = "ON";
            break;
          default:
            pressure_tank_status.innerText = "OFF";
            break;
        } 
      }

      if (data_log.includes("Outlet Solenoid:")) {
        psi_comp_check = String(data_log).split("Outlet Solenoid: ")[1].slice(0, 4).toLowerCase();
        switch (true) {
          case (psi_comp_check.includes("on")):
            pressure_tank_status2.innerText = "ON";
            break;
          default:
            pressure_tank_status2.innerText = "OFF";
            break;
        } 
      }

      return false;
    }
    psi_comp_check = String(data_log).split("Pressure: ")[1].slice(0, 4).toLowerCase();
    psi_comp_check = parseInt(psi_comp_check);

    pressure_values.push(psi_comp_check);
    psi_gauge2.innerText = psi_comp_check + " PSI";
  }  
}

let minutes_passed = 0;
let rate_of_change_temp_board = 0;

let real_temp_change_rate_board = 0;
let real_psi_change_rate_board = 0;

function passMinutes () {
  if (isConnectedToBoard) {
    minutes_passed += 1;
    time_values.push(minutes_passed);

    if (temp_values.length > 2) {
      rate_of_change_temp = (temp_values[temp_values.length - 1] - temp_values[0]) / (time_values[time_values.length - 1] - time_values[0]);
      temp_change_rate.innerText = rate_of_change_temp.toFixed(2) + " *F/MIN";
      rate_of_change_temp_board = rate_of_change_temp;
      
      rr_temp = (temp_values[temp_values.length - 1] - temp_values[temp_values.length - 2]) / (time_values[time_values.length - 1] - time_values[time_values.length - 2]);
      real_temp_change_rate.innerText = rr_temp.toFixed(2) + " *F/MIN";
    }

    if (pressure_values.length > 2) {
      rate_of_change_psi = (pressure_values[pressure_values.length - 1] - pressure_values[0]) / (time_values[time_values.length - 1] - time_values[0]);
      psi_change_rate.innerText = rate_of_change_psi.toFixed(2) + " PSI/MIN";
      psi_change_r = rate_of_change_psi;

      rr_psi = (pressure_values[pressure_values.length - 1] - pressure_values[pressure_values.length - 2]) / (time_values[time_values.length - 1] - time_values[time_values.length - 2]);
      real_psi_change_rate.innerText = rr_psi.toFixed(2) + " PSI/MIN";
    }
  }
}

let has_spliced_one = 0;
setInterval(function () {
  // if (isConnectedToBoard) {
  //   minutes_passed += 1;
  //   time_values.push(minutes_passed);
  // }

  if (time_values.length > 9 && has_spliced_one == 0) {
    time_values.splice(0, 5);
    has_spliced_one = 1;
  }

  if (isConnectedToBoard) {
    clear_console();
  }

  passMinutes();
  // check_for_faulty_parts();
}, 60000);

let int_to_clear;
setTimeout(function () {
  let starter_time_val = 0;
  int_to_clear = setInterval(function () {
    starter_time_val += 0.017;
    time_values.push(starter_time_val);
  }, 1000);
}, 6000);

setTimeout(function () {
  clearInterval(int_to_clear);
  if (time_values.length > 5) {
    time_values.splice(5);
  }
}, 12000);