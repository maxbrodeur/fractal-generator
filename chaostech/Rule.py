import numpy as np
from numba import njit, int32, boolean
from numba.experimental import jitclass

spec = [
	('heap', int32[:]),
	('ln', int32),
	('offset', int32),
	('s', int32),
	('symmetry', boolean)
]

@njit
def get_heap(length):
	heap = np.zeros(length, dtype=np.int32)
	if length > 0:
		heap[length-1] = -1
	return heap

@njit
def sign(x):
	if x < 0:
		return -1
	else:
		return 1


@jitclass(spec)
class Rule(object):

	def __init__(self, num=0, offset=0, symmetry=False):
		self.heap = get_heap(num)
		self.ln = num
		self.offset = np.abs(offset)
		self.s = sign(offset)
		self.symmetry = symmetry


	def get(self):
		return self.heap[0]

	def add(self, e):
		if self.ln > 0:
			for i in range(self.ln-1):
				self.heap[i] = self.heap[i+1]
			self.heap[self.ln-1] = e

	def all(self):
		if self.ln > 0:
			i = 0
			equal = True
			while equal and i < self.ln-1:
				equal = (self.heap[i] == self.heap[i+1])
				i += 1
			return equal
		else:
			return False

	def check(self, vln, ind):
		#Returns TRUE if CANNOT be chosen
		if not self.all():
			return False
		ref = self.get()
		ofs = self.offset
		if self.symmetry:
			return (((ind - ref) % vln) == ofs) or\
			(((-ind + ref) % vln) == ofs)
		else:
			return ((self.s*(ind - ref) % vln) == ofs)

