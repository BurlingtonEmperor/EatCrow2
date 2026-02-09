window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const text_to_speech = new SpeechSynthesisUtterance();
let additional_words = "";

let speech_command_pointer = "computer";
let continue_parsing_speech = false;

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

function parseUserSpeech () {
  if (window.SpeechRecognition) {
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US"; 
    recognition.continuous = true; 
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Parsed user speech: ' + transcript);
      
      const first_word_to_comp = String(transcript.trim().split(' ')[0]).toLowerCase();
      switch (true) {
        case (first_word_to_comp == speech_command_pointer):
          const command_array_org = transcript.trim().split(' ');
          command_array_org[0] = " ";

          const rest_of_command = String(String(command_array_org.join(' ')).trim()).toLowerCase();
          console.log("Voice command given: " + rest_of_command);

          switch (true) {
            case (rest_of_command.includes("confirm use")):
              console.log("User speech commands are functional.");
              convertTextToSpeech("User speech commands are functional.");
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
              break;
            default:
              console.log("Not a valid voice command.");
              convertTextToSpeech("Not a valid voice command.");
              break;
          }
          break;
      }

      setTimeout(function () {
        if (continue_parsing_speech) {
          parseUserSpeech();
        }
      }, getSpeechTime(transcript));
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error: ' + event.error);
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