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

async function checkHardMacroCache () {
  return fetch ("/get_macro") // yes these fetch requests are redundant but I need to do this ASAP
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

async function updateHardMacros () {
  
}