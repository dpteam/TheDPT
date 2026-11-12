import sys
if sys.platform == "win32":
    import ctypes
    ctypes.windll.user32.MessageBoxW(0, "DPT", "TheDPT", 0x40)
else:
    print("DPT")
