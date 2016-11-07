
//var CT = require('./modules/country-list');
var school_list = require('./modules/school-list');
var role_list = require('./modules/role-list');
//var user_list = require('./modules/user-list');
var AM = require('./modules/account-manager');
//var UM = require('./modules/userdata-manager');

var EM = require('./modules/email-dispatcher');
var moment 		= require('moment');

var word_list = require('./modules/word-list');

var game_word_list = require('./modules/game-word-list');
var phoneme_list = require('./modules/phoneme-list');

var async = require('async');

module.exports = function(app) {


/* Some views to look at game data */

    app.get('/live', function(req,res) {
	if (req.session.user == null){
	    // if user is not logged-in redirect back to login page //
	    res.redirect(app.locals.baseURL);
	}
	else
	    AM.get_word_and_phoneme_counts(req.session.user, function(e, phoneme_counts,word_counts) {
		console.log("Rendering:");
		console.log(e);
		res.render('livedemo', { 
		    title: 'SIAK web demo!',
                    udata : req.session.user,
		    word_list : word_list,
		    game_word_list : game_word_list,
		    phoneme_list : phoneme_list,
		    phoneme_counts : phoneme_counts,
		    word_counts : word_counts
		});
	    });
    });

    app.get('/fysiak', function(req,res) {
	if (req.session.user == null){
	    // if user is not logged-in redirect back to login page //
	    res.redirect(app.locals.baseURL);
	}
	else
	    AM.get_word_and_phoneme_counts(req.session.user, function(e, phoneme_counts,word_counts) {
		console.log("Rendering:");
		console.log(e);
		res.render('fysiak-02', { 
		    title: 'fySIAK on-line v. 0.2',
		    fysiak_version: '0.2',
                    udata : req.session.user,
		    word_list : word_list,
		    game_word_list : game_word_list,
		    phoneme_list : phoneme_list,
		    phoneme_counts : phoneme_counts,
		    word_counts : word_counts
		});
	    });
    });

    app.get('/fysiak', function(req,res) {
	if (req.session.user == null){
	    // if user is not logged-in redirect back to login page //
	    res.redirect(app.locals.baseURL);
	}
	else
	    AM.get_word_and_phoneme_counts(req.session.user, function(e, phoneme_counts,word_counts) {
		console.log("Rendering:");
		console.log(e);
		res.render('fysiak-03', { 
		    title: 'fySIAK on-line v. 0.3',
		    fysiak_version: '0.3',
                    udata : req.session.user,
		    word_list : word_list,
		    game_word_list : game_word_list,
		    phoneme_list : phoneme_list,
		    phoneme_counts : phoneme_counts,
		    word_counts : word_counts
		});
	    });
    });

    app.get('/fysiak-dev', function(req,res) {
	if (req.session.user == null){
	    // if user is not logged-in redirect back to login page //
	    res.redirect(app.locals.baseURL);
	}
	else
	    AM.get_word_and_phoneme_counts(req.session.user, function(e, phoneme_counts,word_counts) {
		console.log("Rendering:");
		console.log(e);
		res.render('fysiak-dev', { 
		    title: 'fySIAK on-line unstable cutting edge release',
                    udata : req.session.user,
		    word_list : word_list,
		    game_word_list : game_word_list,
		    phoneme_list : phoneme_list,
		    phoneme_counts : phoneme_counts,
		    word_counts : word_counts
		});
	    });
    });

    app.get('/live2', function(req,res) {
	if (req.session.user == null){
	    // if user is not logged-in redirect back to login page //
	    res.redirect(app.locals.baseURL);
	}
	else
	    res.redirect(app.locals.baseURL+'/fysiak');
    });

      
    app.get('/:type(view|api)/gamedata/:fp1?/:fv1?/:fp2?/:fv2?/:fp3?/:fv3?/:fp4?/:fv4?/:fp5?/:fv5?/:fp6?/:fv6?/:fp7?/:fv7?', function(req, res) {


	if (req.session.user == null){
	    // if user is not logged-in redirect back to login page //
	    if (req.params.type == 'view')
		res.redirect(app.locals.baseURL);
	    else {
		res.statusCode = 401;
		res.send('Please log in first.');
	    }
	}	
	else{
	    //console.log("Setting filters");
	    
	    var filter = {}
	    var current_filters=  {'user' : 'All users',
				   'word' : 'All words',
				   'date' : 'All sessions',
				   'event' : 'All events',
				   'level' : 'All levels'} ;
	    

	    var requested_filters = [ [req.params.fp1, req.params.fv1],
				      [req.params.fp2, req.params.fv2],
				      [req.params.fp3, req.params.fv3],
				      [req.params.fp4, req.params.fv4],
				      [req.params.fp5, req.params.fv5],
				      [req.params.fp6, req.params.fv6],
				      [req.params.fp7, req.params.fv7] ];
	    
	    
	    var limit = 50;
	    var page = 0;

	    //console.log("looping over filters");
	    requested_filters.forEach(
		function (filterarray) {
		    //console.log("Filter: " + filterarray[0]);
		    if (typeof (current_filters[ filterarray[0] ]) != 'undefined') {
			//console.log('setting filter '+filterarray[0]+ ' = ' + filterarray[1]);
			filter[filterarray[0]] = filterarray[1];
			current_filters[filterarray[0]] = filterarray[1];
		    }
		    else {
			if (filterarray[0] == 'show') {
			    limit =  parseInt( filterarray[1] )
			}
			if (filterarray[0] == 'page') {
			    page= parseInt( filterarray[1] )
			}
		    }
		});
	    
	    
	    var offset = limit * page;
	    
   	    var users = AM.getGameData( filter , limit, offset, function(e, game_data) { 
		if (e) console.log(e);
		//console.log(game_data);
		histograms=[ [0,0,0,0,0,0], 
			     [0,0,0,0,0,0],
			     [0,0,0,0,0,0] ];
		game_data.forEach(function(item) {
		    if (typeof(item.dnn_score) != 'undefined')
			histograms[0][parseInt(item.dnn_score)]+=1;
		    if (typeof(item.kalles_score) != 'undefined')
			histograms[1][parseInt(item.kalles_score)]+=1;
		    if (typeof(item.score) != 'undefined')
			if (parseInt(item.score)>-1)
			    histograms[2][parseInt(item.score)]+=1;
		});
		
		//console.log(histograms);

		res.render('userstats', {
		    title : 'Statistics',
		    this_user : current_filters.user,
		    events : current_filters.event,
		    filters : current_filters,
		    page : page,
		    limit : limit,
		    schools : school_list,
   		    roles : role_list,
		    game_data : game_data,// indByMultipleFields( [{school :req.session.user.school }]),
		    udata : req.session.user,
		    histograms : histograms
		});
	    });
	}
    });

      
    app.get('/users/name/:username/:filtertype1/:filtervalue1/:filtertype2/:filtervalue2/', function(req, res) {
	    if (req.session.user == null){
		// if user is not logged-in redirect back to login page //
		res.redirect('/');
	    }	
	    else{
		var user = req.params.username;
		var filtertype1 = req.params.filtertype1;
		var filtervalue1 = req.params.filtervalue1;

		var filtertype2 = req.params.filtertype2;
		var filtervalue2 = req.params.filtervalue2;

		var filter = { user: user};
		filter[filtertype1] = filtervalue1;
		filter[filtertype2] = filtervalue2;

		var eventtype = (filtertype1 == 'event' ? filtervalue1 : 'all');
		eventtype = (filtertype2 == 'event' ? filtervalue2 : eventtype);


   		var users = AM.getGameData( filter , 50, 0, function(e, game_data) { 
		    if (e) console.log(e);
		    console.log(game_data);
		    res.render('userstats', {
			title : 'User Statistics for '+user,
			this_user : user,
			events : eventtype,
			schools : school_list,
   			roles : role_list,
			game_data : game_data,// indByMultipleFields( [{school :req.session.user.school }]),
			udata : req.session.user
		    });
		});
	    }
	});
 


    	app.get('/users/name/:username', function(req, res) {
	    if (req.session.user == null){
		// if user is not logged-in redirect back to login page //
		res.redirect('/');
	    }	
	    else{
		var user = req.params.username;
		
   		var users = AM.getGameData( {user: user}, 50, 0, function(e, game_data) { 
		    if (e) console.log(e);
		    console.log(game_data);
		    res.render('userstats', {
			title : 'User Statistics for '+user,
			schools : school_list,
			this_user : user,
			events : 'all',
   			roles : role_list,
			game_data : game_data,// indByMultipleFields( [{school :req.session.user.school }]),
			udata : req.session.user
		    });
		});
	    }
	});
    

    	app.get('/audio/:username/:audiofile', function(req, res) {
	    if (req.session.user == null){
		// if user is not logged-in redirect back to login page //
		res.redirect('/');
	    }	
	    else{
		username = req.params.username;
		audiofile = req.params.audiofile;
		res.sendFile('upload_data/from_game/'+username+'/'+audiofile,  { root: __dirname + '/../../' });
	    }
	});



    	app.get('/users', function(req, res) {
	    if (req.session.user == null){
		// if user is not logged-in redirect back to login page //
		res.redirect('/');
	    }	
	    else{
   		var users = AM.getAccountsBySimpleQuery( [{school : req.session.user.school }], function(e, users) { 
		    if (e) console.log(e);
		    console.log(users);
		    res.render('users', {
			title : 'User Statistics',
			schools : school_list,
   			roles : role_list,
			users : users,// indByMultipleFields( [{school :req.session.user.school }]),
			udata : req.session.user
		    });
		});
	    }
	});
    
    	app.get('/sessions', function(req, res) {
		if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			res.render('sessions', {
				title : 'Session Statistics',
				schools : school_list,
   			        roles : role_list,
				udata : req.session.user
			});
		}
	});

    
    	app.get('/restart-server', function(req, res) {
		if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		} 	else{
		                app.locals.game_server_child.kill();
		                var fork = require('child_process').fork;
  		                app.locals.game_server_child = fork('./game_server_app.js');

		                res.render('home', {
				title : 'Server restarted on '+moment().format('MMMM Do YYYY, h:mm:ss a'),
				schools : school_list,
   			        roles : role_list,
				udata : req.session.user
			});
		}
	});





// main login page //
	app.get('/', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect(app.locals.baseURL+'/home');
				}	else{
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});
	
	app.post('/', function(req, res){
		AM.manualLogin(req.body['user'], req.body['pass'], function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				req.session.user = o;
				if (req.body['remember-me'] == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.status(200).send(o);
			}
		});
	});
	
// logged-in user homepage //
	
        app.get('/home', function(req, res) {
		if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			res.render('home', {
				title : 'Home',
				udata : req.session.user
			});
		}
	});

	app.get('/account', function(req, res) {
		if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			res.render('myaccount', {
				title : 'My account',
				schools : school_list,
   			        roles : role_list,
				udata : req.session.user
			});
		}
	});
	




    	app.get('/addusers', function(req, res) {
		if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			res.render('addusers', {
				title : 'Add New Users',
				schools : (req.session.user.role == 'admin' ? school_list : [{name:req.session.user.school}]),
   			        roles : (req.session.user.role == 'admin' ? role_list : [ {name:'pupil'} ]),
			        teachers : [ {name: req.session.user.user} ],
				udata : req.session.user
			});
		}
	});


	app.post('/account', function(req, res){
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			AM.updateAccount({
				id		: req.session.user._id,
				name	: req.body['name'],
				email	: req.body['email'],
				pass	: req.body['pass'],
			        role    : req.body['role'],
			        school  : req.body['school'],
			}, function(e, o){
				if (e){
					res.status(400).send('error-updating-account');
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.status(200).send('ok');
				}
			});
		}
	});


	app.post('/logout', function(req, res){
		res.clearCookie('user');
		res.clearCookie('pass');
		req.session.destroy(function(e){ res.status(200).send('ok'); });
	})
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		res.render('signup', {  
		    title: 'Signup', 
		    schools : school_list, 
  		    roles : role_list
		});
	});
	
	app.post('/signup', function(req, res){
	        var now = new Date();
		AM.addNewAccount({
			name 	: req.body['name'],
			email 	: req.body['email'],
			user 	: req.body['user'],
			pass	: req.body['pass'],
		        school  : req.body['school'],
		        role    : req.body['role'],
		        created : now,
		        last_active :  now,
		}, function(e){
			if (e){
				res.status(400).send(e);
			}	else{
				res.status(200).send('ok');
			}
		});
	});
	app.post('/addusers', function(req, res){
	        var now = new Date();
		AM.addPupilAccount({
  		        // We won't take pupils emails or names, as they would form a register of people
			//name 	: req.body['name'],
		        //email 	: req.body['email'], 
			user 	: req.body['newuser'],
			pass	: req.body['pass'],
		        school  : req.body['school'],
		        role    : req.body['role'],
		        teacher : req.session.user.user,
		        created : now,
		        last_active :  now,
		}, function(e){
			if (e){
				res.status(400).send(e);
			}	else{
				res.status(200).send('ok');
			}
		});
	});
// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.body['email'], function(o){
			if (o){
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// TODO add an ajax loader to give user feedback //
					if (!e){
						res.status(200).send('ok');
					}	else{
						for (k in e) console.log('ERROR : ', k, e[k]);
						res.status(400).send('unable to dispatch password reset');
					}
				});
			}	else{
				res.status(400).send('email-not-found');
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.body['pass'];
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.status(200).send('ok');
			}	else{
				res.status(400).send('unable to update password');
			}
		})
	});
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		})
	});
	
	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
				req.session.destroy(function(e){ res.status(200).send('ok'); });
			}	else{
				res.status(400).send('record not found');
			}
	    });
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};
