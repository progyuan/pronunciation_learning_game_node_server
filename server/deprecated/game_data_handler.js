
var conf = require ('../config');
var fs = require('fs');




var crypto 		= require('crypto');
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');

/*
	ESTABLISH DATABASE CONNECTION
*/

var dbName = process.env.DB_NAME || 'siak-gamedata';
var dbHost = process.env.DB_HOST || 'localhost'
var dbPort = process.env.DB_PORT || 27017;

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
db.open(function(e, d){
	if (e) {
		console.log(e);
	} else {
		if (process.env.NODE_ENV == 'live') {
			db.authenticate(process.env.DB_USER, process.env.DB_PASS, function(e, res) {
				if (e) {
					console.log('mongo :: error: not authenticated', e);
				}
				else {
					console.log('mongo :: authenticated and connected to database :: "'+dbName+'"');
				}
			});
		}	else{
			console.log('mongo :: connected to database :: "'+dbName+'"');
		}
	}
});

var game_events = db.collection('events');



/*

Stored user and game data:
==========================

username :         String
password :         String

stars :            int
keys :             int

word_stars :       { String : int }
completed_levels : [ int ]

created :          String (ISO date)
last_modified :    String (ISO date)


*/


// constructor:
//function Logging () {    

var getGameData = function(user) {

    try { 
	fs.accessSync(path, fs.F_OK);	
	return gamedata = JSON.parse(fs.readFileSync(getDataFilename(user), 'utf8'));
    } 
    catch(e) {
	return createDatafile(user);
    }
}


var saveGameData = function(user, gamedata) {

    gamedata['last_modified'] = new Date().toISOString();
    var gamedatafile = getDataFilename(user);
    
    fs.writeFile(gamedatafile,
		 JSON.stringify({ gamedata }, null, 4),
		 function(err) {
		     if(err) {
			 process.emit('user_event', user, wordid, 'error', {'error_source':'saving_game_event_to_file',
									    'file_to_write': gamedatafile,
									    'error': err });
		     }
		 });
    //newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
    game_events.insert(gamedata, {safe: true}, function(err) {
	if(err) {
	    process.emit('user_event', user, wordid, 'error', {'error_source':'saving_game_event_to_db',
							       'error': err });
	}
    });
}


var getWordStars = function(user, word) {

    gamedata = getGameData(user);
    if (word in gamedata.word_stars) {
	return gamedata.word_stars[word];
    }
    else return 0
}


var setWordStars = function(user, word, stars) {

    gamedata = getGameData(user);
    if (!(word in gamedata.word_stars) || gamedata.word_stars[word] < stars) {
	gamedata.word_stars[word] = stars;
	saveGameData(user, gamedata);
    }
}



var getCompletedLevels = function(user) {

    gamedata = getGameData(user);
    return gamedata.completed_levels;
}


var setCompletedLevel = function(user, level) {

    gamedata = getGameData(user);
    if (!level in gamedata.completed_levels) {
	gamedata.completed_levels.push(level);
	saveGameData(user, gamedata);
    }
}

	
var getDataFilename = function(user) {
    return conf.gamedatadir+user;
}

var createDatafile = function(user) {
    var now = new Date().toISOString();
    gamedata = { 'username': user,
		 'password' : password,
		 'stars' : 0,
		 'keys' : 0,
		 'word_stars' : {},
		 'completed_levels' : [],
	         'created' : now,
	         'last_modified' : now  }

    fs.writeFile(gamedatafile,
		 JSON.stringify({ gamedata }, null, 4),
		 function(err) {
		     if(err) {
			 process.emit('user_event', user, wordid, 'error', {'error_source':'saving_game_event',
									    'file_to_write': gamedatafile,
									    'error': err });
		     }
		 });
    
    return gamedata;
}




module.exports = { getData: getGameData,
		   getGameData: getGameData,
		   setWordStars : setWordStars,
		   getWordStars : getWordStars,
		   setCompletedLevel : setCompletedLevel,
		   getCompletedLevels : getCompletedLevels,		   
		 };
