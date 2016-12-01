

/**
        * Node.js Login Boilerplate
        * More Info : http://kitchen.braitsch.io/building-a-login-system-in-node-js-and-mongodb/
        * Copyright (c) 2013-2016 Stephen Braitsch

	* Modifications 2016- by Reima Karhila. Lots of them.

**/

var http = require('http');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);

var app = express();

app.locals.pretty = true;
app.set('port', process.env.WEBAPP_PORT || 3000);
app.set('views', __dirname + '/app/server/views');
app.set('view engine', 'jade');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
app.use(express.static(__dirname + '/app/public'));

// use a base url set in the env variables //
app.locals.baseURL = process.env.BASEURL || '';
app.locals.asrURL = process.env.ASRURL || '';



/*
 * 
 * Fire up a webapp in a different thread:
 *   
 *
 */ 

var fork = require('child_process').fork;
var waitForPort = require('wait-for-port');

var start_game_server = function() {
    console.log('Waiting for port', (process.env.PORT || 8001) );
    waitForPort('localhost',  (process.env.PORT || 8001), function(err) {
	console.log('Port free, starting!');
	app.locals.game_server_child = fork('./game_server_app.js');
	app.locals.game_server_child.on('exit', function() {
	    console.log('The asr server died. Let\'s restart...' );		
	    start_game_server();

	});
    });
}

start_game_server();



require('jade').filters.escape = function( block ) {
  return block
    .replace( / /g, '_'  )
}
// build mongo database connection url //

var dbHost = process.env.DB_HOST || 'localhost'
var dbPort = process.env.DB_PORT || 27017;
var dbName = process.env.DB_NAME || 'node-login';

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

require('./app/server/routes')(app);

http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
});


