(function() {

    var _isBrowser = typeof window !== 'undefined' && window.location,
        _useInspector = _isBrowser && window.location.hash.indexOf('-inspect') !== -1,
        _isMobile = _isBrowser && /(ipad|iphone|ipod|android)/gi.test(navigator.userAgent),
        _isAutomatedTest = !_isBrowser || window._phantom;

    var Matter = _isBrowser ? window.Matter : require(BASEURL+'/js/fysiak/matter-dev.js');

    var Game = {};
    Matter.Game = Game;



    // reset game timer:

    var game_time_left = 0;
    var timer_running = false;
    var timer_instance;

    if (!_isBrowser) {
        module.exports = Game;
        window = {};
    }

    // Matter aliases
    var Body = Matter.Body,
        Levels = Matter.Levels,
        Engine = Matter.Engine,
        World = Matter.World,
        Common = Matter.Common,
        Bodies = Matter.Bodies,
        Events = Matter.Events,
        Mouse = Matter.Mouse,
        MouseConstraint = Matter.MouseConstraint,
        Runner = Matter.Runner;

    // MatterTools aliases
    /*
    if (window.MatterTools) {
        var Gui = MatterTools.Gui,
            Inspector = MatterTools.Inspector;
    }
    */


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

	/*
        // create a Matter.Gui
        if (!_isMobile && Gui) {	   
            game.gui = Gui.create(game.engine, game.runner);

            // need to add mouse constraint back in after gui clear or load is pressed
            Events.on(game.gui, 'clear load', function() {
                game.mouseConstraint = MouseConstraint.create(game.engine);
                World.add(game.engine.world, game.mouseConstraint);
            });

            // need to rebind mouse on render change
            Events.on(game.gui, 'setRenderer', function() {
                Mouse.setElement(game.mouseConstraint.mouse, game.engine.render.canvas);
            });
        }
	
        // create a Matter.Inspector
        if (!_isMobile && Inspector && _useInspector) {
            game.inspector = Inspector.create(game.engine, game.runner);

            Events.on(game.inspector, 'import', function() {
                game.mouseConstraint = MouseConstraint.create(game.engine);
                World.add(game.engine.world, game.mouseConstraint);
            });

            Events.on(game.inspector, 'play', function() {
                game.mouseConstraint = MouseConstraint.create(game.engine);
                World.add(game.engine.world, game.mouseConstraint);
            });

            Events.on(game.inspector, 'selectStart', function() {
                game.mouseConstraint.constraint.render.visible = false;
            });

            Events.on(game.inspector, 'selectEnd', function() {
                game.mouseConstraint.constraint.render.visible = true;
            });
        }
	*/
        // go fullscreen when using a mobile device

	/*
        if (_isMobile) {
            var body = document.body;

            body.className += ' is-mobile';
            game.engine.render.canvas.addEventListener('touchstart', Game.fullscreen);

            var fullscreenChange = function() {
                var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;

                // delay fullscreen styles until fullscreen has finished changing
                setTimeout(function() {
                    if (fullscreenEnabled) {
                        body.className += ' is-fullscreen';
                    } else {
                        body.className = body.className.replace('is-fullscreen', '');
                    }
                }, 2000);
            };

            document.addEventListener('webkitfullscreenchange', fullscreenChange);
            document.addEventListener('mozfullscreenchange', fullscreenChange);
            document.addEventListener('fullscreenchange', fullscreenChange);
        }
*/
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
        /*Game.setUpdateSourceLink(game.sceneName);*/
        
        levelSelect.addEventListener('change', function(e) {
            Game.reset(game);
            Game.setScene(game,game.sceneName = e.target.value);

            if (game.gui) {
                Gui.update(game.gui);
            }
            
            var scrollY = window.scrollY;
            window.location.hash = game.sceneName;
            window.scrollY = scrollY;
            /*Game.setUpdateSourceLink(game.sceneName);*/
        });
        
        levelReset.addEventListener('click', function(e) {
            Game.reset(game);
            Game.setScene(game, game.sceneName);

            if (game.gui) {
                Gui.update(game.gui);
            }

            /*Game.setUpdateSourceLink(game.sceneName);*/
        });
    };

    /*Game.setUpdateSourceLink = function(sceneName) {
        var gameViewSource = document.getElementById('game-view-source'),
            sourceUrl = 'https://github.com/liabru/matter-js/blob/master/examples';
        gameViewSource.setAttribute('href', sourceUrl + '/' + sceneName + '.js');
    };*/

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
	/*        var _fullscreenElement = game.engine.render.canvas;
        
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
            if (_fullscreenElement.requestFullscreen) {
                _fullscreenElement.requestFullscreen();
            } else if (_fullscreenElement.mozRequestFullScreen) {
                _fullscreenElement.mozRequestFullScreen();
            } else if (_fullscreenElement.webkitRequestFullscreen) {
                _fullscreenElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }*/
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

/*        var offset = 5;
        World.add(world, [
            Bodies.rectangle(400, -offset, 800.5 + 2 * offset, 50.5, { isStatic: true }),
            Bodies.rectangle(400, 600 + offset, 800.5 + 2 * offset, 50.5, { isStatic: true }),
            Bodies.rectangle(800 + offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true }),
            Bodies.rectangle(-offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true })
            ]);*/

        if (game.mouseConstraint) {
            World.add(world, game.mouseConstraint);
        }




	/* Game events for the fysiak game: */

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
            /*if (_isMobile) {
                renderOptions.showDebug = true;
            }*/
        }

	document.getElementById('scorewrapper').style.visibility = "hidden";
	document.getElementById('scorecard').style.visibility = "hidden";

    };

})();


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



