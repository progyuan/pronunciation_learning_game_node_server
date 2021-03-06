


var canvas = document.getElementById("gamecanvas");

var w = canvas.width,
    h = canvas.height;


var audioelements = {};


var scaleX = 30, scaleY = -30;

// Create a physics world, where bodies and constraints live
var world = new p2.World({
	gravity:[ 0, -9.82]
    });

var defaultNodeRadius = 2;
var defaultStarRadius=0.6;
var starMass = 5;

var timepenalties = [ 2000, // 0
		      1500, // 1 star
		      2200, // 2 stars
		      1500, // 3 stars
		      900, // 4 stars
		      300 ]; // 5 stars


var running_node_id = 0;
var running_static_id = 1000;
var running_star_id = 2000;

var editMode = false;

var maxStars = 0;
var starCount = 0;

var hitNode = null;


var nodes = {},
    circleBodies = {},
    starBodies = [], 
    hangerBodies = [],
    statics = [],
    edges = [],
    circleBodiesArray = [],
    id_to_node = {};

var build_level = function(new_level) {

    // Clear any exising structures:
    world.clear();
		  
    level = JSON.parse(JSON.stringify(new_level));
    //document.getElementById('leveljson').value=JSON.stringify(level, null, 2);

    nodes = {};
    circleBodies = {};
    starBodies = [];
    hangerBodies = [];
    statics = [];
    edges = [];
    circleBodiesArray = [];
    id_to_node = {};

    nodes = level.nodes;
    edges = level.edges;
    statics = level.statics;
    meta = level.meta;

    world.gravity = meta.gravity;


    starMass = meta.starmass;
    maxStars = 0;
    starCount = 0;
    //
    // Add nodes:
    //

    running_node_id = 1;
    running_static_id = 1001;
    running_star_id = 2001;


    Object.keys(nodes).forEach(function (key) {

	node = nodes[key];
	//console.log("Add node", key, node);

	node.name = key;
	
	if (! "mass" in node) {
	    node.mass = 5
	}

	circleBody = new p2.Body({
	    mass: node.mass,
	    position: node.position,
	    id : running_node_id++
	});
	
	var circleShape = new p2.Circle({ radius: defaultNodeRadius });

	circleBody.addShape(circleShape);

	circleBodies[circleBody.id]=circleBody;
	circleBodiesArray.push(circleBody);

	world.addBody(circleBody);
	nodes[key].id =  circleBody.id;
	id_to_node[circleBody.id] = key;

	if (node.type == 'start') {
	    maxStars += 5;
	    node.type = 'unlocked';
	    node.word = false;
	    node.score = 0;
	}
	else if (node.type == 'word') 
	{
	    maxStars += 5;
	    node.type = 'locked';
	    node.word = false;
	    node.score = 0;
	}
	else {
	    node.word = node.type.toUpperCase();
	}
    });

    $("#maxstars").html(maxStars);

    // 
    // Add edges:
    // 

    Object.keys(edges).forEach(function (key) {    
	e = edges[key];  
	badnode = false;
	try {
	    test = circleBodies[nodes[e.from].id];
	}
	catch (err) {
	    badnode = true;
	}
	try  {
	    test = circleBodies[nodes[e.to].id];
	}
	catch (err) {
	    badnode = true;
	}

	if (!badnode) {
	    if (! "type" in e) {
		e.type = 'spring';
	    }
	    
	    if (e.type == 'spring') {
		if (! "options" in e) {
		    e.options = {stiffness: 1000} ;
		}
		e.p2object = new p2.LinearSpring( circleBodies[nodes[e.from].id], circleBodies[nodes[e.to].id] , e.options),
		
		// Make it winnable?
		typeA = nodes[e.from].type;
		typeB = nodes[e.to].type;

		/*
		  if (typeA == 'exit' && typeB == 'start' ) {
		  nodes[e.from].type = 'activeExit';
		  }	    
		  if (typeB == 'exit' && typeA == 'start' ) {
		  nodes[e.to].type = 'activeExit';
		  }
		*/
		// Open new nodes?
		if (typeA == 'locked' && typeB == 'start' ) {
		    console.log("unlocking node ",bodyA.id);
		    nodes[e.from].type = 'unlocked';
		}	    
		if (typeB == 'locked' && typeA == 'start' ) {
		    console.log("unlocking node ",bodyB.id);
		    nodes[e.to].type = 'unlocked';
		}
		world.addSpring(e.p2object);

	    }

	    else if (e.type == 'fixed') {
		//if (! "fix_type" in e) {
		//    e.fix_type = p2.Constraint.DISTANCE ;
		//
		e.p2object = new p2.DistanceConstraint( circleBodies[nodes[e.from].id], circleBodies[nodes[e.to].id]),
		
		// Make it winnable?
		typeA = nodes[e.from].type;
		typeB = nodes[e.to].type;

		// Open new nodes?
		if (typeA == 'locked' && typeB == 'start' ) {
		    console.log("unlocking node ",bodyA.id);
		    nodes[e.from].type = 'unlocked';
		}	    
		if (typeB == 'locked' && typeA == 'start' ) {
		    console.log("unlocking node ",bodyB.id);
		    nodes[e.to].type = 'unlocked';
		}
		world.addConstraint(e.p2object);

	    }
	}
    });

    statics.forEach(function(statObj) {

	var staticBody = new p2.Body({
            mass: 0, // Static
            position: statObj.position,
	    angle: statObj.angle,
	    id : running_static_id++
	});
	staticBody.type = p2.Body.STATIC;
	var staticShape = new p2.Box({ width: statObj.w , height: statObj.h });
	//platformShape.material = groundMaterial;
	staticBody.addShape(staticShape);
	world.addBody(staticBody);
	statObj.p2object = staticBody;

	//console.log("Added a static object:",staticBody);
    });

    // Done building, let's roll!
    console.log("Starting game timer!");
    game_timer(meta.timelimit);
    

}

// To animate the bodies, we must step the world forward in time, using a fixed time step size.
// The World will run substeps and interpolate automatically for us, to get smooth animation.
var fixedTimeStep = 1 / 60; // seconds
var maxSubSteps = 10; // Max sub steps to catch up with the wall clock
var lastTime;





// RENDERING





// Rendering style:




var nodeColors = {
    'start': { fill: 'lightgreen',
	       stroke: 'black',
	       activeFill: 'lightgreen',
	       activeStroke: 'black',
	       textFill: 'yellow',
	     },
    'exit': { fill: 'brown',
	      stroke: 'black',
	      activeFill: 'brown',
	      activeStroke: 'black',
	      textFill: 'yellow',
	    },	
    'activeExit': { fill: 'lightgreen',
		    stroke: 'yellow',
		    activeFill: 'yellow',
		    activeStroke: 'red',
		    textFill: 'yellow',

		  },   
    'visited': { fill: 'lightgreen',
		 stroke: 'black',
		 activeFill: 'yellow',
		 activeStroke: 'lightgreen',
		 textFill: 'yellow',

	     },
    'locked': { fill: 'brown', //'darkgreen',
		stroke: 'black',
		activeFill: 'brown',
		activeStroke: 'black',
		textFill: 'yellow',

	      },
    'unlocked': { fill: 'lightgreen',
		  stroke: 'black',
		  activeFill: 'yellow',
		  activeStroke: 'lightgreen',
		  textFill: 'yellow',

		},
    'static' :  { fill: 'orange',
		  stroke: 'darkblue'

		},
    'star' : { circleFill: 'lightgreen',
	       starFill: 'yellow',
	       circleStroke: 'black',
	       starStroke: 'orange',
	       activeCircleFill: 'yellow',
	       activeStarFill: 'lightgreen',
	       activeCircleStroke: 'black',
	       activeStarStroke: 'orange'
	     },
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
    if (from == 'unlocked' && to == 'unlocked') 
	return edgeColors.active;	

    return edgeColors.inactive
}

// From http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


var pulse_color = function( fillStyle, shift)  {
    fills = hexToRgb(fillStyle);

    //console.log(moment, colorshift);
    fills.r = Math.min(255, Math.max(0, fills.r + colorshift));
    fills.g = Math.min(255, Math.max(0, fills.g + colorshift));
    fills.b = Math.min(255, Math.max(0, fills.b + colorshift));

    return rgbToHex( fills.r, fills.g, fills.b  );
}





// Animation loop





var lastRender = 0;
var movingStarTargetTime = 0;
var movingStarCount = 0;
var movingExtraStars = 0;
var movingStarCurrentPosition, movingStarTargetPosition;

function animate(time){
    requestAnimationFrame(animate);

    ctx = canvas.getContext("2d");
    ctx.lineWidth = 0.05;



    if (timer_running) {
	// Compute elapsed time since last render frame
	var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;
	
	// Move bodies forward in time
	world.step(fixedTimeStep, deltaTime, maxSubSteps);
    }

    lastTime = time;
    
    if (time-lastRender > 40 ) {
	lastRender = time;
	render(time);
    }
}

var render = function(time) {
  

    cyclems = 1200;
    maxshift = 22;

    if (movingStarTargetTime < time) {

	moment = time % cyclems;
	colorshift = Math.round(moment%(cyclems/4) * (4 * maxshift / cyclems));
	
	if (moment < cyclems/4)
	    colorshift = colorshift;
	else if (moment < cyclems/2)
	    colorshift = maxshift - colorshift
	else if (moment < 3*cyclems/4)
	    colorshift = - colorshift;  
	else
	    colorshift = -maxshift + colorshift;  
    }
    else {
	colorshift = -80;
    }
    // Clear the canvas
    ctx.clearRect(0,0,w,h);
    
    // Transform the canvas
    ctx.save();
    ctx.translate(w/2, h/2); // Translate to the center
    ctx.scale(scaleX, scaleY);
    


    if (!audio_ok_for_game) {

	ctx.strokeStyle = 'brown';
	ctx.fillStyle = 'yellow';



	ctx.font = 2+"px Arial";
	ctx.lineWidth = 0.05;

	ctx.scale(1, -1);	   

	txt = "Error accessing microphone.";
	ctx.fillText(txt, -w/scaleX/3 , -2.5)

	txt = "Please give permission and reload page!";
	ctx.fillText(txt, -w/scaleX/3 , 2.5)


	ctx.scale(1, -1);	   
	
    }




    // A little frame edge:

    ctx.beginPath();
    ctx.rect(-w/2 /scaleX, -h/2/scaleY, w/scaleX, h/scaleY);
    ctx.lineWidth = 0.35;
    ctx.strokeStyle = 'black';
    ctx.stroke();

    

    // Draw scoring:
    ctx.lineWidth = 0.05;
  
    ctx.strokeStyle = 'orange';
    ctx.fillStyle = 'yellow';

    ptSize = 2;
    ctx.font = ptSize+"px Arial";	    

    txt = "\u2605";    
    ctx.strokeText(txt, (-w/2.07)/scaleX , -(h/2.04)/scaleY);
    ctx.fillText(txt, (-w/2.07)/scaleX , -(h/2.04)/scaleY);


    // Small stars:

    ptSize = 0.6;;
    ctx.font = ptSize+"px Arial";	    
    ctx.lineWidth = 0.05;


    ctx.strokeStyle = 'brown';
    ctx.fillStyle = 'yellow';

    txt = "";
    for (i=0; i < maxStars; i++) txt +=  "\u2605";

    ctx.lineWidth = 0.08;
    ctx.strokeText(txt, (-w/2.25)/scaleX , -(h/2.08)/scaleY);


    txt = "";
    for (i=0; i < starCount-movingExtraStars; i++) txt +=  "\u2605";
    
    
    ctx.fillText(txt, (-w/2.25)/scaleX , -(h/2.08)/scaleY);
    ctx.strokeStyle = 'yellow';
    ctx.strokeText(txt, (-w/2.25)/scaleX , -(h/2.08)/scaleY);

    // Draw a timer:

    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'yellow';

    ptSize = 2;;
    ctx.font = ptSize+"px Arial";	    
    txt = "\u231A";

    ctx.fillText(txt,(-w/2.08)/scaleX , -(h/2.25)/scaleY) ;

    if (max_game_time > 0 && game_time_left > 0) {

	ctx.beginPath();
	ctx.rect( (-w/2.25)/scaleX , -(h/2.28)/scaleY, w * (max_game_time/60) / 1.2 /scaleX, h/60/scaleY);
	ctx.lineWidth = 0.15;
	ctx.strokeStyle = 'brown';
	ctx.stroke();
	ctx.fillStyle = 'lightblue'
	ctx.fill();

	ctx.beginPath();
	ctx.rect( (-w/2.25)/scaleX , -(h/2.28)/scaleY, w * (game_time_left/60) / 1.2 /scaleX, h/60/scaleY);
	ctx.lineWidth = 0.15;
	ctx.strokeStyle = 'brown';
	ctx.stroke();
	ctx.fillStyle = 'lightgreen'
	ctx.fill();
	
    }

    

  
    // Draw all bodies
    drawStatics();
    drawEdges();
    drawCircles();
    //drawPlane();

    //movingStarTargetTime = time+100;
    //movingStarCount = 3;

    if (movingStarTargetTime>time) {
	ctx.beginPath();
	ctx.rect(-w/2 /scaleX, -h/2/scaleY, w/scaleX, h/scaleY);
	ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
	ctx.fill();
	drawMovingStars(time);
    }
    else {
	movingStarCount = 0;
	movingExtraStars = 0;
    }

    if (editMode)
	drawGrid();



    // Restore transform
    ctx.restore();
    

    // Show grid for editing:

    function drawGrid() {
	ctx.strokeStyle = 'brown';
	ctx.lineWidth = 0.03;
	
	ptSize = 1.5;
	ctx.font = ptSize+"px Arial";	    

	for (x=-30; x < 31; x+=5) {
	    ctx.beginPath();	    
            ctx.moveTo(x, -h/scaleY);
	    ctx.lineTo(x, h/scaleY);
	    ctx.stroke();
	    
	    ctx.save();
	    ctx.scale(1, -1);	   
	    ctx.fillText(x, x, -h/2.08/scaleY);
	    ctx.restore();

	}

 	for (y=-20; y < 21; y+=5) {
	    ctx.beginPath();	    
            ctx.moveTo(-w/scaleX, y);
	    ctx.lineTo(w/scaleX, y);
	    ctx.stroke();
	    
	    ctx.save();
	    ctx.scale(1, -1);	   
	    ctx.fillText(-y,  (-w/2.15)/scaleX , y);
	    ctx.restore();

	}  
    }

    


    function drawEdges(){
		
	Object.keys(edges).forEach(function (key) {
	    e = edges[key]
	    if ("p2object" in e) {
		c = edges[key].p2object;

		x1 = c.bodyA.position[0];
		y1 = c.bodyA.position[1];

		x2 = c.bodyB.position[0];
		y2 = c.bodyB.position[1];

		len =  Math.sqrt( (x1-x2) * (x1-x2) + (y1-y2)*(y1-y2));
		if (e.type =='spring')  
		    lenRatio =  (c.restLength / len) * (c.restLength / len);// *  (c.restLength / len);

		else {
		    ctx.lineWidth = 0.7;
		    ctx.strokeStyle = 'gray';

		    ctx.beginPath();
                    ctx.moveTo(x1, y1);
		    ctx.lineTo(x2, y2);
		    ctx.stroke();


		    ctx.lineWidth = 0.6;
		    ctx.strokeStyle = 'lightgray';

		    ctx.beginPath();
                    ctx.moveTo(x1, y1);
		    ctx.lineTo(x2, y2);
		    ctx.stroke();

		    lenRatio = 1;		  
		}

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
	    }	

	});

    }

    function drawCircles(){

	Object.keys(nodes).forEach(function (key) {

	    circleBody = circleBodies[nodes[key].id];

	    ctx.lineWidth = 0.05;		

	    if (circleBody.id == hitNode)  {		
		ctx.fillStyle = nodeColors[ nodes[key].type ].activeFill;
		ctx.strokeStyle= nodeColors[ nodes[key].type ].activeStroke;

	    }
	    else {
		ctx.fillStyle = nodeColors[ nodes[key].type ].fill;		
		ctx.strokeStyle= nodeColors[ nodes[key].type ].stroke;
	    }

	    if (nodes[key].type == 'visited' || nodes[key].type == 'unlocked' || nodes[key].type == 'activeExit' ) {
		//if (nodes[key].type == 'activeExit')
		//    console.log("activeExit colorshift!");
		ctx.fillStyle = pulse_color( ctx.fillStyle,  colorshift);
		ctx.strokeStyle = pulse_color( ctx.strokeStyle, colorshift );
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
	    
	    ctx.fillStyle = nodeColors[ nodes[key].type ].textFill;

	    if (nodes[key].type == 'visited' || nodes[key].type == 'unlocked' || nodes[key].type == 'activeExit' ) {
		ctx.fillStyle = pulse_color( ctx.fillStyle ,colorshift );
	    }
	    

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
	    
	    ctx.scale(1, -1);
	    ctx.fillText(txt, -0.5*txtw, 0.35*ptSize);
	    ctx.strokeText(txt, -0.5*txtw, 0.35*ptSize);

	    ctx.restore();   
		
	});

	starBodies.forEach(function (star) {

	    parent_id = star.parent_id;
	    circleBody = star.body;

	    ctx.lineWidth = 0.05;

	    if (parent_id == hitNode)  {		
		ctx.fillStyle = nodeColors.star.activeCircleStroke;
	    }
	    else {
		ctx.fillStyle = nodeColors.star.circleStroke;
	    }



	    ctx.strokeStyle=nodeColors.star.circleStroke;

            ctx.beginPath();
            ctx.save();

            var x = circleBody.position[0],
            y = circleBody.position[1],
            radius = defaultStarRadius;

            ctx.arc(x,y,radius,0,2*Math.PI);
            ctx.stroke();


	    if (parent_id == hitNode)  {		
		ctx.fillStyle = nodeColors.star.activeCircleFill;
	    }
	    else {
		ctx.fillStyle = nodeColors.star.circleFill;
	    }



	    ctx.fill();
	    //ctx.restore();

	    ptSize = 2*defaultStarRadius;
	    ctx.font = ptSize+"px Arial";	    
	    txt = "\u2605";
	    txtw=ctx.measureText(txt).width;
	    

	    //ctx.save();
	    ctx.translate(x, y);   // Translate to the center of the box
	    ctx.rotate(circleBody.angle);  // Rotate to the box body frame
	    

	    if (parent_id == hitNode)  {		
		ctx.strokeStyle = nodeColors.star.activeStarStroke;
		ctx.fillStyle = nodeColors.star.activeStarFill;
	    }
	    else {
		ctx.strokeStyle = nodeColors.star.starStroke;
		ctx.fillStyle = nodeColors.star.starFill;
	    }


	    ctx.scale(1, -1);
	    ctx.fillText(txt, -0.5*txtw, 0.35*ptSize);
	    ctx.strokeText(txt, -0.5*txtw, 0.35*ptSize);





	    ctx.restore();   
		
	});

    }
    
    function drawStatics() {
	Object.keys(statics).forEach(function (key) {	    
	    //console.log("Drawing static", key);
	    c = statics[key].p2object;

	    x = c.position[0];
	    y = c.position[1];
	    s = c.shapes[0];

	    //console.log("static x:",x, "y:", y, "h:",c.height, "w:", c.width );
	    //console.log(c);

	    ctx.beginPath();
            ctx.save();
	    
	    ctx.translate(x, y);   // Translate to the center of the box
	    ctx.rotate(c.angle);  // Rotate to the box body frame

	    ctx.lineWidth = 0.05;

	    ctx.strokeStyle = nodeColors.static.stroke;
	    ctx.fillStyle = nodeColors.static.fill;
	    ctx.rect(-s.width /2 , -s.height/2, s.width, s.height);
	    ctx.fill();
	    ctx.stroke();

	    ctx.restore();   


	});
    }

    function drawMovingStars(time) {

	
	if (!movingStarCurrentPosition)
	    movingStarCurrentPosition = [0,0];

	if (!movingStarTargetPosition) {	    
	    ptSize = 0.6;
	    ctx.font = ptSize+"px Arial";
	    txt = "";
	    for (i=0; i < starCount-movingStarCount; i++) txt +=  "\u2605";
	    starsw = ctx.measureText(txt).width;
	    movingStarTargetPosition = [(-w/2.25)/scaleX + starsw,
				    -(h/2.08)/scaleY ] 
	}
	
	

	interpolatedPosition = [
	    movingStarTargetPosition[0] - ((movingStarTargetTime-time) /  timepenalties[movingStarCount] ) *  movingStarTargetPosition[0],
	    movingStarTargetPosition[1] - ((movingStarTargetTime-time) / timepenalties[movingStarCount] ) *  movingStarTargetPosition[1]
	];

	ptSize = 8 * (movingStarTargetTime-time) / ( timepenalties[movingStarCount] ) + 1;
	ctx.font = ptSize+"px Arial";	    
	txt = ""
	for (i=0; i < movingStarCount; i++) txt +=  "\u2605";

	ctx.lineWidth = 0.08;
	
	ctx.fillStyle = "yellow";
	ctx.strokeStyle = "orange";

	ctx.fillText(txt, interpolatedPosition[0], interpolatedPosition[1]);
	ctx.strokeText(txt, interpolatedPosition[0], interpolatedPosition[1]);
	

	
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
    
    if (movingStarTargetTime < lastTime) { //movingStarCount < 1) {

	// Convert the canvas coordinate to physics coordinates
	var position = getPhysicsCoord(event);

	console.log("Mouse down at world coords:", position);
	
	// Check if the cursor is inside the box
	var hitBodies = world.hitTest(position, circleBodiesArray);
	
	if(hitBodies.length) {
	    console.log("hit body id:",hitBodies[0].id, "(", id_to_node[hitBodies[0].id], ")");
	    node = nodes[id_to_node[hitBodies[0].id]];
	    console.log("hit body type & word:", node.type, node.word);
	    
	    if (node.type == 'unlocked' || node.type == 'visited') {
		handle_scoring( nodes[id_to_node[hitBodies[0].id]] );
	    } else 	if (node.type == 'activeExit') {
		win_game();
	    }
	}
    }
});

    
canvas.addEventListener('mousemove', function(event) {

     if (movingStarTargetTime < lastTime) { //   if (movingStarCount < 1) {
	
	// Convert the canvas coordinate to physics coordinates
	var position = getPhysicsCoord(event);
	
	// Check if the cursor is inside the box
	var hitBodies = world.hitTest(position, circleBodiesArray);
	
	hitNode = null;
	if(hitBodies.length){
            //console.log("over body!");
	    hitNode = hitBodies[0].id; 
	}
    }
});

addableEdges = [];

// The beginContact event is fired whenever two shapes starts overlapping, including sensors.
world.on("beginContact",function(event){
    //console.log("Contact! BodyA", event.bodyA.id, "BodyB: ", event.bodyB.id);

    if ( id_to_node[event.bodyA.id] &&  id_to_node[event.bodyB.id]) {

	bodyA = id_to_node[event.bodyA.id];
	bodyB = id_to_node[event.bodyB.id];
	//console.log(bodyA, bodyB);

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
		nodes[bodyA].type = 'activeExit';
	    }	    
	    if (typeB == 'exit' && ( typeA == 'visited' || typeA == 'start' )) {
		nodes[bodyB].type = 'activeExit';
	    }

	    // Open new nodes?
	    if (typeA == 'locked' && ( typeB == 'visited' || typeB == 'start' )) {
		console.log("unlocking node ",bodyA.id);
		nodes[bodyA].type = 'unlocked';
	    }	    
	    if (typeB == 'locked' && ( typeA == 'visited' || typeA == 'start' )) {
		console.log("unlocking node ",bodyB.id);
		nodes[bodyB].type = 'unlocked';
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

var max_game_time; 
var game_time_left;
var timer_running = false;
var timer_instance = null;

game_timer = function (timelimit) {

    max_game_time = timelimit;
    game_time_left = timelimit;
    timer_running = true;

    document.getElementById('scorewrapper').style.visibility = "hidden";
    document.getElementById('scorecard').style.visibility = "hidden";

    if (timer_instance) 
	window.clearInterval(timer_instance);

    timer_instance = setInterval( function() {
	if (timer_running && game_time_left >= 0) {
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

var pause_game = function () {
    pause_timer();
}



var continue_game = function(score, extra_stars) {    
    continue_timer();
    document.getElementById('scorewrapper').style.visibility = "hidden";
    document.getElementById('scorecard').style.visibility = "hidden";

    movingStarTargetTime = lastTime + timepenalties[score];
    movingStarTargetPosition = false;
    movingStarCount = score;    
    movingExtraStars = extra_stars;

    update_star_count();

}

var pause_timer = function () {
    timer_running = false;
}

var continue_timer = function() {
    timer_running = true;
}

var out_of_time = function(game) {
    document.getElementById('scorewrapper').style.visibility = "visible";
    document.getElementById('scorecard').style.visibility = "visible";
    document.getElementById('score').innerHTML='Out of time! Please try again.';
    document.getElementById('score').innerHTML+='<p><input onclick=\'build_level_from_JSON(false);\' type=button value=\'Try again!\'>';
}


var win_game = function(item) {
    pause_timer();
    
    //starscore = parseInt(document.getElementById('starcount').innerHTML)
    starscore = starCount *100;
    timescore = parseInt(game_time_left*10);
    
    document.getElementById('scorewrapper').style.visibility = "visible";
    document.getElementById('scorecard').style.visibility = "visible";
    document.getElementById('score').innerHTML='You win! <table style="font-size: 1.2em" border=0><tr><td>'+'\u2605:</td><td>' + starscore + '</td></tr><tr><td>' + '\u231A:</td><td>' + timescore + '</td></tr><tr><td colspan=2>' + '\u21D2' +  (starscore + timescore) + " points</td></tr></table>";

    document.getElementById('score').innerHTML+='<p><input onclick=\'next_level();\' type=button value=\'Next level\'>';
    document.getElementById('score').innerHTML+='<p><input onclick=\'build_level_from_JSON(false);\' type=button value=\'Try again\'>';


    
}


var next_level = function(item) {
    //var selector = $( '#level-select' ); //
    document.getElementById('level-select').selectedIndex = document.getElementById('level-select').selectedIndex + 1 ;
    //selector.selectedIndex = ( selector.selectedIndex + 1 );  

    sceneName = document.getElementById('level-select').value;
    window.location.hash = sceneName;
  
    build_level(levels[ sceneName ]);     
    update_level_editor( levels[ sceneName ] );
}


//
// Game functions:
//

debug_score=0;

var handle_playing = function(word, node, callback) { 		    

    document.getElementById('waiting_for_server').style.visibility = "hidden";
    //node.word = word;
    document.getElementById('score').innerHTML='Say this word or phrase: <br><b>'+ word + '</b>'; //"apple";

    if (typeof(audioelements[word]) == 'undefined') {
	audiourl=BASEURL + '/audio_files/' + word + '.mp3';
	audioelements[word] = new Audio(audiourl);
	
	var audio_ok = true;
	audioelements[word].oncanplay = function () { 
	    document.getElementById('waiting_for_server').style.visibility = "hidden";
	    document.getElementById('speaker_animation').style.visibility = "visible";

	    var promise = audioelements[word].play();
	    if(promise instanceof Promise) {
		promise.catch(function(error) {
		    // Check if it is the right error
		    if(error.name == "NotAllowedError") {
			audio_ok = false;
			document.getElementById('speaker_animation').style.visibility = "hidden";
			document.getElementById('score').innerHTML='Your browser does not allow playing sounds without explicit user action.';
			document.getElementById('score').innerHTML+= "Please override this by going to <p>chrome://flags/#disable-gesture-requirement-for-media-playback";
		    } else {
			throw error;
		    }
		});
	    }
	    
	    setTimeout( function() {
		if (audio_ok) {
		    document.getElementById('speaker_animation').style.visibility = "hidden";
		    get_score_for_word(word, node, callback);
		} 
	    }, audioelements[word].duration*1000 - 800);
	    
	};
    }
    else {
	audioelements[word].play();
	setTimeout( function() {
	    document.getElementById('speaker_animation').style.visibility = "hidden";
	    get_score_for_word(word, node, callback);
	}, audioelements[word].duration*1000 - 800);
    }
}



var handle_scoring = function(node) {
    console.log("handle scoring node id",node.id);

    pause_game();

    document.getElementById('scorewrapper').style.visibility = "visible";
    document.getElementById('scorecard').style.visibility = "visible";
    document.getElementById('waiting_for_server').style.visibility = "visible";
    
    if (node.word) {
	var word = node.word;
	handle_playing(word, node, apply_scoring);1
    }
    else {
	document.getElementById('score').innerHTML='Getting a word for you...';
	get_word_to_score(node, apply_scoring, handle_playing) 

    }
}



var apply_scoring = function(node, score) {

    console.log("apply scoring node id",node.id);

    if (score < 0) {
	txt = error_codes[score.toString()];
	document.getElementById('score').innerHTML ='<p style="font-size:1.5em">'+txt+'</p>';
	setTimeout(function( ){ 
	    document.getElementById('scorewrapper').style.visibility = "hidden";
	    document.getElementById('scorecard').style.visibility = "hidden";
	    continue_game(0, 0);
	}, 4300);
    }
    else {
	txt = "";
	for (i=0; i < score; i++) txt +=  "\u2605";

	document.getElementById('score').innerHTML +='<br><p style="font-size:3em">'+txt+'</p>';

	extra_stars = score - node.score;

	console.log("extra stars:", extra_stars, "for node id:", node.id );
	//console.log(id_to_node);
	
	setTimeout(function( ){ 
	    document.getElementById('scorewrapper').style.visibility = "hidden";
	    document.getElementById('scorecard').style.visibility = "hidden";
	    continue_game(score, Math.max(0, extra_stars ));
	}, 1300);

	if (score > (node.score | 0 )) {
	    // If the score was good enough, add some stars:
	    addStars(node, score);

	    // Mark the node as visited:
	    //console.log("Node", node_id, ":",node);
	    node.type = 'visited';
	    //item.render.fillStyle=box_colors[game.object_properties[ item.id].type];

	    // Unlock the close-by edges and nodes 
	    Object.keys(edges).forEach( function(key) {
		//console.log(edges);
		//console.log("key:",key);
		e=edges[key];
		
		if (e.from == node.name || e.to == node.name ) {
		    itemA = nodes[ e.from ];
		    itemB = nodes[ e.to ];
		    //console.log(itemA, itemB);
		    if (itemA.type == 'locked')
			itemA.type = 'unlocked';
		    if  (itemB.type == 'locked')
			itemB.type = 'unlocked';
		    if  (itemA.type == 'exit')
			itemA.type = 'activeExit';
		    if  (itemB.type == 'exit')
			itemB.type = 'activeExit';
		    //console.log(itemA, itemB);
		    
		}
	    });

	    node.score = score;
	}
	if (score > 0 ) {
	    // Apply force!
	    //Matter.Body.applyForce(item, item.position, Matter.Vector.create(0, getScoreForce(score)) );
	}

    }
}


var addStars = function(node, score) {
    console.log("addStars for node",node.id);


    // Distance between node and star centres:
    var dist = defaultNodeRadius + 1.5 * defaultStarRadius
    var sqt2 = Math.sqrt(2);

    star_offsets = [
	{x: 0, y: dist }, // 0
	{x: -dist/sqt2, y: dist/sqt2}, // 1
	{x: dist/sqt2, y: dist/sqt2}, // 2
	{x: -dist, y: 0}, // 3
	{x: dist, y: 0}, // 4
    ]
    
    //stars = {}

    item = circleBodies[ node.id ];

    for (i= (node.score | 0); i < score; i++) {
c
	star = {
	    position : [
		item.position[0]+star_offsets[i].x,
		item.position[1]+star_offsets[i].y,
	    ],
	    mass: starMass
	}
	
	circleBody = new p2.Body({
	    mass: star.mass,
	    position: star.position,
	    id : running_star_id++
	});
	

	var circleShape = new p2.Circle({ radius: defaultStarRadius });
	circleBody.addShape(circleShape);
	world.addBody(circleBody);
	starBodies.push({body:  circleBody, parent_id: node.id});

	var hanger = new p2.LinearSpring( item, circleBody, {stiffness: 1000, restLength: defaultNodeRadius + defaultStarRadius} );
	world.addSpring(hanger);
    }


}


var update_star_count = function() {
    starCount= starBodies.length;
    document.getElementById('starcount').innerHTML = starCount;
}



//
// Level editor functions:
//



var update_level_editor = function (level) {

    need_json_update = true;

    if (typeof(level) == 'undefined') {
	level = JSON.parse(document.getElementById('leveljson').value);	
	need_json_update = false;
    }

    counter=0;

    console.log("UPDATING LEVEL EDITOR");
    $('#edit-meta').empty();
    $('#edit-meta').append( get_meta_editor(level.meta));

    $('#edit-nodes').empty();
    Object.keys(level.nodes).forEach( function (key) {
	$('#edit-nodes').append( get_node_editor(key, level.nodes[key], counter++  ) );
    });
    // Update level editor:
    
    counter = 0;
    // Update level editor:
    $('#edit-edges').empty();
    level.edges.forEach( function (edge) {
	$('#edit-edges').append( get_edge_editor( edge, counter++) );
    });

     counter = 0;
    $('#edit-statics').empty();
    // Update level editor:
    level.statics.forEach( function (staticobj) {
	$('#edit-statics').append( get_statics_editor( staticobj, counter++) );
    });

    if (need_json_update)
	updateJSON();
}

var decrease_field = function (field) {
    tweak_field(field, 'minus');
}
var increase_field = function (field) {
    tweak_field(field, 'plus');
}

var tweak_field = function (field, direction) {
    val = parseFloat(field.value);
    if (Math.abs(val) < 20)
	valchange = 0.1;
    else if (Math.abs(val) < 100)
	valchange = 1;
    else if (Math.abs(val) < 1000)
	valchange = 10;
     else 
	 valchange = 100;
    if (direction == 'minus')
	val -= valchange;
    else
	val += valchange;

    field.value = Math.round( val * 1000 ) / 1000.0;
    updateJSON();
}

var remove_node = function(element) {
    $( element ).parent().remove();
    updateJSON();
}
var remove_static = function(element) {
    $( element ).parent().remove();
    updateJSON();
}
var remove_edge = function(element) {
    $( element ).parent().remove();
    updateJSON();
}


var add_node = function(element) {
    $('#edit-nodes').append( get_node_editor(
	Math.random().toString(36).substring(2,7), 
	{
	    type:'word',
	    position: [0,0],
	    mass: 5
	}, 
	    -1));

    updateJSON();
}
var add_static = function(element) {
    $('#edit-statics').append( get_statics_editor( 
	{
	    position: [0,0],
	    h: 1,
	    w: 1,
	    angle: 0
	},
	    -1) );
    updateJSON();
}
var add_edge = function(element) {
       $('#edit-edges').append( get_edge_editor(
        {
            from: "",
            to: "",
            type: "spring",
            options: { stiffness: 1000 }
        },
            -1) );

    updateJSON();
}

var get_meta_editor = function(meta) {
    editor = "<div>"
    editor += " Level name:";
    editor += "<input id='levelname' type=text value='"+meta.levelname+"' maxlength=24 size=12 onchange='updateJSON();'>";
    editor += " Author:";
    editor += "<input id='author' type=text value='"+meta.author+"' maxlength=24 size=12 onchange='updateJSON();'>";
    editor += " Time limit:";
    editor += "<input onclick='decrease_field(  $( this ).parent().find(\"#timelimit\")[0]  )' type=button value='-'>";
    editor += "<input id='timelimit' type=text value='"+meta.timelimit+"' maxlength=4 size=4 onchange='updateJSON();'>";
    editor += "<input onclick='increase_field(  $( this ).parent().find(\"#timelimit\")[0] )' type=button value='+'>";
    editor += " star mass:";
    editor += "<input onclick='decrease_field( $( this ).parent().find(\"#starmass\")[0] )' type=button value='-'>";
    editor += "<input id='starmass' type=text value='"+meta.starmass+"' maxlength=6 size=6 onchange='updateJSON();'>";
    editor += "<input onclick='increase_field( $( this ).parent().find(\"#starmass\")[0] )' type=button value='+'>";
    editor += " Gravity x:";
    editor += "<input onclick='decrease_field( $( this ).parent().find(\"#gravityx\")[0] )' type=button value='-'>";
    editor += "<input id='gravityx' type=text value='"+meta.gravity[0]+"' maxlength=6 size=6 onchange='updateJSON();'>";
    editor += "<input onclick='increase_field( $( this ).parent().find(\"#gravityx\")[0] )' type=button value='+'>";
    editor += " Gravity y:";
    editor += "<input onclick='decrease_field( $( this ).parent().find(\"#gravityy\")[0] )' type=button value='-'>";
    editor += "<input id='gravityy' type=text value='"+meta.gravity[1]+"' maxlength=6 size=6 onchange='updateJSON();'>";
    editor += "<input onclick='increase_field( $( this ).parent().find(\"#gravityy\")[0] )' type=button value='+'>";
   editor += '</div>';

    return editor;
}


var get_node_editor = function(name, node, id) {
    

    editor = "<div>"
    editor += " id:";
    editor += "<input id='key' type=text value='"+name+"' maxlength=12 size=6 onchange='updateJSON();'>";
    
    editor += " type:";
    editor += "<select id='node_type' onchange='updateJSON();'>";
    (['start', 'word', 'exit']).forEach (function (type) {
	if (node.type == type)
	    editor += "<option value='" + type + "' selected>" + type + "</option>";
	else
	    editor += "<option value='" + type + "'>" + type + "</option>";
    } );
    editor += "</select>";


    editor += " Position "
    editor += " x:";
    editor += "<input onclick='decrease_field( $( this ).parent().find(\"#node_positionx\")[0] )' type=button value='-'>";
    editor += "<input id='node_positionx' type=text value='"+node.position[0]+"' maxlength=6 size=6 onchange='updateJSON();'>";
    editor += "<input onclick='increase_field( $( this ).parent().find(\"#node_positionx\")[0] )' type=button value='+'>";
    editor += " y:";
    editor += "<input onclick='decrease_field( $( this ).parent().find(\"#node_positiony\")[0] )' type=button value='-'>";
    editor += "<input id='node_positiony' type=text value='"+node.position[1]+"' maxlength=6 size=6 onchange='updateJSON();'>";
    editor += "<input onclick='increase_field( $( this ).parent().find(\"#node_positiony\")[0] )' type=button value='+'>";
    editor += " mass:";
    editor += "<input onclick='decrease_field( $( this ).parent().find(\"#node_mass\")[0] )' type=button value='-'>";
    editor += "<input id='node_mass' type=text value='"+node.mass+"' maxlength=6 size=6 onchange='updateJSON();'>";
    editor += "<input onclick='increase_field( $( this ).parent().find(\"#node_mass\")[0] )' type=button value='+'>";
    
  editor += " <input type=button value='Remove element' onclick='remove_node(this)' style='color: red;'>"

    return editor;    
}

var get_edge_editor = function(edge, id) {
    //console.log("Adding edge editor!");
    editor = "<p>"
    editor += " from: ";
    editor += "<input id='edge_from' type=text value='"+ edge.from + "' maxlength=12 size=6 onchange='updateJSON();'>";
    editor += " to: ";
    editor += "<input id='edge_to' type=text value='"+ edge.to + "' maxlength=12 size=6 onchange='updateJSON();'>";
    editor += " type: ";
    editor += "<select id='edge_type' onchange='updateJSON();'>";
    (['spring', 'fixed']).forEach (function (type) {
	if (edge.type == type)
	    editor += "<option value='" + type + "' selected>" + type + "</option>";
	else
	    editor += "<option value='" + type + "'>" + type + "</option>";
    } );
    editor += "</select>";
    editor += " options.stiffness: ";
    editor += "<input onclick='decrease_field( $( this ).parent().find(\"#edge_stiffness\")[0] )' type=button value='-'>";
    editor += "<input id='edge_stiffness' type=text value='"+ edge.options.stiffness + "' maxlength=12 size=6 onchange='updateJSON();'>";
    editor += "<input onclick='increase_field( $( this ).parent().find(\"#edge_stiffness\")[0] )' type=button value='+'>";

  editor += " <input type=button value='Remove element' onclick='remove_edge(this)' style='color: red;'>"

    return editor;

}


var get_statics_editor = function(statics, id) {
 
    editor = "<div>";
    editor += " Position ";
    editor += " x:";
    editor += "<input onclick='decrease_field( $( this ).parent().find(\"#statics_positionx\")[0] )' type=button value='-'>";
    editor += "<input id='statics_positionx' type=text value='"+statics.position[0]+"' maxlength=6 size=6 onchange='updateJSON();'>";
    editor += "<input onclick='increase_field( $( this ).parent().find(\"#statics_positionx\")[0] )' type=button value='+'>";
    editor += " y:";
    editor += "<input onclick='decrease_field( $( this ).parent().find(\"#statics_positiony\")[0] )' type=button value='-'>";
    editor += "<input id='statics_positiony' type=text value='"+statics.position[1]+"' maxlength=6 size=6 onchange='updateJSON();'>";
    editor += "<input onclick='increase_field( $( this ).parent().find(\"#statics_positiony\")[0] )' type=button value='+'>";
    
    editor += " height:";
    editor += "<input onclick='decrease_field( $( this ).parent().find(\"#statics_h\")[0] )' type=button value='-'>";
    editor += "<input id='statics_h' type=text value='"+statics.h+"' maxlength=6 size=6 onchange='updateJSON();'>";
    editor += "<input onclick='increase_field( $( this ).parent().find(\"#statics_h\")[0] )' type=button value='+'>";
    editor += " width:";
    editor += "<input onclick='decrease_field( $( this ).parent().find(\"#statics_w\")[0] )' type=button value='-'>";
    editor += "<input id='statics_w' type=text value='"+statics.w+"' maxlength=6 size=6 onchange='updateJSON();'>";
    editor += "<input onclick='increase_field( $( this ).parent().find(\"#statics_w\")[0] )' type=button value='+'>";
    editor += " angle (radians):";
    editor += "<input onclick='decrease_field( $( this ).parent().find(\"#statics_angle\")[0] )' type=button value='-'>";
    editor += "<input id='statics_angle' type=text value='"+statics.angle+"' maxlength=6 size=6 onchange='updateJSON();'>";
    editor += "<input onclick='increase_field( $( this ).parent().find(\"#statics_angle\")[0]  )' type=button value='+'>";    
    editor += " <input type=button value='Remove element' onclick='remove_static(this)' style='color: red;'>"

    editor += "</div>";
    return editor;    
}


var updateJSON = function() {

    console.log("updating JSON!");
    json_nodes = {};
    json_edges = [];
    json_statics = [];

    console.log("#edit-meta:",$('#edit-meta'));

    json_meta = { gravity: []};

    $('#edit-meta').find('input').each(function () {
	//$( this ).children('input').each(function () {
	    field = this;
	    console.log("metafield:",field);
	    if ( field.id == 'levelname')
		json_meta.levelname = field.value;
            else if ( field.id == 'timelimit')
		json_meta.timelimit = field.value ;
            else if ( field.id == 'author')
		json_meta.author = field.value ;
            else if ( field.id == 'starmass')
		json_meta.starmass = field.value ;
            else if ( field.id == 'gravityx')
		json_meta.gravity[0] = field.value ;
            else if ( field.id == 'gravityy')
		json_meta.gravity[1] = field.value ;
			
	//});
    });

    $('#edit-nodes').children().each(function () {	
	node = { position: []}; 
	var key;
	$( this ).children('input').each(function () {
	    field = this;
	    if ( field.id == 'key')
		key = field.value;	    
	    else if ( field.id == 'node_positionx')
		node.position[0] = parseFloat(field.value);
	    else if ( field.id == 'node_positiony')
		node.position[1] = parseFloat(field.value);
	    else if ( field.id == 'node_type')
		node.type = field.value ;
	    else if ( field.id == 'node_mass')
		node.mass = parseFloat(field.value);

	});
	$( this ).children('select').each(function () {
	    field = this;
	    if ( field.id == 'node_type')
		node.type = field.value ;

	});
	json_nodes[key] = node;
    });

    $('#edit-edges').children().each(function () {	
	edge = { options : {} }; 
	var key;
	console.log( $( this ) );
	$( this ).children('input').each(function () {
	    field = this;
	    if (field.id == 'edge_to')
		edge.to = field.value;
	    else if ( field.id == 'edge_from')
		edge.from = field.value ;
	    else if ( field.id == 'edge_type')
		edge.type = field.value ;
	    else if ( field.id == 'edge_stiffness')
		edge.options.stiffness = field.value ;

	});
	$( this ).children('select').each(function () {
	    field = this;
	    if ( field.id == 'edge_type')
		edge.type = field.value ;

	});
	json_edges.push(edge)
    });

    $('#edit-statics').children().each(function () {	
	st = { position:[] }; 
	var key;
	
	$( this ).children('input').each(function () {
	    field = this;
	    if (field.id == 'statics_positionx')
		st.position[0] = parseFloat(field.value);
	    else if ( field.id == 'statics_positiony')
		st.position[1] = parseFloat(field.value);
	    else if ( field.id == 'statics_h')
		st.h = parseFloat(field.value) ;
	    else if ( field.id == 'statics_w')
		st.w = parseFloat(field.value) ;
	    else if ( field.id == 'statics_angle')
		st.angle = parseFloat(field.value) ;
	});
	json_statics.push(st)
    });

	/*console.log(node);
	nodes[ $("#node_"+(id)+"_id").value ] = 
	    {
		position: [ $("#node_"+(id)+"_positionx").value,  $("#node_"+(id)+"_positiony").value ],
		type :  $("#node_"+id+"_type").value
	    };*/
    json_level = { meta: json_meta,
		   nodes: json_nodes,
		   edges: json_edges,
		   statics: json_statics
		 }
    
    document.getElementById('leveljson').value =  JSON.stringify(json_level, null, 2);
    build_level_from_JSON();
}


var build_level_from_JSON = function (update_editor) {
    console.log("Building level from JSON!");
    build_level( JSON.parse(document.getElementById('leveljson').value));
    if (update_editor) {
    	update_level_editor( JSON.parse(document.getElementById('leveljson').value)  );
    }
}

// Screen size handling: 

var screen_size_setup = function() {

    // Fiddle with the css of the game container:

    game_canvas_element = document.getElementById("gamecanvas");
    underbar = document.getElementById("underbar");
    cover = document.getElementById("scorewrapper");

    
    var toolbarwi = 200,
    toolbarhe = 200,
    toolbarstyle = {
	position: "absolute"
    };

    var canvaswi;
    var he, wi;

    if (editMode) {
	he=400;
	wi=$(window).width();
    }

    else {
	he = $(window).height();
	wi = $(window).width();
    }

    bottom_toolbar_canvaswi = Math.min (wi, 4.0 / 3.0 * (he -toolbarhe));
    left_toolbar_canvaswi = Math.min ( 4.0 / 3.0 * (he), wi - toolbarwi);
    
    // Option 1: 
    // More vertical space than horisontal space: Toolbar on bottom
    if (bottom_toolbar_canvaswi > left_toolbar_canvaswi && ! editMode) {	    

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

    //game_canvas_element.style.width = canvaswi+"px";
    //game_canvas_element.style.transform = "scale("+(canvaswi/800.0)+")";

    
    $('#gamecanvas').prop('width', canvaswi);
    $('#gamecanvas').prop('height',  (3*canvaswi/4) );

    scaleX = 15.0*canvaswi/800.0;
    scaleY = -scaleX;

    //console.log("canvas width:",canvaswi);
    //console.log("scaleX & scaleY: ",scaleX, scaleY);


    w = canvas.width;
    h = canvas.height;

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




//document.getElementById('level-select').value;
levelselector = document.getElementById('level-select');



Object.keys(levels).forEach ( function(key) {
	var opt = document.createElement("option");
	opt.value= key;
	opt.innerHTML = key+ " - " + levels[key].meta.levelname; // whatever property it has
	
	// then append it to the select element
	levelselector.appendChild(opt);
});

var opt = document.createElement("option");
opt.value= "levelEditor";
opt.innerHTML = "Edit this level" ; // whatever property it has
levelselector.appendChild(opt);




// Everything set, let's run the game!

var levelSelect = document.getElementById('level-select'),
levelReset = document.getElementById('level-reset');

// get the scene function name from hash
if (window.location.hash.length !== 0) {
    sceneName = window.location.hash.replace('#', '').replace('-inspect', '');   
} 
else {
    sceneName = $( levelselector ).children()[0].value;
}
    


// From http://stackoverflow.com/questions/2400935/browser-detection-in-javascript


navigator.sayswho= (function(){
    var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    //return M.join(' ');
    return M;
})();



var init_fysiak = function() {

    build_level(levels[sceneName]);


    // initialise game selector
    levelSelect.value = sceneName;
    document.getElementById('leveljson').value =  JSON.stringify(levels[sceneName], null, 2);
    update_level_editor();

    levelSelect.addEventListener('change', function(e) {

	if (e.target.value == "levelEditor") {
	    
	    editMode = true;
	    $('#editor').show();
	    screen_size_setup();
	}
	else {
	    sceneName = e.target.value;
	    window.location.hash = sceneName;
	    build_level(levels[ sceneName ]);     
	    update_level_editor( levels[ sceneName ] );
	    //document.getElementById('leveljson').value =  JSON.stringify(levels[sceneName], null, 2);
	    //update_level_editor();
	}


    });

    levelReset.addEventListener('click', function(e) {

	build_level_from_JSON(false);

	if (e.target.value == "levelEditor") {
	    $('#editor').show();
	    screen_size_setup(true);
	    //$(document).scrollTop( $("#editor").offset().top ); 
	}
	/*
	  if (e.target.value == "levelEditor") {
	  build_level_from_json();
	  }
	  else if ( levelSelect.value != "0") {
	  build_level(levels[levelSelect.value]);
	  }*/
    });



    browser = navigator.sayswho;
    if (browser[0] != 'Chrome')  {
	
	pause_game();
	document.getElementById('scorewrapper').style.visibility = "visible";
	document.getElementById('scorecard').style.visibility = "visible";
	document.getElementById('score').innerHTML='Your browser claims to be '+browser[0]+ " version " + browser[1]+'. ';
	document.getElementById('score').innerHTML+= "We recommend using the Chrome browser.";
	document.getElementById('score').innerHTML+='<input onclick=\'continue_game();\' type=button value=\'Try the game anyway\'>';
    }
}
