
levels = {
    "L0-0" :
{
  "meta": {
    "gravity": [
      "0",
      "-9.82"
    ],
    "levelname": "Intro 0",
    "author": "Reima",
    "timelimit": "20",
    "starmass": "5"
  },
  "nodes": {
    "START": {
      "position": [
        -15,
        6
      ],
      "mass": 5,
      "type": "start"
    },
    "EXIT": {
      "position": [
        15,
        6
      ],
      "mass": 5,
      "type": "exit"
    },
    "A": {
      "position": [
        -5,
        6
      ],
      "mass": 5,
      "type": "word"
    },
    "B": {
      "position": [
        5,
        6
      ],
      "mass": 5,
      "type": "word"
    }
  },
  "edges": [
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "START",
      "to": "A",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "A",
      "to": "B",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "B",
      "to": "EXIT",
      "type": "spring"
    }
  ],
  "statics": [
    {
      "position": [
        0,
        -15
      ],
      "h": 20,
      "w": 60,
      "angle": 0
    }
  ]
},
"L0-1": 
{
  "meta": {
    "gravity": [
      "0",
      "-9.82"
    ],
    "levelname": "Intro 1",
    "author": "Reima",
    "timelimit": "150",
    "starmass": "5"
  },
  "nodes": {
    "START": {
      "position": [
        -18,
        0
      ],
      "mass": 5,
      "type": "start"
    },
    "EXIT": {
      "position": [
        18,
        0
      ],
      "mass": 5,
      "type": "exit"
    },
    "A": {
      "position": [
        -8,
        12
      ],
      "mass": 5,
      "type": "word"
    },
    "B": {
      "position": [
        -8,
        -12
      ],
      "mass": 5,
      "type": "start"
    },
    "C": {
      "position": [
        8,
        12
      ],
      "mass": 5,
      "type": "word"
    },
    "D": {
      "position": [
        8,
        -12
      ],
      "mass": 5,
      "type": "word"
    }
  },
  "edges": [
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "START",
      "to": "A",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "START",
      "to": "B",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "A",
      "to": "C",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "A",
      "to": "D",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "B",
      "to": "C",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "B",
      "to": "D",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "C",
      "to": "EXIT",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "D",
      "to": "EXIT",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "A",
      "to": "B",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "C",
      "to": "D",
      "type": "spring"
    }
  ],
  "statics": [
    {
      "position": [
        0,
        -15
      ],
      "h": 2,
      "w": 40,
      "angle": 0
    }
  ]
},

    "L0-2": {
	"meta": {
	    "levelname": "Intro 2",
	    "author" : "Reima",
	    "date" : "9 Nov 2016",
	    "timelimit" : 15,
	    "starmass": "5",
	    "gravity" : [0, -9.82]
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
    },
"L0-3":
{
  "meta": {
    "gravity": [
      "0",
      "-9.82"
    ],
    "levelname": "Intro 3",
    "author": "Reima",
    "timelimit": "15",
    "starmass": "5"
  },
  "nodes": {
    "START": {
      "position": [
        0.7,
        15.4
      ],
      "mass": 5,
      "type": "start"
    },
    "A": {
      "position": [
        1.7,
        29.4
      ],
      "mass": 5,
      "type": "exit"
    },
    "B": {
      "position": [
        -3.7,
        25.4
      ],
      "mass": 5,
      "type": "word"
    },
    "C": {
      "position": [
        0.7,
        25.4
      ],
      "mass": 5,
      "type": "word"
    },
    "D": {
      "position": [
        -3.7,
        15.4
      ],
      "mass": 5,
      "type": "word"
    },
    "EXIT": {
      "position": [
        2,
        35.3
      ],
      "mass": 5,
      "type": "word"
    }
  },
  "edges": [
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "START",
      "to": "B",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "C",
      "to": "EXIT",
      "type": "spring"
    }
  ],
  "statics": [
    {
      "position": [
        2,
        -2
      ],
      "h": 2,
      "w": 8,
      "angle": 1
    },
    {
      "position": [
        -7,
        -4
      ],
      "h": 2,
      "w": 6,
      "angle": -0.5
    },
    {
      "position": [
        8,
        -7
      ],
      "h": 1,
      "w": 9,
      "angle": -0.7
    }
  ]
}

}
