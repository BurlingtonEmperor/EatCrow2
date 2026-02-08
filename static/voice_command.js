window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const text_to_speech = new SpeechSynthesisUtterance();

function convertTextToSpeech (message_text) {
  text_to_speech.text = String(message_text);
  window.speechSynthesis.speak(text_to_speech);
}

function parseUserSpeech () {
  if (window.SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US"; 
    recognition.interimResults = false; 

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Parsed user speech: ' + transcript);
      
      const first_word_to_comp = String(transcript.trim().split(' ')[0]).toLowerCase();
      switch (true) {
        case (first_word_to_comp == "computer"):
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
          }
          break;
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error: ' + event.error);
    };

    recognition.start();
    console.log("Began parsing user speech.");
  }

  else {
    console.warn("Speech recognition is not supported by this browser.");
  }
}