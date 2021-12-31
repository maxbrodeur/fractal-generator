from dash import html
from dash import dcc
import dash_bootstrap_components as dbc

import numpy as np
import plotly.express as px 


kind_radio = html.Div(
		className = 'input_frame_find',
		children = [
		html.Label(
			className = "my_label",
			children = ['Chaotic Map Order',
			dbc.RadioItems(
			    id='kind-radio',
			    options=[
			        {'label': 'Quadratic', 'value': 'quadratic'},
			        {'label': 'Cubic', 'value': 'cubic'},
			    ],
			    value='quadratic',
			    labelStyle={'display': 'flex'},
			    inline = True
				)]
			)])


iterations = html.Div(
		className = 'input_frame_find',
		children = [
		html.Label(
			className = "my_label",
			children = ['Iterations (in thousands)',
			dbc.Input(
				className='input',
				id='find-iterations-input',
				type='number',
				min=10,
				max=10000,
				step=5,
				value=1000)]
			)])

trans_input = dbc.Input(
	id='find-trans-input',
	className = "input",
	type='number',
	min=100,
	max=10000,
	step=5,
	value=800)
trans_label = html.Label(className = "my_label",
	children=["Discard the first ", html.Label(id="trans",children=[800])," points when testing for Chaos",
		trans_input])
trans = html.Div(className = 'input_frame_find',
		children = [trans_label])

test = html.Div(
		className = 'input_frame_find',
		children = [
		html.Label(
			className = "my_label",
			children = ['Number of maps to check: ',
			dbc.Input(
				id='find-test-input',
				className = "input",
				type='number',
				min=10000,
				max=1000000,
				step=1000,
				value=70000)]
			)])


randtype = html.Div(
		className = 'input_frame_find',
		children = [
		html.Label(
			className = "my_label",
			children = ['Randomization Type',
			dbc.RadioItems(
			    id='find-randtype-dropdown',
			    options=[
					{'label': 'Continuous', 'value': 'False'},
					{'label': 'Discrete (\"Alphabet\" mode)', 'value': 'True'},
				],
				value = 'True'
				)]
			)])


find_button = dbc.Button(
	'Find next chaotic map',
	id='find-button')


map_info_display = html.Label(
	id='find-map-info',
	children=["No map information to show"])

def format_map_info(args, max_le, min_le, fractal_dim, use_alphabet):
	args = map(lambda x: round(x, 1), args)
	if use_alphabet:
		ints = [x/10 for x in range(-12, 13, 1)]
		chrs = [chr(x) for x in range(65, 90)]
		int_chr_dict = dict(zip(ints, chrs))
		args_show = ''
		for a in args:
			args_show += int_chr_dict[a]
	else:
		args_show = str(list(args))

	fractal_dim = '> 2.0' if fractal_dim > 2.0 else fractal_dim

	ret = []
	ret.append(f'Parameters: {args_show}')
	ret.append(html.Br())
	ret.append(f'Maximum lyapunov exponent: {max_le}')
	ret.append(html.Br())
	ret.append(f'Minimum lyapunov exponent: {min_le}')
	ret.append(html.Br())
	ret.append(f'Estimated Kaplan-Yorke dimension: {fractal_dim}')

	return ret


graph = dcc.Graph(id='find-graph',
	style={'height': '100vh'})

# layout_div = html.Div(
# 	[kind_radio, plot_options_div, randtype, find_button, html.Br(), map_info_display, graph])


tab3 = html.Div(className = "CHAOS-FINDER", 
	children = 
				[dbc.Accordion(
					dbc.AccordionItem(
						className = "accordion-find",
				 		children = [html.Div(
							className = "finder",
							children = [kind_radio, 
										iterations, 
										trans, 
										test, 
										randtype, 
										find_button, 
										map_info_display]
										)], 
							        title="PARAMETERS"),
							    start_collapsed = True),
				graph
				])
