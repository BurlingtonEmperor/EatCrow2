import psutil
import os

def find_flash_drives (filename):
  for partition in psutil.disk_partitions(all=True):
    if 'removable' in partition.opts.lower():
      target_path = os.path.join(partition.mountpoint, filename)
            
      if os.path.exists(target_path):
        return target_path

  return "no_file"          