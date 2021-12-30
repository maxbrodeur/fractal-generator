import numpy as np
from numba import njit, int32, boolean
from chaostech.Rule import *
from chaostech.MathTech import *
import time
import sys
import scipy


def njit_all(funs):
	return np.array(list(map(lambda x: njit(x), funs)))

@njit
def test(f, args, a, b):
	for i in range(args.shape[0]):
		print(f(args[i],a,b))


def get_random_transformation():
	# xparams = 2*np.random.rand(3)-1
	# yparams = 2*np.random.rand(3)-1
	a,b,c,d,e,f = (4,4,4,4,4,4)

	while (not test_params(a, b, c, d, e, f)):
		a, b, c = 2*np.random.rand(3)-1
		d, e, f = 2*np.random.rand(3)-1

	return (a, b, c, d, e, f)


@njit
def test_params(a,b,c,d,e,f):

	c1 = (a**2 + d**2) < 1
	c2 = (b**2 + e**2) < 1
	c3 = (a**2 + b**2 + d**2 + e**2) < (1 + (a*e - d*b)**2)

	return (c1 and c2 and c3)



@njit
def get_3D_rotn_matrix(a, b, c):
	COSA = np.cos(a)
	SINA = np.sin(a)
	COSB = np.cos(b)
	SINB = np.sin(b)
	COSC = np.cos(c)
	SINC = np.sin(c)

	row1 = np.array([COSA*COSB, COSA*SINB-SINA*COSC, COSA*SINB*COSC+SINA*SINC])
	row2 = np.array([SINA*COSB, SINA*SINB+COSA*COSC, SINA*SINB*COSC-COSA*SINC])
	row3 = np.array([-SINB, COSB*SINC, COSB*COSC])

	rot_matrix = np.eye(3)
	rot_matrix[0] = row1
	rot_matrix[1] = row2
	rot_matrix[2] = row3

	return rot_matrix

@njit
def rotate_3D(p, a, b, c):
	m = get_3D_rotn_matrix(a, b, c)
	return m.dot(p)

@njit
def rotate_3D_fast(p, m):
	return m.dot(p)

@njit
def find_center_(vertices, n):
	xs = vertices[:, 0]
	ys = vertices[:, 1]
	return np.array([np.sum(xs)/n, np.sum(ys)/n])

@njit
def recenter_(vertices, n):
	diffx, diffy = find_center_(vertices, n)
	new = np.zeros_like(vertices)
	for i in range(new.shape[0]):
		vx, vy = vertices[i]
		new[i, 0] = vx - diffx
		new[i, 1] = vy - diffy
	return new

@njit
def find_center(vertices):
	xs = vertices[:, 0]
	ys = vertices[:, 1]
	minx, maxx, miny, maxy = (np.min(xs), np.max(xs), np.min(ys), np.max(ys))
	return np.array([minx + (maxx - minx)/2, miny + (maxy - miny)/2])

@njit
def re_center(vertices):
	diffx, diffy = find_center(vertices)
	new = np.zeros_like(vertices)
	for i in range(len(vertices)):
		vx, vy = vertices[i]
		new[i, 0] = vx - diffx
		new[i, 1] = vy - diffy
	return new

@njit
def stack_center(vertices):
	s = vertices.shape[0]
	vs = np.zeros((s+1,2))
	for i in range(s):
		vs[i] = vertices[i]
	vs[s] = np.array([0.,0.])
	return vs

@njit
def stack_center_3D(vertices):
	s = vertices.shape[0]
	vs = np.zeros((s+1,3))
	for i in range(s):
		vs[i] = vertices[i]
	vs[s] = np.array([0.,0.,0.])
	return vs

@njit
def get_midpoint(p1, p2):
	dx = (p1[0] - p2[0])/2
	dy = (p1[1] - p2[1])/2
	return np.array([dx+p2[0],dy+p2[1]])

@njit
def stack_midpoints(vertices):
	s = vertices.shape[0]
	s_ = (s*2)
	vs = np.zeros((s_, 2))
	for i in range(s_):
		if i % 2 == 0:
			vs[i] = vertices[int(i/2)]
		else:
			p1 = vertices[int((i-1)/2)]
			p2 = vertices[int((i+1)/2)]
			vs[i] = get_midpoint(p1, p2)
	vs[s_-1] = get_midpoint(vertices[s-1], vertices[0])
	return vs

@njit
def add_to_axis(vs, n, ax):
	for i in range(vs.shape[0]):
		v = vs[i]
		v[ax] += n

@njit
def pad(ps):
	s1, s2 = ps.shape
	new = np.zeros((s1, s2+1))
	for i in range(s1):
		new[i] = np.append(ps[i], 0)
	return new

@njit
def get_polygon(num, scale=1, recenter=True):
	'''
	Create a num-gon and return 2D array of pts of its vertices
	'''
	pts = np.zeros((num,2))
	dtheta = 2*PI / float(num)
	theta0 = 0
	p0 = np.zeros(2)
	pts[0] = p0
	x = p0[0]
	y = p0[1]
	theta = theta0
	for i in range(1, num):
		theta += dtheta
		dx = np.cos(theta)
		dy = np.sin(theta)
		x += scale*dx
		y += scale*dy
		pts[i] = np.array([x, y])
	return recenter_(pts, num) if recenter else pts

@njit
def get_prism(num=4, scale=1):
	btm = pad(get_polygon(num))
	top = pad(get_polygon(num))
	add_to_axis(btm, -0.5, 2)
	add_to_axis(top, 0.5, 2)
	cube = np.zeros((num*2, 3))
	for i in range(0, num):
		cube[i] = btm[i]
	for i in range(num, num*2):
		cube[i] = top[i-num]
	return cube

@njit
def get_pyramid(num, doub=False, scale=1):
	btm = get_polygon(num, scale=scale)
	s = num + 1
	if doub:
		s += 1
	pyr = np.zeros((s,3))
	for i in range(s):
		pyr[i] = np.array([btm[i,0], btm[i,1], 0.])
	if doub:
		pyr[s-2] = [0., 0., -0.5]
		pyr[s-1] = [0., 0., 0.5]
	else:
		pyr[s-1] = [0., 0., 1.]
		add_to_axis(pyr, -0.5, 2)
	return pyr

@njit
def get_vertex(num, heap):
	cond = True
	while cond:
		vi = np.random.randint(num)
		cond = heap.check(num, vi)
	heap.add(vi)
	return vi


@njit
def rotate(x, y, theta):
	COS = np.cos(theta)
	SIN = np.sin(theta)
	return np.array([x*COS - y*SIN, x*SIN + y*COS])

@njit
def rotate_(x, y, COS, SIN):
	return np.array([x*COS - y*SIN, x*SIN + y*COS])


@njit
def to_trig(T):
	s = T.shape[0]
	T_ = np.zeros((s, 3))
	for i in range(s):
		T_[i, 0] = T[i, 0]
		theta = T[i, 1]
		T_[i, 1] = np.cos(theta)
		T_[i, 2] = np.sin(theta)
	return T_

@njit
def to_array(T, lnv):
	T_ = np.zeros((lnv, 2))
	for i in range(lnv):
		T_[i] = T
	return T_

@njit
def identity(x):
	return x

@njit
def get_diffs(v, p, d):
	diffs = np.zeros(d)
	for i in range(d):
		diffs[i] = v[i] - p[i]
	return diffs

@njit
def get_next_3D(p, ds, k):
	return np.array([ds[0]*k + p[0],
					 ds[1]*k + p[1],
					 ds[2]*k + p[2]])

@njit
def getPointsAdv_sequence(N, p, f, args, seq, modulo, iterator, seqiter):
	'''
	Fractal iterator where the selection of the vertex follows the given sequence.
	'seqiter' is a function that is call on the sequence at every iteration
	and can modify the sequence (otherwise, seqiter == lambda x: x (id function))
	'''
	pts = np.zeros((N, 3))
	pts[0] = p
	s_ = np.copy(seq)
	arg_i = 0
	for k in range(1, N):
		params = args[seq[arg_i]]
		if arg_i > 3:
			print(params)
		p = f(params, p[0], p[1], p[2])
		pts[k] = p
		params = iterator(params)
		arg_i  = (arg_i + 1) % modulo
		seq = seqiter(seq,k,s_)
	return pts

@njit
def getPointsAdv(N, p, f, args, chooser, selector, iterator, probs):
	'''
	Fractal iterator where almost the entire functionality is based on user input
	(WORK IN PROGRESS, MAKES MORE SENSE WITH GUI [SEE _old_MainUI_.py]). The user
	provides a function ('chooser') that returns a vertex (or transformation) index when
	provided an array of probabilities/weights (corresponding to chance of choosing
	a certain vertex/transformation). 'Selector' returns a transformation function
	given an index. Iterator is a function called on the transformation/vertex parameters
	(usually just id map, i.e. lambda x: x). 'Probs' is an array of relative weights.
	'f' is the function called on the current point and the parameters returned by
	'selector'.
	'''
	pts = np.zeros((N, 3))
	pts[0] = p
	for k in range(1, N):
		i = chooser(probs)
		params = selector(args, i)
		p = f(params, p[0], p[1], p[2])
		pts[k] = p
		params = iterator(params)
	return pts

@njit
def getPointsV(vs, x0, y0, N, ifs, T, rule):
	'''
	The classic fractal iterator. 'vs' is an array of vertices. 'x0' & 'y0' are the
	initial conditions. 'N' is the number of iterations. 'ifs' is deprecated and
	should probably be removed. 'T' is the transformation (i.e. a tuple (k, theta)).
	Rule is a heap object (see chaostech.Rule.py) which keeps track of the last choices
	of vertices to check if the specified rule is satisfied (eg.: the next vertex cannot be
	two vertices away from the previous vertex, etc.).

	No iterator argument is present. If iterator needed, call 'getPointsV_iter'.
	'''
	x = x0
	y = y0
	pts = np.zeros((N, 3))
	lnv = vs.shape[0]
	lnt = T.shape[0]
	pts[0] = np.array([x,y,0])
	#if check_v(ifs, T, lnv):  removed for modulo T accessing
	T_ = to_trig(T)
	for i in range(1,N):
		vi = get_vertex(lnv, rule)
		v = vs[vi]
		diffx = (v[0] - x)
		diffy = (v[1] - y)
		k, COS, SIN = T_[vi % lnt]
		rot = rotate_(diffx, diffy, COS, SIN) #if do_rot else np.array([diffx, diffy])
		x = rot[0]*k + x
		y = rot[1]*k + y
		pts[i, 0] = x
		pts[i, 1] = y
	return pts

@njit
def getPoints3D(vs, p0, N, ifs, T, R, rule, fk=identity):
	'''
	Similar to getPointsV but in 3D. However, an iterator 'fk' can be passed to iterate
	k (the compression value).
	'''
	p = p0
	pts = np.zeros((N, 3))
	lnv = vs.shape[0]
	lnt = T.shape[0]
	for i in range(1,N):
		vi = get_vertex(lnv, rule)
		v = vs[vi]
		diffs = R.dot(get_diffs(v, p, 3))
		k, _ = T[vi % lnt]
		p = get_next_3D(p, diffs, k)
		T[vi % lnt, 0] = fk(k) 
		pts[i] = p
	return pts

@njit
def getPoints3D_iter_thetas(vs, p0, N, ifs, T, thetas, rule, fk=identity, fa=identity,
	fb=identity, fc=identity):
	'''
	Similar to getPoints3D but also allows for passing iterators for yaw, pitch and roll
	'''
	a, b, c = thetas
	p = p0
	pts = np.zeros((N, 3))
	lnv = vs.shape[0]
	lnt = T.shape[0]
	for i in range(1,N):
		vi = get_vertex(lnv, rule)
		v = vs[vi]
		diffs = rotate_3D(get_diffs(v, p, 3), a, b, c)
		k, _ = T[vi % lnt]
		p = get_next_3D(p, diffs, k)
		T[vi % lnt, 0] = fk(k) 
		a = fa(a)
		b = fb(b)
		c = fc(c)
		pts[i] = p
	return pts


@njit
def getPointsV_iter(vs, x0, y0, N, ifs, T, rule, fk=identity, ft=identity):
	'''
	Similar to getPointsV but iterator functions can be passed on k and theta
	'''
	x = x0
	y = y0
	pts = np.zeros((N, 3))
	lnv = vs.shape[0]
	lnt = T.shape[0]
	pts[0] = np.array([x,y,0])
	for i in range(1,N):
		vi = get_vertex(lnv, rule)
		v = vs[vi]
		diffx = (v[0] - x)
		diffy = (v[1] - y)
		k, theta = T[vi % lnt]
		rot = rotate(diffx, diffy, theta)
		x = rot[0]*k + x
		y = rot[1]*k + y
		T[vi % lnt, 0] = fk(k)
		T[vi % lnt, 1] = ft(theta)
		pts[i, 0] = x
		pts[i, 1] = y
	return pts


@njit
def no_rule():
	'''
	The default rule. (i.e. no extra rules)
	ex.: should be used as rule for siepinski triangle
	'''
	return Rule(0,0,False)





##################################################################

####### THESE \/ \/ MAY STILL WORK (NOT SURE) #####
### BUT 'ifs' enum (Order.vertex, etc.) is kinda useless

@njit
def sierpt(N, T=np.array([0.5, 0])):
	vs = get_polygon(3, 1, True)
	heap = no_rule()
	ifs = Order.vertex
	T = to_array(T, vs.shape[0])
	return getPointsV(vs, 0, 0, N, ifs, T, heap)

@njit
def sierpc(N, T=np.array([2/3, 0])):
	vs = get_polygon(4, 1, True)
	vs = stack_midpoints(vs)
	heap = no_rule()
	ifs = Order.vertex
	T = to_array(T, vs.shape[0])
	return getPointsV(vs, 0, 0, N, ifs, T, heap)

@njit
def vicsek(N, T=np.array([2/3, 0])):
	vs = get_polygon(4, 1, True)
	vs = stack_center(vs)
	heap = no_rule()
	ifs = Order.vertex
	T = to_array(T, vs.shape[0])
	return getPointsV(vs, 0, 0, N, ifs, T, heap)

@njit
def tsquare(N, T=np.array([1/2, 0])):
	vs = get_polygon(4, 1, True)
	heap = Rule(1, 2, False)
	ifs = Order.vertex
	T = to_array(T, vs.shape[0])
	return getPointsV(vs, 0, 0, N, ifs, T, heap)

@njit
def techs(N, T=np.array([1/2, 0]), skew=0):
	vs = get_polygon(4, 1, True)
	heap = Rule(1, skew, False)
	ifs = Order.vertex
	T = to_array(T, vs.shape[0])
	return getPointsV(vs, 0, 0, N, ifs, T, heap)

@njit
def webs(N, T=np.array([1/2, 0.1]), symmetry=True):
	vs = get_polygon(4, 1, True)
	heap = Rule(2, -1, symmetry)
	ifs = Order.vertex
	T = to_array(T, vs.shape[0])
	return getPointsV(vs, 0, 0, N, ifs, T, heap)



