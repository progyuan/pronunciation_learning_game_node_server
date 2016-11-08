


var canvas = document.getElementById("gamecanvas");

var w = canvas.width,
    h = canvas.height;
var scaleX = 20, scaleY = -20;

// Create a physics world, where bodies and constraints live
var world = new p2.World({
    gravity:[ 0, -9.82]
});

var defaultNodeRadius = 2;
var defaultStarRadius=0.8;

circleBodiesArray = [];

var nodes = {
    'START': { position: [ 0.7  , 15.4   ], mass: 5 , type: 'start', word: 'START', color: 'lightgreen' },
    'EXIT': { position: [ -3.7  , 15.4  ], mass: 5 , type: 'exit', word: 'EXIT' , color: 'red' },
    'A': { position: [ -3.7  , 25.4  ], mass: 5 , type: 'unlocked', word: false },
    'B': { position: [ 0.7  , 25.4  ], mass: 5 , type: 'locked', word: false },
} 
var hitNode = null;

var id_to_node = {};

circleBodies = {};
starBodies = [];
hangerBodies = [];

Object.keys(nodes).forEach(function (key) {
    node = nodes[key];
    
    circleBody = new p2.Body({
	mass: node.mass,
	position: node.position,
    });
	
    var circleShape = new p2.Circle({ radius: defaultNodeRadius });

    circleBody.addShape(circleShape);

    circleBodies[circleBody.id]=circleBody;
    circleBodiesArray.push(circleBody);

    // ...and add the body to the world.
    // If we don't add it to the world, it won't be simulated.
    world.addBody(circleBody);
    nodes[key].id =  circleBody.id;
    id_to_node[circleBody.id] = key;
});


var edges = [
    { from: 'START', to: 'A', type: 'spring', options: {stiffness: 1000}  },
    { from: 'START', to: 'B', type: 'spring', options: {stiffness: 1000}  },
    { from: 'A', to: 'B', type: 'spring', options: {stiffness: 1000}  },     
    { from: 'B', to: 'EXIT', type: 'spring', options: {stiffness: 1000}  },     
    { from: 'A', to: 'EXIT', type: 'spring', options: {stiffness: 1000}  },     
]


Object.keys(edges).forEach(function (key) {    
    e = edges[key];    
    if (e.type == 'spring') {
	e.p2object = new p2.LinearSpring( circleBodies[nodes[e.from].id], circleBodies[nodes[e.to].id] , e.options),
	world.addSpring(e.p2object);
    }
});








// Add a plane
planeShape = new p2.Plane();
planeBody = new p2.Body();
planeBody.addShape(planeShape);
world.addBody(planeBody);


// To animate the bodies, we must step the world forward in time, using a fixed time step size.
// The World will run substeps and interpolate automatically for us, to get smooth animation.
var fixedTimeStep = 1 / 60; // seconds
var maxSubSteps = 10; // Max sub steps to catch up with the wall clock
var lastTime;


// Rendering style:

var nodeColors = {
    'start': { fill: 'lightgreen',
	       stroke: 'black',
	       activeFill: 'green',
	       activeStroke: 'yellow',
	     },
    'exit': { fill: 'brown',
	      stroke: 'black',
	      activeFill: 'orange',
	      activeStroke: 'yellow',
	    },	
    'activeExit': { fill: 'lightgreen',
		    stroke: 'black',
		    activeFill: 'green',
		    activeStroke: 'yellow',
		  },   
    'visited': { fill: 'lightgreen',
		 stroke: 'black',
		 activeFill: 'lightgreen',
		 activeStroke: 'yellow',
	     },
    'locked': { fill: 'darkgreen',
		stroke: 'black',
		activeFill: 'green',
		activeStroke: 'yellow',
	      },
    'unlocked': { fill: 'lightgreen',
		  stroke: 'black',
		  activeFill: 'green',
		  activeStroke: 'yellow',
		},
    'static' :  { fill: 'lightblue',
		  stroke: 'darkblue'
		}
}


var edgeColors = {
    'active' :  {
	outer: 'green',
	inner: 'lightgreen'
    },
    'inactive' : {
	outer: 'black',
	inner: 'brown'
    }
}

var get_edge_colors = function(bodyA, bodyB ) {
    from = nodes[ id_to_node[bodyA.id] ].type;
    to = nodes[ id_to_node[bodyB.id] ].type;

    if (from == 'start' || to == 'start') 
	return edgeColors.active;	
    if (from == 'visited' || to == 'visited') 
	return edgeColors.active;	

    return edgeColors.inactive
}


// Animation loop


function animate(time){
    requestAnimationFrame(animate);

    ctx = canvas.getContext("2d");
    ctx.lineWidth = 0.05;

    // Compute elapsed time since last render frame
    var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;

    // Move bodies forward in time
    world.step(fixedTimeStep, deltaTime, maxSubSteps);

    // Clear the canvas
    ctx.clearRect(0,0,w,h);
    
    // Transform the canvas
    ctx.save();
    ctx.translate(w/2, h/2); // Translate to the center
    ctx.scale(scaleX, scaleY);
    
    // Draw all bodies
    drawEdges();
    drawCircles();
    drawPlane();


    // Restore transform
    ctx.restore();


    lastTime = time;
    
    
    function drawEdges(){
	
	
	Object.keys(edges).forEach(function (key) {
	    c = edges[key].p2object;

	    x1 = c.bodyA.position[0];
	    y1 = c.bodyA.position[1];

	    x2 = c.bodyB.position[0];
	    y2 = c.bodyB.position[1];

	    len =  Math.sqrt( (x1-x2) * (x1-x2) + (y1-y2)*(y1-y2));

	    lenRatio =  (c.restLength / len) * (c.restLength / len) *  (c.restLength / len);

	    ctx.lineWidth = 0.25 * lenRatio;
	    
	    colors = get_edge_colors( c.bodyA, c.bodyB );

	    ctx.strokeStyle= colors.outer;

	    ctx.beginPath();
	    ctx.moveTo(x1, y1);
	    ctx.lineTo(x2, y2);
	    ctx.stroke();

	    ctx.lineWidth = 0.15 * lenRatio;
	    ctx.strokeStyle=colors.inner;

	    ctx.lineTo(x1, y1);
	    ctx.stroke();
	    
	    

	});

    }


    function drawCircles(){



	Object.keys(nodes).forEach(function (key) {

	    circleBody = circleBodies[nodes[key].id];



	    if (circleBody.id == hitNode)  {		
		ctx.fillStyle = nodeColors[ nodes[key].type ].activeFill;
		ctx.lineWidth = 0.10;		
		ctx.strokeStyle= nodeColors[ nodes[key].type ].activeStroke;
	    }
	    else {
		ctx.fillStyle = nodeColors[ nodes[key].type ].fill;		
		ctx.lineWidth = 0.05;		
		ctx.strokeStyle= nodeColors[ nodes[key].type ].stroke;
	    }


            ctx.beginPath();
            ctx.save();

            var x = circleBody.position[0],
            y = circleBody.position[1],
            radius = defaultNodeRadius;

            ctx.arc(x,y,radius,0,2*Math.PI);
            ctx.stroke();



	    ctx.fill();
	    //ctx.restore();
	    
	    if (nodes[key].word) {
		txt = nodes[key].word; 
	    }
	    else txt = '?';

	    if (nodes[key].fontSize)
		ptSize = nodes[key].fontSize
	    else {
		ptSize = 2*defaultNodeRadius;
		do {
		    ptSize-=0.2;
		    ctx.font = ptSize+"px Arial";
		    txtw=ctx.measureText(txt).width;
		} while (txtw > defaultNodeRadius*2)
	    }
	    
	    //ctx.save();
	    ctx.translate(x, y);   // Translate to the center of the box
	    ctx.rotate(circleBody.angle);  // Rotate to the box body frame
	    
	    ctx.fillStyle = 'black';
	    ctx.scale(1, -1);
	    ctx.strokeText(txt, -0.5*txtw, 0.35*ptSize);
	    
	    ctx.restore();   
		
	});

	starBodies.forEach(function (circleBody) {

	    ctx.lineWidth = 0.05;
	    ctx.strokeStyle='black';

            ctx.beginPath();
            ctx.save();

            var x = circleBody.position[0],
            y = circleBody.position[1],
            radius = defaultStarRadius;

            ctx.arc(x,y,radius,0,2*Math.PI);
            ctx.stroke();
	    
	    ctx.fillStyle = 'pink';
	    ctx.fill();
	    //ctx.restore();

	    ptSize = 2*defaultStarRadius;
	    ctx.font = ptSize+"px Arial";	    
	    txt = "\u2605";
	    txtw=ctx.measureText(txt).width;
	    

	    //ctx.save();
	    ctx.translate(x, y);   // Translate to the center of the box
	    ctx.rotate(circleBody.angle);  // Rotate to the box body frame
	    
	    ctx.fillStyle = 'black';
	    ctx.scale(1, -1);
	    ctx.strokeText(txt, -0.5*txtw, 0.35*ptSize);
	    
	    ctx.restore();   
		
	});

    }
    
    function drawPlane(){
	ctx.strokeStyle= nodeColors[ 'static' ].stroke;
	ctx.fillStyle = nodeColors[ 'static' ].activeFill;
	ctx.lineWidth = 0.05;
	
        var y = planeBody.position[1];
        ctx.moveTo(-w, y);
        ctx.lineTo( w, y);
        ctx.stroke();
    }
    

}



// Event listeners:

canvas.addEventListener('mousedown', function(event){
    
    // Convert the canvas coordinate to physics coordinates
    var position = getPhysicsCoord(event);

    console.log("Mouse down at world coords:", position);
    
    // Check if the cursor is inside the box
    var hitBodies = world.hitTest(position, circleBodiesArray);
    
    if(hitBodies.length) {
	node = nodes[id_to_node[hitBodies[0].id]];
	console.log("hit body:", node.type, node.word);
	
	if (node.type == 'unlocked' || node.type == 'visited') {
	    handle_scoring( id_to_node[hitBodies[0].id] );
	} else 	if (node.type == 'activeExit') {
	    win_game();
	}

    }
});

    
canvas.addEventListener('mousemove', function(evt) {
   
    // Convert the canvas coordinate to physics coordinates
    var position = getPhysicsCoord(event);
    
    // Check if the cursor is inside the box
    var hitBodies = world.hitTest(position, circleBodiesArray);
    
    hitNode = null;
    if(hitBodies.length){
        //console.log("over body!");
	hitNode = hitBodies[0].id; 
    }
});

addableEdges = [];

// The beginContact event is fired whenever two shapes starts overlapping, including sensors.
world.on("beginContact",function(event){
    console.log("Contact! BodyA", event.bodyA.id, "BodyB: ", event.bodyB.id);

    if ( id_to_node[event.bodyA.id] &&  id_to_node[event.bodyB.id]) {

	bodyA = id_to_node[event.bodyA.id];
	bodyB = id_to_node[event.bodyB.id];
	console.log(bodyA, bodyB);

	addEdge = true;
	// Unlock the close-by edges and nodes 
	Object.keys(edges).forEach( function(key) {
	    e=edges[key];
	    if (e.from == bodyA || e.to == bodyA ) {
		if (e.from == bodyB || e.to == bodyB ) {
		    addEdge = false;
		}
	    }
	});
	if (addEdge) {	    
	    addableEdges.push({ from: bodyA, to: bodyB, type: 'spring', options: {stiffness: 30, restLength: 4 * defaultNodeRadius }});

	    // Make it winnable?
	    typeA = nodes[bodyA].type;
	    typeB = nodes[bodyB].type;

	    if (typeA == 'exit' && ( typeB == 'visited' || typeB == 'start' )) {
		bodyA.type = 'activeExit';
	    }	    
	    if (typeB == 'exit' && ( typeA == 'visited' || typeA == 'start' )) {
		bodyB.type = 'activeExit';
	    }

	    // Open new nodes?
	    if (typeA == 'locked' && ( typeB == 'visited' || typeB == 'start' )) {
		bodyA.type = 'unlocked';
	    }	    
	    if (typeB == 'locked' && ( typeA == 'visited' || typeA == 'start' )) {
		bodyB.type = 'unlocked';
	    }




	}


    }
});


world.on("postStep",function(event){

    if (addableEdges.length > 0) {
	for (i=0; i< addableEdges.length; i++) { 
	    e = addableEdges.pop();
	    if (e.type == 'spring') {
		console.log("Adding spring between ",e.from, "and",e.to);
		e.p2object = new p2.LinearSpring( circleBodies[nodes[e.from].id], circleBodies[nodes[e.to].id] , e.options),
		world.addSpring(e.p2object);
		edges.push(e);
	    }
	}
    }
})


// Convert a canvas coordiante to physics coordinate
function getPhysicsCoord(mouseEvent){
    var rect = canvas.getBoundingClientRect();
    var x = mouseEvent.clientX - rect.left;
    var y = mouseEvent.clientY - rect.top;

    x = (x - w / 2) / scaleX;
    y = (y - h / 2) / scaleY;

    return [x, y];
}




// Start the animation loop
requestAnimationFrame(animate);

world.on('postStep', function(event){

    // Add horizontal spring force
    //circleBody.force[0] -= 100 * circleBody.position[0];
});


//
// Game timer functions:
//


var game_time_left;
var timer_running = false;
var timer_instance = null;

game_timer = function (timelimit) {
    game_time_left = timelimit;
    timer_running = true;

    if (timer_instance) 
	window.clearInterval(timer_instance);

    timer_instance = setInterval( function() {
	if (timer_running && game_time_left >= 0) {
	    game_time_left -= 0.1;
	    if (game_time_left < 0) {
		timer_running=false;
		Game.out_of_time(game);
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

var pause_game = function () {
    pause_timer();
}


var continue_game = function() {
    continue_timer();
}

var pause_timer = function () {
    timer_running = false;
}

var continue_timer = function() {
    timer_running = true;
}


//
// Game functions:
//

debug_score=0;

var handle_scoring = function(node_id) {
    pause_game();

    document.getElementById('scorewrapper').style.visibility = "visible";
    document.getElementById('scorecard').style.visibility = "visible";

    //var score = Math.floor((Math.random() * 5.9999))
    if (nodes[node_id].word) {
	var word = nodes[node_id].word;
	document.getElementById('score').innerHTML='Say this word or phrase: <br><b>'+ word + '</b>';
	//get_score_for_word(word, node_id, apply_scoring);
	apply_scoring(node_id, ++debug_score);
    }
    else {
	document.getElementById('score').innerHTML='Getting a word for you..';
	get_word_to_score(node_id, apply_scoring, function(word, node_id, callback) { 		    
	    //console.log(nodes[node_id]);
	    nodes[node_id].word = word;
	    //console.log(nodes[node_id]);
	    document.getElementById('score').innerHTML='Say this word or phrase: <br><b>'+ word + '</b>'; //"apple";
	    //get_score_for_word(word, node_id, callback);
	    apply_scoring(node_id, ++debug_score);
	});
    }
}



var apply_scoring = function(node_id, score) {

    document.getElementById('score').innerHTML +='<br>You scored '+score;
    setTimeout(function(){ 
	document.getElementById('scorewrapper').style.visibility = "hidden";
	document.getElementById('scorecard').style.visibility = "hidden";
	continue_game();
    }, 1300);

    if (score > (nodes[node_id].score | 0 )) {
	// If the score was good enough, add some stars:
	addStars(node_id, score);

	// Mark the node as visited:
	console.log("Node", node_id, ":",nodes[node_id]);
	nodes[node_id].type = 'visited';
	//item.render.fillStyle=box_colors[game.object_properties[ item.id].type];

	// Unlock the close-by edges and nodes 
	Object.keys(edges).forEach( function(key) {
	    console.log(edges);
	    console.log("key:",key);
	    e=edges[key];
	    
	    if (e.from == node_id || e.to == node_id ) {
		itemA = nodes[ e.from ];
		itemB = nodes[ e.to ];
		console.log(itemA, itemB);
		if (itemA.type == 'locked')
		    itemA.type = 'unlocked';
		if  (itemB.type == 'locked')
		    itemB.type = 'unlocked';
		if  (itemA.type == 'exit')
		    itemA.type = 'activeExit';
		if  (itemB.type == 'exit')
		    itemB.type = 'activeExit';
		console.log(itemA, itemB);
		
	    }
	});

	nodes[node_id].score = score;
    }
    if (score > 0 ) {
	// Apply force!
	//Matter.Body.applyForce(item, item.position, Matter.Vector.create(0, getScoreForce(score)) );
    }


}


var addStars = function(node_id, score) {

    // Distance between node and star centres:
    var dist = defaultNodeRadius + 1.5 * defaultStarRadius
    var sqt2 = Math.sqrt(2);

    star_offsets = [
	{x: 0, y: -dist }, // 0
	{x: -dist/sqt2, y: -dist/sqt2}, // 1
	{x: dist/sqt2, y: -dist/sqt2}, // 2
	{x: -dist, y: 0}, // 3
	{x: 0, y: dist}, // 4
    ]
    
    stars = {}

    item = circleBodies[ nodes[node_id].id ];

    for (i= (nodes[node_id].score | 0); i < score; i++) {

	star = {
	    position : [
		item.position[0]+star_offsets[i].x,
		item.position[1]+star_offsets[i].y,
	    ],
	    mass: 15
	}
	
	circleBody = new p2.Body({
	    mass: star.mass,
	    position: star.position,
	});
	

	var circleShape = new p2.Circle({ radius: defaultStarRadius });
	circleBody.addShape(circleShape);
	world.addBody(circleBody);
	starBodies.push(circleBody);

	var hanger = new p2.LinearSpring( item, circleBody, {stiffness: 1000, restLength: defaultNodeRadius + defaultStarRadius} );
	world.addSpring(hanger);
    }
    
    update_star_count();

}


var update_star_count = function() {
    var starcount= starBodies.length;
    document.getElementById('starcount').innerHTML = starcount;
}



/*

    Game.create = function(options) {
        var defaults = {
            isManual: false,
            sceneName: 'mixed',
            sceneEvents: []
        };

        return Common.extend(defaults, options);
    };

    Game.init = function() {
        var game = Game.create();
        Matter.Game._game = game;

        // get container element for the canvas
        game.container = document.getElementById('canvas-container');

        // create an example engine (see /examples/engine.js)
        game.engine = Levels.engine(game);

	game.engine.constraintIterations = 25;
	game.engine.positionIterations = 25;

        // run the engine
        game.runner = Engine.run(game.engine);

        // add a mouse controlled constraint
        game.mouseConstraint = MouseConstraint.create(game.engine);
        World.add(game.engine.world, game.mouseConstraint);

        // pass mouse to renderer to enable showMousePosition
        game.engine.render.mouse = game.mouseConstraint.mouse;

        // get the scene function name from hash
        if (window.location.hash.length !== 0) 
            game.sceneName = window.location.hash.replace('#', '').replace('-inspect', '');

        // set up a scene with bodies
	Game.reset(game);
        Game.setScene(game, game.sceneName);

        // set up game interface (see end of this file)
        Game.initControls(game);

        // pass through runner as timing for debug rendering
        game.engine.metrics.timing = game.runner;




	var screen_size_setup = function() {
	    // Eventually move this to a separate function:

	    // Fiddle with the css of the game container:
	    canvas_children=document.getElementById("canvas-container").childNodes;
	    game_canvas_element = canvas_children[canvas_children.length-1];
	    underbar = document.getElementById("underbar");
	    cover = document.getElementById("scorewrapper");

	    var he = $(window).height(),
	    wi = $(window).width();
	    
	    var toolbarwi = 200,
	    toolbarhe = 200,
	    toolbarstyle = {
		position: "absolute"
	    };

	    var canvaswi;

	    bottom_toolbar_canvaswi = Math.min (wi, 4.0 / 3.0 * (he -toolbarhe));
	    left_toolbar_canvaswi = Math.min ( 4.0 / 3.0 * (he), wi - toolbarwi);

	    // Option 1: 
	    // More vertical space than horisontal space: Toolbar on bottom
	    if (bottom_toolbar_canvaswi > left_toolbar_canvaswi) {	    

		canvaswi = bottom_toolbar_canvaswi
		toolbarstyle.top = ((3.0 / 4.0) * canvaswi) + "px";
		toolbarstyle.left = "0"
		toolbarstyle.height = toolbarhe + "px";
		toolbarstyle.width = canvaswi + "px";

		document.getElementById("debug-area").style.top = (3*canvaswi/4 + toolbarhe) + "px";

	    }
	    // Option 2: Toolbar at the bottom
	    // More horizontal space than vertical space: Toolbar on the left
	    else {
		canvaswi = left_toolbar_canvaswi;

		toolbarstyle.top = "0";
		toolbarstyle.left = canvaswi + "px";
		toolbarstyle.height = (3.0 / 4.0 * canvaswi) + "px";
		toolbarstyle.width = toolbarwi + "px";

		document.getElementById("debug-area").style.top = (3*canvaswi/4) + "px";
	    }

	    game_canvas_element.style.width = canvaswi+"px";

	    Object.keys(toolbarstyle).forEach( function(key) {
		underbar.style[key] = toolbarstyle[key];
	    });
	    
	    cover.style.width = canvaswi + "px";
	    cover.style.height = 3*canvaswi/4 + "px";
	    


	}
	screen_size_setup();
	$( window ).resize(function() {
	    	screen_size_setup();
	});
        return game;
    };

    // call init when the page has loaded fully
    if (!_isAutomatedTest) {
        if (window.addEventListener) {
            window.addEventListener('load', Game.init);
        } else if (window.attachEvent) {
            window.attachEvent('load', Game.init);
        }
    }

    Game.setScene = function(game, sceneName) {
        Levels[sceneName](game);
	Game.game_timer(game, game.timelimit);

    };

    // the functions for the game interface and controls below
    Game.initControls = function(game) {
        var levelSelect = document.getElementById('level-select'),
            levelReset = document.getElementById('level-reset');

        // go fullscreen when using a mobile device

        // keyboard controls
        document.onkeypress = function(keys) {
            // shift + a = toggle manual
            if (keys.shiftKey && keys.keyCode === 65) {
                Game.setManualControl(game, !game.isManual);
            }

            // shift + q = step

            if (keys.shiftKey && keys.keyCode === 81) {
                if (!game.isManual) {
                    Game.setManualControl(game, true);
                }

                Runner.tick(game.runner, game.engine);
            }
        };

        // initialise game selector
        levelSelect.value = game.sceneName;
        
        levelSelect.addEventListener('change', function(e) {
            Game.reset(game);
            Game.setScene(game,game.sceneName = e.target.value);

            if (game.gui) {
                Gui.update(game.gui);
            }
            
            var scrollY = window.scrollY;
            window.location.hash = game.sceneName;
            window.scrollY = scrollY;
        });
        
        levelReset.addEventListener('click', function(e) {
            Game.reset(game);
            Game.setScene(game, game.sceneName);

            if (game.gui) {
                Gui.update(game.gui);
            }

        });
    };



    Game.setManualControl = function(game, isManual) {
        var engine = game.engine,
            world = engine.world,
            runner = game.runner;

        game.isManual = isManual;

        if (game.isManual) {
            Runner.stop(runner);

            // continue rendering but not updating
            (function render(time){
                runner.frameRequestId = window.requestAnimationFrame(render);
                Events.trigger(engine, 'beforeUpdate');
                Events.trigger(engine, 'tick');
                engine.render.controller.world(engine);
                Events.trigger(engine, 'afterUpdate');
            })();
        } else {
            Runner.stop(runner);
            Runner.start(runner, engine);
        }
    };

    Game.fullscreen = function(game) {
	return false;

    };
    

    Game.game_timer = function (game,timelimit) {
	game_time_left = timelimit;
	timer_running = true;

	if (timer_instance) 
	    window.clearInterval(timer_instance);

	timer_instance = setInterval( function() {
	    if (timer_running && game_time_left >= 0) {
		game_time_left -= 0.1;
		if (game_time_left < 0) {
		    timer_running=false;
		    Game.out_of_time(game);
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

    Game.out_of_time = function(game) {
	document.getElementById('scorewrapper').style.visibility = "visible";
	document.getElementById('scorecard').style.visibility = "visible";
	document.getElementById('score').innerHTML='Out of time! Please try again.';


    }

    Game.reset = function(game) {
        var world = game.engine.world,
            i;
        
        World.clear(world);
        Engine.clear(game.engine);

        // clear scene graph (if defined in controller)
        if (game.engine.render) {
            var renderController = game.engine.render.controller;
            if (renderController && renderController.clear)
                renderController.clear(game.engine.render);
        }

        // clear all scene events
        if (game.engine.events) {
            for (i = 0; i < game.sceneEvents.length; i++)
                Events.off(game.engine, game.sceneEvents[i]);
        }

        if (game.mouseConstraint && game.mouseConstraint.events) {
            for (i = 0; i < game.sceneEvents.length; i++)
                Events.off(game.mouseConstraint, game.sceneEvents[i]);
        }

        if (world.events) {
            for (i = 0; i < game.sceneEvents.length; i++)
                Events.off(world, game.sceneEvents[i]);
        }

        if (game.runner && game.runner.events) {
            for (i = 0; i < game.sceneEvents.length; i++)
                Events.off(game.runner, game.sceneEvents[i]);
        }

        if (game.engine.render && game.engine.render.events) {
            for (i = 0; i < game.sceneEvents.length; i++)
                Events.off(game.engine.render, game.sceneEvents[i]);
        }

        game.sceneEvents = [];

        // reset id pool
        Body._nextCollidingGroupId = 1;
        Body._nextNonCollidingGroupId = -1;
        Body._nextCategory = 0x0001;
        Common._nextId = 0;

        // reset random seed
        Common._seed = 0;

        // reset mouse offset and scale (only required for Game.views)
        if (game.mouseConstraint) {
            Mouse.setScale(game.mouseConstraint.mouse, { x: 1, y: 1 });
            Mouse.setOffset(game.mouseConstraint.mouse, { x: 0, y: 0 });
        }



        game.engine.enableSleeping = true;
        game.engine.world.gravity.y = 1;
        game.engine.world.gravity.x = 0;
        game.engine.timing.timeScale = 1;



        if (game.mouseConstraint) {
            World.add(world, game.mouseConstraint);
        }




	// Game events for the fysiak game: 

	Events.on(game.mouseConstraint, "startdrag", function(event) {
	    console.log("started dragging");
	    return false;
	});
	Events.on(game.mouseConstraint, "enddrag", function(event) {
	    return false;
	});
	Events.on(game.mouseConstraint, 'mousedown', function(event) {
	    var mousePosition = event.mouse.position;
	    console.log('mousedown at ' + mousePosition.x + ' ' + mousePosition.y);
	    
	    bodies = Matter.Composite.allBodies(game.engine.world);
	    console.log(bodies);
	    Matter.Query.point(bodies, mousePosition).forEach( function(item) {
		console.log(item);
		if (item.id < game.object_properties.length) {
		    if (game.object_properties[item.id].type == 'exit' &&  game.object_properties[item.id].winnable) {	
			win_game(item);
		    }	    
		    else if (game.object_properties[item.id].clickable) {	
			//ASR here 
			handle_scoring(item);
		    }
		}
	    });
	})
	
	var mouseOverStack = [];
	var default_fill = 'green';
	var active_fill = 'lightgreen';
	

	

	Events.on(game.engine.render, 'afterRender', function() {
	    var mousePosition = game.mouseConstraint.mouse.position;
	    mouseOverStack.forEach(function() {
		item = mouseOverStack.pop();
		//console.log(item.label +" in mouseoverstack");
		item.render.fillStyle = box_colors[game.object_properties[item.id].type];
	    });
	    var allBodies = Matter.Composite.allBodies(game.engine.world);
	    Matter.Query.point(allBodies, mousePosition).forEach( function(item) {
		if (item.id < game.object_properties.length) {		    
		    mouseOverStack.push(item);	    
		    item.render.fillStyle = active_box_colors[game.object_properties[item.id].type];
		}
	    });    
	});
	
	// Game events:

	var getScoreDensity = function(score) {
	    return (score+1)*4
	}

	var getScoreForce = function(score) {
	    return 10 * (score+1);
	}

	var addStars = function(item, score) {
	    console.log("check if "+game.object_properties[item.id].score+" < "+ score);

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
	    
	    for (i=game.object_properties[item.id].score;i<score;i++) {
		
		console.log("adding a box!");
		game.stars[item.id+'_star'+i] = Bodies.circle(
		    item.position.x+star_offsets[i].x,
		    item.position.y+star_offsets[i].y,
		    //item.position.x+(i-3)*20,
		    //item.position.y+30,
		    7,
		    { label: item.id+'_star'+i, 
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

		Matter.Body.setDensity(game.stars[item.id+'_star'+i], 50);
		Matter.Composite.add(object_stack, game.stars[item.id+'_star'+i]);

		console.log("Adding an edge");
		hangers[item.id+'_hanger'+i] =  Matter.Constraint.create(
		    {
			bodyA: item,
			bodyB: game.stars[item.id+'_star'+i],
			pointA: {x: 0, y: 0},
			stiffness: defaultStiffness,
			render: { visible: false }
		    });
		
		console.log("Adding to stack!");	  
		Matter.Composite.add(object_stack, hangers[item.id+'_hanger'+i]);

		if (connect_star_to[i]) {
		    hangers[item.id+'_hanger_connection'+i] =  Matter.Constraint.create(
			{
			    bodyA: game.stars[connect_star_to[i]],
			    bodyB: game.stars[item.id+'_star'+i],
			    pointA: {x: 0, y: 0},
			    stiffness: 1,
			    render: { visible: false }
			});
		    Matter.Composite.add(object_stack, hangers[item.id+'_hanger_connection'+i]);
		}
		

		Matter.Composite.setModified(object_stack, true);
		console.log("Finished adding");
	    }
	    
	    update_star_count();

	}

	var update_star_count = function() {
	    var starcount= 0;
	    Object.keys(game.stars).forEach( function(key) {
		starcount ++; 
	    });
	    document.getElementById('starcount').innerHTML = starcount;
	}


	var handle_scoring = function(item) {
	    console.log(game.engine.timing);
	    pause_game();

	    document.getElementById('scorewrapper').style.visibility = "visible";
	    document.getElementById('scorecard').style.visibility = "visible";

	    //var score = Math.floor((Math.random() * 5.9999))
	    if ("word" in game.object_properties[item.id]) {
		var word = game.object_properties[item.id].word;
		document.getElementById('score').innerHTML='Say this word or phrase: <br><b>'+ word + '</b>';
		get_score_for_word(word, item, apply_scoring);
	    }
	    else {
		document.getElementById('score').innerHTML='Getting a word for you..';
		get_word_to_score(item, apply_scoring, function(word, item, callback) { 		    
		    console.log(game.object_properties[item.id]);
		    game.object_properties[item.id].word = word;
		    console.log(game.object_properties[item.id]);
		    document.getElementById('score').innerHTML='Say this word or phrase: <br><b>'+ word + '</b>'; //"apple";
		    get_score_for_word(word, item, callback);

		});
	    }
	}

	var apply_scoring = function(item, score) {

	    document.getElementById('score').innerHTML +='<br>You scored '+score;
	    setTimeout(function(){ 
		document.getElementById('scorewrapper').style.visibility = "hidden";
		document.getElementById('scorecard').style.visibility = "hidden";
		continue_game();
	    }, 1300);
	    console.log(item);
	    if (score > game.object_properties[item.id].score  ) {
		// If the score was good enough, add some stars:
		addStars(item, score);

		// Mark the node as visited:
		game.object_properties[item.id].type = 'visited';
		item.render.fillStyle=box_colors[game.object_properties[ item.id].type];

		// Unlock the close-by edges and nodes 
		Object.keys(game.object_properties).forEach( function(key) {
		    if (game.object_properties[key].type == "constraint") {
		    
			if (game.object_properties[key].bodyA.id == item.id || game.object_properties[key].bodyB.id == item.id ) {
			    itemA=game.object_properties[key].bodyA;
			    itemB=game.object_properties[key].bodyB;
			    
			    if ( game.object_properties[itemB.id].type == 'locked') {
				game.object_properties[itemB.id].type = 'unlocked';
				game.object_properties[itemB.id].clickable = true;
				itemB.render.fillStyle=box_colors[game.object_properties[ itemB.id].type];
			    }	
			    else if ( game.object_properties[itemA.id].type == 'locked') {
				game.object_properties[itemA.id].type = 'unlocked';
				game.object_properties[itemA.id].clickable = true;
				itemA.render.fillStyle=box_colors[game.object_properties[ itemA.id].type];
			    }
			    else if ( game.object_properties[itemA.id].type == 'exit') {
				game.object_properties[itemA.id].winnable = 'true';
			    }
			    else if ( game.object_properties[itemB.id].type == 'exit') {
				game.object_properties[itemB.id].winnable = 'true';
			    }	    
			}
		    }
		} )
		Object.keys(game.object_properties ).forEach( function(key) {
		    if (game.object_properties[key].type == "constraint") {
			
			itemA=game.object_properties[key].bodyA;
			itemB=game.object_properties[key].bodyB;

			game.object_properties[key].render.strokeStyle = edgestyles[ game.object_properties[ itemB.id].type+'-'+object_properties[ itemA.id].type].strokeStyle;
		    }
		});
		
		
		game.object_properties[item.id].score = score;
	    }
	    if (score > 0 ) {
		Matter.Body.applyForce(item, item.position, Matter.Vector.create(0, getScoreForce(score)) );
	    }


	}


	var win_game = function(item) {
	    pause_timer();

	    starscore = parseInt(document.getElementById('starcount').innerHTML);
	    timescore = parseFloat(parseInt(game_time_left*10)/100.0);

	    document.getElementById('scorewrapper').style.visibility = "visible";
	    document.getElementById('scorecard').style.visibility = "visible";
	    document.getElementById('score').innerHTML='You win! <br>Your score: <br> Stars: '+ starscore + '<br>Time '+ timescore + '<br>Total: '+ (starscore + timescore);

	}



	// Game events:


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
	    return 100 * (score+1);
	}

	var pause_game = function () {

	    //Matter.Runner.stop(engine)
	    game.engine.timing.timeScale = 0.0000;
	    //Render.stop(render);
	    game.engine.enabled = false
	    pause_timer();
	    console.log(game.engine.timing);

	}

	var continue_game = function() {

	    //Matter.Runner.run(engine);
	    game.engine.enabled = true;
	    //Render.run(render);
	    game.engine.timing.timeScale = 1;
	    continue_timer();

	}


        
        if (game.engine.render) {
            var renderOptions = game.engine.render.options;
            renderOptions.wireframes = false;
            renderOptions.hasBounds = false;
            renderOptions.showDebug = false;
            renderOptions.showBroadphase = false;
            renderOptions.showBounds = false;
            renderOptions.showVelocity = false;
            renderOptions.showCollisions = false;
            renderOptions.showAxes = false;
            renderOptions.showPositions = false;
            renderOptions.showAngleIndicator = true;
            renderOptions.showIds = false;
            renderOptions.showShadows = false;
            renderOptions.showVertexNumbers = false;
            renderOptions.showConvexHulls = false;
            renderOptions.showInternalEdges = false;
            renderOptions.showSeparations = false;
            renderOptions.background = '#fff';

	    renderOptions.height= 1000;
            renderOptions.width= 1000;

            renderOptions.showDebug = true;

        }

	document.getElementById('scorewrapper').style.visibility = "hidden";
	document.getElementById('scorecard').style.visibility = "hidden";

    };

})();

*/


sample_level = '{\n\
	    "meta": \n\
	    {\n\
		"levelname": "A sample for the level editor",\n\
		"author": "Reima",\n\
		"date": "Oct 27 2016"\n\
	    },\n\
            "box_properties":\n\
	    {\n\
		"A" : {"x":  75,  "y": 175,  "clickable" : true, "type": "start", "score": 0},\n\
		"A1" :{"x":  75,  "y": 50,  "clickable" : true, "type": "unlocked", "score": 0},\n\
		"B" : {"x":  150, "y": 75,  "clickable" : true, "type": "unlocked", "score": 0},\n\
		"C" : {"x":  200, "y": 220,  "clickable" : true, "type": "unlocked", "score": 0},\n\
		"D" : {"x":  375, "y": 100,  "clickable" : false, "type": "locked", "score": 0},\n\
		"E" : {"x":  355, "y": 250,  "clickable" : false, "type": "locked", "score": 0},\n\
		"F" : {"x":  475, "y": 100,  "clickable" : false, "type": "locked", "score": 0},\n\
		"G" : {"x":  525, "y": 250,  "clickable" : false, "type": "locked", "score": 0},\n\
		"H" : {"x":  675, "y": 175,  "clickable" : false, "type": "locked", "score": 0},\n\
		"I" : {"x":  675, "y": 450,  "clickable" : false, "type": "exit", "score": 0, "winnable": false}\n\
	    },\n\
	    "edge_array" :\n\
	    [\n\
		["A","B"], ["A","C"], ["A","A1"], ["A1","B"],\n\
		["B","C"], ["B","D"],["C","D"], ["C","E" ], \n\
		["D","E"],\n\
		["D","F"], ["D","G"], ["E","G"],\n\
		["F","H"], ["G","H"],\n\
		["H","I"]\n\
	    ],\n\
	    "shelf_properties" :\n\
	    {\n\
		"left_shelf": { "x": 80, "y": 260, "height": "80", "width": 120, "angle": -0.0942, "isStatic": true},\n\
		"right_shelf": { "x": 360, "y": 300, "height": "80", "width": 120, "angle": 0.0314, "isStatic": true}\n\
	    },\n\
	    "constants" : \n\
	    {\n\
		"defaultStiffness": 0.5,\n\
		"timelimit": 30\n\
	    }\n\
	}';




// Screen size handling: 

var screen_size_setup = function() {
    // Eventually move this to a separate function:

    // Fiddle with the css of the game container:

    game_canvas_element = document.getElementById("gamecanvas");
    underbar = document.getElementById("underbar");
    cover = document.getElementById("scorewrapper");

    var he = $(window).height(),
    wi = $(window).width();
    
    var toolbarwi = 200,
    toolbarhe = 200,
    toolbarstyle = {
	position: "absolute"
    };

    var canvaswi;

    bottom_toolbar_canvaswi = Math.min (wi, 4.0 / 3.0 * (he -toolbarhe));
    left_toolbar_canvaswi = Math.min ( 4.0 / 3.0 * (he), wi - toolbarwi);

    // Option 1: 
    // More vertical space than horisontal space: Toolbar on bottom
    if (bottom_toolbar_canvaswi > left_toolbar_canvaswi) {	    

	canvaswi = bottom_toolbar_canvaswi
	toolbarstyle.top = ((3.0 / 4.0) * canvaswi) + "px";
	toolbarstyle.left = "0"
	toolbarstyle.height = toolbarhe + "px";
	toolbarstyle.width = canvaswi + "px";

	document.getElementById("debug-area").style.top = (3*canvaswi/4 + toolbarhe) + "px";

    }
    // Option 2: Toolbar at the bottom
    // More horizontal space than vertical space: Toolbar on the left
    else {
	canvaswi = left_toolbar_canvaswi;

	toolbarstyle.top = "0";
	toolbarstyle.left = canvaswi + "px";
	toolbarstyle.height = (3.0 / 4.0 * canvaswi) + "px";
	toolbarstyle.width = toolbarwi + "px";

	document.getElementById("debug-area").style.top = (3*canvaswi/4) + "px";
    }

    game_canvas_element.style.width = canvaswi+"px";

    Object.keys(toolbarstyle).forEach( function(key) {
	underbar.style[key] = toolbarstyle[key];
    });
    
    cover.style.width = canvaswi + "px";
    cover.style.height = 3*canvaswi/4 + "px";
    


}
screen_size_setup();
$( window ).resize(function() {
    screen_size_setup();
});


document.getElementById('level-select').value;
levelselector = document.getElementById('level-select');

/*Object.keys(levels).forEach ( function(key) {
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
*/
var opt = document.createElement("option");
opt.value= "testA";
opt.innerHTML = "Test 0" ; // whatever property it has
levelselector.appendChild(opt);

var opt = document.createElement("option");
opt.value= "testB";
opt.innerHTML = "Test 1" ; // whatever property it has
levelselector.appendChild(opt);

var opt = document.createElement("option");
opt.value= "levelEditor";
opt.innerHTML = "Your own level" ; // whatever property it has
levelselector.appendChild(opt);


document.getElementById('leveleditor').value=sample_level;



