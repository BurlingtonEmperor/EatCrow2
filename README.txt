EatCrow2 -- Industrial Autoclave Interface

-- USAGE --
Section 1: Download and Setup
Click "<> Code", and then select "Download ZIP".
Extract the files from the zip file into a seperate folder.
Click RUNME.bat and allow all permissions.
To run and/or reboot the program, simply click RUNME.bat.

Section 2: Modes
There are 3 modes of the autoclave. MANUAL, SEMI-MANUAL, and AUTOMATIC.
MANUAL mode: Manually set temperature and pressure change amounts, and then apply them to the autoclave.
SEMI-MANUAL mode: Set a specific temperature and pressure amount to level off at.
AUTOMATIC mode: Use preprogrammed macros for different curing processes.

The default mode is the MANUAL mode. To change modes, simply select the drop-down menu on the left-hand corner of the screen.

Section 3: Usage Modes 
Usage Modes can be found on the left-hand corner of the screen.
IDLE - Default state of the autoclave. The board is not connected, or the autoclave is not actively curing or cooling.
ACTIVE - Autoclave is actively curing or cooling.
TRAINER - Autoclave is in trainer mode (using the Modelclave).

Section 4: The Interface 
Autoclave Diagram *
The Autoclave Diagram is located in the very center of the screen, and is a large rectangle with a smaller 
rectangle inside of it with "TEMP" and "PSI" inside of the smaller rectangle. The large rectangle represents the autoclave integrity
with respect to temperature (ie. when the "TEMPERATURE" warning displays, the larger rectangle will turn red), and the smaller 
rectangle represents autoclave integrity with respect to pressure (ie. when the "PRESSURE" warning displays, the smaller rectangle will turn red).
"TEMP" and "PSI" indictate risks with respect to temperature and pressure rates (ie. when the "T-CLIMB" warning displays, the "TEMP" indicator
will turn red, and when the "P-CLIMB" warning displays, the "PSI" indicator will turn red).

* see warnings below.

-- SAFETY --
Section 1: Warnings
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