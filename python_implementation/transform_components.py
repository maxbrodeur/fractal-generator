import dash_bootstrap_components as dbc
from dash import dcc
from dash import html
import numpy as np
import plotly.express as px 






MB_LIKE = '0.2020,-0.8050,-0.3730,-0.6890,-0.3420,-0.6530\n'
MB_LIKE += '0.1380, 0.6650, 0.6600, -0.5020, -0.2220,  -0.2770'
MB_LIKE_PROBS = '0.5,0.5'

SPIRAL = '0.787879,-0.424242,0.242424,0.859848,1.758647,1.408065\n'
SPIRAL += '-0.121212,0.257576,0.151515,0.053030,-6.721654,1.377236\n'
SPIRAL += '0.181818,-0.136364,0.090909,0.181818,6.086107,1.568035'
SPIRAL_PROBS = '0.9,0.05,0.05'

DRAGON = '0.824074,0.281428,-0.212346,0.864198,-1.882290,-0.110607\n'
DRAGON += '0.088272,0.520988,-0.463889,-0.377778,0.785360,8.095795'
DRAGON_PROBS = '0.8,0.2'

XMAS = '0.0, -0.5, 0.5, 0.0, 0.5, 0.0\n'
XMAS += '0.0, 0.5, -0.5, 0.0, 0.5, 0.5\n'
XMAS += '0.5, 0.0, 0.0, 0.5, 0.25, 0.5'
XMAS_PROBS = '1/3,1/3,1/3'

FERN = '0.0,0.0,0.0,0.16,0.0,0.0\n'
FERN += '0.2,-0.26,0.23,0.22,0.0,1.6\n'
FERN += '-0.15,0.28,0.26,0.24,0.0,0.44\n'
FERN += '0.85,0.04,-0.04,0.85,0.0,1.6'
FERN_PROBS = '0.01,0.07,0.07,0.85'

LEAF = '0.14,0.01,0.0,0.51,-0.08,-1.31\n'
LEAF += '0.43,0.52,-0.45,0.5,1.49,-0.75\n'
LEAF += '0.45,-0.49,0.47,0.47,-1.62,-0.74\n'
LEAF += '0.49,0.0,0.0,0.51,0.02,1.62'
LEAF_PROBS = '0.25,0.25,0.25,0.25'

SIERPT = '0.5,0.0,0.0,0.0,0.5,0.0\n'
SIERPT += '0.5,0.0,0.5,0.0,0.5,0.0\n'
SIERPT += '0.5,0.0,0.0,0.0,0.5,0.5'
SIERPT_PROBS = '1/3,1/3,1/3'

presets = html.Div(
		className = 'input_frame',
		children = [
		html.Label(
			className = "my_label",
			children = ['Transformation Presets',
			dcc.Dropdown(
				id="presets-dropdown",
				className = "dropdown",
				options=[
					{'label': 'Mandelbrot-like', 'value': 'MB_LIKE'},
					{'label': 'Spiral', 'value': 'SPIRAL'},
					{'label': 'Dragon', 'value': 'DRAGON'},
					{'label': 'Christmas tree', 'value': 'XMAS'},
					{'label': 'Fern', 'value': 'FERN'},
					{'label': 'Maple leaf', 'value': 'LEAF'},
					{'label': 'Sierpinski triangle', 'value': 'SIERPT'}
		],
		placeholder='Select a preset...',
		value = 'DRAGON'
	)])])


color_presets = html.Div(
		className = 'input_frame',
		children = [
		html.Label(
			className = "my_label",
			children = ['Color Presets',
			dcc.Dropdown(
				id="color-dropdown",
				className = "dropdown",
				options=[
					{'label': 'Fire', 'value': 'cc.fire'},
					{'label': 'Jet', 'value': 'plt.get_cmap(\'jet\')'},
					{'label': 'Prism', 'value': 'plt.get_cmap(\'prism\')'},
					{'label': 'Turbo', 'value': 'plt.get_cmap(\'turbo\')'},
					{'label': 'Color wheel', 'value': 'cc.colorwheel'},
					{'label': 'GNUPlot', 'value': 'plt.get_cmap(\'gnuplot2\')'},
					{'label': 'BMY', 'value': 'cc.bmy'}],
				placeholder='Select a color preset...',
				value = 'cc.fire'),
			]
			)])

parse_type = html.Div(
		className = 'input_frame',
		id = "PARSE-SELECT",
		children = [
		html.Label(
			className = "my_label",
			children = ['Parsing Type',
			dbc.RadioItems(
			    id='parse-type',
			    options=[
			        {'label': 'a,b,c,d,e,f => xnew = ax + by + c, ynew = dx + ey + f', 'value': 'regular'},
			        {'label': 'a,b,c,d,e,f => xnew = ax + by + e, ynew = cx + dy + f', 'value': 'borke'},
			    ],
			    value='regular',
			    labelStyle={'display': 'flex', 'text-align' : 'center'}
				)]
			)])


iterations = html.Div(
		className = 'input_frame',
		children = [
		html.Label(
			className = "my_label",
			children = ['Iterations (in thousands)',
			dbc.Input(
				className='input',
				id='iters',
				type='number',
				min=10,
				max=10000,
				step=5,
				value=1000)]
			)])

arguments = dbc.Textarea(
	className='txt_area',
	id='args-txt',
	placeholder='a,b,c,d,e,f\na,b,c,d,e,f\na,b,c,d,e,f\n...',
	value=DRAGON,
	#style={'width': '100%', 'height': 120}
)
arguments_div = html.Div(className='txt', children = ["Transformations: ", arguments])

probabilities = dbc.Textarea(
	className='txt_area',
	id='probs-txt',
	placeholder='1,1,1\nNOTE: number of entries needs to equal number of supplied parameters',
	value=DRAGON_PROBS,
	# style={'width': '100%'}
	)
probabilities_div = html.Div(className='txt', children = ["Probabilities: ",probabilities])

plot_button = dbc.Button('Plot', id='plot-button')

graph = dcc.Graph(id='GRAPH2',
	style={'height': '100vh'})

tab2 = html.Div(className = "TRANSFORMATIONS", 
	children = 
				[dbc.Accordion(
					dbc.AccordionItem(
						className = "accordion-transfos",
				 		children = [html.Div(
							className = "transfos",
							children = [presets,
										color_presets,
										parse_type, 
										iterations, 
										plot_button,
										arguments_div, 
										probabilities_div]
										)], 
							        title="PARAMETERS"),
							    start_collapsed = True),
				graph
				])
	



def read_args_from_string(string):
	args_pre = string.split('\n')
	params = list(filter(lambda x: x != '\n', args_pre))
	params = list(map(lambda x: x.strip(), params))
	params = list(map(lambda x: 'np.array(['+x+'])', params))
	return list(map(
		lambda x: eval(x),
		params))

def read_probs_from_string(string):
	probs = string.strip().split(',')
	probs = list(map(lambda x: float(eval(x)), probs))
	return np.array(probs)







	