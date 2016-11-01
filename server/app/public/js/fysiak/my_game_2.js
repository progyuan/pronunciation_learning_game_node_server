/* Boring stuff: Words to be uttered: */

words = [
    'apple',
    'baseball',
    'age',
    'pig',
    'please',
    'elephant',
    'choose',
    'too',
    'monkey',
    'look',
    'long'
]


global_default_constants = {
    defaultStiffness: 0.5,
    defaultFriction: 0.01,
    defaultAirFriction: 0.1,
    nodesize : 16,
    spritesize : 25,
    timelimit: 60, // in seconds
};

levels = 
    {
	L0: 
	{
	    meta: 
	    {
		levelname: "A gentle intro",
		author: "Reima",
		date: "Oct 27 2016"
	    },
	    // Nodes:
	    box_properties:
	    {
		A : {x:  175,  y: 175,  clickable : false, type: 'start', score: 0},
		B : {x:  295,  y: 50,  clickable : true, type: 'unlocked', score: 0},
		C : {x:  375, y: 330,  clickable : false, type: 'exit', score: 0, winnable: false},
	    },
	    // Edges:
	    edge_array :
	    [
		['A','B'], 
		['B','C']
	    ],
	    // Static objects:
	    shelf_properties :
	    {
		ground: { x: 400, y: 550, height: 100, width: 800, angle: 0.03* Math.PI, isStatic: true},
	    },
	    constants: 
	    {
		timelimit: 20		
	    }
	}, // End L0

	L1: {
	    meta: 
	    {
		levelname: "A structure to entertain a game developer",
		author: "Reima",
		date: "Oct 25 2016"
	    },
	    // Nodes:
	    box_properties:
	    {
		A : {x:  75,  y: 175,  clickable : true, type: 'start', score: 0},
		A1 :{x:  75,  y: 50,  clickable : true, type: 'unlocked', score: 0},
		B : {x:  150, y: 75,  clickable : true, type: 'unlocked', score: 0},
		C : {x:  200, y: 220,  clickable : true, type: 'unlocked', score: 0},
		D : {x:  375, y: 100,  clickable : false, type: 'locked', score: 0},
		E : {x:  355, y: 250,  clickable : false, type: 'locked', score: 0},
		F : {x:  475, y: 100,  clickable : false, type: 'locked', score: 0},
		G : {x:  525, y: 250,  clickable : false, type: 'locked', score: 0},
		H : {x:  675, y: 175,  clickable : false, type: 'locked', score: 0},
		I : {x:  675, y: 450,  clickable : false, type: 'exit', score: 0, winnable: false},
	    },
	    
	    // Edges:
	    edge_array :
	    [
		['A','B'], ['A','C'], ['A','A1'], ['A1','B'],
		['B','C'], ['B','D'],['C','D'], ['C','E' ], 
		['D','E'],
		['D','F'], ['D','G'], ['E','G'],
		['F','H'], ['G','H'],
		['H','I']
	    ],
	    
	    // Static objects:
	    shelf_properties :
	    {
		left_shelf: { x: 80, y: 260, height: 80, width: 120, angle: -0.03*Math.PI, isStatic: true},
		right_shelf: { x: 360, y: 300, height: 80, width: 120,angle: 0.01*Math.PI, isStatic: true},
	    },

	    constants : 
	    {
		defaultStiffness: 0.5,
		timelimit: 30
	    }

	}, // End L1

    }




// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraints = Matter.Constraint,
    Query = Matter.Query,
    Composite = Matter.Composite;


// create an engine
var engine = Engine.create();

engine.constraintIterations = 6;
engine.positionIterations = 6;

var canvas = document.getElementById('gamecanvas');


// create a renderer
var render = Render.create({
    //element: document.body, //document.getElementById('gamecanvas'),//document.body,
    canvas: canvas,
    engine: engine,
    options: {
	wireframes : false,
	showDebug: true,
	//showBounds: true,
	//showAngleIndicator: true
    }	
});



// Define the look and feel of the game:
// Colors:

box_colors = {
    start: 'green',
    visited: 'lightgreen',
    locked: 'red',
    unlocked: 'orange',
    exit: 'red'
};

active_box_colors = {
    start: 'green',
    visited: 'lightgreen',
    locked: 'red',
    unlocked: 'yellow',
    exit : 'red'
}

var possible_edge = { lineWidth: 5 , visible: true, strokeStyle: 'lightgreen'};
var blocked_edge = { lineWidth: 3 , visible: true, strokeStyle: 'darkred'};
var orange_edge = { lineWidth: 4 , visible: true, strokeStyle: 'orange'};

var edgestyles = {
    'start-unlocked' : possible_edge,
    'unlocked-start' : possible_edge,
    'unlocked-unlocked' : orange_edge,
    'unlocked-locked' : blocked_edge,
    'locked-unlocked' : blocked_edge,
    'locked-locked' : blocked_edge,
    'visited-visited' : possible_edge,
    'visited-start' : possible_edge,
    'visited-unlocked' : possible_edge,
    'unlocked-visited' : possible_edge,
    'locked-exit' : blocked_edge,
    'unlocked-exit' : blocked_edge,
    'visited-exit' : possible_edge,
    'exit-visited' : possible_edge,
    'exit-locked' : blocked_edge,
    'exit-unlocked' : blocked_edge
}




//sprites:

var home= '/siak-users/images/';

score_sprites = {
    score1: home+'./score1.png',
    score2: home+'./score2.png',
    score3: home+'./score3.png' ,
    score4: home+'./score4.png' ,
    score5: home+'./score5.png',
    exit: home+'./exit.png',
    start: home+'./start.png',
    //locked : home+'./locked.png',
    //unlocked : home+'./unlocked.png',
};


// styles:

var strokeStyle = {
    lineWidth : 1,
    opacity : 0.2,
    strokeStyle : '#00066600'
}


// Game items:


// Level building helping functions: 

var getEdgePoint = function(itemA, itemB) {
    // Get a point on the edge of itemA in the direction of itemB:

    var vec = {x:itemA.circleRadius, y:0}; 
    var angle = Matter.Vector.angle(itemA.position, itemB.position);
    return Matter.Vector.rotate(vec, angle);
}


// From https://www.frankmitchell.org/2015/01/fisher-yates/
function shuffle (array) {
  var i = 0
    , j = 0
    , temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}





// Prepare the level:

var levelmeta;

var boxes;
var stars;
var hangers;
var edges;
var invisible_edges;
var object_stack;

var defaultStiffness = global_default_constants.defaultStiffness;
var defaultFriction = global_default_constants.defaultFriction;
var defaultAirFriction =  global_default_constants.defaultAirFriction;
var nodesize = global_default_constants.nodesize;
var spritesize = global_default_constants.spritesize;




// Building the level:



var build_level = function(levelname) {

    World.clear(engine.world, false);
    
    if (levelname == 'My own') {
	level = JSON.parse(document.getElementById('leveleditor').value);
    }
    else {
	level = levels[levelname];
    }


    if ("constants" in level) 
	dummy = 1;
    else	
	level.constants = {}

    levelmeta = 
	{ leveltitle : levelname + ": " + level.meta.levelname,
	  maxstars : 0
	}
    
    if ("timelimit" in level.constants) 
	levelmeta.timelimit = level.constants.timelimit;
    else
	levelmeta.timelimit = global_default_constants.timelimit;


    
    box_properties = level.box_properties;
    edge_array = level.edge_array;
    shelf_properties = level.shelf_properties;

    var defaultStiffness = global_default_constants.defaultStiffness;
    var defaultFriction = global_default_constants.defaultFriction;
    var defaultAirFriction =  global_default_constants.defaultAirFriction;
    var nodesize = global_default_constants.nodesize;
    var spritesize = global_default_constants.spritesize;
    
    if ("defaultStiffness" in level.constants)
	defaultStiffness = level.constants.defaultStiffness;
    if ("defaultFriction" in level.constants)
	defaultFriction = level.constants.defaultFriction;	
    if ("defaultAirFriction" in level.constants)
	defaultAirFriction = level.constants.defaultAirFriction;
    if ("nodesize" in level.constants)
	nodesize = level.constants.nodesize;
    if ("spritesize" in level.constants)
	spritesize = level.constants.spritesize;



    shuffle(words);
    Object.keys(box_properties).forEach( function(key) {
	if (box_properties[key].type == 'locked' || box_properties[key].type == 'unlocked') {
	    levelmeta.maxstars += 5;
	    box_properties[key].word = words.pop();
	    console.log('key: '+key + " word: "+ box_properties[key].word );
	}
    });
    

    boxes = {};
    Object.keys(box_properties).forEach( function(key) {
	item = box_properties[key];
	if (item.type in score_sprites) {
	    boxes[key]=Bodies.circle(item.x, item.y, spritesize,
				     //boxes[key]=Bodies.rectangle(item.x, item.y, 30,30, 
				     { label: key, 
				       render:{ 
					   fillStyle: box_colors[item.type],
					   sprite : {
					       texture :  score_sprites[item.type],
					   }
				       },
				       friction: defaultFriction,
				       frictionAir: defaultAirFriction
				     }
				    );
	    
	}
	else {
	    boxes[key]=Bodies.circle(item.x, item.y, nodesize,
				     //boxes[key]=Bodies.rectangle(item.x, item.y, 30,30, 
				     { label: key, 
				       render:{ 
					   fillStyle: box_colors[item.type],
				       },
				       friction: defaultFriction,
				       frictionAir: defaultAirFriction
				     }
				    );
	}
	
	
	Matter.Body.setDensity(boxes[key], 0.3);
    });

    stars = {};
    hangers = {};
    edges = {};
    invisible_edges = {};


    edge_array.forEach( function(ends) {
	edges[ends[0]+ends[1]] =  Constraints.create(
	    {
		bodyA: boxes[ends[0]],
		bodyB: boxes[ends[1]],
		stiffness: 0.01,
		render: //strokeStyle
		edgestyles[ box_properties[ends[0]].type +'-' + box_properties[ends[1]].type ],
		pointA: getEdgePoint ( boxes[ends[0]],  boxes[ends[1]] ),
		pointB: getEdgePoint ( boxes[ends[1]], boxes[ends[0]] )
		//pointB: {x:-15, y:0}
	    });
	invisible_edges[ends[0]+ends[1]] =  Constraints.create(
	    {
		bodyA: boxes[ends[0]],
		bodyB: boxes[ends[1]],
		stiffness: defaultStiffness,
		render: {visible:false},
		//pointB: {x:-15, y:0}
	    });

    });

    var shelves = [];
    Object.keys(shelf_properties).forEach( function(key) {
	s=shelf_properties[key];
	shelf = Bodies.rectangle( s.x, s.y, s.width, s.height, {isStatic: s.isStatic})
	if ("angle" in s) {
	    Matter.Body.rotate(shelf, s.angle);
	}
	shelves.push(shelf);
    });



    object_stack = Composite.create();
    Object.keys(boxes).forEach( function(box) { Composite.add(object_stack, boxes[box]) }  )
    Object.keys(edges).forEach( function(edge) { Composite.add(object_stack, edges[edge]) }  )
    Object.keys(invisible_edges).forEach( function(edge) { Composite.add(object_stack, invisible_edges[edge]) }  )


    // add all of the bodies to the world
    World.add(engine.world, shelves.concat([object_stack]));
}

// Event handling:

Events = Matter.Events;

MouseConstraint = Matter.MouseConstraint;
mouseConstraint = MouseConstraint.create(engine, {
    element: render.canvas
});

Events.on(mouseConstraint, 'mousedown', function(event) {
    var mousePosition = event.mouse.position;
    console.log('mousedown at ' + mousePosition.x + ' ' + mousePosition.y);
    bodies = Matter.Composite.allBodies(engine.world);
    Matter.Query.point(bodies, mousePosition).forEach( function(item) {
	if (item.label in box_properties) {
	    if (box_properties[item.label].type == 'exit' &&  box_properties[item.label].winnable) {	
		win_game(item);
	    }	    
	    else if (box_properties[item.label].clickable) {	
		/* ASR here */
		handle_scoring(item);
	    }
	}
    });
})

var mouseOverStack = [];
var default_fill = 'green';
var active_fill = 'lightgreen';

Events.on(render, 'afterRender', function() {
    var mousePosition = mouseConstraint.mouse.position;
    bodies = Matter.Composite.allBodies(engine.world);
    mouseOverStack.forEach(function() {
	item = mouseOverStack.pop();
	//console.log(item.label +" in mouseoverstack");
	item.render.fillStyle = box_colors[box_properties[item.label].type];
    });
    Matter.Query.point(bodies, mousePosition).forEach( function(item) {
	if (item.label in box_properties) {
	    mouseOverStack.push(item);

	    item.render.fillStyle = active_box_colors[box_properties[item.label].type];
	}
    });    
});

// Game events:

var game_time_left = 0;
var timer_running = false;


var game_timer = function (timelimit) {
    game_time_left = timelimit;
    timer_running = true;
    setInterval( function() {
	if (timer_running) {
	    game_time_left -= 0.1;
	    if (game_time_left < 0) {
		timer_running=false;
		out_of_time();
	    }
	    else {
		if (game_time_left > 10)
		    document.getElementById('timeleft').innerHTML = Math.floor(game_time_left);
		else
		    document.getElementById('timeleft').innerHTML = (Math.floor(game_time_left*10)/10);
	    }
	}	
    }, 100);
}

var pause_timer = function () {
    timer_running = false;
}

var continue_timer = function() {
    timer_running = true;
}

// Game-related physical things:

var getScoreDensity = function(score) {
    return (score+1)*4
}

var getScoreForce = function(score) {
    return 10 * (score+1);
}

var pause_game = function () {

    //Matter.Runner.stop(engine)
    engine.timing.timeScale = 0.00001;
    Render.stop(render);
    //engine.enabled = false
    pause_timer();
    console.log(engine.timing);

}

var continue_game = function() {

    //Matter.Runner.run(engine);
    //engine.enabled = true;
    Render.run(render);
    engine.timing.timeScale = 1;
    continue_timer();

}

var addStars = function(item, score) {
	console.log("check if "+box_properties[item.label]+" < "+ score);

	star_offsets = [
	    {x: 0, y: 25}, // 0
	    {x: -15, y: 20}, // 1
	    {x: 15, y: 20}, // 2
	    {x: -25, y: 15}, // 3
	    {x: 25, y: 15}, // 4
	]
	connect_star_to = [
	    false,
	    item.label+'_star'+0,
	    item.label+'_star'+0,
	    item.label+'_star'+1,
	    item.label+'_star'+2,
	]
	
	for (i=box_properties[item.label].score;i<score;i++) {
	    
	    console.log("adding a box!");
	    stars[item.label+'_star'+i] = Bodies.circle(
		item.position.x+star_offsets[i].x,
		item.position.y+star_offsets[i].y,
		//item.position.x+(i-3)*20,
		//item.position.y+30,
		7,
		{ label: item.label+'_star'+i, 
		  render:{ 
		      fillStyle: box_colors[item.type],
		      sprite : {
			  texture :  home+'./star.png' //score_sprites[item.type],
			  
		      }
		  },
		  friction: defaultFriction,
		  frictionAir: 0.6
		}
		

	    );

	    Matter.Body.setDensity(stars[item.label+'_star'+i], 15);
	    Composite.add(object_stack, stars[item.label+'_star'+i]);

	    console.log("Adding an edge");
	    hangers[item.label+'_hanger'+i] =  Constraints.create(
		{
		    bodyA: boxes[item.label],
		    bodyB: stars[item.label+'_star'+i],
		    pointA: {x: 0, y: 0},
		    stiffness: defaultStiffness,
		    render: { visible: false }
		});
	    
	    console.log("Adding to stack!");	  
	    Composite.add(object_stack, hangers[item.label+'_hanger'+i]);

	    if (connect_star_to[i]) {
		hangers[item.label+'_hanger_connection'+i] =  Constraints.create(
		    {
			bodyA: stars[connect_star_to[i]],
			bodyB: stars[item.label+'_star'+i],
			pointA: {x: 0, y: 0},
			stiffness: 1,
			render: { visible: false }
		    });
		Composite.add(object_stack, hangers[item.label+'_hanger_connection'+i]);
	    }
	    

	    Composite.setModified(object_stack, true);
	    console.log("Finished adding");
	}
    
    update_star_count();

}

var update_star_count = function() {
    var starcount= 0;
    Object.keys(stars).forEach( function(key) {
	starcount ++; 
    });
    document.getElementById('starcount').innerHTML = starcount;
}


var handle_scoring = function(item) {
    //var score = Math.floor((Math.random() * 5.9999))
    var word = box_properties[item.label].word;


    console.log(engine.timing);
    pause_game();

    document.getElementById('scorewrapper').style.visibility = "visible";
    document.getElementById('scorecard').style.visibility = "visible";
    document.getElementById('score').innerHTML='Say this word or phrase: <br><b>'+ word + '</b>';
    get_score_for_word(word, item, apply_scoring);
}

var apply_scoring = function(item, score) {

    document.getElementById('score').innerHTML +='<br>You scored '+score;
    setTimeout(function(){ 
	document.getElementById('scorewrapper').style.visibility = "hidden";
	document.getElementById('scorecard').style.visibility = "hidden";
	continue_game();
    }, 1300);
    console.log(item);
    if (score > box_properties[item.label].score  ) {
	// If the score was good enough, add some stars:
	addStars(item, score);

	// Mark the node as visited:
	box_properties[item.label].type = 'visited';
	
	// Unlock the close-by edges and nodes 
	Object.keys(edges).forEach( function(key) {
	    if (edges[key].bodyA.label == item.label || edges[key].bodyB.label == item.label ) {
		itemA=edges[key].bodyA;
		itemB=edges[key].bodyB;
	    
		if ( box_properties[itemB.label].type == 'locked') {
		    box_properties[itemB.label].type = 'unlocked';
		    box_properties[itemB.label].clickable = true;
		    boxes[itemB.label].render.fillStyle=box_colors[box_properties[ itemB.label].type];
		}	
		else if ( box_properties[itemA.label].type == 'locked') {
		    box_properties[itemA.label].type = 'unlocked';
		    box_properties[itemA.label].clickable = true;
		    boxes[itemA.label].render.fillStyle=box_colors[box_properties[ itemA.label].type];
		}
		else if ( box_properties[itemA.label].type == 'exit') {
		    box_properties[itemA.label].winnable = 'true';
		}
		else if ( box_properties[itemB.label].type == 'exit') {
		    box_properties[itemB.label].winnable = 'true';
		}	    }

	} )
	Object.keys(edges).forEach( function(key) {
	    itemA=edges[key].bodyA;
	    itemB=edges[key].bodyB;

	    edges[key].render.strokeStyle = edgestyles[ box_properties[ itemB.label].type+'-'+box_properties[ itemA.label].type].strokeStyle;
	});
	
	
	box_properties[item.label].score = score;
    }
    if (score > 0 ) {
	Matter.Body.applyForce(boxes[item.label], item.position, Matter.Vector.create(0, getScoreForce(score)) );
    }


}

var out_of_time = function() {
    alert("Out of time! Practice if you like, or restart level and try again.");

    Object.keys(box_properties).forEach(function(key) {
	if (box_properties[key].type == 'exit') {
	    Object.keys(edges).forEach( function(edgekey) {
		if (edges[edgekey].bodyA == boxes[key] || edges[edgekey].bodyB == boxes[key]) {
		    Composite.remove( object_stack, edges[ edgekey ] );
		}
	    });	
	    Object.keys(invisible_edges).forEach( function(edgekey) {
		if (invisible_edges[edgekey].bodyA == boxes[key] || invisible_edges[edgekey].bodyB == boxes[key]) {
		    Composite.remove( object_stack, invisible_edges[ edgekey ] );		
		}
	    });
	    Composite.remove( object_stack, boxes[ key ] );	    
	}
    });

}

var win_game = function(item) {
    alert("You win!");
}



var play_level = function () {

    levelkey = document.getElementById('levelselector').value;


    build_level(levelkey);

    document.getElementById('leveltitle').innerHTML = levelmeta.leveltitle;
    document.getElementById('maxstars').innerHTML = levelmeta.maxstars;
    document.getElementById('timeleft').innerHTML = levelmeta.timelimit;
    document.getElementById('starcount').innerHTML = 0;


    // run the engine
    Engine.run(engine);
    
    // run the renderer
    Render.run(render);

    game_timer(levelmeta.timelimit);
 }


document.getElementById('levelselector').value;
levelselector = document.getElementById('levelselector');
Object.keys(levels).forEach ( function(key) {
	var opt = document.createElement("option");
	opt.value= key;
	opt.innerHTML = key+ " - " + levels[key].meta.levelname; // whatever property it has
	
	// then append it to the select element
	levelselector.appendChild(opt);
});
var opt = document.createElement("option");
opt.value= "My own";
opt.innerHTML = "Define my own level" ; // whatever property it has
levelselector.appendChild(opt);

document.getElementById('leveleditor').value=JSON.stringify(levels.L1, null, "   ");

