
/*
 * A not-exactly-simple script (that started out simple) that receives 
 * binary data through HTTP(S) POST in pieces and feeds it to
 * an aligner and phone segment classifier.
 *
 * Intended to do almost-real-time audio processing.
 *
 */


console.log("==================== Starting...");


var http = require('http');

// From: http://stackoverflow.com/questions/13478464/how-to-send-data-from-jquery-ajax-request-to-node-js-server

var util = require('util');
var url = require('url');
var fs = require('fs');

var reply_codes = { 'package_received' : 0,
		    'audio_end': -1,
		    'segmentation_failure' : -2,
		    'segmentation_error' : -3,
		    'classification_error' : -4,
		    'no_audio_activity': -5,
		    'mic_off' : -6,
		    'late_arrival': -7,
		    'duplicate' : -8,
		    'network_lag_error' : -9,
		    'generic_server_error': -100 }

var spawn = require('child_process').spawn;

var flag_ada_running=0;


var conf = require('./config');

var logging = require('./game_data_handling/logging');


var game_data_handler = require('./game_data_handling/game_data_handler');
var user_handler = require('./game_data_handling/user_handler.js');

var userdata = {};

//var recogniser_client = require('./audio_handling/recogniser_client');
var vad = require('./audio_handling/vad_stolen_from_sphinx');

var segmentation_handler  = new require('./score_handling/a_less_impressive_segmentation_handler.js');
var segmentation_queue = new require('./score_handling/segmentation_queue');

var scorer =  require('./score_handling/magicians_hat_scorer.js');
//var fur_hat_scorer =  require('./score_handling/fur_hat_scorer.js');

var audioconf = conf.audioconf;
var recogconf = conf.recogconf;


var debugout = function(format, msg) {
    if (msg)
	console.log( format, logging.get_date_time().datetime + ' ' +msg);
    else
	console.log( '\x1b[33mserver %s\x1b[0m', logging.get_date_time().datetime  +' '+ format);
}


if (process.env.NODE_ENV !== 'production'){
    require('longjohn');
    var debug = true;

    var colorcodes =  {'event' : '\x1b[36mserver %s\x1b[0m' };
}





/*
 *   GET READY!
 */

/*
// I had this idea of copying the ASR models to ramdisk for quicker loading
// but those are not used now.

var cp_command="cp"
var cpmodels = spawn(cp_command, ['-r',conf.recogconf.model_source, conf.recogconf.model_cache]);
cpmodels.stderr.on('close',  function(exit_code)  { console.log("models copied with exit code "+exit_code); 
} );

*/




/*
 *
 *     SUPER-BASIC SERVER LOGIC
 * 
 */




http.createServer(function (req, res) {

    // JSON parsing is problematic on client, so let's leave this out:
    //res.setHeader('Content-Type', 'application/json');

    user_handler.authenticate(req, res,
			      function (err, username, req, res) {
				  if (err) {
				      debugout(username +": user "+username + " password NOT ok!");
				      res.statusCode = 401;
				      res.end( err.msg );
				  }
				  else {
				      //debugout(username + ": user "+username + " password ok!");
				      if (req.url == "/asr") 
				      {
					  operate_recognition (req, res);
				      }
				      if (req.url == "/start-level") 
				      {
					  start_level(req, res);
				      }			 
				      if (req.url == "/get-next-word") 
				      {
					  get_next_word(req, res);
				      }
				      if (req.url == "/finish-level") 
				      {
					  finish_level(req, res);
				      }
				      

				      if (req.url == "/log-action")
				      {
					  log_action(req, res);
				      }
				      else if (req.url == "/login")
				      {
					  log_login(req, res);
				      }
				      else if (req.url == "/logout")
				      {
					  log_logout(req, res);
				      }
				  }
			      });

}).listen(process.env.PORT || 8001);



debugout('If you don\'t see errors above, you should have a server running on port '+ (process.env.PORT || 8001) );



/*
  
  Event-driven asynchronous behaviour:
  
  Trigger events are passed through the process event handler - A dedicated event
  handler would be necessary for communicating between processes, so now the user
  is locked into using a single instance for the duration of the game session.


  Nothing stops from having multiple instances of the server running, but players
  need to be assigned to a single server for each session. Some URL coding could be
  added to accomplish this if we start running multiple instances.

*/


/* 
 *   USER EVENTS
 */


process.on('user_event', function(user, wordid, eventname, eventdata) {

    //debugout(colorcodes.event, user + ': EVENT: wordid '+wordid +" eventname "+eventname); 

    if (eventname == 'timestamp') {
	userdata[user].timestamps[eventdata.name] =   new Date().getTime();
    }
    else if (eventname == 'new_word_id') {
	word_select_reply(user);
    }
    else 
    {
	if (wordid != get_current_word_id(user)) {
	    debugout(colorcodes.event, user + " wid " + userdata[user].currentword.id + ": this event ("+ eventname +") is for a word (#"+wordid+")that we are not processing at this time (which would be "+get_current_word_id(user)+")");
	    console.log(eventdata);
	}
	else
	{		    
	    if (eventname == 'last_packet_check' ) {
		check_last_packet(user);	    
	    }
	    else if (eventname ==  'send_audio_for_analysis' ) {		
		asyncAudioAnalysis(user);	    
	    }
	    else if (eventname == 'wav_file_written' ) {
		userdata[user].currentword.wavfilename2 = eventdata.wavfilename;
	    }
	    else if (eventname ==  'features_done') {
		userdata[user].currentword.featuresdone = true;

		// If also segmentation is complete, send the features to classification queue:
		if (userdata[user].currentword.segmentation_complete == true  && userdata[user].currentword.sent_to_classification_queue == false) {
		    userdata[user].currentword.sent_to_queue = true;
		    if (! segmentation_queue.send_to_queue(
			userdata[user].segmentation_handler.get_classifiable_thing( 
			    userdata[user].currentword.segmentation, userdata[user].featuredata ))) {
			send_score_object(user, {"total_score" : reply_codes.classification_error, 
						 "error" : "Classifier operation error"});
		    }
		}

	    }
	    else if (eventname == 'segmented' ) {
		segmentation = eventdata.segmentation;
		if (segmentation.length > 0) {
		    
		    userdata[user].currentword.segmentation = 
			userdata[user].segmentation_handler.shell_segmentation_to_state_list(segmentation);

		    userdata[user].currentword.segmentation_complete = true;

		    if ( userdata[user].currentword.featuresdone == true && userdata[user].currentword.sent_to_classification_queue == false)  {
			if (!segmentation_queue.send_to_queue(
			    userdata[user].segmentation_handler.get_classifiable_thing( 
				userdata[user].currentword.segmentation, userdata[user].featuredata  ))) {
			    send_score_object(user, {"total_score" : reply_codes.classification_error, 
						     "error" : "Classifier operation error"});

			}
		    }
		    
		}
		else 
		{
		    debugout(colorcodes.event, user + " wid " + userdata[user].currentword.id + ": SEGMENTATION FAILED(1)! Give score of "+reply_codes.segmentation_failure);
		    userdata[user].currentword.segmentation = null;	
		    userdata[user].currentword.segmentation_complete = true;

		    // Segmentation failed, let's send a zero score to the client:
		    send_score_object(user, 
					 {
					     "total_score" : reply_codes.segmentation_failure, 
					     "error" : "Segmentation failed"
					 });
		}
		
		//check_feature_progress(user);
		
	    }
	    else if (eventname == 'kalle_dbg') {

		//fur_hat_scorer.fur_hat_scorer(user, 
		//			      userdata[user].currentword.reference, 
		//			      wordid, 
		//			      userdata[user].currentword,
		//			      eventdata);
		
	    }
	    else if (eventname == 'segmentation_error') {
		userdata[user].currentword.segmentation = null;
		userdata[user].currentword.segmentation_complete = true;
		
		debugout(colorcodes.event, user +": SEGMENTATION FAILED(2)!");
		send_score_object(user, 
				     {
					 "total_score" : reply_codes.segmentation_error, 
					 "error" : "Segmentation error"
				     });
		
	    }
	    else if (eventname == 'no_audio_activity') {
		send_score_object(user, 
				     {
					 "total_score" : reply_codes.no_audio_activity,
					 "error" : "No audio activity"
				     });
	    }
	    else if (eventname == 'mic_off') {
		send_score_object(user, 
				     {
					 "total_score" : reply_codes.mic_off,
					 "error" : "No audio activity"
				     });
	    }
	    
	    else if (eventname == 'classification_done') {
		userdata[user].currentword.guessed_classes = eventdata.guessed_classes
		
		scorer.magicians_hat_scorer(user, 
					    userdata[user].currentword.reference, 
					    wordid, 
					    userdata[user].currentword.guessed_classes, 
					    userdata[user].currentword.segmentation);
		
	    }
	    else if (eventname == 'classification_error') {
		send_score_object(user, {"total_score" : reply_codes.classification_error, 
					    "error" : "Classifier operation error"});
	    }
	    else if (eventname == 'kalles_scoring_done') {
		userdata[user].currentword.kalles_score = eventdata;
		if (userdata[user].currentword.dnn_score) {
		    send_score(user);		
		}
		else {
		    dummy = 1;
		    //debugout(colorcodes.event, user + " wid " + userdata[user].currentword.id + ": Waiting for DNN score event! "+
		    //"Kalles score: "+ userdata[user].currentword.kalles_score +
		    //"DNN score: " +  userdata[user].currentword.dnn_score
		    //);
		}

	    }
	    else if (eventname == 'dnn_scoring_done') {
		debugout(colorcodes.event, user + " wid " + userdata[user].currentword.id + ": dnn scoring done! Can we send reply in packet "+userdata[user].currentword.lastpacketnr + "? Our choices of packets is "+ userdata[user].currentword.analysedpackets.toString() );
		userdata[user].currentword.dnn_score = eventdata;
		send_score(user);		
	    }
	    else  {
		debugout(colorcodes.event, user + " wid " + userdata[user].currentword.id + ": Don't know what to do with this event! ("+ eventname +")");
	    }
	}
    }
});

process.on('print', function(printdata) {
    if (printdata.priority > 0) {
	var reset = "\x1b[0m";
	if (printdata.source == 'aligne') {
	    var cyan = "\x1b[36m";
	    var bright = "\x1b[1m" ;
	    color = cyan+bright;
	}
	else if (printdata.source == 'scorer') {
	    color = '\x1b[32'	    ;
	} 
	else if (printdata.source == 'segmen') {
	    color = '\x1b[34m';
	}
	else color = "";

	console.log(color , printdata.source , logging.get_date_time().datetime , printdata.message + reset);
    }
    

});




/*
 *
 *   HTTP REPLY FUNCTIONS
 * 
 */


// Reply to initialisation call:
function initialisation_reply(user) {    
    userdata[user].initreply.end( "ok" );
}

// Reply to word selection call:
function word_select_reply(user) {
    //debugout("Replying: "+ userdata[user].currentword.reference);
    userdata[user].readyreply.end( ""+userdata[user].currentword.id ); // userdata[user].currentword.reference );
}


// Reply to an audio packet call:
function audio_packet_reply(user,res, packetnr, usevad) {
    // Acknowledge client with message:
    //   
    //   0:  ok, continue
    //   -1: ok, that's enought, stop recording
    //   or something else  - The reply codes are at the top of this file!
/*
    if (userdata[user].currentword.resultsent) {
	res.end( ""+reply_codes.late_arrival );
    }
    else if (userdata[user].currentword.dnn_score) {
	debugout( '\x1b[33m\x1b[1mserver %s\x1b[0m', user + " wid " + userdata[user].currentword.id + ": audio packet reply ready for user: "+user + " word: "+ userdata[user].currentword.reference );
	userdata[user].currentword.lastPacketnr = packetnr;
	userdata[user].lastPacketRes = res;
	send_score(user);
    }
    else */
    if (packetnr == userdata[user].currentword.lastpacketnr) {
	// Retain the last packet for later reply:
	dummy = 1; 
    }
    else if ( (userdata[user].currentword.vad.speechend > 0 ) ||
 	 (packetnr == conf.audioconf.packets_per_second * conf.temp_devel_stuff.good_utterance_length_s ) ) {
	//debugout('\x1b[33m\x1b[1mserver %s\x1b[0m', user + " wid " + userdata[user].currentword.id + ":" +" Packet nr "+packetnr+": Replying -1")
	res.end( ""+reply_codes.audio_end  );
    }
    else if (packetnr > -1) {
	//debugout('\x1b[33m\x1b[1mserver %s\x1b[0m', user + " wid " + userdata[user].currentword.id + ":" +" Packet nr "+packetnr+": Replying 0")
	res.end( ""+reply_codes.package_received  );
    } 
    else res.end( ""+reply_codes.generic_server_error  );
}

// Reply to the last packer call:
function send_score(user) {

    var score_object = userdata[user].currentword.dnn_score; 
	
    score_object.dnn_score = userdata[user].currentword.dnn_score.total_score;
    score_object.total_score = userdata[user].currentword.dnn_score.total_score;
    score_object.kalles_score = -1,
    
    send_score_object(user, score_object);

}


// Reply to the last packer call:
function send_score_object(user, score_object) {

    userdata[user].lastPacketReply = score_object;

    if ( userdata[user].currentword.lastpacketnr < 0 ) {
	debugout(colorcodes.event, user + " wid " + userdata[user].currentword.id + ": Last packet not yet in!" );
	
    } else {

	var speech_start =  userdata[user].currentword.vad.speechstart / conf.audioconf.fs / 4;
	var speech_end =  userdata[user].currentword.vad.speechend / conf.audioconf.fs / 4;
	var speech_dur =  speech_end - speech_start;

	score_object.speech_start = speech_start;
	score_object.speech_end = speech_end;
	score_object.speech_dur = speech_dur;
	score_object.word = userdata[user].currentword.reference;

	score_object.wavfilename = userdata[user].currentword.wavfilename2;


	if (userdata[user].profiling) {
	    userdata[user].currentword.resultsent = true;
	    score_object.timestamps = userdata[user].timestamps;
	    userdata[user].lastPacketRes.end( JSON.stringify( score_object ) );
	}
	else {
	    userdata[user].currentword.resultsent = true;
	    userdata[user].lastPacketRes.end( "" + score_object.total_score );
	}
	debugout( '\x1b[33m\x1b[1mserver %s\x1b[0m', user + " wid " + userdata[user].currentword.id + ": Sending score for user: "+user + " word: "+ userdata[user].currentword.reference + " score: "+  score_object.total_score + " in packet #"+ userdata[user].currentword.lastpacketnr);
	logging.log_scoring({user: user,
			     packetcount: userdata[user].currentword.lastpacketnr,
			     word_id : userdata[user].currentword.id,
			     score: score_object.total_score, 
			     kalles_score : score_object.kalles_score,
			     dnn_score : score_object.dnn_score,
			     word : userdata[user].currentword.reference,
			     phoneme_scores : score_object.phoneme_scores,		
			     reference_phones : score_object.reference_phones,
			     guess : score_object.guess_phones,
			     level: userdata[user].currentlevel,
			     event: 'score',
			     wavfilename: userdata[user].currentword.wavfilename2
			     //segmentation: userdata[user].currentword.segmentation, 
			     //classification: userdata[user].currentword.phoneme_classes 
			    });

    }    
}




/*
 *
 *     A BIT MORE COMPLEX SERVER LOGIC: RECEIVING AUDIO
 * 
 */


var operate_recognition = function (req,res) {
    user = req.headers['x-siak-user'];
    packetnr = req.headers['x-siak-packetnr'];

    finalpacket = req.headers['x-siak-final-packet'];

    if (finalpacket == "true") {
	debugout( '\x1b[33m\x1b[1mserver %s\x1b[0m', user + " wid " + userdata[user].currentword.id + ": "+packetnr +" is the last packet for user: "+user + " word "+ userdata[user].currentword.reference);
	
	userdata[user].currentword.lastpacketnr=packetnr;
	userdata[user].lastPacketRes=res;
    }	    


    packet_word_id = req.headers['x-siak-current-word-id'];

    new_word = false;

    if (packetnr < 0) 
	debugout( '\x1b[33m\x1b[1mserver %s\x1b[0m', user + " wid " + packet_word_id + ": Got packet nr "+  packetnr +" for "+user );
    else {
	debugout( '\x1b[33m\x1b[1mserver %s\x1b[0m', user + " wid " + packet_word_id + ": Got packet nr "+  packetnr +" for word: "+ userdata[user].currentword.reference + " copied packets: "+ userdata[user].currentword.analysedpackets.sort(function(a, b) { return a - b; }).toString() );
	if (packet_word_id != userdata[user].currentword.id) {
	    debugout( '\x1b[33m\x1b[1mserver %s\x1b[0m', user + " wid " + packet_word_id + ' != current word_id ' + userdata[user].currentword.id + ' - Replying ' + reply_codes.network_lag_error);
	    res.end( ""+reply_codes.network_lag_error);	    
	    return 0;
	}
	
    }

    if (packetnr == 0) {
	debugout( '\x1b[33m\x1b[1mserver %s\x1b[0m', user + " wid " + packet_word_id + ": Starting to receive audio for user: "+user + " word: "+ userdata[user].currentword.reference );
	/* With first packet write the beginning to a log */
	logging.log_event( { user: user, 
			     event: "start_audio", 
			     word_id: userdata[user].currentword.id, 
			     word: userdata[user].currentword.reference,
			     level:  userdata[user].currentlevel } );		
	
    }

    
    // If recovering from a server crash or otherwise lost:
    if (!userdata.hasOwnProperty(user)) {	
	init_userdata(user);
    }

    level = req.headers['x-siak-level'];
    if (typeof(level) == 'undefined') {
	level = "L0";
	if (userdata[user].currentlevel != level) {
	    change_level(user, level, function(){});
	}
    }

    if (req.headers.hasOwnProperty('x-siak-profiler')) {
	userdata[user].profiling = req.headers['x-siak-profiler'];
    }
    else
	userdata[user].profiling = false;
    

    /* Packet nr -2 is used to initialise the recogniser ie. to check if login works... */
    if (packetnr == -2) {
	logging.log_event({user: user, 
			   event: "initialise",
			   level: level });

	debugout("Time for init reply");
	userdata[user].initreply = res;
	initialisation_reply(user);
	return 0;
    }

    /* Packet nr -1 is used to set the word: */
    else if (packetnr == -1) {
	// Connections breaking before word is complete have been causing problems.
	// Let's clear the user data when we receive indication of new upload starting:
	
	new_word = req.headers['x-siak-current-word'];
	userdata[user].readyreply = res;

	// Clear old upload and find a new id for the new word: 
	// Once that is done, send a reply to the client via event emitter
	clearUpload(user, new_word);
	return 0;

    }	

    /* Packets from 0 onward carry chunked audio data. Last packet has 'x-siak-final-packet' header set to true. */
    else {

	if (packet_word_id != userdata[user].currentword.id) {
	    res.end( ""+reply_codes.network_lag_error);	    
	}
	//else if (userdata[user].currentword.resultsent) {
	//    res.end( ""+reply_codes.late_arrival);
	//}
	// If we already have the reply, let's send it:
	else if (userdata[user].lastPacketReply ) { // && userdata[user].currentword.dnn_score) {
	    if (userdata[user].currentword.resultsent) {
		debugout( '\x1b[33m\x1b[1mserver %s\x1b[0m', user + " wid " + userdata[user].currentword.id + ": Score already sent but let's resend!");
	    }
	    debugout( '\x1b[33m\x1b[1mserver %s\x1b[0m', user + " wid " + userdata[user].currentword.id + ": Score ready so lets send it for user: "+user + " word: "+ userdata[user].currentword.reference );	    
	    userdata[user].currentword.lastPacketnr = packetnr;
	    userdata[user].lastPacketRes = res;
	    send_score(user, userdata[user].lastPacketReply);
	}
	else  if (array_contains(userdata[user].currentword.analysedpackets, packetnr))
	{
	    /* Sometimes we fail to reply, and some nosy clients try to resend their call.
	       That would mess up our careful data processing system, so let's ignore those
	       recalls. */
	    debugout(user + " wid " + userdata[user].currentword.id +  ": Packet "+packetnr +" already processed - The client tried resending?");
	    res.end( ""+reply_codes.duplicate);
	}
	else {
	    
	    /* As the audio buffer from the game is transferred in chunks, the following
	       headers tell where to place the data in our buffer (as there is a chance that
	       the HTTP packets arrive in a mixed-up order. Length is redundant as start and
               end are defined. */

	    arraystart = parseInt(req.headers['x-siak-packet-arraystart']);
	    arrayend = parseInt(req.headers['x-siak-packet-arrayend']);
	    arraylength = parseInt(req.headers['x-siak-packet-arraylength']);
	    
	    var postdata = ''; // collect the datachunks here and on 'end' copy the data to a reusable buffer

	    req.on('data', function (chunk, encoding) {
		/* HTTP data transfer happens in chunks; Node makes sure the data arrives in a proper
		   order so we can just simply append to the end: */
		postdata += chunk;

	    });
	    
	    req.on('end', function () {
		/* As the HTTP call ends (no more data chunks) it would be time to reply.
		   But as some of the things we want to do take time, we'll store the reply objects 
		   in out great central userdata object for later processing: */
		//debugout(user, "Req end! "+packetnr);

		// If result for this word has already been sent:
		{
		    /* Process the audio data: Decode, copy to our user buffer and send for
		       processing, together with the reply object */
		    
		    // For debug let's write the received data in the debug dir:
		    if (debug) { fs.writeFile("upload_data/debug/"+user+"_packet_"+packetnr, postdata); }
	    	    

		    // Decode the received data (base64 encoded binary)
		    decodedchunks=new Buffer(postdata, 'base64');
		    
		    // Check that we have some reasonable data (other than zeros) in the audio bits:		    
		    if (userdata[user].allzeros == true) {
			for (i=0; i < decodedchunks.length; i+=4) {
			    if (decodedchunks.readFloatLE(i) != 0) {
				userdata[user].allzeros = false;
				break;
			    }
			}
		    }
		    
		    decodedchunks.copy( // src buffer
			userdata[user].audiobinarydata, // targetbuffer
			arraystart*audioconf.datatype_length, // targetstart
			0, // sourcestart
			decodedchunks.length); //source-length	 	    
		    

		    userdata[user].currentword.analysedpackets.push(packetnr);
		    userdata[user].currentword.packetends[""+packetnr] = Math.max( (arrayend)*audioconf.datatype_length, 
								     userdata[user].currentword.bufferend);


		    var bufferend = 0;
		    for (i=0; i< userdata[user].currentword.analysedpackets.length; i++) {
			if (array_contains(userdata[user].currentword.analysedpackets, ""+i)) {	    
			    bufferend = userdata[user].currentword.packetends[""+i];
			}
			else
			    break;
		    }			
		    if (bufferend != userdata[user].currentword.bufferend) {
			userdata[user].currentword.bufferend = bufferend;
			process.emit('user_event', user, packet_word_id,'send_audio_for_analysis', null);
		    }
		    debugout(user + " wid " +userdata[user].currentword.id+ ": Packet "+packetnr +" copied, bufferend at " + userdata[user].currentword.bufferend);
		    //processDataChunks(user, userdata[user].currentword.id, res, packetnr);	
		    audio_packet_reply(user,res,packetnr, true);
		    
		}
	    });    
	}
    }
}


/*
 *
 *  SOME GAME CONTINUITY FUNCTIONS
 * 
 */


/*
  function get_game_data(user) {
  return game_data_handler.getData(user);
  }


  function set_game_data(user, new_data) {
  return game_data_handler.setData(user,new_data);
  }
*/



/*
 *
 *  SOME REAL FUNCTIONALITY:
 *
 *  1: Init user data structure on first call
 *     (and reinit when necessary) 
 */


function init_userdata(user, level) {
    if (typeof userdata[user] == 'undefined') {
	userdata[user] = {};

	// Initialise all the buffers with zeros:

	userdata[user].chunkeddata = new Buffer( audioconf.max_packet_length_s * 
						 audioconf.fs * 
						 audioconf.datatype_length ,0);

	userdata[user].audiobinarydata = new Buffer( 
	    audioconf.max_utterance_length_s * audioconf.fs * audioconf.datatype_length ,0);

	userdata[user].featuredata = new Buffer( 
	    Math.ceil(audioconf.max_utterance_length_s * 
		      audioconf.fs / 
		      audioconf.frame_step_samples * 
		      audioconf.feature_dim ) ,0);	

	userdata[user].segmenter_ready = false;

	// Let's remove this for a while: Init a new recogniser for each word!
	// init segmenter / recogniser:
	//userdata[user].segmenter = new recogniser_client(recogconf, user, "init_segmenter");		
	
	// init segmentation handler / classifier:

	userdata[user].segmentation_handler = new segmentation_handler(user);

	userdata[user].profiling = false;
	userdata[user].timestamps = {};

	userdata[user].currentlevel=level;
    }
}


function clearUpload(user, new_word) {

    console.log("Clearing for user",user," new word is:",new_word);

    userdata[user].lastPacketReply = false;
    userdata[user].allzeros = true;
    
    userdata[user].chunkeddata.fill(0);	   
    userdata[user].audiobinarydata.fill(0);
    userdata[user].featuredata.fill(0);

    userdata[user].vadding = false;
    userdata[user].vad_queue = false;


    word = {};

    word.id = -1;

    if (new_word)
	word.reference = new_word;
    else
	word.reference = null;
    
    word.recresult = false;

    word.packetset=[];
    word.lastpacketnr=-3;
    word.analysedpackets=[];
    word.packetends = {};

    word.speechstart=-1;
    word.speechend=-1;

    word.bufferend=0;
    word.vadded=0;
    word.sent_to_classification_queue = false;

    word.featuresdone= 0;
    word.featureprogress = [];
    word.analysed = 0;
    
    word.segmentation_complete = false;
    word.state_statistics = null;
    word.finishing_segmenter = false;
    word.resultsent = false;


    word.wavfilename2 = '';

    var vad = {};
    vad.level = 0;
    vad.background = 20;
    vad.speechstart = -1;
    vad.speechend = -1;
    vad.numsil = 0;
    vad.numspeech = 0;

    word.kalles_score = -101;
    word.dnn_score = -101;

    word.vad = vad;

    userdata[user].currentword = word;

    userdata[user].timestamps = {};

    get_next_word_id(user, function (err, res) {
	if (err) {
	    console.log(err);
	    userdata[user].currentword.id = 0;
	}
	else  {
	    if (res.length<1) { 
		userdata[user].currentword.id = 0;
	    }
	    else {
		if (typeof(res[0].word_id) === 'undefined' ) { 
		    userdata[user].currentword.id = 0;
		}
		else {
		    userdata[user].currentword.id = res[0].word_id + 1 ;
		}
		set_word_and_init_recogniser(user, userdata[user].currentword.reference,userdata[user].currentword.id );	
		process.emit('user_event', user, userdata[user].currentword.id, 'new_word_id', {});
	    }

	    logging.log_event({user: user, 
			       event: "set_word", 
			       word: userdata[user].currentword.reference, 
			       word_id: userdata[user].currentword.id,
			       level: userdata[user].currentlevel
			      });

	}
    });


}



/*
 *
 *  2: Set reference word for segmentation:
 *    
 */


function set_word_and_init_recogniser(user, word, word_id) {
    debugout(user + " wid " + word_id + ": New word id set for "+word);

    // init segmenter / recogniser:
    userdata[user].segmentation_handler.init_classification(word, word_id);

    // Kludging to continue; it really isn't necessary to use events here but
    // I want to experiment quickly
    //process.emit('user_event', user, word_id, 'segmenter_ready',{word:word});

}


/*
 *
 *  3-(n) Take in audio packets and process audio:
 * 
 */


// A somewhat overcomplicated method for checking if all data has been received:
// (But what can you do? We're in a hurry to process the data and there is no 
//  guarantee of the packets arriving in right order.)

function check_last_packet(user) {

    if (userdata[user].currentword.finishing_segmenter == false) {

	// Check if we have all the packets in already:    
	var chunkcount = -1;    
	userdata[user].currentword.analysedpackets.forEach( function(element, index, array) {
	    chunkcount++;
	});
	
	// Also, if the VAD has a speech end value, finish audio processing:
	if ((chunkcount == userdata[user].currentword.lastpacketnr) || (userdata[user].currentword.vad.speechend > -1)) {		
	    
	    if (userdata[user].currentword.vad.speechend > -1 && userdata[user].currentword.vad.speechend <= userdata[user].currentword.bufferend )
		debugout(user + " wid " + userdata[user].currentword.id + ": check_last_packet all good - VAD says we're done");
	    else if (chunkcount == userdata[user].currentword.lastpacketnr) {
		debugout(user + " wid " + userdata[user].currentword.id + ": check_last_packet all good - All chunks in : Let's tell our VAD that!");
		userdata[user].currentword.vad.speechend = userdata[user].currentword.bufferend;
	    }
	    userdata[user].currentword.finishing_segmenter = true;

	    if ( userdata[user].currentword.vad.speechstart > -1 ) {
		// Let's send the speech segmnents to the aligner:

		var sh_aligner = require('./audio_handling/shell_script_aligner');
		sh_aligner.align_with_shell_script(
		    conf, 
		    userdata[user].audiobinarydata.slice(userdata[user].currentword.vad.speechstart,  
							 userdata[user].currentword.vad.speechend),
		    userdata[user].currentword.reference, 
		    user, 
		    userdata[user].currentword.id
		); 

		// For debug let's write the received data in the debug dir:
		if (debug) { 
		    fs.writeFile("upload_data/debug/"+user+"_floatdata", 
				 userdata[user].audiobinarydata.slice(userdata[user].currentword.vad.speechstart,  
								      userdata[user].currentword.vad.speechend) ); 
		    fs.writeFile("upload_data/debug/"+user+"_complete_floatbuffer", 
				 userdata[user].audiobinarydata); 			 
		}
		
		// Kalle commented out the audio analyzer 

		var sh_feat_ext = require('./audio_handling/audio_analyser');

		sh_feat_ext.compute_features( 
		    audioconf,
		    userdata[user].audiobinarydata.slice(userdata[user].currentword.vad.speechstart,  
							 userdata[user].currentword.vad.speechend   ),
		    userdata[user].featuredata,
		    user, 
		    userdata[user].currentword.id,
		    packetnr,
		    userdata[user].currentword.vad.speechend
		);
	    }
	    else {
		if (userdata[user].allzeros) {
		    debugout(user + " wid " + userdata[user].currentword.id + ": No mic signal detected. Reply with error code ");
		    process.emit('user_event', user, userdata[user].currentword.id, 'mic_off',{});		    
		}
		else {		    
		    debugout(user + " wid " + userdata[user].currentword.id + ": No audio activity detected. Reply with error code ");
		    process.emit('user_event', user, userdata[user].currentword.id, 'no_audio_activity',{});
		}
	    }
	}
    }
}



function asyncAudioAnalysis(user) {

    if ( (userdata[user].currentword.vad.speechend > 0)  && ( userdata[user].currentword.vadded > userdata[user].currentword.vad.speechend) ) {
	debugout(user +": Whole package after VAD says we're finished!");	
    }
    else {
	/*
	 * OPERATING VOICE ACTIVITY DETECTION
	 */

	var vadp = { level: userdata[user].currentword.vad.level, 
		     background: userdata[user].currentword.vad.background  };

	if (userdata[user].vadding == true) {
	    userdata[user].vad_queue = true;
	}

	if (userdata[user].vadding == false) {

	    userdata[user].vad_queue = false;

	    for (i=userdata[user].currentword.vadded; i < userdata[user].currentword.bufferend+conf.vad.window; i+= conf.vad.window ) {
		vadp = vad.classify_frame( userdata[user].audiobinarydata.slice(i, i+conf.vad.window), vadp);
		
		if (vadp.is_speech) { 
		    userdata[user].currentword.vad.numsil = 0;  
		    userdata[user].currentword.vad.numsp += 1;  
		}
		else {
		    userdata[user].currentword.vad.numsil += 1;  
		    userdata[user].currentword.vad.numsp   = 0;  		
		}
		
		if ((userdata[user].currentword.vad.speechstart < 0 ) && 
		    (userdata[user].currentword.vad.numsp >= conf.vad.speech_frame_thr)) 
		{
		    userdata[user].currentword.vad.speechstart = Math.max(0, i - (conf.vad.speech_frame_thr * conf.vad.window));		
		    userdata[user].currentword.vad.speechstart = Math.max(0, userdata[user].currentword.vad.speechstart - conf.vad.extra_start_sil);
		    
		}
		else if ((userdata[user].currentword.vad.speechstart > -1 ) && 
			 ( userdata[user].currentword.vad.speechend < 0 ) && 
			 (userdata[user].currentword.vad.numsil >= conf.vad.sil_frame_thr)) 
		{
		    userdata[user].currentword.vad.speechend = i - (conf.vad.sil_frame_thr * conf.vad.window) ;
		    userdata[user].currentword.vad.speechend += conf.vad.extra_end_sil ;
		    
		    process.emit('user_event', user, userdata[user].currentword.id,'last_packet_check', null);

		}

		userdata[user].currentword.vadded = i+conf.vad.window;

	    }
	    
	    userdata[user].currentword.vad.level = vadp.level;	
	    userdata[user].currentword.vad.background = vadp.background;	   
	    
	    userdata[user].vadding = false;

	    if (userdata[user].vad_queue == true)
		process.emit('user_event', user, packet_word_id,'send_audio_for_analysis', null);
	    else
		process.emit('user_event', user, userdata[user].currentword.id,'last_packet_check', null);
	}
    }
}


function send_to_recogniser(user, datastart, dataend) {

    // Write the floats into a 16-bit signed integer buffer:
    if (debug) {
	var okcount=0;
	var notokcount = 0;
    }

    pcmdata = new Buffer( (dataend-datastart) /2);
    pcmindex=0;

    for (var i = datastart; i < datastart+(pcmdata.length*2); i+=4) {
	try {
	    pcmdata.writeInt16LE( (userdata[user].audiobinarydata.readFloatLE(i) * 32767), pcmindex );
	    pcmindex+=2;
	    if (debug) okcount++;
	}
	catch (err) {	    
	    pcmindex+=2;
	    //debugout(err.toString());
	    if (debug) notokcount++;
	}
    }
    if (debug && notokcount > 0) {
	debugout(user + " wid " + userdata[user].currentword.id + ": ERRRRROOOOORRRRRSSSS!!!!!!!!  Bad floats in "+notokcount+" of "+(okcount+notokcount)+" values");
    }

    // Send the 16-bit buffer to recogniser and segmenter processses:
    userdata[user].segmenter.send_audio(pcmdata);  
}




var start_level = function (req,res) {
    user = req.headers['x-siak-user'];
    level = req.headers['x-siak-level'];
    if (typeof(level) == 'undefined') 
	level = "L0";

    debugout( '\x1b[33m\x1b[1mserver %s\x1b[0m', user + ": Received packet level up! user: "+user + " level "+ level);
    
    game_data_handler.get_and_somehow_order_words_for_level( user, level, req, res, 
	function(e,req,res,user, level,words) { 
	    if (!userdata.hasOwnProperty(user)) {	
		debugout("Init userdata!");
		init_userdata(user, function() {
		    userdata[user].currentlevel = level;
		    userdata[user].levelwordstack = words;
		    res.end( JSON.stringify( words));
		});
	    }
	    else {
		userdata[user].currentlevel = level;
		userdata[user].levelwordstack = words;
		res.end( JSON.stringify( words));
	    }
	});
}


var get_next_word = function(req,res) {
    user = req.headers['x-siak-user'];
    level = req.headers['x-siak-level'];
    if (typeof(level) == 'undefined') 
	level = "L0";

    //if (! 'user' in userdata) {
    //	init_userdata(user);
    //}

    var nextword;

    if (user in userdata 
	&& 'levelwordstack' in userdata[user] 
	&& userdata[user].levelwordstack.length>0) {


	nextword = userdata[user].levelwordstack[0];
	userdata[user].levelwordstack =  userdata[user].levelwordstack.slice(1);
	res.end( JSON.stringify( nextword));

	
    }
    else {
	game_data_handler.get_and_somehow_order_words_for_level( user, level, req, res, 
	    function(e,req,res,user, level,words) { 
		if (!userdata.hasOwnProperty(user)) {	
		    debugout("Init userdata!");
		    init_userdata(user, function() {
			userdata[user].currentlevel = level;
			nextword=words[0];
			userdata[user].levelwordstack = words.slice(1);
			res.end( JSON.stringify( nextword));
		    });
		}
		else {
		    userdata[user].currentlevel = level;
		    nextword=words[0];
		    userdata[user].levelwordstack = words.slice(1);
		    res.end( JSON.stringify( nextword));
		}
	    });
    }
}



var change_level = function(user, level, callback)  {
    userdata[user].currentlevel = level;
    
    logging.log_event({user: user, 
		       event: "start-level", 
		       level: userdata[user].currentlevel
		      });
    callback();
}

var finish_level = function (req,res) {
    user = req.headers['x-siak-user'];
    level = req.headers['x-siak-level'];
    if (typeof(level) == 'undefined') 
	level = "L0";
    score = req.headers['x-siak-score'];
    if (typeof(score) == 'undefined') 
	score = 0;

    debugout( '\x1b[33m\x1b[1mserver %s\x1b[0m', user + " wid " + userdata[user].currentword.id + ": Received packet level up! user: "+user + " level "+ level);

    logging.finish_level(user, level, score);
    logging.log_event({user: user, 
		       event: "finish-level", 
		       level: userdata[user].currentlevel,
		       score: score
		      });
    res.end("ok");
}



/*
 *
 * A FEW HELPER FUNCTIONS
 *
 */

// From http://stackoverflow.com/questions/237104/how-do-i-check-if-an-array-includes-an-object-in-javascript

function array_contains(array, obj) {
    var i = array.length;
    while (i--) {
	if (array[i] === obj) {
	    return true;
	}
    }
    return false;
}

function get_next_word_id(user, callback) {
    game_data_handler.get_next_word_id(user, callback)
    /*if (userdata[user].currentword == null) {
      return 1;
      }
      else {
      return userdata[user].currentword.id +1;
      }*/
}

function get_current_word_id(user) {
    return userdata[user].currentword.id;
}

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename)
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes
}


