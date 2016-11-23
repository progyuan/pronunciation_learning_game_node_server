/*
 *
 *     USER CONTROL
 * 
 */

var AM = require('../app/server/modules/account-manager');

var fs=require('fs');

var DEBUG_TEXTS=true;

var logging = require('../game_data_handling/logging.js');


/* All this extra junk here just to be able to access the session storage
   of the parent process... Let's hope it's worth it! */

var cookie = require('cookie');

var dbHost = process.env.DB_HOST || 'localhost'
var dbPort = process.env.DB_PORT || 27017;
var dbName = process.env.DB_NAME || 'node-login';


var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoStore = new MongoStore({
    db:dbName,            //these options values may different
    port:dbPort,
    host: dbHost
});
var app = express();

var dbURL = 'mongodb://'+dbHost+':'+dbPort+'/'+dbName;
if (app.get('env') == 'live'){
// prepend url with authentication credentials // 
        dbURL = 'mongodb://'+process.env.DB_USER+':'+process.env.DB_PASS+'@'+dbHost+':'+dbPort+'/'+dbName;
}

app.use(session({
        secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
        proxy: true,
        resave: true,
        saveUninitialized: true,
        store: new MongoStore({ url: dbURL })
        })
);

/* This was the extra junk ! All this! It's loads! */


function authenticate(req, res, callback) {
    var username = req.headers['x-siak-user'];
    var password = req.headers['x-siak-password'];
	
    //debugout("Authenticating >"+username + "< >" + password +"<!");       

    var tS = cookie.parse(req.headers.cookie)['connect.sid'];

    if (tS) {
	var sessionID = tS.split(".")[0].split(":")[1];
	mongoStore.get(sessionID,function(err,session){
	    if (err || session.user.user != username) 
		AM.gamedataLogin(username, password, req, res, callback );    	
	    else 
		callback(null, username, req, res);
	});	
    }
    else {
	callback("Session expired", null, req, res);
    }

}



function debugout(text) {
    // Did you set DEBUG_TEXTS == true there at the top?
    if (DEBUG_TEXTS) 
    {
	var cyan="\x1b[36m";
	var bright=  "\x1b[1m" ;
	console.log(cyan + "userha " + logging.get_date_time().datetime + " " + text);
    }
}




module.exports = { authenticate: authenticate }

