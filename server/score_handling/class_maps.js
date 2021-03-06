

var aalto_to_classes= { "A": 0,
           "C": 1,
           "D": 2,
           "E": 3,
           "H": 4,
           "I": 5,
           "J": 6,
           "N": 7,
           "O": 8,
           "P": 9,
           "Q": 10,
           "R": 11,
           "S": 12,
           "T": 13,
           "U": 14,
           "W": 15,
           "Y": 16,
           "Z": 17,
           "a": 18,
           "b": 19,
           "d": 20,
           "e": 21,
           "f": 22,
           "g": 23,
           "i": 24,
           "j": 25,
           "k": 26,
           "l": 27,
           "m": 28,
           "n": 29,
           "o": 30,
           "p": 31,
           "r": 32,
           "s": 33,
           "t": 34,
           "u": 35,
           "v": 36,
           "w": 37,
           "z": 38,
           "Ä": 39,
           "Å": 40,
           "ä": 41,
           "å": 42,
           "ö": 43 };


var classes_to_aalto = {0: "A"
           1: "C"
           2: "D"
           3: "E"
           4: "H"
           5: "I"
           6: "J"
           7: "N"
           8: "O"
           9: "P"
           10: "Q"
           11: "R"
           12: "S"
           13: "T"
           14: "U"
           15: "W"
           16: "Y"
           17: "Z"
           18: "a"
           19: "b"
           20: "d"
           21: "e"
           22: "f"
           23: "g"
           24: "i"
           25: "j"
           26: "k"
           27: "l"
           28: "m"
           29: "n"
           30: "o"
           31: "p"
           32: "r"
           33: "s"
           34: "t"
           35: "u"
           36: "v"
           37: "w"
           38: "z"
           39: "Ä"
           40: "Å"
           41: "ä"
           42: "å"
           43: "ö"
};

var aalto_to_arpa = {
    "A": "aa",
    "ä": "ae",
    "a": "ah",
    "å": "aw",
    "Ä": "ay",
    "Å": "oy",
    "b": "b",
    "C": "ch",
    "d": "d",
    "D": "dh",
    "e": "eh",
    "E": "ey",
    "f": "f",
    "g": "g",
    "H": "hh",
    "i": "ih",
    "I": "iy",
    "J": "jh",
    "j": "y",
    "k": "k",
    "l": "l",
    "m": "m",
    "n": "n",
    "N": "ng",
    "O": "ao",
    "ö": "er",
    "o": "ow",
    "p": "p",
    "Q": "ax",
    "R": "ia",
    "r": "r",
    "s": "s",
    "S": "sh",
    "t": "t",
    "T": "th",
    "U": "uh",
    "u": "uw",
    "v": "v",
    "W": "ea",
    "w": "w",
    "Y": "oh",
    "z": "z"
};

var arpa_to_festival_unilex = {
"aa": "aa",
"ae": "a",
"ah": "uh",
"ao": "oo",
"aw": "ow",
"ax": "@",
"ay": "ai",
"b": "b",
"ch": "ch",
"d": "d",
"dh": "dh",
"ea": "eir",
"eh": "e",
"er": "@@r",
"ey": "ei",
"f": "f",
"g": "g",
"hh": "h",
"ia": "i@", // WHAT? 
"ih": "i",
"iy": "ii",
"jh": "jh",
"k": "k",
"l": "lw",
"m": "m",
"n": "n",
"ng": "ng",
"oh": "o",
"ow": "ou",
"oy": "oi", // WHAT???
"p": "p",
"r": "r",
"s": "s",
"sh": "sh",
"t": "t",
"th": "th",
"uh": "u",
"uw": "uu",
"v": "v",
"w": "w",
"y": "y",
"z": "z"
};

var festival_unilex_to_ipa= {
    "@" : "ə",
    "a" : "æ",
    "aa" : "ɑː",
    "ai" : "aɪ",
    "b" : "b",
    "ch" : "tʃ",
    "d" : "d",
    "dh" : "ð",
    "e" : "ɛ",
    "e" : "e", // added by Heini
    "ei" : "eɪ",
    "eir" : "eə", // corrected by Heini
    "f" : "f",
    "g" : "ɡ",
    "h" : "h",
    "i" : "ɪ",
    "i@" : "ɪə", // corrected by Heini
    "ii" : "iː",
    "jh" : "dʒ",
    "k" : "k",
    "l" : "l",
    "lw" : "l",
    "m" : "m",
    "n" : "n",
    "ng" : "ŋ",
    "o" : "ɒ",
    "oo" : "ɔː",
    "oo" : "ɔə", // added by Heini
    "oi" : "ɔɪ", // corrected by Heini
    "ou" : "əʊ", // corrected by Heini
    "ow" : "aʊ",
    "p" : "p",
    "r" : "r",
    "@@r" : "ɜː", 
    "s" : "s",
    "sh" : "ʃ",
    "t" : "t",
    "th" : "θ",
    "u" : "ʊ",
    "uh" : "ʌ",
    "uu" : "uː",
    "uu" : "əʊ", // added by Heini
    "uhr" : "ʊə" // guessed by Heini
    "uhr" : "ʊɔ" // added by Heini
    "v" : "v",
    "w" : "w",
    "y" : "j",
    "z" : "z",
    "zh" : "ʒ",
    "l!" : "əl"
};

var phone_properties: {
    "aʊ":	{
	"vowel-length": {"value": 3, "name": "diphtong"},
	"frontness": {"value": 5, "name": "back"},
	"Openness": {"value": 1, "name": "close"},
	"diphtong-frontness": {"value": 2, "name": "Near-front"},
	"diphtong-openness": {"value": 6, "name": "Near-open"},
	"Roundness": {"value": 0, "name": "unrounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "oʊ":	{
	"vowel-length": {"value": 3, "name": "diphtong"},
	"frontness": {"value": 1, "name": "front"},
	"Openness": {"value": 5, "name": "Open-mid"},
	"diphtong-frontness": {"value": 2, "name": "Near-front"},
	"diphtong-openness": {"value": 6, "name": "Near-open"},
	"Roundness": {"value": 1, "name": "rounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "ʊ":	{
	"vowel-length": {"value": 1, "name": "short"},
	"frontness": {"value": 2, "name": "Near-front"},
	"Openness": {"value": 6, "name": "Near-open"},
	"diphtong-frontness": {"value": 2, "name": "Near-front"},
	"diphtong-openness": {"value": 6, "name": "Near-open"},
	"Roundness": {"value": 0, "name": "unrounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "æ":	{
	"vowel-length": {"value": 1, "name": "short"},
	"frontness": {"value": 4, "name": "Near-back"},
	"Openness": {"value": 3, "name": "Close-mid"},
	"diphtong-frontness": {"value": 4, "name": "Near-back"},
	"diphtong-openness": {"value": 3, "name": "Close-mid"},
	"Roundness": {"value": 1, "name": "rounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "ɪ":	{
	"vowel-length": {"value": 1, "name": "short"},
	"frontness": {"value": 4, "name": "Near-back"},
	"Openness": {"value": 6, "name": "Near-open"},
	"diphtong-frontness": {"value": 4, "name": "Near-back"},
	"diphtong-openness": {"value": 6, "name": "Near-open"},
	"Roundness": {"value": 0, "name": "unrounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "ɪər":	{
	"vowel-length": {"value": 1, "name": "short"},
	"frontness": {"value": 4, "name": "Near-back"},
	"Openness": {"value": 6, "name": "Near-open"},
	"diphtong-frontness": {"value": 3, "name": "central"},
	"diphtong-openness": {"value": 5, "name": "Open-mid"},
	"Roundness": {"value": 0, "name": "unrounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "oɪ":	{
	"vowel-length": {"value": 3, "name": "diphtong"},
	"frontness": {"value": 1, "name": "front"},
	"Openness": {"value": 5, "name": "Open-mid"},
	"diphtong-frontness": {"value": 4, "name": "Near-back"},
	"diphtong-openness": {"value": 6, "name": "Near-open"},
	"Roundness": {"value": 1, "name": "rounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "aɪ":	{
	"vowel-length": {"value": 3, "name": "diphtong"},
	"frontness": {"value": 5, "name": "back"},
	"Openness": {"value": 1, "name": "close"},
	"diphtong-frontness": {"value": 4, "name": "Near-back"},
	"diphtong-openness": {"value": 6, "name": "Near-open"},
	"Roundness": {"value": 0, "name": "unrounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "ɛ":	{
	"vowel-length": {"value": 1, "name": "short"},
	"frontness": {"value": 5, "name": "back"},
	"Openness": {"value": 3, "name": "Close-mid"},
	"diphtong-frontness": {"value": 5, "name": "back"},
	"diphtong-openness": {"value": 3, "name": "Close-mid"},
	"Roundness": {"value": 0, "name": "unrounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "ɛər":	{
	"vowel-length": {"value": 3, "name": "diphtong"},
	"frontness": {"value": 5, "name": "back"},
	"Openness": {"value": 3, "name": "Close-mid"},
	"diphtong-frontness": {"value": 3, "name": "central"},
	"diphtong-openness": {"value": 4, "name": "mid"},
	"Roundness": {"value": 0, "name": "unrounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "iː":	{
	"vowel-length": {"value": 2, "name": "long"},
	"frontness": {"value": 5, "name": "back"},
	"Openness": {"value": 7, "name": "open"},
	"diphtong-frontness": {"value": 5, "name": "back"},
	"diphtong-openness": {"value": 7, "name": "open"},
	"Roundness": {"value": 0, "name": "unrounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "ɑː":	{
	"vowel-length": {"value": 2, "name": "long"},
	"frontness": {"value": 1, "name": "front"},
	"Openness": {"value": 1, "name": "close"},
	"diphtong-frontness": {"value": 1, "name": "front"},
	"diphtong-openness": {"value": 1, "name": "close"},
	"Roundness": {"value": 1, "name": "rounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "ɑr":	{
	"vowel-length": {"value": 3, "name": "diphtong"},
	"frontness": {"value": 1, "name": "front"},
	"Openness": {"value": 1, "name": "close"},
	"diphtong-frontness": {"value": 1, "name": "front"},
	"diphtong-openness": {"value": 1, "name": "close"},
	"Roundness": {"value": 1, "name": "rounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "ɒ":	{
	"vowel-length": {"value": 1, "name": "short"},
	"frontness": {"value": 1, "name": "front"},
	"Openness": {"value": 1, "name": "close"},
	"diphtong-frontness": {"value": 1, "name": "front"},
	"diphtong-openness": {"value": 1, "name": "close"},
	"Roundness": {"value": 0, "name": "unrounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "eɪ":	{
	"vowel-length": {"value": 3, "name": "diphtong"},
	"frontness": {"value": 5, "name": "back"},
	"Openness": {"value": 5, "name": "Open-mid"},
	"diphtong-frontness": {"value": 4, "name": "Near-back"},
	"diphtong-openness": {"value": 6, "name": "Near-open"},
	"Roundness": {"value": 1, "name": "rounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "ə":	{
	"vowel-length": {"value": 1, "name": "short"},
	"frontness": {"value": 3, "name": "central"},
	"Openness": {"value": 4, "name": "mid"},
	"diphtong-frontness": {"value": 3, "name": "central"},
	"diphtong-openness": {"value": 4, "name": "mid"},
	"Roundness": {"value": 0, "name": "unrounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "ɜː":	{
	"vowel-length": {"value": 2, "name": "long"},
	"frontness": {"value": 3, "name": "central"},
	"Openness": {"value": 3, "name": "Close-mid"},
	"diphtong-frontness": {"value": 3, "name": "central"},
	"diphtong-openness": {"value": 3, "name": "Close-mid"},
	"Roundness": {"value": 0, "name": "unrounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "ɔː":	{
	"vowel-length": {"value": 2, "name": "long"},
	"frontness": {"value": 1, "name": "front"},
	"Openness": {"value": 3, "name": "Close-mid"},
	"diphtong-frontness": {"value": 1, "name": "front"},
	"diphtong-openness": {"value": 3, "name": "Close-mid"},
	"Roundness": {"value": 1, "name": "rounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "uː":	{
	"vowel-length": {"value": 2, "name": "long"},
	"frontness": {"value": 1, "name": "front"},
	"Openness": {"value": 7, "name": "open"},
	"diphtong-frontness": {"value": 1, "name": "front"},
	"diphtong-openness": {"value": 7, "name": "open"},
	"Roundness": {"value": 1, "name": "rounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "ʌ":	{
	"vowel-length": {"value": 1, "name": "short"},
	"frontness": {"value": 1, "name": "front"},
	"Openness": {"value": 3, "name": "Close-mid"},
	"diphtong-frontness": {"value": 1, "name": "front"},
	"diphtong-openness": {"value": 3, "name": "Close-mid"},
	"Roundness": {"value": 0, "name": "unrounded"},
	"type": {"value": 1, "name": "vowel"}
    },
    "b":	{
	"voiced": {"value": 1, "name": "voiced"},
	"Place": {"value": 12, "name": "Labio-velar"},
	"Manner": {"value": 8, "name": "Trill"},
	"type": {"value": 0, "name": "consonant"}
    },
    "d":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 10, "name": "dorsal"},
	"Manner": {"value": 8, "name": "Trill"},
	"type": {"value": 0, "name": "consonant"}
    },
    "ð":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 10, "name": "dorsal"},
	"Manner": {"value": 4, "name": "Non-sib_affric"},
	"type": {"value": 0, "name": "consonant"}
    },
    "dʒ":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 7, "name": "Coronal"},
	"Manner": {"value": 7, "name": "Approximant"},
	"type": {"value": 0, "name": "consonant"}
    },
    "f":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 11, "name": "glottal"},
	"Manner": {"value": 4, "name": "Non-sib_affric"},
	"type": {"value": 0, "name": "consonant"}
    },
    "ɡ":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 4, "name": "labial"},
	"Manner": {"value": 8, "name": "Trill"},
	"type": {"value": 0, "name": "consonant"}
    },
    "h":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 2, "name": "Labio-dental"},
	"Manner": {"value": 4, "name": "Non-sib_affric"},
	"type": {"value": 0, "name": "consonant"}
    },
    "j":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 5, "name": "alveolar"},
	"Manner": {"value": 3, "name": "sibilant_affric"},
	"type": {"value": 0, "name": "consonant"}
    },
    "k":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 4, "name": "labial"},
	"Manner": {"value": 8, "name": "Trill"},
	"type": {"value": 0, "name": "consonant"}
    },
    "l":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 10, "name": "dorsal"},
	"Manner": {"value": 1, "name": "nasal"},
	"type": {"value": 0, "name": "consonant"}
    },
    "m":	{
	"voiced": {"value": 1, "name": "voiced"},
	"Place": {"value": 12, "name": "Labio-velar"},
	"Manner": {"value": 9, "name": "Lateral_Approx"},
	"type": {"value": 0, "name": "consonant"}
    },
    "n":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 10, "name": "dorsal"},
	"Manner": {"value": 9, "name": "Lateral_Approx"},
	"type": {"value": 0, "name": "consonant"}
    },
    "ŋ":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 4, "name": "labial"},
	"Manner": {"value": 9, "name": "Lateral_Approx"},
	"type": {"value": 0, "name": "consonant"}
    },
    "p":	{
	"voiced": {"value": 1, "name": "voiced"},
	"Place": {"value": 12, "name": "Labio-velar"},
	"Manner": {"value": 9, "name": "Lateral_Approx"},
	"type": {"value": 0, "name": "consonant"}
    },
    "r":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 8, "name": "Palatal"},
	"Manner": {"value": 2, "name": "stop"},
	"type": {"value": 0, "name": "consonant"}
    },
    "s":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 10, "name": "dorsal"},
	"Manner": {"value": 4, "name": "Non-sib_affric"},
	"type": {"value": 0, "name": "consonant"}
    },
    "ʃ":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 7, "name": "Coronal"},
	"Manner": {"value": 5, "name": "Sibilant_fric"},
	"type": {"value": 0, "name": "consonant"}
    },
    "t":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 10, "name": "dorsal"},
	"Manner": {"value": 8, "name": "Trill"},
	"type": {"value": 0, "name": "consonant"}
    },
    "tʃ":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 7, "name": "Coronal"},
	"Manner": {"value": 7, "name": "Approximant"},
	"type": {"value": 0, "name": "consonant"}
    },
    "v":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 11, "name": "glottal"},
	"Manner": {"value": 6, "name": "Non-sib fric"},
	"type": {"value": 0, "name": "consonant"}
    },
    "w":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 1, "name": "bilabial"},
	"Manner": {"value": 3, "name": "sibilant_affric"},
	"type": {"value": 0, "name": "consonant"}
    },
    "z":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 10, "name": "dorsal"},
	"Manner": {"value": 5, "name": "Sibilant_fric"},
	"type": {"value": 0, "name": "consonant"}
    },
    "ʒ":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 7, "name": "Coronal"},
	"Manner": {"value": 5, "name": "Sibilant_fric"},
	"type": {"value": 0, "name": "consonant"}
    },
    "θ":	{
	"voiced": {"value": 0, "name": "unvoiced"},
	"Place": {"value": 10, "name": "dorsal"},
	"Manner": {"value": 4, "name": "Non-sib_affric"},
	"type": {"value": 0, "name": "consonant"}
    }
};
