let warningArray = [];
const warningDiv = document.getElementById("warnings");
const issueDiv = document.getElementById("issues");

let last_maintained = localStorage.getItem("last_maintained");
const issue_resolve_msg = document.getElementById("issue-resolve-msg");

const vendorID = localStorage.getItem("vendor_id");
function checkForVendorID () {
  if (vendorID === null || vendorID === "" || vendorID === undefined) {
    localStorage.setItem("vendor_id", "0x2341");
  }
}
const vend_id = document.getElementById("vend_id");
vend_id.innerText = localStorage.getItem("vendor_id");

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
      issue_resolve_msg.innerHTML = "<p>CONNECT BOARD TO DEVICE</p>";
      break;
    case "PORT":
      issue_resolve_msg.innerHTML = "<p>PERMISSIONS ISSUE. SWITCH DEVICE</p>";
      break;
    case "ACCESS":
      issue_resolve_msg.innerHTML = "<p>REROUTING BOARD CONNECTION MACRO</p>";
      break;
  }
}

async function generateWarnings () {
  warningArray = []; 
  /*
  Warning List:
  <Temperature and Pressure>
  TEMPERATURE - Autoclave temperature is too high
  PRESSURE - Autoclave pressure is too high
  T-CLIMB - Autoclave temperature is increasing too quickly
  P-CLIMB - Autoclave pressure is increasing too quickly

  <Device and Interface>
  INTERNET - No internet connection
  WEATHER - Incoming storms which may affect power supply
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
        if (!battery.charging) {
          warningArray.push("POWER");
        }
        
        if (battery.level < 0.50) {
          warningArray.push("BATTERY");
        }

        resolve();
      });
    }
  });

  const boardCheckPromise = new Promise((resolve) => {
    fetch ("/find_board", {
      method : "GET"
    })
    .then(response => response.text())
    .then(data => {
      if (data == "not_found" || data.includes("The system cannot find the file specified")) {
        warningArray.push("BOARD");
      }

      else if (data == "port_not_found") {
        warningArray.push("PORT");
      }

      if (data.includes("Access is denied")) {
        warningArray.push("ACCESS");
      }
      resolve();
    })
    .catch(error => {
      warningArray.push("PRGM_ERR");
      resolve();
    });
  })

  asyncChecks.push(batteryCheckPromise, boardCheckPromise);
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
  }
}

const warningInterval = setInterval(function () {
  generateWarnings();
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

checkForVendorID();

const last_maintained_status = document.getElementById("lm-status");
function checkMSTATUS () {
  switch (true) {
    case (localStorage.getItem("last_maintained") == null):
    case (localStorage.getItem("last_maintained") == 'null'):
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
        external_temp_status.innerText = String(data) + " * C";
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