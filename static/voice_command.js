window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const text_to_speech = new SpeechSynthesisUtterance();
let additional_words = "";

let speech_command_pointer = "computer";
let continue_parsing_speech = false;
let error_handler_speech = 0;
let is_actively_listening = false;
// let stutter_prevent_count = 0;
// let stutter_word_storage = "";

const audioCtx_dalek = new (window.AudioContext || window.webkitAudioContext)();

async function speakDalek (dalek_text) {
  const oscillator = audioCtx_dalek.createOscillator();
  const modulator = audioCtx_dalek.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.value = 30; 
  modulator.gain.value = 0; 

  oscillator.connect(modulator.gain);
  oscillator.start();

  const utterance = new SpeechSynthesisUtterance(dalek_text);
  
  utterance.pitch = 0.8; 
  utterance.rate = 1.1; 

  window.speechSynthesis.speak(utterance);
  modulator.connect(audioCtx_dalek.destination);
}

function convertTextToSpeech (message_text) {
  text_to_speech.text = String(message_text);
  additional_words = message_text;
  window.speechSynthesis.speak(text_to_speech);
}

function getSpeechTime (given_text) {
  const ind_words = given_text.trim().split("/\s+/").length;
  const word_minutes = ind_words / 140;
  const word_seconds = Math.ceil(word_minutes * 60);

  return (word_seconds * 1000);
}

// function spamPreventer () {
//   let this_is_a_Fake_variable = 0;
// }

let buggy_jarvis = false;
function parseUserSpeech () {
  if (window.SpeechRecognition) {
    is_actively_listening = true;
    const recognition = new SpeechRecognition();
    error_handler_speech = 0;
    buggy_jarvis = false;
    additional_words = "";

    recognition.lang = "en-US"; 
    recognition.continuous = true; 
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      additional_words += String(transcript);
      console.log('Parsed user speech: ' + transcript);
      
      const first_word_to_comp = String(transcript.trim().split(' ')[0]).toLowerCase();
      switch (true) {
        case (first_word_to_comp == speech_command_pointer):
        case (first_word_to_comp == (speech_command_pointer + ",")):
          recognition.stop();
          buggy_jarvis = true;
          is_actively_listening = false;
          const command_array_org = transcript.trim().split(' ');
          command_array_org[0] = " ";

          const rest_of_command = String(String(command_array_org.join(' ')).trim()).toLowerCase();
          console.log("Voice command given: " + rest_of_command);

          switch (true) {
            case (rest_of_command.includes("confirm use")):
              console.log("User speech commands are functional.");
              convertTextToSpeech("User speech commands are functional.");
            //   spamPreventer();
              break;
            case (rest_of_command.includes("give warnings")):
              console.log("Warnings: " + JSON.stringify(warningArray));
              switch (true) {
                case (warningArray.length < 1):
                  convertTextToSpeech("There are no current warnings.");
                  break;
                default:
                  convertTextToSpeech("Current warnings are " + String(warningArray));
                  break;
              }
              break;
            case (rest_of_command.includes("switch displays")):
              console.log("Switching displays.");
              convertTextToSpeech("Switching displays.");
              switch_Displays_Graph();
              break;
            case (rest_of_command.includes("enable parsing")):
              console.log("Continuous parsing enabled.");
              convertTextToSpeech("Continuous parsing enabled.");
              continue_parsing_speech = true;
              break;
            case (rest_of_command.includes("end parsing")):
              console.log("Continuous parsing disabled.");
              convertTextToSpeech("Continuous parsing disabled.");
              continue_parsing_speech = false;
              break;
            case (rest_of_command.includes("refresh interface")):
              location = "";
              break;
            case (rest_of_command.includes("goodbye")):
            case (rest_of_command.includes("shut off")):
            case (rest_of_command.includes("shutoff")):
            case (rest_of_command.includes("shut down")):
            case (rest_of_command.includes("shutdown")):
              console.log("Goodbye to you as well!");
              convertTextToSpeech("Goodbye to you as well!");
            //   spamPreventer();
              error_handler_speech = 2;
              break;
            case (rest_of_command.includes("create log")):
            case (rest_of_command.includes("record log")):
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
              convertTextToSpeech("Created a log.");
              break;
            case (rest_of_command.includes("expand graph")):
              autoclavePlot.style.width = "600px";
              break;
            case (rest_of_command.includes("shrink graph")):
              autoclavePlot.style.width = "400px";
              break;
            case (rest_of_command.includes("fullscreen")):
            case (rest_of_command.includes("full screen")):
              fullscreenOption();
              break;
            case (rest_of_command.includes("open pod bay doors")):
            case (rest_of_command.includes("open pod bay door")):
              convertTextToSpeech("I'm sorry Dave, I'm afraid I can't do that.");
              break;
            case (rest_of_command.includes("save power")):
              batteryETEMP_int = 20000;
              batteryMSTATUS_int = 20000;
              reroute_bint_text.innerText = "BATTERY INTERVAL [BAT_INT2]";
              break;
            case (rest_of_command.includes("create instant log")):
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
              convertTextToSpeech("Created an instant log.");
              break;
            case (rest_of_command.includes("open macros")):
              macro_window.style.display = "block";
              break;
            case (rest_of_command.includes("close macros")):
              macro_window.style.display = "none";
              break;
            case (rest_of_command.includes("hide gridlines")):
            case (rest_of_command.includes("hide grid lines")):
              hide_all_gridlines_btn.click();
              break;
            case (rest_of_command.includes("show gridlines")):
            case (rest_of_command.includes("show grid lines")):
              show_all_gridlines_btn.click();
              break;
            case (rest_of_command.includes("hide small graphs")):
            case (rest_of_command.includes("hide small graph")):
              hide_small_graphs = true;
              break;
            case (rest_of_command.includes("show small graphs")):
            case (rest_of_command.includes("show small graph")):
              hide_small_graphs = false;
              break;
            case (rest_of_command.includes("clear soft macros")):
              delete_all_soft_macros_btn.click();
              break;
            case (rest_of_command.includes("test temperature alarm")):
              playAlarm(0);
              break;
            case (rest_of_command.includes("test pressure alarm")):
              playAlarm(1);
              break;
            case (rest_of_command.includes("zoom graph 2 times")):
            case (rest_of_command.includes("zoom graph two times")):
              zoom_minutes = 1;
              break;
            case (rest_of_command.includes("zoom graph 4 times")):
            case (rest_of_command.includes("zoom graph four times")):
              zoom_minutes = 2;
              break;
            case (rest_of_command.includes("reset graph zoom")):
            case (rest_of_command.includes("zoom graph 1 times")):
            case (rest_of_command.includes("zoom graph 1 time")):
            case (rest_of_command.includes("zoom graph one times")):
            case (rest_of_command.includes("zoom graph one time")):
              zoom_minutes = 0;
              break;
            default:
              console.log("Not a valid voice command.");
              convertTextToSpeech("Not a valid voice command.");
              break;
          }
          break;
        default:
          recognition.stop();
          buggy_jarvis = true;
          is_actively_listening = false;
          break;
      }

      // setTimeout(function () {
      //   buggy_jarvis = false;
      //   // transcript = "";
      //   if (error_handler_speech == 2) {
      //     recognition.stop();
      //     is_actively_listening = false;
      //     return false;
      //   }
      //   error_handler_speech = 1;
      //   // if (continue_parsing_speech) {
      //   //   parseUserSpeech();
      //   // }
      // }, getSpeechTime(transcript));
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error: ' + event.error);
      // switch (error_handler_speech) {
      //   case 0:
      //   case 1:
      //     parseUserSpeech();
      //     break;
      //   default:
      //     is_actively_listening = false;
      //     break;
      // }
    };

    recognition.onend = () => {
      // if (buggy_jarvis == true) {
      //   buggy_jarvis = false;
      // }
      // if (continue_parsing_speech || is_actively_listening) {
      //   parseUserSpeech();
      // }   
      if (buggy_jarvis == true || buggy_jarvis == false) {
        switch (error_handler_speech) {
          case 0:
          case 1:
            // parseUserSpeech();
            setTimeout(function () {
              // buggy_jarvis = false;
              // transcript = "";
              if (error_handler_speech == 2) {
                recognition.stop();
                buggy_jarvis = "";
                is_actively_listening = false;
                return false;
              }
              error_handler_speech = 1;
              parseUserSpeech();
            }, getSpeechTime(additional_words));
            break;
          default:
            is_actively_listening = false;
            break;
        }
      }
    };

    recognition.start();
    console.log("Began parsing user speech.");

    // recognition.onend = () => {
    //   recognition.start();
    //   console.log("Listening restarted...");
    // };
  }

  else {
    console.warn("Speech recognition is not supported by this browser.");
  }
}