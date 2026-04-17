let warningArray = [];
let urgent_warningArray = [];
let isConnectedToBoard = false;
let write_mode = 0;

const warningDiv = document.getElementById("warnings"); // do all these DOM manipulations cause a memory leak? Yes. But it's far too late to change it now
const issueDiv = document.getElementById("issues");
const urgentWarningDiv = document.getElementById("urgent-warnings");

let last_maintained = localStorage.getItem("last_maintained");
const issue_resolve_msg = document.getElementById("issue-resolve-msg");
const device_battery_percent = document.getElementById("device-battery-percent");

// these values can be changed to fit your own autoclave.
let temp_ceiling = 300;
let psi_ceiling = 100;

let temp_max_rate = 2.49; // Anything above this rate will trigger a T-CLIMB warning. (For RAS's autoclave, the temperature should be rising by around 2deg *F for safety)
let temp_min_rate = 1.51; // Anything below this rate will trigger a T-STALL warning. (The (RAS) autoclave is curing unusually slow if this is the case)

let psi_max_rate = 0.17; // Anything above this rate will trigger a P-CLIMB warning. (For RAS's autoclave, the psi should be rising by around 0.17 PSI for safety)
let psi_min_rate = 0.08; // Anything below this rate will trigger a P-STALL warning. (This rate is very, very slow. Something has gone wrong if this is the case!)

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
    localStorage.setItem("baud_rate", "9600"); // feel free to switch to 115200, but it does iffy things
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
const interfaceSetPSI = document.getElementById("html-interface-set-psi");

async function generateWarnings () { // this probably causes a memory leak from all the DOM usage. too bad.
  warningArray = [];
  urgent_warningArray = []; 
  /*
  NOTE: THIS IS OUTDATED. Use the README.txt file instead for better documentation.
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
        device_battery_percent.innerText = (battery.level * 100).toFixed(2) + "%";
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
          device_battery_percent.style.color = "rgb(136, 238, 136)";
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
                      getBoardSRAM(data);
                      checkForGoodComms(data);
                      // checkFor_other();
                      resolve();
                  }
                }
                break;
            }
          })
          .catch(error => {
            if (is_actively_curing && String(error).includes("TypeError: The view function for 'read_signal_from_board' did not return a valid response. The function either returned None or ended without a return statement.")) {
              // do nothing
            }

            else {
              warningArray.push("PRGM_ERR");
              urgent_warningArray.push("REBOOT SYSTEM");
              if (ignore_errors == false) {
                console.error(error);
              }
            }
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
                      getBoardSRAM(data);
                      checkForGoodComms(data);
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
    
    if (rate_of_change_temp_board > temp_max_rate || real_temp_change_rate_board > temp_max_rate) {
      warningArray.push("T-CLIMB");
      urgent_warningArray.push("RAPID TEMPERATURE CLIMB");
      temp_gauge.style.color = "red";
      resolve();
    }
    
    else if (((rate_of_change_temp_board < temp_min_rate && is_actively_curing) || (real_temp_change_rate_board < temp_min_rate && is_actively_curing)) && time_values.length > 19) {
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
    if (psi_change_r > psi_max_rate || real_psi_change_rate_board > psi_max_rate) {
      warningArray.push("P-CLIMB");
      urgent_warningArray.push("RAPID PRESSURE CLIMB");
      psi_gauge.style.color = "red";
      resolve();
    }

    else if (((psi_change_r < psi_min_rate && is_actively_curing) || (real_psi_change_rate_board < psi_min_rate && is_actively_curing)) && time_values.length > 19) {
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

  const ml_algoWarningPromise = new Promise((resolve) => {
    if (potential_faulty_parts.innerText !== "NONE") {
      warningArray.push("PATTERN");
      urgent_warningArray.push("CHECK REPAIR PANEL");
    }
     
    switch (true) {
      case (board_communication_functional == false):
        warningArray.push("COMMS");
        urgent_warningArray.push("NO BOARD COMMUNICATION, TRY REBOOTING");
        if (is_using_modelclave == false) {
          usage_mode.innerText = "IDLE";
        }
        is_actively_curing = false;
        break;
    }

    switch (true) {
      case (board_comm_status.innerText == "OK"):
        board_communication_functional = true;
        break;
    }
    resolve();
  });

  asyncChecks.push(batteryCheckPromise, boardCheckPromise, boardReturnErrPromise, emergencyStopCheckPromise, temperatureWarningPromise, pressureWarningPromise, pressureClimbOrStall, ml_algoWarningPromise);
  await Promise.all(asyncChecks);

  if (urgent_warningArray.length === 0) {
    urgentWarningDiv.innerHTML = "";
  }

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

  if (warningArray.includes("TEMPERATURE") || warningArray.includes("T-CLIMB")) {
    playAlarm(0);
  }

  if (warningArray.includes("PRESSURE") || warningArray.includes("P-CLIMB")) {
    playAlarm(1);
  }

  if (urgent_warningArray.length > 1) {
    playAlarm(2);
  }

  switch (false) {
    case (set_temp_amount_interface == 0):
      interfaceSetTemp.innerText = set_temp_amount_interface + " *F";
      break;
  }

  switch (false) {
    case (set_psi_amount_interface == 0):
      interfaceSetPSI.innerText = set_psi_amount_interface + " PSI"
      break;
  }

  // check_for_faulty_parts(); This causes too much memory to be used, switching to 1min interval instead
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
        external_temp_status.innerText = String(data) + " * C" + " || " + String(farenheitTemp.toFixed(2)) + " * F";
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
const command_list_3 = document.getElementById("command-list-3");

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
// const hide_x_gridlines_btn = document.getElementById("hide-x-gridlines-btn"); <-- I was going to finish these, but got lazy and decided not to.
// const hide_y_gridlines_btn = document.getElementById("hide-y-gridlines-btn");
const hide_all_gridlines_btn = document.getElementById("hide-all-gridlines-btn");
const show_all_gridlines_btn = document.getElementById("show-all-gridlines-btn");
const hide_small_graphs_btn = document.getElementById("hide-small-graphs-btn");
const show_small_graphs_btn = document.getElementById("show-small-graphs-btn");
const delete_all_soft_macros_btn = document.getElementById("delete-all-soft-macros-btn");
const cmd_list_3_btn = document.getElementById("cmd-list-3-btn");
const close_cmd_list_3_btn = document.getElementById("close-command-list-3");
const zoom_2x_btn = document.getElementById("zoom-2x-btn");
const zoom_4x_btn = document.getElementById("zoom-4x-btn");
const reset_graph_zoom_btn = document.getElementById("reset-graph-zoom-btn");
const reboot_system_btn = document.getElementById("reboot-system-btn");
const hard_reboot_btn = document.getElementById("hard-reboot-btn");
const reboot_learning_systems = document.getElementById("reboot-learning-system");
const reboot_port_btn = document.getElementById("reboot-port-btn");
const toggle_threshold_text = document.getElementById("toggle-threshold-text");

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
  playAlarm(4);
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

reset_graph_zoom_btn.onclick = function () {
  zoom_minutes = 0;
}

zoom_2x_btn.onclick = function () {
  zoom_minutes = 1;
}

zoom_4x_btn.onclick = function () {
  zoom_minutes = 2;
}

cmd_list_3_btn.onclick = function () {
  command_list_3.style.display = "block";
  command_list_3.click();
}

close_cmd_list_3_btn.onclick = function () {
  command_list_3.style.display = "none";
}

reboot_system_btn.onclick = function () {
  fetch ("/restart_server")
  .then(response => response.text())
  .then(data => {
    // do nothing
  })
  .catch(error => {
    console.error(error);
  });
}

hard_reboot_btn.onclick = function () {
  fetch ("/hard_reboot")
  .then(response => response.text())
  .then(data => {
    // do nothing <-- inefficient way to do things but it works
  })
  .catch(error => {
    console.error(error);
  });
}

reboot_port_btn.onclick = function () {
  fetch ("/reboot_port", {
    method : "POST",
    headers : {
      "Content-Type" : "application/json"
    },
    body : JSON.stringify({
      port_name : String(localStorage.getItem("board_port"))
    })
  })
  .then(response => response.text())
  .then(data => {
    if (data == "error") {
      console.error("Port reboot failed");
    }
  })
  .catch(error => {
    console.error(error);
  });
}

reboot_learning_systems.onclick = function () {
  localStorage.setItem("warnings_catalogue", "temperature:0;pressure:0;p-climb:0;t-climb:0;p-stall:0;t-stall:0;vacuum:0");
  localStorage.setItem("fully_func", "0");
  console.log("Learning algorithms have been reset.");
}

toggle_threshold_text.onclick = function () {
  if (is_using_targets_p == false) {
    is_using_targets_p = true;
  } else {
    is_using_targets_p = false;
  }

  if (is_using_targets_t == false) {
    is_using_targets_t = true;
  } else {
    is_using_targets_t = false;
  }
}

document.getElementById("soft-reboot-btn").onclick = function () {
  window.open("https://github.com/BurlingtonEmperor/EatCrow2");
}

document.getElementById("open-file-updater").onclick = function () {
  fetch ("/update_files");
}

document.getElementById("estimate-time").onclick = function () {
  generateAnalysisWindow(set_temp_amount_interface, set_psi_amount_interface);
}

document.getElementById("check-sram").onclick = function () {
  if (safetyTimeProtocol) {
    return false;
  }
  checkForSafety();

  send_signal_to_board("z");
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
  reroute_board_conn_text.innerText = "BOARD CONNECTION CHECK [BC_CHECK2]";
  localStorage.setItem("board_conn_route", "1");
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

const reroute_write_method = document.getElementById("reroute-write-method");
const reroute_write_method_text = document.getElementById("reroute-write-method-text");
reroute_write_method.onclick = function () {
  if (safetyTimeProtocol) {
    return false;
  }

  checkForSafety();

  switch (write_mode) {
    case 0:
      write_mode = 1;
      reroute_write_method_text.innerText = "WRITE METHOD [WM_2]";
      send_signal_to_board("*");
      break;
    default:
      write_mode = 0;
      reroute_write_method_text.innerText = "WRITE METHOD [WM_1]";
      send_signal_to_board("*");
      break
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

let board_communication_functional = true;
function check_for_boardCommunication () {
  
}

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
      board_communication_functional = true;
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

      if (isConnectedToBoard) {
        board_communication_functional = false;
      }
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
              getBoardSRAM(data);
              checkForGoodComms(data);
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

function send_msg_to_board (msgString) {
  setTimeout(function () {
    fetch ("/send_string_to_board", {
      method : "POST",
      headers : {
        "Content-Type" : "application/json"
      },
      body : JSON.stringify({
        message : String(String(msgString) + "\n"),
        baud_rater : parseInt(localStorage.getItem("baud_rate")),
        board_porter : String(localStorage.getItem("board_port"))
      })
    })
    .then(response => response.text())
    .then(data => {
      if (data == "sent") {
        board_communication_functional = true;
        console.log("Msg was sent to the board.");
      }

      else {
        if (isConnectedToBoard) {
          board_communication_functional = false;
        }
      }
    })
    .catch(error => {
      console.error(error);
    });
  }, 1000);
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

let safetyTimeProtocol = false;

let has_sent_signal = 0; // check to see if the board is actually recieving signals properly. if not, the Serial buffer is probably clogged
let has_passed_time_limit = 0;
let has_recieved_confirmation =  0;

let is_using_targets_t = false;
let is_using_targets_p = false;

const rate_limit_status = document.getElementById("rate-limit-status");
const write_method_status = document.getElementById("write-method-status");
const board_comm_status = document.getElementById("board-comm-status");
function checkForSafety () {
  safetyTimeProtocol = true;
  has_sent_signal = 1;
  rate_limit_status.innerText = "WAIT";
  rate_limit_status.style.color = "yellow";

  if (set_temp_amount_interface > 0) {
    is_using_targets_t = true;
  }

  if (set_psi_amount_interface > 0) {
    is_using_targets_p = true;
  }

  write_method_status.innerText = "RATE LIMIT: WAIT";

  board_comm_status.innerText = "WAIT";
  board_comm_status.style.color = "yellow";

  setTimeout(function () {
    safetyTimeProtocol = false;
    has_passed_time_limit = 1;
    if (has_sent_signal == 1 && has_passed_time_limit == 1 && has_recieved_confirmation == 0) {
      board_comm_status.innerText = "FAULTY";
      board_comm_status.style.color = "red";
    } else {
      board_comm_status.innerText = "OK";
      board_comm_status.style.color = "rgb(136, 238, 136)";
    }

    has_sent_signal = 0;
    has_passed_time_limit = 0;
    has_recieved_confirmation = 0;

    rate_limit_status.innerText = "READY";
    write_method_status.innerText = "RATE LIMIT: READY";
    rate_limit_status.style.color = "rgb(136, 238, 136)";
  }, 15000);
}

raiseTempManually.onclick = function () {
  if (tempRaiseAmount.value == null || isConnectedToBoard == false || safetyTimeProtocol) {
    return false;
  }

  // safetyTimeProtocol = true;
  // setTimeout(function () {
  //   safetyTimeProtocol = false;
  // }, 15000);
  checkForSafety(); // yeah this is a bad way to limit requests but i'm too lazy to do much else

  is_actively_curing = true;
  notifyActiveCureStatus();
  is_using_targets_t = true;

  set_temp_amount_interface = parseInt(tempRaiseAmount.value) + temp_values[temp_values.length - 1];
  if (set_temp_amount_interface == NaN || temp_values.length < 1) {
    set_temp_amount_interface = parseInt(tempRaiseAmount.value);
  }

  switch (write_mode) {
    case 0:
      send_msg_to_board("+" + String(set_temp_amount_interface));
      return false;
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
  if (tempRaiseAmount.value == null || isConnectedToBoard == false || safetyTimeProtocol) {
    return false;
  }

  checkForSafety();

  is_actively_curing = false;
  ceaseCuringStatus();
  is_using_targets_t = true;

  set_temp_amount_interface = temp_values[temp_values.length - 1] - parseInt(tempRaiseAmount.value);
  if (set_temp_amount_interface == NaN || temp_values.length < 1) {
    set_temp_amount_interface = 0;
  }

  switch (write_mode) {
    case 0:
      send_msg_to_board("+" + String(set_temp_amount_interface));
      return false;
  }

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
  if (psiRaiseAmount.value == null || isConnectedToBoard == false || safetyTimeProtocol) {
    return false;
  }

  checkForSafety();

  is_actively_curing = true;
  notifyActiveCureStatus();
  is_using_targets_p = true;

  set_psi_amount_interface = parseInt(psiRaiseAmount.value) + pressure_values[pressure_values.length - 1];
  if (set_psi_amount_interface == NaN || pressure_values.length < 1) {
    set_psi_amount_interface = parseInt(psiRaiseAmount.value);
  }

  switch (write_mode) {
    case 0:
      send_msg_to_board("p" + String(set_psi_amount_interface));
      return false;
  }

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
  if (psiRaiseAmount.value == null || isConnectedToBoard == false || safetyTimeProtocol) {
    return false;
  }

  checkForSafety();

  is_actively_curing = false;
  ceaseCuringStatus();
  is_using_targets_p = true;

  set_psi_amount_interface =  pressure_values[pressure_values.length - 1] - parseInt(psiRaiseAmount.value);
  if (set_psi_amount_interface == NaN || pressure_values.length < 1) {
    set_psi_amount_interface = 0;
  }

  switch (write_mode) {
    case 0:
      send_msg_to_board("p" + String(set_psi_amount_interface));
      return false;
  }

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
let set_psi_amount_interface = 0;

bringToLevels.onclick = function () {
  if (tempSetAmount.value == null || isConnectedToBoard == false || psiSetAmount.value == null || tempSetAmount.value < 0 || psiSetAmount.value < 0 || safetyTimeProtocol) {
    console.warn("Conditions have not been met.");
    return false;
  }

  checkForSafety();

  is_using_targets_t = true;
  is_using_targets_p = true;

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
    set_psi_amount_interface = parseInt(psiSetAmount.value);

    switch (write_mode) {
      case 0:
        send_msg_to_board("+" + String(set_temp_amount_interface));
        send_msg_to_board("p" + String(set_psi_amount_interface));
        return false;
    }

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
    set_psi_amount_interface = parseInt(psiSetAmount.value);

    switch (write_mode) {
      case 0:
        send_msg_to_board("+" + String(set_temp_amount_interface));
        send_msg_to_board("p" + String(set_psi_amount_interface));
        return false;
    }

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
    set_psi_amount_interface = parseInt(psiSetAmount.value);

    switch (write_mode) {
      case 0:
        send_msg_to_board("+" + String(set_temp_amount_interface));
        send_msg_to_board("p" + String(set_psi_amount_interface));
        return false;
    }
    
    for (let i = 0; i < temp_and_set_diff; i++) { // this is write mode 2. not very efficient
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
    set_psi_amount_interface = parseInt(psiSetAmount.value);

    switch (write_mode) {
      case 0:
        send_msg_to_board("+" + String(set_temp_amount_interface));
        send_msg_to_board("p" + String(set_psi_amount_interface));
        return false;
    }

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
  if (isConnectedToBoard == false || safetyTimeProtocol) {
    return false;
  }

  checkForSafety();

  is_actively_curing = false;
  if (is_using_modelclave == false) {
    usage_mode.innerText = "IDLE";
  }

  set_temp_amount_interface = parseInt(tempSetAmount.value);
  set_psi_amount_interface = parseInt(psiSetAmount.value);

  switch (write_mode) {
    case 0:
      send_msg_to_board("+70");
      send_msg_to_board("p14.7");
      return false;
  }

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

// localStorage.getItem("default-cure-process"); <-- This is where the cure process macro name will be stored, as well as it's type (ie. soft macro, hard macro, board macro)
function setAsCuringProcess (macro_name, macro_type) {
  let macro_push_array = [];
  macro_push_array.push(macro_name);
  macro_push_array.push(macro_type);

  localStorage.setItem("default-cure-process", JSON.stringify(macro_push_array));
}

// function runAsCuringProcess () {}

const start_autoclave_btn = document.getElementById("start-autoclave-btn");
const stop_autoclave_btn = document.getElementById("stop-autoclave-btn");

start_autoclave_btn.onclick = function () {
  if (localStorage.getItem("default-cure-process") == null || localStorage.getItem("default-cure-process") == '' || safetyTimeProtocol) {
    return false;
  }

  let default_curings_array = JSON.parse(localStorage.getItem("default-cure-process"));
  let macro_curings_name = String(default_curings_array[0]);
  let macro_curings_type = parseInt(default_curings_array[1]);

  // console.log(default_curings_array);
  // console.log(macro_curings_type);

  switch (macro_curings_type) {
    case 0:
      console.log("Running soft macro...");

      switch (true) {
        case (checkIfMacroExists(macro_curings_name)):
          runSoftMacro(macro_curings_name);
          checkForSafety();
          break;
        default:
          return false;
      }
      break;
    case 1:
      console.log("Running hard macro...");

      switch (true) {
        case (checkIfHardMacroExists(macro_curings_name)):
          runHardMacro(macro_curings_name);
          checkForSafety();
          break;
        default:
          return false;
      }
      break;
    default:
      console.error("Invalid macro.");
      return false;
  }
}

stop_autoclave_btn.onclick = function () {
  if (safetyTimeProtocol || isConnectedToBoard == false) {
    return false;
  }

  checkForSafety();

  send_signal_to_board("~");
  send_signal_to_board("#");
  send_signal_to_board("%");
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

const graph_zoom_status = document.getElementById("graph-zoom-status");
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
                },
                // min : 0,
                // max : 600
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
                backgroundColor : "rgba(235, 73, 28, 0.8)",
                borderColor : "rgba(235, 73, 28, 0.8)",
                data: temp_values
              },
              {
                fill : false,
                lineTension : 0,
                backgroundColor : "rgba(110, 114, 221, 0.8)",
                borderColor : "rgba(110, 114, 221, 0.8)",
                data : pressure_values
              }
              // {
              //   fill : false,
              //   lineTension : 0,
              //   backgroundColor : "rgba(136,238,136,1.000)",
              //   borderColor : "rgba(136,238,136,1.000)",
              //   data : set_temp_amount_interface
              // }
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
              },
              annotation: {
                annotations: {
                  line1: { // line for set temp.
                    type: 'line',
                    yScaleID: 'y',
                    yMin: set_temp_amount_interface, 
                    yMax: set_temp_amount_interface,
                    borderColor: 'red',
                    borderWidth: 2,
                    label: {
                      display: is_using_targets_t,
                      content: 'Target Temp.',
                      position: 'start',
                      backgroundColor: 'rgba(255, 0, 0, 0.8)',
                      color: 'white',
                      font: {
                        family: "Hornet"
                      }
                    }
                  },
                  line2: {
                    type: 'line',
                    yScaleID: 'y',
                    yMin: set_psi_amount_interface,
                    yMax: set_psi_amount_interface,
                    borderColor: 'indigo',
                    borderWidth: 2,
                    label: {
                      display: is_using_targets_p,
                      content : 'Target PSI',
                      position: 'end',
                      backgroundColor: 'rgba(26, 3, 172, 0.8)',
                      color: 'white',
                      font: {
                        family: "Hornet"
                      }
                    }
                  }
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
                  text : "FARENHEIT",
                  font : {
                    family : "Hornet"
                  },
                  color : "rgba(136,238,136,1.000)"
                },
                min : 0,
                max : 600
              },
              y1 : {
                position: 'right',
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
                  text : "PSI",
                  font : {
                    family : "Hornet"
                  },
                  color : "rgba(136,238,136,1.000)"
                },
                min : 0,
                max : 300
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

  switch (zoom_minutes) {
    case 0:
      graph_zoom_status.innerText = "1x";
      break;
    case 1:
      graph_zoom_status.innerText = "2x";
      break;
    case 2:
      graph_zoom_status.innerText = "4x";
      break;
  }
}, 1000);
Chart.defaults.animation = false;

// board modes
const autoclaveMode = document.getElementById("autoclave-mode");
const usage_mode = document.getElementById("usage-mode");

const manualControls = document.getElementById("manual-controls");
const automaticControls = document.getElementById("automatic-controls");
const semiManualControls = document.getElementById("semi-manual-controls");
const realManualControls = document.getElementById("real-manual-controls");

const desired_heater_status = document.getElementById("desired-heater-status");
const desired_inlet_solenoid_status = document.getElementById("desired-inlet-solenoid-status");
const desired_outlet_solenoid_status = document.getElementById("desired-outlet-solenoid-status");

let ignore_errors = false;
let is_using_modelclave = false;

let modal_value = autoclaveMode.value;
setInterval(function () {
  if (autoclaveMode.value != modal_value) {
    modal_value = autoclaveMode.value;
    if (modal_value !== "real-manual") {
      desired_heater_status.innerText = "NONE";
      desired_inlet_solenoid_status.innerText = "NONE";
      desired_outlet_solenoid_status.innerText = "NONE";
    }

    switch (modal_value) {
      case "manual":
        automaticControls.style.display = "none";
        semiManualControls.style.display = "none";
        realManualControls.style.display = "none";
        manualControls.style.display = "block";
        break;
      case "semi-manual":
        automaticControls.style.display = "none";
        semiManualControls.style.display = "block";
        realManualControls.style.display = "none";
        manualControls.style.display = "none";
        break;
      case "automatic":
        automaticControls.style.display = "flex";
        semiManualControls.style.display = "none";
        realManualControls.style.display = "none";
        manualControls.style.display = "none";
        break;
      case "real-manual":
        realManualControls.style.display = "block";
        automaticControls.style.display = "none";
        semiManualControls.style.display = "none";
        manualControls.style.display = "none";
        break;
    }
  }
}, 100);

const activate_heater_btn = document.getElementById("activate-heater-btn");
const deactivate_heater_btn = document.getElementById("deactivate-heater-btn");
const activate_inlet_solenoid_btn = document.getElementById("activate-inlet-solenoid-btn");
const deactivate_inlet_solenoid_btn = document.getElementById("deactivate-inlet-solenoid-btn");
const activate_outlet_solenoid_btn = document.getElementById("activate-outlet-solenoid-btn");
const deactivate_outlet_solenoid_btn = document.getElementById("deactivate-outlet-solenoid-btn");

activate_heater_btn.onclick = function () {
  if (isConnectedToBoard == false || safetyTimeProtocol) {
    return false;
  }

  checkForSafety();
  desired_heater_status.innerText = "ON";
  send_signal_to_board("!");
}

deactivate_heater_btn.onclick = function () {
  if (isConnectedToBoard == false || safetyTimeProtocol) {
    return false;
  }

  checkForSafety();
  desired_heater_status.innerText = "OFF";
  send_signal_to_board("~");
}

activate_inlet_solenoid_btn.onclick = function () {
  if (isConnectedToBoard == false || safetyTimeProtocol) {
    return false;
  }

  checkForSafety();
  desired_inlet_solenoid_status.innerText = "ON";
  send_signal_to_board("@");
}

deactivate_inlet_solenoid_btn.onclick = function () {
  if (isConnectedToBoard == false || safetyTimeProtocol) {
    return false;
  }

  checkForSafety();
  desired_inlet_solenoid_status.innerText = "OFF";
  send_signal_to_board("#");
}

activate_outlet_solenoid_btn.onclick = function () {
  if (isConnectedToBoard == false || safetyTimeProtocol) {
    return false;
  }

  checkForSafety();
  desired_outlet_solenoid_status.innerText = "ON";
  send_signal_to_board("$");
}

deactivate_outlet_solenoid_btn.onclick = function () {
  if (isConnectedToBoard == false || safetyTimeProtocol) {
    return false;
  }

  checkForSafety();
  desired_outlet_solenoid_status.innerText = "OFF";
  send_signal_to_board("%");
}

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
                getBoardSRAM(data);
                checkForGoodComms(data);

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
            let psi_cure_percent = Math.abs(parseInt(pressure_values[pressure_values.length - 1]) / set_psi_amount_interface);

            if (temp_cure_percent < 1.5 && psi_cure_percent < 1.5) {
              is_actively_curing = false;
              is_using_targets_p = false;
              is_using_targets_t = false;
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
  } else {
    if (data_log.includes("TD:")) {
      let data_array = data_log.split(";");
      for (let i = 0; i < data_array.length; i++) {
        const secondary_data_array = data_array[i].split(":");

        const data_label = secondary_data_array[0];
        const data_content = secondary_data_array[1];

        switch (data_label) {
          case "T":
            temp_gauge2.innerText = data_content + " °F";
            break;
          case "P":
            psi_gauge2.innerText = data_content + " PSI";
            break;
          case "TD":
            document.getElementById("board-set-temp").innerText = data_content + " °F";
            break;
          case "PD":
            document.getElementById("board-set-psi").innerText = data_content + " PSI";
            break;
        }
      }
    } else if (data_log.includes("H:")) {
      let data_array = data_log.split(";");
      for (let i = 0; i < data_array.length; i++) {
        const secondary_data_array = data_array[i].split(":");

        const data_label = secondary_data_array[0];
        const data_content = parseInt(secondary_data_array[1]);

        let switcher__ = "OFF";
        switch (data_content) {
          case 1:
            switcher__ = "ON";
            break;
        }

        switch (data_label) {
          case "H":
            heater_status.innerText = switcher__;
            break;
          case "I":
            pressure_tank_status.innerText = switcher__;
            break;
          case "O":
            pressure_tank_status2.innerText = switcher__;
            break;
        }
      }
    }
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

const board_sram_status = document.getElementById("board-sram-status");
function getBoardSRAM (data_log) {
  switch (true) {
    case(String(data_log).includes("FREE SRAM: ")):
      board_sram_status.innerText = String(data_log).split("FREE SRAM: ")[1].replace(" ", "") + " BYTES FREE";
      break;
  }
}

function checkForGoodComms (data_log) {
  switch (true) {
    case (String(data_log).includes("Incoming signal:")):
      has_recieved_confirmation = 1;
      break;
  }
}

let minutes_passed = 0;
let rate_of_change_temp_board = 0;

let real_temp_change_rate_board = 0;
let real_psi_change_rate_board = 0;

let zoom_minutes = 0;
function passMinutes () { // pushes minutes based on zoom settings to the graphs
  if (isConnectedToBoard) {
    switch (zoom_minutes) {
      case 0: // default zoom
        minutes_passed += 1;
        time_values.push(minutes_passed);
        break
      case 1: // 2x zoom
        minutes_passed += 0.5;
        time_values.push(minutes_passed);
        minutes_passed += 0.5;
        time_values.push(minutes_passed);
        break;
      case 2: // 4x zoom
        for (let i = 0; i < 4; i++) {
          minutes_passed += 0.25;
          time_values.push(minutes_passed);
        }
        break;
    }

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
  check_for_faulty_parts();
  updateHardMacros(); // next time I am using sockets but this time I don't care
}, 60000);

let int_to_clear;
setTimeout(function () { // makes it so that the graphs don't remain blank for all eternity
  let starter_time_val = 0;
  int_to_clear = setInterval(function () {
    starter_time_val += 0.017;
    starter_time_val = starter_time_val.toFixed(3);
    starter_time_val = parseFloat(starter_time_val);
    time_values.push(starter_time_val);
  }, 1000);
}, 6000);

setTimeout(function () {
  clearInterval(int_to_clear);
  if (time_values.length > 5) {
    time_values.splice(5);
  }
}, 12000);