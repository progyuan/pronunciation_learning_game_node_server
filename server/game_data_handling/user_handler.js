/*
 *
 *     USER CONTROL
 * 
 */

var fs=require('fs');

var DEBUG_TEXTS=true;

var logging = require('../game_data_handling/logging.js');

/*
 * Extremely lazy user control!
 * 
 * Keep in mind this is not a production system in any way!
 */


var user_credential_file = './users.json';
var passwords = JSON.parse(fs.readFileSync(user_credential_file, 'utf8'));

//var user_data_dir = './users/';

function authenticate(req, res, callback) {
    username = req.headers['x-siak-user'];
    password = req.headers['x-siak-password'];

    //debugout("Authenticating >"+username + "< >" + password +"<!");    

    if (!passwords.hasOwnProperty(username)) {
	debugout('users does not contain >'+username+'<');
	err= { error: 101,
		 msg: "unknown username"
	       }
    }
    else if (passwords[username] != password) {
	debugout('password for '+username +' is not '+ password + ' (should be '+passwords[username]+" )");
	err= { error: 102,
		 msg: "username and password do not match"
	       }	
    }
    else
	err = null;
    
    callback( err, username, req, res );

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

