autoclave_sim_active = 1;

# 2-3 celsius per min increase is NOT ALLOWED!

def activate_sim ():
  global autoclave_sim_active;
  autoclave_sim_active = 1; 

def autoclave_simulator_interface ():
  print("Type HELP for a list of simulator commands.");
  simulator_cmd_input = input("SIM: ");
  match (autoclave_sim_active):
    case 1:
      run_simulator_cmd(simulator_cmd_input);
    case _:
      print("Exiting simulation...");

def run_simulator_cmd (commandText):
  global autoclave_sim_active;

  match (commandText):
    case ("help"):
      print("""
start_autoclave: starts the autoclave simulation
quit_autoclave: quits the autoclave simulation
      """);
    case ("start_autoclave"):
      print();
    case ("quit_autoclave"):
      autoclave_sim_active = 0;
      print("Press [ENTER] again to quit");
    case _:
      print("Invalid simulation command.");
  autoclave_simulator_interface();
      
