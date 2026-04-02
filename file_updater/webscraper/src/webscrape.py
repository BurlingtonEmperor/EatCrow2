import sys
import os
import urllib.request

if len(sys.argv) > 1:
  url_to_scrape = sys.argv[1]

  try:
    with urllib.request.urlopen(url_to_scrape) as response:
      file_content = response.read().decode('utf-8')
      with open("webscrape_output.txt", "w") as f:
        f.write(file_content)
  except Exception as err1:
    try:
      with open("webscrape_output.txt", "w") as f:
        f.write("There was an error when trying to fetch the remote file: " + str(err1))
    except Exception as err:
      print("File error: " + str(err))
      input("Press ENTER to exit this program.")  