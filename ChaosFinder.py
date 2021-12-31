import numpy as np
from numba import njit
import scipy
import math
import sys

'''DATASHADER IMPORTS'''
import datashader as ds
import pandas as pd
import colorcet as cc
import matplotlib.pyplot as plt
from matplotlib import cm

# Kaplan-Yorke conjecture
def fractal_dimension(maxLE,minLE):
	if maxLE < 0.0:
		return 0.0
	else:
		sum_ = maxLE + minLE
		if sum_ > 0.0:
			j = 2.0
			pos_sum = sum_
		else:
			j = 1.0
			pos_sum = maxLE
		return j + (pos_sum / abs(minLE))

def get_random_args(n):
	return 2.4*np.random.rand(n)-1.2

def get_random_args_(n):
	args = np.zeros(n)
	for i in range(n):
		args[i] = round(-1.2 + np.random.randint(25)*0.1, 1)
	return args

@njit
def check_unbounded(x, y, thresh):
	'''
	Checks if a point surpasses the supplied
	threshold or DNE / is infinity
	'''
	return (abs(x) > thresh or abs(y) > thresh \
		or math.isnan(x) or math.isnan(y) or
		math.isinf(x) or math.isinf(y))

@njit
def check_movement(x,y,xp,yp):
	'''
	Checks if the current point has moved
	from previous point (to rule out fixed
	points)
	'''
	return (abs(x-xp) < 1e-16 or abs(y-yp) < 1e-16)


@njit
def f(args, x, y):
	'''
	Returns Xn+1 (or Yn+1) given Xn, Yn
	given the respective coefficients
	'''
	a,b,c,d,e,f = args
	return a + b*x + c*(x*x) + d*(x*y) + e*y + f*(y*y)

@njit
def J(args1, args2, x, y):
	'''
	Returns the local jacobian matrix of
	a quadratic two-dimensional map given
	(x,y) and coefficients of the map
	'''
	a1,b1,c1,d1,e1,f1 = args1
	a2,b2,c2,d2,e2,f2 = args2

	return np.array(
			[
			[2*c1*x + d1*y + b1, d1*x + 2*f1*y + e1],
			[2*c2*x + d2*y + b2, d2*x + 2*f2*y + e2]
			] 
			)

@njit
def f_cubic(a,x,y):
	return a[0] + a[1]*x + a[2]*x*x + a[3]*(x*x*x) + \
		a[4]*x*x*y + a[5]*x*y + a[6]*x*y*y + a[7]*y + \
		a[8]*y*y + a[9]*y*y*y

@njit
def J_cubic(args1, args2, x, y):
	a1,a2,a3,a4,a5,a6,a7,a8,a9,a10 = args1
	b1,b2,b3,b4,b5,b6,b7,b8,b9,b10 = args2

	return np.array(
		[
		[a2 + 2*a3*x + 3*a4*(x*x) + 2*a5*y*x + a6*y + a7*(y*y),
		a5*(x*x) + a6*x + a7*x*2*y + a8 + 2*a9*y + 3*a10*y*y],
		[b2 + 2*b3*x + 3*b4*(x*x) + 2*b5*y*x + b6*y + b7*(y*y),
		b5*(x*x) + b6*x + b7*x*2*y + b8 + 2*b9*y + 3*b10*y*y]
		]
		)


# @njit
# def f_symplectic(a,x,y):
# 	return a[0] + a[1]*x + a[2]*(x*x) + a[3]*(x**3) + \
# 		a[4]*(x**4) + a[5]*(x**5) + a[6]*y

# @njit
# def J_symplectic(args1,args2,x,y):
# 	a1,a2,a3,a4,a5,a6,a7 = args1
# 	b1,b2,_,_,_,_,_ = args2

# 	return np.array(
# 		[
# 		[a2 + a3*2*x + a4*3*(x*x) + a5*4*(x**3) + \
# 			a6*5*(x**4) + a7, a7],
# 		[b2, 0]
# 		]
# 		)


def exclude(maxLE, minLE, C, fd, thresh=0.):
	return maxLE <= thresh or abs(fd - 1.) < 0.11

def exclude_cubic(maxLE, minLE, C, fd, thresh=0.):
	exclude = maxLE <= thresh
	for i in [1., 2.]:
		exclude = exclude or abs(fd - i) < 0.11
	return exclude





def wait():
	q_signals = ['q', 'Q']
	x = input()
	if x in q_signals:
		exit()







@njit
def test(args1, args2, n, N, thresh, kind='quadratic'):
	x, y = 0.05, 0.05
	v1 = np.array([1., 0.])
	v2 = np.array([0., 1.])

	if kind == 'quadratic':
		fct = f
		Jacobian = J
	elif kind == 'cubic':
		fct = f_cubic
		Jacobian = J_cubic
	# elif kind == 'symplectic':
	# 	fct = f_symplectic
	# 	Jacobian = J_symplectic

	# Discard the first n points to ensure
	# we begin LE approximation on the
	# (potential) attractor
	for _ in range(n):
		xp, yp = x,y
		x, y = fct(args1,xp,yp), fct(args2,xp,yp)

		# Local jacobian
		M = Jacobian(args1,args2,x,y)

		# Jacobian matrix product
		v1 = M.dot(v1)
		v2 = M.dot(v2)

		# Dot products
		dot_11 = np.dot(v1,v1)
		dot_12 = np.dot(v1,v2)
		dot_22 = np.dot(v2,v2)

		# Gram-Schmidt
		v2 -= np.multiply((dot_12/dot_11), v1)

		# Normalize
		v1 = v1/np.sqrt(dot_11)
		v2 = v2/np.sqrt(dot_22)

	minLE = 0.0
	maxLE = 0.0
	C = 0.0

	count = 0

	# Begin estimation
	for _ in range(N):
		xp, yp = x,y
		x, y = fct(args1,xp,yp), fct(args2,xp,yp)

		# Local jacobian
		M = Jacobian(args1,args2,x,y)

		# Check if bounded
		if check_unbounded(x,y,thresh):
			return np.array([-1.,-1.,-1.])

		# Check if fixed point
		if check_movement(x,y,xp,yp):
			if count >= 15:
				return np.array([-1.,-1.,-1.])
			else:
				count += 1
		elif count > 0:
			count -= 1

		# Jacobian matrix product
		v1 = M.dot(v1)
		v2 = M.dot(v2)

		# Dot products
		dot_11 = np.dot(v1,v1)
		dot_12 = np.dot(v1,v2)
		dot_22 = np.dot(v2,v2)

		# Norms
		sqrt_dot_11 = np.sqrt(dot_11)
		sqrt_dot_22 = np.sqrt(dot_22)

		# Gram-Schmidt
		v2 -= np.multiply((dot_12/dot_11), v1)

		# Normalize
		v1 = v1/sqrt_dot_11
		v2 = v2/sqrt_dot_22

		# Update LEs
		maxLE += np.log(sqrt_dot_11)
		minLE += np.log(sqrt_dot_22)

		# Update contraction
		C += np.log(abs(np.linalg.det(M)))

	N_f = float(N)
	log2 = np.log(2.) # log base 2 is standard for maps

	# Compute the averages
	maxLE = maxLE / N_f / log2
	minLE = minLE / N_f / log2
	C = C / N_f / log2

	return np.array([maxLE, minLE, C])


@njit
def iterate(args1, args2, N, kind='quadratic'):
	x, y = 0.05, 0.05
	pts = np.zeros((N,3))

	if kind == 'quadratic':
		fct = f
	elif kind == 'cubic':
		fct = f_cubic
	# elif kind == 'symplectic':
	# 	fct = f_symplectic

	for i in range(N):
		xp, yp = x,y
		x,y = fct(args1,x,y),fct(args2,x,y)
		pts[i,0], pts[i,1] = x,y
	return pts

def dash_find_next_map(N_plot, N_trans, N_test, use_alphabet, kind):
	thresh = 1e6
	LE_thresh = 1e-4

	randomizer_ = get_random_args

	if use_alphabet:
		randomizer_ = get_random_args_

	if kind == 'quadratic':
		condition = exclude
		randomizer = \
			lambda : (randomizer_(6), randomizer_(6))
	elif kind == 'cubic':
		condition = exclude_cubic
		randomizer = \
			lambda : (randomizer_(10), randomizer_(10))

	# Get random args between -1.2 and 1.2
	args1, args2 = randomizer()
	try:
		maxLE, minLE, C = test(args1, args2, N_trans, 
			int(N_test), thresh, kind)
		fd = fractal_dimension(maxLE, minLE)
	except ZeroDivisionError:
		maxLE, minLE, C, fd = -1,-1,-1,-1
	

	# While not chaotic or no apparent fractality,
	# try new params and test again
	while condition(maxLE, minLE, C, fd, thresh=LE_thresh):
		try:
			args1, args2 = randomizer()
			maxLE, minLE, C = test(args1, args2, N_trans, 
				int(N_test), thresh, kind)
			fd = fractal_dimension(maxLE, minLE)
		except ZeroDivisionError:
			maxLE = -1

	# Acquire points to plot image
	pts = iterate(args1, args2, int(N_plot), kind)

	# Format args & results to convert to string
	args = list(args1) + list(args2)
	[maxLE, minLE, C] = list(map(lambda x: round(x, 4), [maxLE, minLE, C]))
	fd = round(fd, 4)

	return pts, args, maxLE, minLE, fd


def find_maps(N_plot, N_test, kind, canvas_size, mpl_dpi, path):
	################## OPTIONS ###################

	N_search = 1e4
	# N_test = 1e8
	# N_plot = 5e7
	ntrans = 1000
	thresh = 1e6
	LE_thresh = 1e-4

	usePPTK = False
	useDS = True

	useAlphabet = True
	# kind = 'symplectic'

	# canvas_size = 1500
	# mpl_dpi = 1200

	debug = False
	scatter_debug = False

	# path = "/Users/theofabilous/Desktop/School/ChaosProject/auto_pictures/"


	###############################################




	name = path + "auto_args.txt"
	file = open(name, 'a')

	jet = plt.get_cmap('jet')
	prism = plt.get_cmap('prism')
	gnu = plt.get_cmap('gnuplot2')
	turbo = plt.get_cmap('turbo')
	mpl_maps = [jet, prism, gnu, turbo]

	cmaps = [cc.fire, cc.bmy, cc.bgy, cc.kbc, cc.colorwheel]
	# cmaps += mpl_maps

	randomizer_ = get_random_args

	if useAlphabet:
		randomizer_ = get_random_args_

	if kind == 'quadratic':
		condition = exclude
		randomizer = \
			lambda : (randomizer_(6), randomizer_(6))
	elif kind == 'cubic':
		condition = exclude_cubic
		randomizer = \
			lambda : (randomizer_(10), randomizer_(10))
	# elif kind == 'symplectic':
	# 	condition = \
	# 		lambda a,b,c,d: exclude_cubic(a,b,c,d,LE_thresh)
	# 	def randomizer():
	# 		xn1 = randomizer_(6)
	# 		xn1 = np.append(xn1, 0.)
	# 		sw = np.random.rand() < 0.5

	# 		yn1 = np.zeros(7)
	# 		yn1[0], _ = randomizer_(2)
	# 		if sw:
	# 			xn1[-1] = -1.
	# 			yn1[1] = 1
	# 		else:
	# 			xn1[-1] = -1.
	# 			yn1[1] = 1

	# 		return xn1, yn1


	chaos = 0
	non_chaos = 0
	for k in range(int(N_search)):

		# Get random args between -1.2 and 1.2
		args1, args2 = randomizer()
		try:
			maxLE, minLE, C = test(args1, args2, ntrans, 
				int(N_test), thresh, kind)
			fd = fractal_dimension(maxLE, minLE)
		except ZeroDivisionError:
			maxLE, minLE, C, fd = -1,-1,-1,-1
		

		# While not chaotic or no apparent fractality,
		# try new params and test again
		while condition(maxLE, minLE, C, fd):
			non_chaos += 1
			try:
				args1, args2 = randomizer()
				maxLE, minLE, C = test(args1, args2, ntrans, 
					int(N_test), thresh, kind)
				fd = fractal_dimension(maxLE, minLE)
			except ZeroDivisionError:
				maxLE = -1

		chaos += 1

		print("Found a chaotic map!")
		print(f"Chaotic solutions found: {chaos}")
		print(f"Non-chaotic solutions found: {non_chaos}\n")

		print(maxLE)


		# Acquire points to plot image
		pts = iterate(args1, args2, int(N_plot), kind)

		# Format args & results to convert to string
		args = list(args1) + list(args2)
		[maxLE, minLE, C] = list(map(lambda x: round(x, 4), [maxLE, minLE, C]))
		fd = round(fd, 4)
		
		# Write args to file
		file.write("ARGS: " + str(args) + "\n")
		file.write("MAX, MIN, C: " + 
			str([maxLE, minLE, C]) + "\n")
		file.write("FRACTAL DIM: " + str(fd)+"\n")

		# args = list(map(lambda x: round(x, 5)))
		titleDS = ""

		range_ = range(0,12,3)
		plus = 3
		if kind == 'cubic':
			range_ = range(0,20,5)
			plus = 5
		# elif kind == 'symplectic':
		# 	range_ = range(0, 9, 3)
		# 	plus = 3
		for i in range_:
			curr = args[i:i+plus]
			titleDS += str(curr)[1:-1] + "\n"
		titleDS += f"[ * ] MAX, MIN, C [ * ] : {maxLE}, {minLE}, {C}\n"
		titleDS += f"[ * ] FRACTAL DIM [ * ] : {fd}"

		cmap_i = np.random.randint(len(cmaps))
		df = pd.DataFrame(data=pts[:,:2], columns=["x", "y"])
		xbounds = (pts[:, 0].min()-0.2, pts[:, 0].max()+0.2)
		ybounds = (pts[:, 1].min()-0.2, pts[:, 1].max()+0.2)
		# print(xbounds)
		# print(ybounds)
		cvs = ds.Canvas(plot_width=canvas_size, plot_height=canvas_size, 
			x_range=xbounds, y_range=ybounds)
		agg = cvs.points(df, 'x', 'y')
		img = ds.tf.set_background(ds.tf.shade(agg, how="log", cmap=cmaps[cmap_i]), 
			"black").to_pil()
		N_plot
		if debug and scatter_debug:
			plt.scatter(pts[:int(N_plot/100),0], pts[:int(N_plot/100),1], s=0.01)
			plt.title(titleDS, fontdict={'size': 5})
			plt.show()
			wait()
		
		if not debug or (debug and not scatter_debug):
			plt.imshow(img)
			plt.axis('off')
			plt.title(titleDS, fontdict={'size': 5})
			ID = ''.join([chr(65+np.random.randint(123-65)) for _ in range(6)])
			name = path + f"_{k}_{round(args[0],4)}_{ID}.png"
			if debug:
				plt.show()
				wait()
			else:
				plt.savefig(name, dpi=mpl_dpi)
				
			

	file.close()
