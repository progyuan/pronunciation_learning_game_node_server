
var messages = {
    say_this : { en: 'Say this word or phrase:',
		 fi: 'Sano tämä sana tai lause:' },
    mic_error:  { en: "Error accessing microphone.",
		  fi: "Ei lupaa mikrofonin käyttöön" },
    give_permission: {en: "Please give permission and reload page!",
		      fi: "Annahan lupa ja lataa sivu uudestaan!" },
    out_of_time: { en: 'Out of time! Please try again.',
		   fi: 'Aika loppui! Yritähän uudelleen.' },
    try_again: { en: 'Try again',
		 fi: 'Yritä uudestaan' },
    you_win : { en: 'You win!',
		fi: 'Voitit!' },
    points: { en: "points",
	      fi: "pistettä" },
    next_level : { en: "Next level",
		   fi: "Seuraava taso" },
    getting_word : { en: "Getting a word for you...",
		     fi: "Haetaan seuraavaa sanaa..."},
    your_browser : { en: 'Your browser claims to be',
		     fi: 'Selaimesi väittää olevansa' },
    version : { en: "version",
		fi: "versio" },
    recommend_chrome : { en: "We recommend using the Chrome browser.",
			 fi: "Suosittelemme Chrome-selainta." },
    try_anyway : { en: "Try the game anyway", 
		   fi: "Kokeile siitä huolimatta" },
    another_level : { en: "Try another level",
		      fi: "Kokeile toista kenttää" },
    logout : { en: "Log out",
	       fi: "Kirjaudu ulos" },
    browser_sound_permission : { 
	en : 'Your browser does not allow playing sounds without explicit user action.',
	fi : 'Selaimesi ei anna soittaa ääniä ilman käyttäjän selkeää toimintaa.'
    },
    browser_sound_fix : {
	en : "Please override this by tweaking this setting:",
	fi: "Ohita tämä kielto tästä asetuksesta:"
    },
    high_scores : {
	en : "High scores:",
	fi: "Parhaat pisteet:"
    }
}


var canvas = document.getElementById("gamecanvas");

var w = canvas.width,
    h = canvas.height;

var resized = false;
var audio_ok_for_game = false;

var siak_level = "L0";

var scaleX = 30, scaleY = -30;
var qmark_font_size = false;

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



var positions = {
    levelselect: { x:  0.43, 
		   y: -0.51 }
}

var scalings = {
    levelselect: { x:  0.12/1100, 
		   y:  0.12/1100 }
}

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

	txt = messages.mic_error[lng];
	ctx.fillText(txt, -w/scaleX/3 , -2.5)

	txt = messages.give_permission[lng];
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

    ptSize = 0.6;
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

    ctx.save();
    ctx.translate( -(0.48 * w)/scaleX , -(0.45* h )/scaleY) ;
    ctx.scale((w/1100)*0.05/scaleX, (w/1100)*0.05/scaleY );
    ctx.lineWidth = 4;

    var path = new Path2D("M320 25.6c-162.592 0-294.4 131.84-294.4 294.4 0 162.592 131.808 294.4 294.4 294.4s294.4-131.808 294.4-294.4c0-162.592-131.808-294.4-294.4-294.4zM320 550.4c-127.264 0-230.4-103.168-230.4-230.4s103.136-230.4 230.4-230.4 230.4 103.168 230.4 230.4-103.136 230.4-230.4 230.4zM342.4 153.6h-44.8v175.68l108.96 108.96 31.68-31.68-95.84-95.84z");
    ctx.fill(path);
    ctx.stroke(path);
    ctx.restore();





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
    
    // Draw microphone levels:

    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'yellow';

    ctx.save();
    ctx.translate( (-w/2.07)/scaleX , -(h/2.45)/scaleY) ;
    ctx.scale( (w/1100)*0.8/scaleX, (w/1100)*0.8/scaleY );
    ctx.lineWidth = 0.3;
    

    var path = new Path2D("M24 28c3.31 0 5.98-2.69 5.98-6L30 10c0-3.32-2.68-6-6-6-3.31 0-6 2.68-6 6v12c0 3.31 2.69 6 6 6zm10.6-6c0 6-5.07 10.2-10.6 10.2-5.52 0-10.6-4.2-10.6-10.2H10c0 6.83 5.44 12.47 12 13.44V42h4v-6.56c6.56-.97 12-6.61 12-13.44h-3.4z");
    ctx.fill(path);
    ctx.stroke(path);
    //var path = new Path2D("M0 0h48v48H0z");
    //ctx.stroke(path);
    //ctx.fill(path);
    ctx.restore();


    if (audio_ok_for_game) {
	ctx.save();
	ctx.translate( (-w/2.25)/scaleX , -(h/2.47)/scaleY ); // Translate to the center
	updateAnalysers(ctx, 0,0, w /8 /scaleX, h/20/scaleY)
	ctx.restore();
    }
  
    // Draw all bodies
    drawStatics();
    drawEdges();
    drawCircles();
    //drawPlane();



    resized = false;    



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

    drawLevelSelectButton();


    function drawLevelSelectButton() {



	ctx.save();
	ctx.translate( positions.levelselect.x * w /scaleX,  positions.levelselect.y * h /scaleY );
	ctx.scale( scalings.levelselect.x * w / scaleX, scalings.levelselect.y * h / scaleY );
	
	path3 = new Path2D("m 167.68359,236.64844 c -7.81842,0 -14.11132,6.2929 -14.11132,14.11133 l 0,204.63281 c 0,7.81842 6.2929,14.11328 14.11132,14.11328 l 304.63282,0 c 7.81842,0 14.11132,-6.29486 14.11132,-14.11328 l 0,-204.63281 c 0,-7.81843 -6.2929,-14.11133 -14.11132,-14.11133 l -304.63282,0 z m 215.53125,25.71289 80,0 0,41.42969 -80,0 0,-41.42969 z m -206.78711,0.71484 80,0 0,41.42969 -80,0 0,-41.42969 z m 103.39454,0 80,0 0,41.42969 -80,0 0,-41.42969 z m 103.39257,68.75 80,0 0,41.42969 -80,0 0,-41.42969 z m -206.78711,0.71485 80,0 0,41.42773 -80,0 0,-41.42773 z m 103.39454,0 80,0 0,41.42773 -80,0 0,-41.42773 z m 103.39257,68.75 80,0 0,41.42773 -80,0 0,-41.42773 z m -206.78711,0.71484 80,0 0,41.42773 -80,0 0,-41.42773 z m 103.39454,0 80,0 0,41.42773 -80,0 0,-41.42773 z");

    //var path = new Path2D("M24 28c3.31 0 5.98-2.69 5.98-6L30 10c0-3.32-2.68-6-6-6-3.31 0-6 2.68-6 6v12c0 3.31 2.69 6 6 6zm10.6-6c0 6-5.07 10.2-10.6 10.2-5.52 0-10.6-4.2-10.6-10.2H10c0 6.83 5.44 12.47 12 13.44V42h4v-6.56c6.56-.97 12-6.61 12-13.44h-3.4z");


	if (hitNode == -1) {
	    ctx.fillStyle = 'yellow';
	    ctx.strokeStyle = 'yellow';  
	    ctx.lineWidth = 30;	    
	    ctx.stroke(path3);
	
	    ctx.fill(path3);

	    ctx.strokeStyle = 'green';  
	    ctx.lineWidth = 12;	    
	    ctx.stroke(path3);


	}
	else {
	    ctx.strokeStyle = 'black';
	    ctx.fillStyle = 'lightgreen';
	    ctx.lineWidth = 4;	    
	
	    ctx.fill(path3);
	    ctx.stroke(path3);

	}

	
	//ctx.stroke(path);
	//ctx.fill(path);
	ctx.restore();    
    }
    

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
		txt = format_word(nodes[key].word);
		if (nodes[key].fontsize && !resized) {
		    ptSize=nodes[key].fontsize;
		    ctx.font = nodes[key].fontsize+"px Arial";
		    txtw=ctx.measureText(txt).width;
		}
		else {
		    for (ptSize = 20 * defaultNodeRadius; ptSize > 0.4 ;ptSize-= 0.2) {
			ctx.font = ptSize+"px Arial";
			txtw=ctx.measureText(txt).width;
			if (txtw < defaultNodeRadius*20) {
			    
			    nodes[key].fontsize = ptSize;
			    break;
			}
		    }
		}
 
	    }
	    else {
		txt = '?';
		if (qmark_font_size && !resized) {
		    ptSize= qmark_font_size;
		    ctx.font = qmark_font_size+"px Arial";
		    txtw=ctx.measureText(txt).width;
		}
		else
		    for (ptSize=20*defaultNodeRadius; ptSize > 0.4 ;ptSize-= 0.2) {
			ctx.font = ptSize+"px Arial";
			txtw=ctx.measureText(txt).width;
			if (txtw < defaultNodeRadius*20) {
			    qmark_font_size = ptSize;
			    break;
			}
		    }
	    }
	    
	    //ctx.save();
	    ctx.translate(x, y);   // Translate to the center of the box
	    ctx.rotate(circleBody.angle);  // Rotate to the box body frame
	    
	    ctx.scale(0.1, -0.1);
	    ctx.lineWidth = 0.5;		
	    //txtw=ctx.measureText(txt).width;
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
    

    function updateAnalysers(analyserContext, ctxx, ctxy,canvasWidth,canvasHeight) {

	/* Modified: Analyser code completely ovarhauled in style of voice-change-o-matic!  */

	{
	    var bufferLength=analyserNode.frequencyBinCount

	    var dataArray = new Uint8Array(analyserNode.frequencyBinCount);
	    analyserNode.getByteTimeDomainData(dataArray); 

            //analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
            analyserContext.fillStyle = '#F6D565';
            analyserContext.lineCap = 'round';

	    analyserContext.fillStyle = 'rgb(200, 200, 200)';
	    //analyserContext.fillRect(x,y,w,h);

	    analyserContext.lineWidth = 0.1;
	    analyserContext.strokeStyle = 'rgb(0, 0, 0)';

	    analyserContext.beginPath();

	    var sliceWidth = canvasWidth * 1.0 / bufferLength * 32;
	    var x = 0;
	    maxVal -= 0.02;
	    
	    for(var i = 0; i < bufferLength; i+=32) {
		
		var v = dataArray[i] / 128.0;
		var y = v * canvasHeight/2;

		if (Math.abs(v-1) > maxVal) {
		    maxVal=Math.abs(v-1);
		}
		
		if(i === 0) {
		    analyserContext.moveTo(x, y);
		} else {
		    analyserContext.lineTo(x, y);
		}
		
		x += sliceWidth;
	    }
	    analyserContext.stroke();
	    
	    barHeight=maxVal*canvasHeight;

	    if (maxVal>0.8) {

		barHeight=maxVal*canvasHeight*1.2;
		analyserContext.fillStyle = 'rgba(' + Math.round(maxVal*canvasHeight+100) + ',50,50,0.5)';
		analyserContext.fillRect(0,canvasHeight/2-barHeight/2, canvasWidth, barHeight );
	    }

	    if (maxVal>0.5) {
		barHeight=Math.min(maxVal,0.8)*canvasHeight;
		
		analyserContext.fillStyle = 'rgba(255,255,50,0.5)';	
		analyserContext.fillRect(0,canvasHeight/2-barHeight/2, canvasWidth, barHeight );
	    }


	    barHeight=Math.min(maxVal,0.5)*canvasHeight;
	    
	    analyserContext.fillStyle = 'rgba(50,' + Math.round(maxVal*canvasHeight+150) + ',50, 0.5)';	
	    analyserContext.fillRect(0,canvasHeight/2-barHeight/2, canvasWidth ,barHeight );	

	}
	


	//rafID = window.requestAnimationFrame( updateAnalysers );
    }


}



// Event listeners:

canvas.addEventListener('mousedown', function(event){
    
    if (movingStarTargetTime < lastTime) { //movingStarCount < 1) {

	
	
	// Convert the canvas coordinate to physics coordinates
	var position = getPhysicsCoord(event);

	console.log("Mouse down at world coords:", position);
	console.log("Levelselect bounds:", positions.levelselect.x * w / scaleX, positions.levelselect.y *h/scaleY - 0.065*h/scaleX);
	if (position[0] > positions.levelselect.x * w / scaleX && position[1] > positions.levelselect.y *h/scaleY  - 0.065 *h/scaleX) {
	    select_level();
	}
	
	else {
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
    }
});

    
canvas.addEventListener('mousemove', function(event) {
    
    // Convert the canvas coordinate to physics coordinates
    var position = getPhysicsCoord(event);

    // todo: fix these coordinates!
    if (position[0] > positions.levelselect.x * w / scaleX && position[1] > positions.levelselect.y *h/scaleY  - 0.065 *h/scaleX) {
	hitNode = -1;
    }
    
    else if (movingStarTargetTime < lastTime) { //   if (movingStarCount < 1) {
	
	
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
		//console.log("Adding spring between ",e.from, "and",e.to);
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

    if (score != -4) {
	movingStarTargetTime = lastTime + timepenalties[Math.max(score, 0)];
	movingStarTargetPosition = false;

	if (score > 0) {
	    movingStarCount = score;    
	    movingExtraStars = extra_stars;
	
	    update_star_count();
	}
    }
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
    document.getElementById('score').innerHTML= messages.out_of_time[lng];
    document.getElementById('score').innerHTML+='<p><input onclick=\'build_level_from_JSON(false);\' type=button value=\''+messages.try_again[lng]+'\'>';
    
    document.getElementById('score').innerHTML+='<p><input onClick=\'select_level()\' type=button value=\''+messages.another_level[lng]+'\'>';

    //document.getElementById('score').innerHTML+='<p>'+messages.another_level[lng];
    
    //document.getElementById('score').appendChild( get_level_selection() );

    document.getElementById('score').innerHTML+='<p><input onclick="location.href=\''+BASEURL+'/logout\';" type=button value=\''+messages.logout[lng]+'\'>';
}


var win_game = function(item) {


    pause_timer();
    
    //starscore = parseInt(document.getElementById('starcount').innerHTML)
    starscore = starCount *100;
    timescore = parseInt(game_time_left*10);

    overall_performance = Math.ceil( (starscore + timescore) / (maxStars * 100) * 5 );
    

    console.log("Overall performance:", overall_performance);
    console.log( (starscore + timescore) / (maxStars * 100) * 5 );
    
    
    document.getElementById('scorewrapper').style.visibility = "visible";
    document.getElementById('scorecard').style.visibility = "visible";
    document.getElementById('score').innerHTML=messages.you_win[lng] +'<table style="font-size: 1.2em" border=0><tr><td>'+'\u2605:</td><td>' + starscore + '</td></tr><tr><td>' + '\u231A:</td><td>' + timescore + '</td></tr><tr><td colspan=2>' + '\u21D2' +  (starscore + timescore) + " "+ messages.points[lng]+ "</td></tr></table>";

    document.getElementById('score').innerHTML+='<p>';
    for (n = 1; n <= overall_performance; n++) 	
	document.getElementById('score').innerHTML+='\u2605';
    for (n = overall_performance+1; n <= 5; n++)
	document.getElementById('score').innerHTML+='\u2606';
    document.getElementById('score').innerHTML+='</p>'; 
    
    document.getElementById('score').innerHTML+='<p><input onclick=\'next_level();\' type=button value=\''+ messages.next_level[lng] +'\'>';
    document.getElementById('score').innerHTML+='<p><input onclick=\'build_level_from_JSON(false);\' type=button value=\''+messages.try_again[lng]+'\'>';

    document.getElementById('score').innerHTML+='<p><input onClick=\'select_level()\' type=button value=\''+messages.another_level[lng]+'\'>';
    //document.getElementById('score').appendChild( get_level_selection() );
    document.getElementById('score').innerHTML+='<p><input onClick="location.href=\''+BASEURL+'/logout\';" type=button value=\''+messages.logout[lng]+'\'>';
    //document.getElementById('score').appendChild( get_high_scores(sceneName) );

    // Tell the server we're done with this level:
    document.getElementById('score').appendChild( send_level_score(sceneName, starscore, timescore, overall_performance) );
    
}

var select_level = function(item) {
    pause_timer();
    
    //starscore = starCount *100;
    //timescore = parseInt(game_time_left*10);
    
    document.getElementById('scorewrapper').style.visibility = "visible";
    document.getElementById('scorecard').style.visibility = "visible";
    document.getElementById('score').innerHTML = "";
    //document.getElementById('score').innerHTML=messages.you_win[lng] +'<table style="font-size: 1.2em" border=0><tr><td>'+'\u2605:</td><td>' + starscore + '</td></tr><tr><td>' + '\u231A:</td><td>' + timescore + '</td></tr><tr><td colspan=2>' + '\u21D2' +  (starscore + timescore) + " "+ messages.points[lng]+ "</td></tr></table>";

    //document.getElementById('score').innerHTML+='<p><input onclick=\'next_level();\' type=button value=\''+ messages.next_level[lng] +'\'>';


    document.getElementById('score').innerHTML+='<p><input onclick=\'build_level_from_JSON(false);\' type=button value=\''+messages.try_again[lng]+'\'>';


    document.getElementById('score').innerHTML+='<p><input onClick="location.href=\''+BASEURL+'/logout\';" type=button value=\''+messages.logout[lng]+'\'>';

    document.getElementById('score').innerHTML+='<p>'+messages.another_level[lng];
    document.getElementById('score').appendChild( get_level_selection("boxes") );

}

var next_level = function(item) {
    //var selector = $( '#level-select' ); //
    document.getElementById('level-select').selectedIndex = document.getElementById('level-select').selectedIndex + 1 ;
    //selector.selectedIndex = ( selector.selectedIndex + 1 );  

    sceneName = document.getElementById('level-select').value;
    window.location.hash = sceneName;
  
    build_level(levels[ sceneName ].level);     
    update_level_editor( levels[ sceneName ].level );
}


//
// Game functions:
//

debug_score=0;

var handle_playing = function(word, node, callback) { 		    
    //console.log("handle_playing start for item.id", node.id);

    

    node.word = word;
    
    

    if (typeof(node.audioelement) == 'undefined') {
	
	console.log("audioelements[",word,"] does not exist for node.id", node.id);
	audiourl=BASEURL + '/audio_files/' + word + '.mp3';
	node.audioelement = new Audio();
	
	console.log("Got audio:", node.audioelement);

	var audio_ok = true;

	node.audioelement.oncanplaythrough = function () { 
	    document.getElementById('score').innerHTML=messages.say_this[lng]+' <br><b>'+ format_word(word) + '</b>'; //"apple";

	    document.getElementById('waiting_for_server').style.visibility = "hidden";
	    document.getElementById('speaker_animation').style.visibility = "visible";

	    var promise = node.audioelement.play();
	    if(promise instanceof Promise) {
		promise.catch(function(error) {		    
		    // Check if it is the right error
		    if(error.name == "NotAllowedError") {
			audio_ok = false;
			document.getElementById('speaker_animation').style.visibility = "hidden";
			document.getElementById('score').innerHTML=messages.browser_sound_permission[lng];
			document.getElementById('score').innerHTML+= messages.browser_sound_fix[lng];
			document.getElementById('score').innerHTML+= "<p>chrome://flags/#disable-gesture-requirement-for-media-playback";
		    } else {
			throw error;
		    }
		});
	    }
	    
	    setTimeout( function() {
		if (audio_ok) {
		    //console.log("handle_playing 2 for node.id", node.id);		    
		    document.getElementById('speaker_animation').style.visibility = "hidden";
		    get_score_for_word(word, node, callback);
		} 
	    }, node.audioelement.duration*1000 -50 );
	    
	};
	node.audioelement.src=audiourl;
	node.audioelement.load();

    }
    else {
	document.getElementById('score').innerHTML='Say this word or phrase: <br><b>'+ word + '</b>'; //"apple";
	document.getElementById('waiting_for_server').style.visibility = "hidden";
	//console.log("audioelements[",word,"] exists for node.id", node.id);
	node.audioelement.oncanplay = null;
	node.audioelement.play();
	//console.log("set timeout for handle_playing 2 for node.id", node.id);
	setTimeout( function() {
	    //console.log("handle_playing 2 for node.id", node.id);
	    document.getElementById('speaker_animation').style.visibility = "hidden";
	    get_score_for_word(word, node, callback);
	}, node.audioelement.duration*1000 - 50 );
    }
}



var handle_scoring = function(node) {
    //console.log("handle scoring node id",node.id);

    pause_game();

    document.getElementById('scorewrapper').style.visibility = "visible";
    document.getElementById('scorecard').style.visibility = "visible";
    document.getElementById('waiting_for_server').style.visibility = "visible";
    
    if (node.word) {
	var word = node.word;
	handle_playing(word, node, apply_scoring);
    }
    else {
	document.getElementById('score').innerHTML= messages.getting_word[lng];
	get_word_to_score(node, apply_scoring, handle_playing);

    }
}



var apply_scoring = function(node, score) {

    //console.log("apply scoring node id",node.id);

    if (score < 0) {
	txt = error_codes[score.toString()][lng];
	document.getElementById('score').innerHTML ='<p style="font-size:1.5em">'+txt+'</p>';
	setTimeout(function( ){ 
	    document.getElementById('scorewrapper').style.visibility = "hidden";
	    document.getElementById('scorecard').style.visibility = "hidden";
	    continue_game(score, 0);
	}, 3300);
    }
    else {
	txt = "";
	for (i=0; i < score; i++) txt +=  "\u2605";

	document.getElementById('score').innerHTML +='<br><p style="font-size:3em">'+txt+'</p>';

	extra_stars = score - node.score;

	//console.log("node id:", node.id + "extra stars:", extra_stars); 
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
	}
	if (score > 0 ) {
	    // Apply force!
	    //Matter.Body.applyForce(item, item.position, Matter.Vector.create(0, getScoreForce(score)) );
	}

    }
}


var addStars = function(node, score) {
    //console.log("addStars for node",node.id);


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
    node.score = score;    
}


var update_star_count = function() {
    starCount= starBodies.length;
    document.getElementById('starcount').innerHTML = starCount;
}

var format_word = function(word) {    
    word = word.replace(/_/g,' ');
    word = word.replace(/ i /, 'I');
    return word.charAt(0).toUpperCase() + word.slice(1);
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

    
    var toolbarwi = 0,
    toolbarhe = 0,
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

    document.getElementById('scorecard').style.top = Math.max(0, (( h - 400 )/2)) + "px";
    document.getElementById('scorecard').style.left = Math.max(0, (( w - 400 )/2)) + "px";

    resized = true;

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
	opt.innerHTML = key+ " - " + levels[key].level.meta.levelname; // whatever property it has
	
	// then append it to the select element
	levelselector.appendChild(opt);
});

var opt = document.createElement("option");
opt.value= "levelEditor";
opt.innerHTML = "Edit this level" ; // whatever property it has
levelselector.appendChild(opt);


var get_level_selection = function(type) {

    lcounter = 1;
    if (type == "boxes") {
	selector = document.createElement("div");
	selector.id = "levelselect-box";
	Object.keys(levels).forEach ( function(key) {
	    var opt = document.createElement("button");
	    opt.className = "level";
	    opt.id = "levelselect-"+key;
	    opt.innerHTML = key; //+ " - " + levels[key].meta.levelname; // whatever property it has	   
	    opt.innerHTML = (lcounter++) + '. ' + levels[key].level.meta.levelname; // whatever property it has	   
	    opt.innerHTML += "<br>";//+"\u2606"+"\u2606"+"\u2606"+"\u2606"+"\u2606";
	    // then append it to the select element
	    opt.onclick = function() {console.log("Pressed", key); switch_to_level(key)};
	    selector.appendChild(opt);
	});
	
	// Get level scores from server:

	var get_scores_xhr = new XMLHttpRequest();
	// Open the connection.
	get_scores_xhr.open('GET', BASEURL+'/level_scores', true);
	get_scores_xhr.setRequestHeader("x-siak-user", username);
	get_scores_xhr.setRequestHeader("x-siak-password", password);

	get_scores_xhr.onreadystatechange = function(e) {	    
            if ( 4 == this.readyState ) {
		if (get_scores_xhr.status === 200) {

		    scores = JSON.parse(get_scores_xhr.responseText);
		    console.log(scores);
		    scores.forEach( function(l) {
			console.log(l.level);
			key = l.level;
			oid =  "levelselect-"+key;
			if (document.getElementById(oid)) {
			    console.log("exists:",oid);
			    for (n = 1; n <= l.overall_performance; n++) 	
				document.getElementById(oid).innerHTML+='\u2605';
			    for (n = l.overall_performance+1; n <= 5; n++)
				document.getElementById(oid).innerHTML+='\u2606';
			}
			else {
			    console.log("does not exist:",oid);
			}
		    });
		} else if (get_scores_xhr.status === 502) {
		    server_ok=false;
		    logging.innerHTML += "<br>-2 Problem: Server down!";
		    
		} else {
		    logging.innerHTML += '<br>-2 Problem: Server responded '+get_scores_xhr.status;
		}
	    }
	    else {
		dummy = 1;
		//console.log("get_scores_xhr in state "+this.readyState);
	    }
	};
	get_scores_xhr.send()

	return selector;
    }
    else {
	selector = document.createElement("select");
	selector.id = "selector";

	Object.keys(levels).forEach ( function(key) {
	    var opt = document.createElement("option");
	    opt.value= key;
	    opt.innerHTML = key+ " - " + levels[key].level.meta.levelname; // whatever property it has
	    
	    // then append it to the select element
	    selector.appendChild(opt);
	});

	selector.value = sceneName;
	document.getElementById('leveljson').value =  JSON.stringify(levels[sceneName].level, null, 2);
	update_level_editor();

	selector.addEventListener('change', function(e) {

	    if (e.target.value == "levelEditor") {
		
		editMode = true;
		$('#editor').show();
		screen_size_setup();
	    }
	    else {
		sceneName = e.target.value;
		window.location.hash = sceneName;
		build_level(levels[ sceneName ].level);     
		update_level_editor( levels[ sceneName ].level );
		//document.getElementById('leveljson').value =  JSON.stringify(levels[sceneName], null, 2);
		//update_level_editor();
	    }
	});
	return selector;
    }
}

var switch_to_level = function(levelkey) {

    tell_the_server_we_are_on_a_new_level( levelkey );

}


var send_level_score = function(levelkey, starscore, timescore, overall_performance) {

    var set_scores_xhr = new XMLHttpRequest();

    scoresdiv = document.createElement("div");
    scoresdiv.innerHTML = "<h4>"+ messages.high_scores[lng] + "</h4>";
    scoresdiv.id =  "highscores";
    scores = document.createElement("ol");
    scores.id = "highscores-box";

    scoresdiv.appendChild(scores);

    //var formData = new FormData();   
    //formData.append("star_score", starscore);
    //formData.append("time_score", timescore);
    //formData.append("overall_performance", overall_performance );
    //formData.append("level_key", levelkey);
    
    formData = { level_key: levelkey,
		 star_score: starscore,
		 time_score: timescore,
		 overall_performance: overall_performance };


    // Open the connection.
    set_scores_xhr.open('POST', BASEURL+'/level_scores', true);
    set_scores_xhr.setRequestHeader("x-siak-user", username);
    set_scores_xhr.setRequestHeader("x-siak-password", password);
    set_scores_xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    set_scores_xhr.onreadystatechange = function(e) {	    
        if ( 4 == this.readyState ) {
	    if (set_scores_xhr.status === 200) {
		console.log("score sent ok!");
		
		
		high_scores = JSON.parse(set_scores_xhr.responseText);

		high_scores.forEach( function(item) {
		    var sc = document.createElement("li");		
		    sc.innerHTML = (item.star_score + item.time_score)+" "+ item.user ;
		    if (item.user == document.getElementById("username").value)
			sc.innerHTML = "<b>"+sc.innerHTML+"</b>";
		    scores.appendChild(sc);
		});
		
		console.log("High scores: ",high_scores)

	    } else if (set_scores_xhr.status === 502) {
		server_ok=false;
		logging.innerHTML += "<br>-2 Problem: Server down!";
		
	    } else {
		logging.innerHTML += '<br>-2 Problem: Server responded '+set_scores_xhr.status;
	    }
	}
	else {
	    dummy = 1;
	    //console.log("set_scores_xhr in state "+this.readyState);
	}
    };
    set_scores_xhr.send(JSON.stringify(formData));

    return scoresdiv;
}


var get_high_scores = function(levelkey) {


    scoresdiv = document.createElement("div");
    scoresdiv.innerHTML = "<h4>"+ messages.high_scores[lng] + "</h4>";
    scoresdiv.id =  "highscores";
    scores = document.createElement("ol");
    scores.id = "highscores-box";

    scoresdiv.appendChild(scores);

    //Object.keys(levels).forEach ( function(key) {
    //	var opt = document.createElement("button");
    //	opt.className = "level";
    //	opt.id = "levelselect-"+key;
    //	opt.innerHTML = key; //+ " - " + levels[key].meta.levelname; // whatever property it has	   
    //	opt.innerHTML = (lcounter++) + '. ' + levels[key].level.meta.levelname; // whatever property it has	   
    //	opt.innerHTML += "<br>";//+"\u2606"+"\u2606"+"\u2606"+"\u2606"+"\u2606";
    // then append it to the select element
    //	opt.onclick = function() {console.log("Pressed", key); switch_to_level(key)};

    //   });

    var get_scores_xhr = new XMLHttpRequest();
    // Open the connection.
    get_scores_xhr.open('GET', BASEURL+'/high_scores/'+ levelkey, true);
    
    get_scores_xhr.onreadystatechange = function(e) {	    
        if ( 4 == this.readyState ) {
	    if (get_scores_xhr.status === 200) {

		high_scores = JSON.parse(get_scores_xhr.responseText);

		high_scores.forEach( function(item) {
		    var sc = document.createElement("li");
		    sc.innerHTML = (item.star_score + item.time_score)+" "+ item.user ;
		    scores.appendChild(sc);
		});
		
		console.log("High scores: ",high_scores)
		
	    } else if (get_scores_xhr.status === 502) {
		server_ok=false;
		logging.innerHTML += "<br>-2 Problem: Server down!";
		
	    } else {
		logging.innerHTML += '<br>-2 Problem: Server responded '+get_scores_xhr.status;
	    }
	}
	else {
	    dummy = 1;
	    //console.log("set_scores_xhr in state "+this.readyState);
	}
    }
    
    get_scores_xhr.send();
    
    return scoresdiv;
    
}

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


    // initialise game selector
    levelSelect.value = sceneName;
    document.getElementById('leveljson').value =  JSON.stringify(levels[sceneName].level, null, 2);
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
	    build_level(levels[ sceneName ].level);     
	    update_level_editor( levels[ sceneName ].level );
	    siak_level = levels[ sceneName ].wordlist;
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
	document.getElementById('score').innerHTML=messages.your_browser[lng]+ ' ' + browser[0]+ ' ' + messages.version[lng] + ' '+ browser[1]+'. ';
	document.getElementById('score').innerHTML+= messages.recommend_chrome[lng];
	document.getElementById('score').innerHTML+='<p><input onclick=\'switch_to_level("'+sceneName+'");\' type=button value=\'' + messages.try_anyway[lng]+ '\'>';
    }
    
    else 
	tell_the_server_we_are_on_a_new_level( sceneName );

}
