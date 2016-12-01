level_super_basic =
    {
	"meta": {
	    "gravity": [
		"0",
		"-9.82"
	    ],
	    "levelname": "Basics",
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
		"type": "start"
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
    };
level_easy_connections = 
{
  "meta": {
    "gravity": [
      "0",
      "-9.82"
    ],
    "levelname": "Connections",
    "author": "Reima",
    "timelimit": "15",
    "starmass": "5"
  },
  "nodes": {
    "START": {
      "position": [
        4,
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
        2,
        19
      ],
      "mass": 5,
      "type": "word"
    },
    "zmjmj": {
      "position": [
        11,
        6
      ],
      "mass": 5,
      "type": "word"
    },
    "jwisf": {
      "position": [
        21,
        6
      ],
      "mass": 5,
      "type": "word"
    },
    "601r3": {
      "position": [
        30,
        6
      ],
      "mass": 5,
      "type": "start"
    },
    "b10ye": {
      "position": [
        -22,
        12
      ],
      "mass": 5,
      "type": "start"
    },
    "01bka": {
      "position": [
        -19,
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
      "w": 80,
      "angle": 0.01
    }
  ]
},

level_hard_and_soft =  

{
  "meta": {
    "gravity": [
      "0",
      "-9.82"
    ],
    "levelname": "Hard & Soft",
    "author": "Reima",
    "timelimit": "60",
    "starmass": "5"
  },
  "nodes": {
    "START": {
      "position": [
        -15,
        3
      ],
      "mass": 5,
      "type": "start"
    },
    "A1": {
      "position": [
        -11,
        -2
      ],
      "mass": 5,
      "type": "word"
    },
    "A2": {
      "position": [
        -11,
        8
      ],
      "mass": 5,
      "type": "word"
    },
    "B1": {
      "position": [
        -4,
        -2
      ],
      "mass": 5,
      "type": "word"
    },
    "B2": {
      "position": [
        -4,
        8
      ],
      "mass": 5,
      "type": "word"
    },
    "C": {
      "position": [
        0,
        3
      ],
      "mass": 5,
      "type": "word"
    },
    "D1": {
      "position": [
        4,
        -2
      ],
      "mass": 5,
      "type": "word"
    },
    "D2": {
      "position": [
        4,
        8
      ],
      "mass": 5,
      "type": "word"
    },
    "E1": {
      "position": [
        11,
        -2
      ],
      "mass": 5,
      "type": "exit"
    },
    "E2": {
      "position": [
        11,
        8
      ],
      "mass": 5,
      "type": "word"
    },
    "EXIT": {
      "position": [
        15,
        3
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
      "to": "A1",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "START",
      "to": "A2",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "A1",
      "to": "A2",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "A1",
      "to": "B1",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "A2",
      "to": "B2",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "100"
      },
      "from": "B1",
      "to": "B2",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "100"
      },
      "from": "A1",
      "to": "B2",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "100"
      },
      "from": "B1",
      "to": "C",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "100"
      },
      "from": "B2",
      "to": "C",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "100"
      },
      "from": "C",
      "to": "D1",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "100"
      },
      "from": "C",
      "to": "D2",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "D1",
      "to": "E1",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "D2",
      "to": "E2",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "D1",
      "to": "E2",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "E1",
      "to": "EXIT",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "E2",
      "to": "EXIT",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "D1",
      "to": "D2",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "E1",
      "to": "E2",
      "type": "spring"
    }
  ],

 "statics": [
    {
      "position": [
        -20,
        -17
      ],
      "h": 20,
      "w": 30,
      "angle": -0.1
    },
    {
      "position": [
        20,
        -17
      ],
      "h": 20,
      "w": 30,
      "angle": 0.1
    }
  ]
};

level_gravity1 = 
    {
	"meta": {
	    "gravity": [
		"0",
		"-9.82"
	    ],
	    "levelname": "Gravity 2",
	    "author": "Reima",
	    "timelimit": "21",
	    "starmass": "5"
	},
	"nodes": {
	    "START": {
		"position": [
			-17,
		    10
		],
		"mass": 5,
		"type": "word"
	    },
	    "A": {
		"position": [
			-12,
		    10
		],
		"mass": 5,
		"type": "start"
	    },
	    "B": {
		"position": [
			-20,
		    15
		],
		"mass": 5,
		"type": "start"
	    },
	    "C": {
		"position": [
			-9,
		    15
		],
		"mass": 5,
		"type": "word"
	    },
	    "EXIT": {
		"position": [
		    25,
		    19
		],
		"mass": 5,
		"type": "exit"
	    },
	    "BONUS1": {
		"position": [
		    25,
		    200
		],
		"mass": 5,
		"type": "word"
	    },
	    "BONUS2": {
		"position": [
		    25,
		    400
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
		"to": "C",
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
		"from": "B",
		"to": "C",
		"type": "spring"
	    },
	    {
		"options": {
		    "stiffness": "1000"
		},
		"from": "A",
		"to": "B",
		"type": "fixed"
	    }
	],
	"statics": [
	    {
		"position": [
			-14.5,
		    7
		],
		"h": 3,
		"w": 6,
		"angle": 0
	    },
	    {
		"position": [
		    18,
			-12
		],
		"h": 5,
		"w": 55,
		"angle": 0.2
	    },
	    {
		"position": [
			-14.6,
			-11
		],
		"h": 3,
		"w": 4,
		"angle": 0.4
	    }
	]
    };


level_gravity2 = 
{
  "meta": {
    "gravity": [
      "0",
      "-9.82"
    ],
    "levelname": "Gravity 1",
    "author": "Reima",
    "timelimit": "20",
    "starmass": "5"
  },
  "nodes": {
    "START": {
      "position": [
        -20,
        -6
      ],
      "mass": 5,
      "type": "start"
    },
    "EXIT": {
      "position": [
        20,
        -6
      ],
      "mass": 5,
      "type": "exit"
    },
    "A": {
      "position": [
        -10,
        -5
      ],
      "mass": 5,
      "type": "word"
    },
    "B": {
      "position": [
        10,
        -5
      ],
      "mass": 5,
      "type": "word"
    },
    "C": {
      "position": [
        0,
        -6
      ],
      "mass": 5,
      "type": "word"
    },
    "BONUS": {
      "position": [
        -7,
        -14
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
      "to": "C",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "B",
      "to": "EXIT",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "B",
      "to": "C",
      "type": "spring"
    }
  ],
  "statics": [
    {
      "position": [
        -18,
        -12
      ],
      "h": 5,
      "w": 30,
      "angle": 0.3
    },
    {
      "position": [
        18,
        -12
      ],
      "h": 5,
      "w": 30,
      "angle": -0.3
    },
    {
      "position": [
        -7,
        -17
      ],
      "h": 1,
      "w": 3,
      "angle": 0
    }
  ]
};



level_structures_bonus = 
    {
	"meta": {
	    "gravity": [
		"0",
		"-9.82"
	    ],
	    "levelname": "Tilt!",
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
    



level_life_from_above = 
    {
	"meta": {
	    "gravity": [
		"0",
		"-9.82"
	    ],
	    "levelname": "Wait!",
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
    };

level_life_from_above2 = {
  "meta": {
    "gravity": [
      "0",
      "-9.82"
    ],
    "levelname": "Wait 2!",
    "author": "Reima",
    "timelimit": "20",
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
      "type": "word"
    },
    "B": {
      "position": [
        5,
        78
      ],
      "mass": 5,
      "type": "word"
    },
    "yn5qo": {
      "position": [
        -9,
        7
      ],
      "mass": 5,
      "type": "word"
    },
    "7fvht": {
      "position": [
        -15,
        8
      ],
      "mass": 5,
      "type": "word"
    },
    "0uifr": {
      "position": [
        -21,
        9
      ],
      "mass": 5,
      "type": "word"
    },
    "48w40": {
      "position": [
        -27,
        10
      ],
      "mass": 5,
      "type": "word"
    },
    "bau1c": {
      "position": [
        -18,
        340
      ],
      "mass": 5,
      "type": "word"
    },
    "h66f6": {
      "position": [
        -24,
        370
      ],
      "mass": 5,
      "type": "exit"
    }
  },
  "edges": [ ],
  "statics": [
    {
      "position": [
        0,
        -15
      ],
      "h": 20,
      "w": 120,
      "angle": -0.1
    }
  ]
};




level_reach_the_exit =

{
  "meta": {
    "gravity": [
      "0",
      "-9.82"
    ],
    "levelname": "Exit reach!",
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
      "type": "word"
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
      "type": "start"
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
      "type": "exit"
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
        "stiffness": "30"
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
};

level_atapult =
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
    };


level_connect_bom = 
{
  "meta": {
    "gravity": [
      "0",
      "-9.82"
    ],
    "levelname": "Conet bom",
    "author": "Reima",
    "timelimit": "25",
    "starmass": "5"
  },
  "nodes": {
    "START": {
      "position": [
        -1.8,
        -5
      ],
      "mass": 5,
      "type": "word"
    },
    "A": {
      "position": [
        5.2,
        -3
      ],
      "mass": 5,
      "type": "word"
    },
    "B": {
      "position": [
        2,
        -10
      ],
      "mass": 5,
      "type": "word"
    },
    "C": {
      "position": [
        7.5,
        -9.2
      ],
      "mass": 5,
      "type": "word"
    },
    "D": {
      "position": [
        11.2,
        -6.5
      ],
      "mass": 5,
      "type": "word"
    },
    "E": {
      "position": [
        14,
        -10
      ],
      "mass": 5,
      "type": "word"
    },
    "F": {
      "position": [
        14,
        -5
      ],
      "mass": 5,
      "type": "word"
    },
    "EXIT": {
      "position": [
        20,
        -8
      ],
      "mass": 5,
      "type": "exit"
    },
    "START2": {
      "position": [
        -17,
        20
      ],
      "mass": 5,
      "type": "start"
    },
    "BOM": {
      "position": [
        10,
        120
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
        10,
        -23
      ],
      "h": 20,
      "w": 20,
      "angle": 0.07
    },
    {
      "position": [
        14,
        8
      ],
      "h": 1,
      "w": 20,
      "angle": 0.7
    },
    {
      "position": [
        -19,
        5
      ],
      "h": 30,
      "w": 1,
      "angle": 0.3
    },
    {
      "position": [
        18,
        -8
      ],
      "h": 5,
      "w": 1,
      "angle": 0
    },
    {
      "position": [
        -11.8,
        -15
      ],
      "h": 10,
      "w": 0.2,
      "angle": 0.1
    },
    {
      "position": [
        -11,
        -12
      ],
      "h": 0.3,
      "w": 1.9,
      "angle": 0.1
    },
    {
      "position": [
        -15.9,
        -14
      ],
      "h": 0.3,
      "w": 3,
      "angle": 0.1
    },
    {
      "position": [
        -3,
        -14
      ],
      "h": 8,
      "w": 0.2,
      "angle": 0.3
    }
  ]
}

level_short_cuts = {
  "meta": {
    "gravity": [
      "0",
      "-9.82"
    ],
    "levelname": "Short cuts",
    "author": "Reima",
    "timelimit": "40",
    "starmass": "5"
  },
  "nodes": {
    "START": {
      "position": [
        19,
        20
      ],
      "mass": 5,
      "type": "start"
    },
    "A": {
      "position": [
        13,
        20
      ],
      "mass": 5,
      "type": "word"
    },
    "B": {
      "position": [
        16.5,
        25
      ],
      "mass": 5,
      "type": "word"
    },
    "C": {
      "position": [
        -0.5,
        -8
      ],
      "mass": 5,
      "type": "word"
    },
    "D": {
      "position": [
        3.5,
        0
      ],
      "mass": 5,
      "type": "exit"
    },
    "EXIT": {
      "position": [
        22,
        -12
      ],
      "mass": 5,
      "type": "word"
    },
    "F": {
      "position": [
        -8.5,
        4
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
      "from": "START",
      "to": "B",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "A",
      "to": "B",
      "type": "fixed"
    }
  ],
  "statics": [
    {
      "position": [
        10,
        12
      ],
      "h": 1,
      "w": 40,
      "angle": 0.1
    },
    {
      "position": [
        -5,
        -1
      ],
      "h": 1,
      "w": 18.5,
      "angle": -0.15
    },
    {
      "position": [
        -2,
        -12
      ],
      "h": 1,
      "w": 47,
      "angle": -0.15
    },
    {
      "position": [
        -0.5,
        -12
      ],
      "h": 1,
      "w": 2,
      "angle": 0
    },
    {
      "position": [
        3.5,
        -2.2
      ],
      "h": 1,
      "w": 2,
      "angle": 0
    },
    {
      "position": [
        22.5,
        -15.5
      ],
      "h": 1,
      "w": 3,
      "angle": 0
    },
    {
      "position": [
        -8.5,
        -0.3
      ],
      "h": 1,
      "w": 2,
      "angle": 0
    },
    {
      "position": [
        27.3,
        -10.6
      ],
      "h": 1,
      "w": 12,
      "angle": 0.9
    },
    {
      "position": [
        -15,
        1
      ],
      "h": 1,
      "w": 3,
      "angle": -0.5
    }
  ]
};



level_balancia = {
  "meta": {
    "gravity": [
      "0",
      "-9.82"
    ],
    "levelname": "Balancia",
    "author": "Reima",
    "timelimit": "21",
    "starmass": "5"
  },
  "nodes": {
    "START": {
      "position": [
        -22,
        8
      ],
      "mass": 5,
      "type": "word"
    },
    "A": {
      "position": [
        -18,
        0
      ],
      "mass": 5,
      "type": "start"
    },
    "B": {
      "position": [
        -15,
        5
      ],
      "mass": 5,
      "type": "start"
    },
    "C": {
      "position": [
        -12,
        3
      ],
      "mass": 5,
      "type": "word"
    },
    "EXIT": {
      "position": [
        22,
        -15
      ],
      "mass": 5,
      "type": "exit"
    },
    "BONUS1": {
      "position": [
        22,
        20
      ],
      "mass": 5,
      "type": "word"
    },
    "BONUS2": {
      "position": [
        22,
        400
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
      "to": "C",
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
      "from": "B",
      "to": "C",
      "type": "spring"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "A",
      "to": "B",
      "type": "fixed"
    }
  ],
  "statics": [
    {
      "position": [
        -12,
        -8
      ],
      "h": 2.3,
      "w": 65,
      "angle": -0.3
    },
    {
      "position": [
        25,
        -16.6
      ],
      "h": 2.4,
      "w": 16,
      "angle": 0.4
    },
    {
      "position": [
        23,
        -9
      ],
      "h": 1,
      "w": 7,
      "angle": 0
    }
  ]
}




level_libro = {
  "meta": {
    "gravity": [
      "0",
      "-9.82"
    ],
    "levelname": "Libro",
    "author": "Reima",
    "timelimit": "30",
    "starmass": "5"
  },
  "nodes": {
    "M": {
      "position": [
        0,
        4
      ],
      "mass": 5,
      "type": "start"
    },
    "L": {
      "position": [
        -9,
        4
      ],
      "mass": 5,
      "type": "word"
    },
    "LL": {
      "position": [
        -18,
        4
      ],
      "mass": 5,
      "type": "word"
    },
    "R": {
      "position": [
        9,
        4
      ],
      "mass": 5,
      "type": "word"
    },
    "RR": {
      "position": [
        18.1,
        4
      ],
      "mass": 5,
      "type": "word"
    },
    "U": {
      "position": [
        0,
        9.5
      ],
      "mass": 5,
      "type": "word"
    },
    "UU": {
      "position": [
        0,
        15
      ],
      "mass": 5,
      "type": "word"
    },
    "EXIT": {
      "position": [
        -4,
        -14
      ],
      "mass": 5,
      "type": "exit"
    },
    "BONUS": {
      "position": [
        4,
        -14
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
      "from": "M",
      "to": "L",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "L",
      "to": "LL",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "M",
      "to": "R",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "R",
      "to": "RR",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "M",
      "to": "U",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "U",
      "to": "UU",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "L",
      "to": "U",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "LL",
      "to": "UU",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "R",
      "to": "U",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "RR",
      "to": "UU",
      "type": "fixed"
    },
    {
      "options": {
        "stiffness": "1000"
      },
      "from": "LL",
      "to": "RR",
      "type": "fixed"
    }
  ],
  "statics": [
    {
      "position": [
        0,
        0.25
      ],
      "h": 0.5,
      "w": 3,
      "angle": 0
    },
    {
      "position": [
        -2.35,
        2.5
      ],
      "h": 3,
      "w": 0.5,
      "angle": 0
    },
    {
      "position": [
        2.35,
        2.5
      ],
      "h": 3,
      "w": 0.5,
      "angle": 0
    },
    {
      "position": [
        -4,
        -17
      ],
      "h": 0.5,
      "w": 3,
      "angle": 0
    },
    {
      "position": [
        0,
        4.75
      ],
      "h": 0.5,
      "w": 3,
      "angle": 0
    },
    {
      "position": [
        -1.7,
        -14.8
      ],
      "h": 2,
      "w": 0.5,
      "angle": 0
    },
    {
      "position": [
        1.7,
        -14.8
      ],
      "h": 2,
      "w": 0.5,
      "angle": 0
    },
    {
      "position": [
        4,
        -17
      ],
      "h": 0.5,
      "w": 3,
      "angle": 0
    }
  ]
};



levels = { "L0-0" : { level : level_super_basic,
		      wordlist : 'L1' },

	   "L0-1" :  { level : level_easy_connections,
		      wordlist : 'L2' },

	   //"L0-2" :  { level : level_hard_and_soft,
	   //          wordlist : 'L0' },

	   "L0-2" :  { level : level_libro,
	             wordlist : 'L3' },

	   "L1-0" :  { level : level_gravity2,
		      wordlist : 'L4' },

	   "L1-1" :  { level : level_gravity1,
		      wordlist : 'L5' },

	   "L1-2" :  { level : level_structures_bonus,
		      wordlist : 'L6' },

	   "L2-0" :  { level : level_life_from_above2,
		      wordlist : 'L7' },

	   "L2-1" :  { level : level_short_cuts,
		      wordlist : 'L8' },

	   "L2-2" :  { level : level_balancia,
		      wordlist : 'L9' },

	   "L3-0" :  { level : level_reach_the_exit,
		      wordlist : 'L10' },

	   "L3-1" :  { level : level_atapult,
		      wordlist : 'L11' },
	   
	   "L3-2" :  { level : level_connect_bom,
		      wordlist : 'L27' },
	 }


//console.log(levels)
