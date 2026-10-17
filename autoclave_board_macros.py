import psutil
import os

def find_flash_drives (filename):
  for partition in psutil.disk_partitions(all=True):
    if 'removable' in partition.opts.lower() or os.path.exists(partition.mountpoint):
      if 'cdrom' in partition.opts.lower() or not partition.mountpoint:
        continue
      target_path = os.path.join(partition.mountpoint, filename)
            
      if os.path.exists(target_path):
        return target_path

  return "no_file"          