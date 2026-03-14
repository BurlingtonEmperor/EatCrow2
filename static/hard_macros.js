let hard_macro_cache = localStorage.getItem("hard_macro_cache");
if (hard_macro_cache == null || hard_macro_cache == undefined || hard_macro_cache == "") {
  localStorage.setItem("hard_macro_cache", "[]");
  checkHardMacroCache();
}

function waitForVariable(variableName, interval = 100, timeout = 2000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      if (typeof window[variableName] !== 'undefined') {
        resolve(window[variableName]);
      } else if (timeout && Date.now() - startTime > timeout) {
        reject(new Error(`${variableName} was not defined within ${timeout}ms.`));
      } else {
        setTimeout(check, interval); //
      }
    };
    check();
  });
}

async function getContentsOfAllHardMacros () {
  return fetch("/get_macro")
  .then(response => response.text())
  .then(data => {
    const firstElements = String(data).slice(0, 11); 
    switch (true) {
      case (firstElements.includes("File error:")):
        console.error(data);
        macro_status_msgs.innerText = "FILE ERROR WHEN RETRIEVING MACROS";
        return "error";
      // default:
      //   let current_macro_array = JSON.parse(data);
      //   console.log(current_macro_array);
      //   return current_macro_array;
    }

    return JSON.parse(data);
  })
  .catch(error => {
    console.error(error);
    macro_status_msgs.innerText = "COMMUNICATION WITH THE SERVER IS FAULTY";
    return "error";
  });
}

let is_hard_macro_cache_empty = 0;
async function checkHardMacroCache () {
  return fetch ("/get_macro") // yes these fetch requests are redundant but I need to get this done ASAP
  .then(response => response.text())
  .then(data => {
    let check_two = data;
    if (JSON.stringify(JSON.parse(check_two)) == JSON.stringify(JSON.parse(localStorage.getItem("hard_macro_cache")))) {
      // do nothing
    } else {
      if (JSON.parse(check_two).length < JSON.parse(localStorage.getItem("hard_macro_cache"))) {
        return fetch ("/create_macro", {
          method : "POST",
          headers : {
            "Content-Type" : "application/json"
          },
          body : JSON.stringify({
            macro_name : "CREATE",
            macro_content : localStorage.getItem("hard_macro_cache")
          })
        })
        .then(response => response.text())
        .then(data_two => {
          return data_two;
        })
        .catch(error => {
          console.error(error);
          return error;
        });
      } else {
        localStorage.setItem("hard_macro_cache", check_two);
        is_hard_macro_cache_empty = 1;
        return "Updated hard macro cache, " + String(data) + ", " + String(localStorage.getItem("hard_macro_cache"));
      }
    }
    return "No new hard macro cache needed";
  })
  .catch(error => {
    console.error(error);
    return error;
  });
}

function checkIfHardMacroExists (macro_name) {
  let current_macro_array = JSON.parse(localStorage.getItem("hard_macro_cache"));
  for (let i = 0; i < current_macro_array.length; i++) {
    if (current_macro_array[i].split("||{}||")[0] == macro_name) {
      return true;
    }
  }
  return false;
}

function deleteHardMacro (macro_name) { // NOTE: this doesn't *actually* delete a hard macro. What this does is delete it from the cache, so that
  let hard_macro_to_delete = macro_name; // later on the update function sees that macros.txt needs to be more like the cache when needed.
  let current_macro_array = JSON.parse(localStorage.getItem("hard_macro_cache"));

  if (checkIfHardMacroExists(hard_macro_to_delete)) {
    is_hard_macro_cache_empty = 0;
    if (current_macro_array.length < 2) {
      localStorage.setItem("hard_macro_cache", "[]");  
      return false;
    }

    for (let i = 0; i < current_macro_array.length; i++) {
      if (current_macro_array[i].split("||{}||")[0] == macro_name) {
        let saved_alpha = current_macro_array[i];
        let last_pos = current_macro_array.length - 1;
        let save_last_pos = current_macro_array[last_pos];

        current_macro_array[last_pos] = saved_alpha;
        current_macro_array[i] = save_last_pos;

        current_macro_array.pop();
        localStorage.setItem("hard_macro_cache", JSON.stringify(current_macro_array));
      }
    }
  }
  
  else {
    macro_status_msgs.innerText = "'" + String(macro_name) + "' does not exist as a hard macro.";
  }
}

function createNewHardMacro (macro_name, macro_content) {
  let hard_macro_name_to_create = macro_name;
  let current_macro_array = JSON.parse(localStorage.getItem("hard_macro_cache")); 

  is_hard_macro_cache_empty = 0; // this lets the updater know that the permanent file needs to be more like the cache

  if (checkIfHardMacroExists(hard_macro_name_to_create)) { 
    deleteHardMacro(hard_macro_name_to_create);
    current_macro_array = JSON.parse(localStorage.getItem("hard_macro_cache")); // no idea why I put this here, either!
    current_macro_array.push(hard_macro_name_to_create + "||{}||" + macro_content + "||{}||" + macro_mode + "||{}||" + macro_run_cycle);
    localStorage.setItem("hard_macro_cache", JSON.stringify(current_macro_array));
  }

  else {
    current_macro_array = JSON.parse(localStorage.getItem("hard_macro_cache")); // no idea why I put this here.
    current_macro_array.push(hard_macro_name_to_create + "||{}||" + macro_content + "||{}||" + macro_mode + "||{}||" + macro_run_cycle);
    localStorage.setItem("hard_macro_cache", JSON.stringify(current_macro_array));
  }
}

async function updateHardMacros () { // this will happen every 1 minute and will create macros from the cache IF the cache isn't empty
  switch (is_hard_macro_cache_empty) {
    case 0:
      fetch ("/create_macro", {
        method : "POST",
        headers : {
          "Content-Type" : "application/json"
        },
        body : JSON.stringify({
          macro_name : "CREATE",
          macro_content : localStorage.getItem("hard_macro_cache")
        })
      })
      .then(response => response.text())
      .then(data => {
        console.log(data);
        is_hard_macro_cache_empty = 1;
      })
      .catch(error => {
        console.error(error);
      });
      break;
  }
}

function runHardMacro (macro_name) {
  let hard_macro_name_to_read = macro_name;
  let current_macro_array = JSON.parse(localStorage.getItem("hard_macro_cache"));

  if (checkIfHardMacroExists(hard_macro_name_to_read)) {
    for (let i = 0; i < current_macro_array.length; i++) {
      if (current_macro_array[i].split("||{}||")[0] == macro_name) {
        let read_array_macro = current_macro_array[i].split("||{}||");

        switch (parseInt(read_array_macro[2])) {
          case 0:
            break;
          case 1:
            try {
              eval(read_array_macro[1]);
            }
            catch (error) {
              console.error(error);
            };
            break;
        }
      }
    }
  }
  
  else {
    macro_status_msgs.innerText = "'" + String(macro_name) + "' does not exist as a hard macro.";
  }
}