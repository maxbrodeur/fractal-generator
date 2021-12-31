from dash import dcc
import dash_bootstrap_components as dbc
from dash import html

dropdown = html.Div(
		className = 'dropdown_frame',
		children = [
		html.Label(
			className = "my_label",
			children = ['Presets',
			dcc.Dropdown(
	        	className = "dropdown",
	            id = 'presets_dropdown',
	            options=[
	                {'label': 'sierpt', 'value': "sierpt"},
	                {'label': 'sierpc', 'value': "sierpc"},
	                {'label': 'vicsek', 'value': "vicsek"},
	                {'label': 'tsquare', 'value': "tsquare"},
	                {'label': 'techs', 'value': "techs"},
	                {'label': 'webs', 'value': "webs"},
	                {'label': 'XTREME', 'value': "XTREME"}
	            ],value = "sierpt")])
	        
        ])

iterations = html.Div(

	className = "input_number_frame",
	children = [
		html.Label(
			className = "my_label",
			children = [
						"Iterations: ", 
						dbc.Input(
							className="input",
							id = 'iterations_input',
							type = 'number',
							min = 0,
							max = 200000,
							step = 1,
							value = 10000
							)
						]
					),

])

polygon = html.Div(

	className = "input_number_frame",
	children = [
		html.Label(
			className = "my_label",
			children = [
						"Polygon: ", 
						dbc.Input(
							className="input",
							id = 'polygon_input',
							type = 'number',
							min = 1,
							max = 200,
							step = 1,
							value = 3
							)
						]
					),

])

jump = html.Div(

	className = "input_number_frame",
	children = [
		html.Label(
			className = "my_label",
			children = [
						"Jump: ", 
						dbc.Input(
							className="input",
							id = 'jump_input',
							type = 'text',
							value = "1/2",
							invalid = False
							)
						]
					),

])

ln = html.Div(

	className = "input_number_frame",
	children = [
		html.Label(
			className = "my_label",
			children = [
						"Length: ", 
						dbc.Input(
							className="input",
							id = 'length_input',
							type = 'number',
							min = 0,
							value = 0
							)
						]
					),

])

offset = html.Div(

	className = "input_number_frame",
	children = [
		html.Label(
			className = "my_label",
			children = [
						"Offset: ", 
						dbc.Input(
							className="input",
							id = 'offset_input',
							type = 'number',
							value = 0
							)
						]
					),

])

sym = html.Div(

	className = "input_boolean_frame",
	children = [
		html.Label(
			className = "my_label",
			children = [
						"Symmetry: ", 
						dbc.Switch(
							className="switch",
							id = 'symmetry_input',
							value = False
						)]
					)

])

midpoints = html.Div(

	className = "input_boolean_frame",
	children = [
		html.Label(
			className = "my_label",
			children = [
						"Stack Midpoints: ", 
						dbc.Switch(
							className="switch",
							id = 'midpoints_input',
							value = False
						)]
					)

])

center = html.Div(

	className = "input_boolean_frame",
	children = [
		html.Label(
			className = "my_label",
			children = [
						"Stack Center: ", 
						dbc.Switch(
							className="switch",
							id = 'center_input',
							value = False
						)]
					)

])

graph = dcc.Graph(id='GRAPH',style={'height': '100vh'})

tab1 = html.Div(className="CHAOS-GAME",
				children = 
				[dbc.Accordion(
					dbc.AccordionItem(
				 		[html.Div(
							className = "numbers",
							children = [dropdown,
										iterations, 
										jump, 
										polygon, 
										ln, 
										offset, 
										sym, 
										midpoints, 
										center]	
										)], 
							        title="PARAMETERS"),
							    start_collapsed = True),
				graph
				])


about = html.Div(className="ABOUT",
				children = [dbc.Nav([dbc.NavLink("GITHUB", href="https://github.com/maxbrodeur/fractal-generator")])])



