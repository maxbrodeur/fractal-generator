from enum import IntEnum
import numpy as np
from numba import njit, int32, boolean, float32
from numba.experimental import jitclass

PI = np.pi
PHI = (1 + np.sqrt(5))/2
MIL = 10**6


@njit
def random_choice(i, p):
	arr = np.arange(i)
	return arr[np.searchsorted(
		np.cumsum(p),
		np.random.random(),
		side="right")]

@njit
def random_shuffle(arr):
	num = arr.shape[0]
	for i in range(num-1, 0, -1):
		r = np.random.randint(i)
		temp = arr[i]
		arr[i] = arr[r]
		arr[r] = temp
	return arr

@njit
def random_swap(arr, num):
	ln = arr.shape[0]
	num = min(ln, num)
	for _ in range(num):
		i = np.random.randint(ln)
		j = np.random.randint(ln)
		temp = arr[i]
		arr[i] = arr[j]
		arr[j] = temp
	return arr



@njit
def random_choice_fix(i, p, hard=True, soft=False):
	arr = np.arange(i)
	sum_ = np.sum(p)
	if hard and sum_ != 1.:
		p = p/sum_
	# if soft:
	# 	exp = np.exp(p)
	# 	p = exp/np.sum(exp)
	return arr[np.searchsorted(
		np.cumsum(p),
		np.random.random(),
		side="right")]


class Order(IntEnum):
	vertex = 1
	linear = 2
	quadratic = 3
	quartic = 4
