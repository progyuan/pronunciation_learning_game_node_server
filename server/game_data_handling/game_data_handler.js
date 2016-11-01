

var conf = require ('../config');
var fs = require('fs');


var debugout = function(user, msg) {
    console.log("\x1b[35mgamedt %s\x1b[0m", get_date_time().datetime + ' '+user + ': '+msg);
}


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
		    console.log('game_data_handler: mongo :: error: not authenticated', e);
		}
		else {
		    console.log('game_data_handler: mongo :: authenticated and connected to database :: "'+dbName+'"');
		}
	    });
	}	else{
	    console.log('game_data_handler: mongo :: connected to database :: "'+dbName+'"');
	}
    }
});

var game_events = db.collection('events');
var phoneme_scores = db.collection('phoneme_scores');
var phoneme_counts = db.collection('phoneme_counts');
var word_counts = db.collection('word_counts');
var level_scores = db.collection('level_scores');





// Game helpers:


var get_next_word_id = function( user, callback ) {
    game_events.find( { user : user }, { word_id: 1 } ).sort( { word_id: -1 } ).limit(1).toArray(
	function(e, results) {
	    if (e) callback(e)
	    else callback(null, results)
	});
}





/* Functions for getting the right words to give to the player: */


var get_and_somehow_order_words_for_level = function(user, level, req, res, callback) {
    get_word_counts_for_level(user, level, req, res, function(e, req, res, user, level , wordcounts) {
	console.log("I want to print a list of words under here:");
	console.log(wordcounts);
	
	word_array = [];
	moving_average_array = [];
	keys = Object.keys(wordcounts);
	shuffle(keys);
	keys.forEach( function(key) {
	    word = wordcounts[key];	    
	    if (word) {		
		word.word = key;
		word_array.push(word);
		if ("moving_average" in word) {
		    console.log(key, "\t", word.best_score, "\t", word.count, "\t", word.best_score/word.count );
		    moving_average_array.push( word.best_score/word.count );
		}
		else {
		    moving_average_array.push(0);
		    if ("best_score" in word) {
			console.log(key, "\t", word.best_score, "\t", word.count, "\t", word.best_score/word.count );
		    }
		}
	    }
	});
	indices = sort_with_indices(moving_average_array);
	returnable_word_array = [];
	indices.forEach( function(i1, i2) {
	    returnable_word_array.push(word_array[i1]);
	});
	callback(null,req,res,user, level, returnable_word_array);
    });
}



var get_word_counts_for_level = function(user, level, req, res, callback) {
    var words = conf.word_lists[level];
    var wordcounts = {};
    word_counts.findOne({ user: user}, function(e, o){
	if (e) {
	    callback(e, null)
	}
	else {
	    Object.keys(words).forEach( function(word) {
		if (word in words) {
		    wordcounts[word] = o[word];
		}	    
	    });
	    callback(null, req, res, user, level ,  wordcounts);
	}
    });    
}







// Logging functions







var log_event = function( worthy_stuff) {

    var table = 'events';
    insert_to_db(  worthy_stuff, table);
} 
    
var log_scoring = function( worthy_stuff ) {

    var table = 'game_events';
    insert_to_db( worthy_stuff, table);

}
 
var log_error = function( worthy_stuff ) {

    var table = 'errors';
    insert_to_db( worthy_stuff, table);

}

var log_phoneme =  function( worthy_stuff ) {

    var table = 'phoneme_scores';
    insert_to_db( worthy_stuff, table);

}




var update_word_count = function(worthy_stuff, callback) {
    word_counts.findOne({ user: worthy_stuff.user}, function(e, o){
	if (!o) {
	    o = { user: worthy_stuff.user };
	    o[worthy_stuff.word] = { count: 1, best_score: worthy_stuff.score,
				     moving_average: 0.2 * worthy_stuff.score };
	    
	    word_counts.insert(o,  {safe: true}, function(e) {
		if (e) callback(e);
		else callback(null, o);
	    });
	}
	else {
	    if (worthy_stuff.word in o) {
		o[worthy_stuff.word].count++;
		o[worthy_stuff.word].best_score = Math.max( o[worthy_stuff.word].best_score,
							    worthy_stuff.score );
		if ("moving_average" in o[worthy_stuff.word]) {
		    o[worthy_stuff.word].moving_average = ( 0.8 * o[worthy_stuff.word].moving_average + 
							    0.2 * worthy_stuff.score );
		} else {
		    o[worthy_stuff.word].moving_average = ( 0.2 * worthy_stuff.score );		    
		}
		
	    } 
	    else {
		o[worthy_stuff.word] = { count: 1, best_score: worthy_stuff.score };
	    }
	    word_counts.save(o, {safe: true}, function(e) {
		if (e) callback(e);
		else callback(null, o);
	    });
	}
    });   
}







var update_phoneme_count = function(worthy_stuff, callback) {

    phoneme_counts.findOne({ user: worthy_stuff.user}, function(e, o){
	if (!o) {
	    o = { user: worthy_stuff.user };
	    worthy_stuff.reference_phones.forEach(function(phone, index) {
		if (phone in o) {
		    o[phone].count++;
		    o[phone].best_score = Math.max (  o[phone].best_score,
						      worthy_stuff.phoneme_scores[index] );
		}
		else {
		    o[phone] = {count:1, 
				best_score: worthy_stuff.phoneme_scores[index] };
		}
	    });
	    phoneme_counts.insert(o,  {safe: true}, function(e) {
		if (e) callback(e);
		else callback(null, o);
	    });
	}
	else {
	    worthy_stuff.reference_phones.forEach(function(phone, index) {
		if (phone in o) {
		    o[phone].count++;
		    o[phone].best_score = Math.max (  o[phone].best_score,
						      worthy_stuff.phoneme_scores[index] );
		}
		else {
		    o[phone] = {count:1, 
				best_score: worthy_stuff.phoneme_scores[index] };
		}
	    });
	    phoneme_counts.save(o, {safe: true}, function(e) {
		if (e) callback(e);
		else callback(null, o);
	    });
	}
    });   
}


var finish_level = function (user, level, score, callback) {
    level_scores.findOne({ user: user , level: level}, function(e, o){
	if (e) {
	    callback(e, null);
	}
	else {
	    if (!o) {
		o = { user:user, level: level, high_score: score };
		level_scores.insert(o,  {safe: true}, function(e) {
		    if (e) callback(e);
		    else callback(null, o);
		});
	    }
	    else {
		if (score > o.high_score) {
		    o.high_score = score;
		    level_scores.save(o, {safe: true}, function(e) {
			if (e) callback(e);
			else callback(null, o);
		    });
		}
		else {
		    callback();
		}
	    }
	}
    });
}



// Helper functions







var getObjectId = function(id)
{
	return new require('mongodb').ObjectID(id);
}


// From:
// http://stackoverflow.com/questions/3730510/javascript-sort-array-and-return-an-array-of-indicies-that-indicates-the-positi

var sort_with_indices = function (toSort) {
  for (var i = 0; i < toSort.length; i++) {
    toSort[i] = [toSort[i], i];
  }
  toSort.sort(function(left, right) {
    return left[0] < right[0] ? -1 : 1;
  });
  toSort.sortIndices = [];
  for (var j = 0; j < toSort.length; j++) {
    toSort.sortIndices.push(toSort[j][1]);
    toSort[j] = toSort[j][0];
  }
  return toSort;
}


// From https://www.frankmitchell.org/2015/01/fisher-yates/
function shuffle (array) {
  var i = 0
    , j = 0
    , temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}





var findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	game_events.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}






function get_date_time() {
    var date = new Date();
    
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    
    var millisec = date.getMilliseconds();

    var year = date.getFullYear();
    
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    
    return { datetime: year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec+":"+millisec, 
	     datetime_for_file : year + ""  + month + "" + day + "-" + hour + "" + min + "" + sec+"-"+millisec,
	     date:  year + ""  + month + "" + day,
	     time: hour + "" + min + "" + sec+"-"+millisec,
	     timestamp: date.toString() };
}







// Insert to DB:







var insert_to_db = function( data, table ) {

    var user = data.user;

    var logfile = 'log/'+table+'.txt';

    var thismoment = get_date_time();

    var logdata = "timestamp: \""+thismoment.timestamp+"\"";
   
    logdata += " datetime: \""+thismoment.datetime+"\", ";
    
    Object.keys(data).forEach(function(key){
	logdata += key+": \""+data[key]+"\", ";
    });
    logdata += '\n';

    fs.appendFile(logfile, logdata, function (err) {
	if (err) {
	    debugout(user, 'could not write log to file '+logfile);
	}
    });


    data.timestamp = thismoment.timestamp;
    data.timedate = thismoment.datetime;
    data.date = thismoment.date;
    data.time = thismoment.time;


    if (table == 'game_events') {
	game_events.insert(data, {safe: true}, function(err) {
	    if(err) {
		process.emit('user_event', user, wordid, 'error', {'error_source':'saving_game_event_to_db',
								   'error': err });
	    }
	});
    }
    else if  (table == 'phoneme_scores') {
	phoneme_scores.insert(data, {safe: true}, function(err) {
	    if(err) {
		process.emit('user_event', user, wordid, 'error', {'error_source':'saving_game_event_to_db',
								   'error': err });
	    }
	});
    }
    else {
	process.emit('user_event', user, -1, 'error', {'error_source':'saving_game_event_to_db',
							   'error': "No table called "+ table });
    }
}






module.exports = { log_event : log_event, 
		   log_scoring: log_scoring , 
		   get_date_time: get_date_time,
		   get_next_word_id: get_next_word_id,
		   insert_to_db : insert_to_db,
		   log_phoneme: log_phoneme,
		   update_word_count: update_word_count,
		   update_phoneme_count: update_phoneme_count,
		   get_and_somehow_order_words_for_level : get_and_somehow_order_words_for_level,
		   finish_level: finish_level
		 };

