
var crypto 		= require('crypto');
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');

var async = require('async');

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
					console.log('account-manager: mongo :: error: not authenticated', e);
				}
				else {
					console.log('account-manager: mongo :: authenticated and connected to database :: "'+dbName+'"');
				}
			});
		}	else{
			console.log('account-manager: mongo :: connected to database :: "'+dbName+'"');
		}
	}
});


var accounts = db.collection('accounts');
var activation_codes = db.collection('activation_codes');

/* login validation methods */

exports.autoLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o){
			o.pass == pass ? callback(o) : callback(null);
		}	else{
			callback(null);
		}
	});
}

exports.manualLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	else{
			validatePassword(pass, o.pass, function(err, res) {
				if (res){
					callback(null, o);
				}	else{
					callback('invalid-password');
				}
			});
		}
	});
}

exports.gamedataLogin = function(user, pass, req, resp, callback)
{

    console.log("Cookie:");
    console.log(req.headers.cookie);
    
    

	accounts.findOne({user:user}, function(e, o) {
		if (o == null){
			callback('user-not-found',null, req, resp );
		}	else{
			validatePassword(pass, o.pass, function(err, res) {
				if (res){
					callback(null, user, req, resp);
				}	else{
					callback('invalid-password', null, req, resp);
				}
			});
		}
	});
}

/* record insertion, update & deletion methods */

exports.addNewAccount = function(newData, callback)
{
	accounts.findOne({user:newData.user}, function(e, o) {
		if (o){
			callback('username-taken');
		}	else{
			activation_codes.findOne({code:newData.activationcode, 
						  status:"active" }, function(e, o) {
				if (!o){
					callback('bad-activation-code');
				}	else{
					saltAndHash(newData.pass, function(hash){
						newData.pass = hash;
					// append date stamp when record was created //
						newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						accounts.insert(newData, {safe: true}, callback);
					});
				}
			});
		}
	});
}

exports.addPupilAccount = function(newData, callback)
{
    accounts.findOne({user:newData.user}, function(e, o) {
	if (o){
	    callback('username-taken');
	}
	else{
	    saltAndHash(newData.pass, function(hash){
		newData.pass = hash;
		// append date stamp when record was created //
		newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
		accounts.insert(newData, {safe: true}, callback);
	    });
	}
    });
}


exports.updateAccount = function(newData, callback)
{
	accounts.findOne({_id:getObjectId(newData.id)}, function(e, o){
	    o.name 		= newData.name;
	    o.email 	= newData.email;
	    o.school 	= newData.school;
	    o.role 	= newData.role;
	    o.group 	= newData.group;
	    o.last_active = new Date();
		if (newData.pass == ''){
			accounts.save(o, {safe: true}, function(e) {
				if (e) callback(e);
				else callback(null, o);
			});
		}	else{
			saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				accounts.save(o, {safe: true}, function(e) {
					if (e) callback(e);
					else callback(null, o);
				});
			});
		}
	});
}

exports.updatePassword = function(email, newPass, callback)
{
	accounts.findOne({email:email}, function(e, o){
		if (e){
			callback(e, null);
		}	else{
			saltAndHash(newPass, function(hash){
		        o.pass = hash;
		        accounts.save(o, {safe: true}, callback);
			});
		}
	});
}

/* account lookup methods */

exports.deleteAccount = function(id, callback)
{
	accounts.remove({_id: getObjectId(id)}, callback);
}

exports.getAccountByEmail = function(email, callback)
{
	accounts.findOne({email:email}, function(e, o){ callback(o); });
}

exports.validateResetLink = function(email, passHash, callback)
{
	accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
	});
}

exports.getAllRecords = function(callback)
{
	accounts.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
}

exports.getAccountsBySimpleQuery = function(query, callback)
{
	findByMultipleFields( query, callback);
}


exports.delAllRecords = function(callback)
{
	accounts.remove({}, callback); // reset accounts collection for testing //
}

/* private encryption & validation methods */

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

var getObjectId = function(id)
{
	return new require('mongodb').ObjectID(id);
}

var findById = function(id, callback)
{
	accounts.findOne({_id: getObjectId(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
}

var findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	accounts.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}


/* Some stuff to extract game data: */

var game_events = db.collection('events');

exports.getGameData = function(filters, limit, offset, callback)
{
    //console.log('getting game data with filters ');
    //console.log(filters);
    //console.log(limit);
    //console.log(offset);

    //console.log(Object.keys(filters).length);
    if (Object.keys(filters).length>0) {
    //    console.log('Long filter!');
    // this takes an array of name/val pairs to search against {fieldName : 'value'} //
	game_events.find( filters ).sort( { _id: -1 } ).skip( offset ).limit(limit).toArray(
		function(e, results) {
		    //console.log("Got results or error!");
		    if (e) 
			callback(e)
		    else 
			callback(null, results)
	});
    }
    else {
	//console.log('Empty filter!');
	game_events.find().sort( { _id: -1 } ).skip( offset ).limit(limit).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
    }
}

var phoneme_counts = db.collection('phoneme_counts');
var word_counts = db.collection('word_counts');


exports.get_word_and_phoneme_counts = function(user, callback) {

    async.parallel({
	phonemes : function(cb) {
	    phoneme_counts.findOne({ user: user.user}, function(e, o){
		if(e)
		    console.log(e);
		if (o) {
		    user_phoneme_counts=o;		    
		    //console.log(o);
		}
		else {
		    //console.log("1 No o for user ",user);
		    user_phoneme_counts={};
		}
		cb(null, user_phoneme_counts);		
	    });
	},
	words: function(cb) {	
	    word_counts.findOne({ user: user.user}, function(e, o){
		if(e)
		    console.log(e);
		if (o) {
		    user_word_counts=o;
		    //console.log(o);

		}
		else {
		    //console.log("2 No o for user ",user);		
		    user_word_counts={};
		}
		cb(null, user_word_counts);
	    });
	}}, function(err, data) {
	    callback(err, data.phonemes, data.words); 
	});

}

var user_high_scores = db.collection('user_high_scores');
var user_level_scores = db.collection('user_level_scores');

exports.get_user_high_scores = function(user, callback) {

    filters = {user: user};

    user_high_scores.find( filters ).toArray(
	function(e, o) {
	    if (e) 
		callback(e)
	    else 
		callback(null, o)
	});
}

exports.get_level_high_scores = function(level, callback1) {

    filters = {level: level};

    user_high_scores.find( filters ).sort( { total_score : -1, star_score : -1 } ).limit( 10 ).toArray(
	function(e, o) {
	    if (e) 
		callback(e)
	    else 
		callback(null, o)
	});
}

exports.set_high_scores = function(user, userdata, callback) { 


    thismoment =  moment().format('MMMM Do YYYY, h:mm:ss a')

    console.log(thismoment,
		"Inserting: ",
		user,
		userdata );
    
    filters = {user: user,
	       level: userdata.level_key};


    
    u =  {level : userdata.level_key }
    u.time_score = userdata.time_score;
    u.star_score = userdata.star_score;
    u.user = user;
    u.date = thismoment;
    u.overall_performance = userdata.overall_performance;
    u.total_score =  userdata.star_score +  userdata.time_score;
    
    user_level_scores.insert(u, {safe: true}, function(e) {
	if (e) 
	    console.log(e);
    });

    async.series([
	user_high_scores.findOne( 
	    filters , 
	    function(e, o) {
		if (e) 
		    callback(e)
		else {
		    if (o) {
			if (o.time_score + o.star_score < userdata.time_score + userdata.star_score) {
			    o.time_score = userdata.time_score;
			    o.star_score = userdata.star_score;
			    o.total_score =  userdata.star_score +  userdata.time_score;
			    o.date =thismoment;
			    o.overall_performance = userdata.overall_performance;

			    user_high_scores.save(o, {safe: true}, function(e) {
				if (e) 
				    console.log(e);
				//callback(e);
				else 
				    callback(null, o);
			    });
			}
		    }
		    else {
			o =  {level : userdata.level_key }
			o.time_score = userdata.time_score;
			o.star_score = userdata.star_score;
			o.user = user;
			o.date = thismoment;
			o.overall_performance = userdata.overall_performance;
			o.total_score =  userdata.star_score +  userdata.time_score;
			
			user_high_scores.save(o, {safe: true}, function(e) {
			    if (e)
				console.log(e)
			    //callback(e);
			    else 
				callback(null, o);
			});
			
		    }
		}
	    }),
	user_high_scores.find(  {level : userdata.level_key } ).sort( { total_score : -1, star_score : -1 } ).limit( 10 ).toArray(
	    function(e, o) {
		if (e) 
		    callback(e)
		else 
		    callback(null, o)
	    })
    ], function(err, results) {
	// results is now equal to ['one', 'two']
	callback1(null, results[1])
    });
}
							 

exports.get_high_scores = function(user, callback) {

    filters = {user: user};

    user_high_scores.find( filters ).toArray(
	function(e, o) {
	    if (e) 
		callback(e)
	    else 
		callback(null, o)
	});
}
