from shelve import Shelf
from collections import OrderedDict
import time
import dbm
from threading import Lock

class OrderedShelf(Shelf):
    """
    This class inherits Shelf and adds an order to the inserted elements, deleting the oldest key once the OrderedShelf is full.
    """
    def __init__(self, filename, flag='c', protocol=None, writeback=False,
                 keyencoding="utf-8", size=100):
        super().__init__(dbm.open(filename, flag), protocol=protocol, writeback=writeback, keyencoding=keyencoding)
        self.lock = Lock()
        self.size = size

    def __setitem__(self, key, value):
        with self.lock:
            if len(self) == self.size:
                super().__delitem__(self.get_oldest_key())
            super().__setitem__(key, [time.time(), value])

    def __getitem__(self, key):
        return super().__getitem__(key)[1]

    def get_oldest_key(self):
        get = super().__getitem__
        return min(((key, get(key)) for key in self.keys()), key=lambda x: x[1][0])[0]
