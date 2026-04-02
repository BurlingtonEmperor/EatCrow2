import sys
import urllib.request

if len(sys.argv) > 1:
  url_to_scrape = sys.argv[1]

  try:
    with urllib.request.urlopen(url_to_scrape) as response:
      file_content = response.read().decode('utf-8')
      print(content)
  except:
    #placeholder