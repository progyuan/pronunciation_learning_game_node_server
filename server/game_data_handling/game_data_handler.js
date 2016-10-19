

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





var debugout = function(user, msg) {
    console.log("\x1b[35mloggin %s\x1b[0m", get_date_time().datetime + ' '+user + ': '+msg);
}







// constructor:
//function Logging () {    


var log_event = function( worthy_stuff) {

    var table = 'events';
    insert_to_db(  worthy_stuff, table);
} 
    
var log_scoring = function( worthy_stuff ) {

    var table = 'scorings';
    insert_to_db( worthy_stuff, table);

}
 
var log_error = function( worthy_stuff ) {

    var table = 'errors';
    insert_to_db( worthy_stuff, table);

}




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

    game_events.insert(data, {safe: true}, function(err) {
	if(err) {
	    process.emit('user_event', user, wordid, 'error', {'error_source':'saving_game_event_to_db',
							       'error': err });
	}
    });

}


var get_next_word_id = function( user, callback ) {
    game_events.find( { user : user }, { word_id: 1 } ).sort( { word_id: -1 } ).limit(1).toArray(
	function(e, results) {
	    if (e) callback(e)
	    else callback(null, results)
	});
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


module.exports = { log_event : log_event, 
		   log_scoring: log_scoring , 
		   get_date_time: get_date_time,
		   get_next_word_id: get_next_word_id,
		   insert_to_db : insert_to_db
		 };
