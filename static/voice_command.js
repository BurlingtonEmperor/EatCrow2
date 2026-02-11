window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const text_to_speech = new SpeechSynthesisUtterance();
let additional_words = "";

let speech_command_pointer = "computer";
let continue_parsing_speech = false;
let error_handler_speech = 0;
let is_actively_listening = false;
// let stutter_prevent_count = 0;
// let stutter_word_storage = "";

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

function parseUserSpeech () {
  if (window.SpeechRecognition) {
    is_actively_listening = true;
    const recognition = new SpeechRecognition();
    error_handler_speech = 0;

    recognition.lang = "en-US"; 
    recognition.continuous = true; 
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Parsed user speech: ' + transcript);
      
      const first_word_to_comp = String(transcript.trim().split(' ')[0]).toLowerCase();
      switch (true) {
        case (first_word_to_comp == speech_command_pointer):
          recognition.stop();
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
            default:
              console.log("Not a valid voice command.");
              convertTextToSpeech("Not a valid voice command.");
              break;
          }
          break;
      }

      setTimeout(function () {
        if (error_handler_speech == 2) {
          recognition.stop();
          is_actively_listening = false;
          return false;
        }
        error_handler_speech = 1;
        if (continue_parsing_speech) {
          parseUserSpeech();
        }
      }, getSpeechTime(transcript));
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error: ' + event.error);
      switch (error_handler_speech) {
        case 1:
          parseUserSpeech();
          break;
        default:
          is_actively_listening = false;
          break;
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