
levels = {
    "L0-0" :
    {
	"meta": {
	    "gravity": [
		"0",
		"-9.82"
	    ],
	    "levelname": "Intro 0: Basics",
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
	    "levelname": "Intro 1: Connections",
	    "author": "Reima",
	    "timelimit": "15",
	    "starmass": "5"
	},
	"nodes": {
	    "START": {
		"position": [
		    10,
		    6
		],
		"mass": 5,
		"type": "start"
	    },
	    "EXIT": {
		"position": [
			-3,
		    6
		],
		"mass": 5,
		"type": "exit"
	    },
	    "B": {
		"position": [
		    5,
		    78
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
		"from": "EXIT",
		"to": "A",
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
		"angle": -0.1
	    }
	]
    },



    "L0-2": 
    {
	"meta": {
	    "gravity": [
		"0",
		"-9.82"
	    ],
	    "levelname": "Intro 2: Structure types",
	    "author": "Reima",
	    "timelimit": "30",
	    "starmass": "5"
	},
	"nodes": {
	    "START": {
		"position": [
			-10,
		    0
		],
		"mass": 5,
		"type": "start"
	    },
	    "A": {
		"position": [
			-5,
			-5
		],
		"mass": 5,
		"type": "word"
	    },
	    "B": {
		"position": [
			-5,
		    5
		],
		"mass": 5,
		"type": "word"
	    },
	    "C": {
		"position": [
		    0,
		    0
		],
		"mass": 5,
		"type": "word"
	    },
	    "D": {
		"position": [
		    5,
		    0
		],
		"mass": 5,
		"type": "word"
	    },
	    "E": {
		"position": [
		    10,
			-5
		],
		"mass": 5,
		"type": "word"
	    },
	    "F": {
		"position": [
		    10,
		    5
		],
		"mass": 5,
		"type": "word"
	    },
	    "EXIT": {
		"position": [
		    15,
		    0
		],
		"mass": 5,
		"type": "exit"
	    },
	    "BONUS1": {
		"position": [
			-16,
			-3
		],
		"mass": 5,
		"type": "word"
	    },
	    "BONUS2": {
		"position": [
			-20,
		    0
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
		"type": "fixed"
	    },
	    {
		"options": {
		    "stiffness": "1000"
		},
		"from": "A",
		"to": "C",
		"type": "fixed"
	    },
	    {
		"options": {
		    "stiffness": "1000"
		},
		"from": "START",
		"to": "B",
		"type": "fixed"
	    },
	    {
		"options": {
		    "stiffness": "1000"
		},
		"from": "B",
		"to": "C",
		"type": "fixed"
	    },
	    {
		"options": {
		    "stiffness": "1000"
		},
		"from": "A",
		"to": "B",
		"type": "fixed"
	    },
	    {
		"options": {
		    "stiffness": "100"
		},
		"from": "C",
		"to": "D",
		"type": "spring"
	    },
	    {
		"options": {
		    "stiffness": "100"
		},
		"from": "D",
		"to": "E",
		"type": "spring"
	    },
	    {
		"options": {
		    "stiffness": "100"
		},
		"from": "D",
		"to": "F",
		"type": "spring"
	    },
	    {
		"options": {
		    "stiffness": "100"
		},
		"from": "F",
		"to": "EXIT",
		"type": "spring"
	    },
	    {
		"options": {
		    "stiffness": "100"
		},
		"from": "E",
		"to": "EXIT",
		"type": "spring"
	    },
	    {
		"options": {
		    "stiffness": "100"
		},
		"from": "E",
		"to": "F",
		"type": "spring"
	    },
	    {
		"options": {
		    "stiffness": "1000"
		},
		"from": "BONUS1",
		"to": "BONUS2",
		"type": "fixed"
	    }
	],
	"statics": [
	    {
		"position": [
		    0,
			-17
		],
		"h": 20,
		"w": 60,
		"angle": 0.07
	    },
	    {
		"position": [
		    0,
			-5
		],
		"h": 3,
		"w": 3,
		"angle": 0.07
	    },
	    {
		"position": [
		    4,
			-4
		],
		"h": 3,
		"w": 3,
		"angle": 0.07
	    },
	    {
		"position": [
			-20,
			-6
		],
		"h": 3,
		"w": 3,
		"angle": 0.07
	    }
	]
    },

    "L1-a": 
    {
	"meta": {
	    "gravity": [
		"0",
		"-9.82"
	    ],
	    "levelname": "Atapulco",
	    "author": "Reima",
	    "timelimit": "16",
	    "starmass": "5"
	},
	"nodes": {
	    "START": {
		"position": [
			-21,
		    16
		],
		"mass": 5,
		"type": "start"
	    },
	    "EXIT": {
		"position": [
		    20,
		    12
		],
		"mass": 5,
		"type": "exit"
	    },
	    "B": {
		"position": [
			-16,
		    16
		],
		"mass": 5,
		"type": "word"
	    },
	    "C": {
		"position": [
			-26,
		    16
		],
		"mass": 5,
		"type": "word"
	    },
	    "D": {
		"position": [
			-21,
		    12
		],
		"mass": 5,
		"type": "word"
	    },
	    "PIVOT": {
		"position": [
		    0,
		    0
		],
		"mass": 5,
		"type": "word"
	    },
	    "LLEVER": {
		"position": [
			-10,
		    0
		],
		"mass": 5,
		"type": "word"
	    },
	    "RLEVER": {
		"position": [
		    17,
		    0
		],
		"mass": 5,
		"type": "word"
	    },
	    "CATAPULT": {
		"position": [
		    12,
			-10
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
		"type": "fixed"
	    },
	    {
		"options": {
		    "stiffness": "1000"
		},
		"from": "START",
		"to": "C",
		"type": "fixed"
	    },
	    {
		"options": {
		    "stiffness": "1000"
		},
		"from": "START",
		"to": "D",
		"type": "fixed"
	    },
	    {
		"options": {
		    "stiffness": "1000"
		},
		"from": "C",
		"to": "D",
		"type": "fixed"
	    },
	    {
		"options": {
		    "stiffness": "1000"
		},
		"from": "B",
		"to": "C",
		"type": "fixed"
	    },
	    {
		"options": {
		    "stiffness": "1000"
		},
		"from": "PIVOT",
		"to": "LLEVER",
		"type": "fixed"
	    },
	    {
		"options": {
		    "stiffness": "1000"
		},
		"from": "PIVOT",
		"to": "RLEVER",
		"type": "fixed"
	    },
	    {
		"options": {
		    "stiffness": "1000"
		},
		"from": "LLEVER",
		"to": "RLEVER",
		"type": "fixed"
	    },
	    {
		"options": {
		    "stiffness": "100"
		},
		"from": "CATAPULT",
		"to": "RLEVER",
		"type": "spring"
	    }
	],
	"statics": [
	    {
		"position": [
		    20,
			-25
		],
		"h": 17,
		"w": 40,
		"angle": 0
	    },
	    {
		"position": [
		    0,
			-8
		],
		"h": 4,
		"w": 3,
		"angle": 0
	    },
	    {
		"position": [
			-2.7,
			-4
		],
		"h": 1,
		"w": 1,
		"angle": 0
	    },
	    {
		"position": [
		    2.7,
			-4
		],
		"h": 1,
		"w": 1,
		"angle": 0
	    },
	    {
		"position": [
			-23,
		    8
		],
		"h": 2,
		"w": 5,
		"angle": 0
	    },
	    {
		"position": [
		    18.5,
		    8
		],
		"h": 2,
		"w": 3,
		"angle": 0
	    }
	]
    }
}
