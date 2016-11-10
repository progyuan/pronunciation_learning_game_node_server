
levels = {
    "L0-3": {
	"meta": {
	    "levelname": "Intro 3",
	    "author" : "Reima",
	    "date" : "9 Nov 2016",
	    "timelimit" : 15
	},
	"nodes" : {
	    "START": { position: [ 0.7  , 15.4   ], mass: 5 , type: "start" },
	    "EXIT": { position: [ -1.7  , 29.4  ], mass: 5 , type: "exit" },
	    "A": { position: [ -3.7  , 25.4  ], mass: 5 , type: "word" },
	    "B": { position: [ 0.7  , 25.4  ], mass: 5 , type: "word" },
	    "C": { position: [ -3.7  , 15.4  ], mass: 5 , type: "word" },
	},
	"edges" : [
	        { from: "START", to: "A", type: "spring", options: {stiffness: 1000}  },
		  { from: "START", to: "B", type: "spring", options: {stiffness: 1000}  }/*,
		  { from: "A", to: "B", type: "spring", options: {stiffness: 1000}  },     
		  { from: "B", to: "EXIT", type: "spring", options: {stiffness: 1000}  },     
		  { from: "A", to: "EXIT", type: "spring", options: {stiffness: 1000}  },     */
	],
	"statics" : [
	    { "position": [ 2.0, -2.0], "h": 2.0, "w": 8.0 , "angle": 1 },
	    { "position": [ -7.0, -4.0], "h": 2.0, "w": 6.0 , "angle": -0.5 },	
	]
    }

}
