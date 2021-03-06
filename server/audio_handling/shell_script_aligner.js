
/*
if (process.env.NODE_ENV !== 'production'){
    print_debug('Requiring longjohn:');
    longjohn = require('longjohn');

    longjohn.async_trace_limit = 25;   // defaults to 10
}*/

var logging = require('../game_data_handling/logging.js');

//var eventEmitter = require('./emitters.js');

//var config=require('config');
var spawn = require('child_process').spawn;
//var exec = require('child_process').exec;

var feature_timeout_ms = 15000; // 15s 
var DEBUG_TEXTS = true;

var sptk_path='/usr/local/bin/';

var debug = true;

//var fs = require('fs');
var fs = require('fs-extra');
var mkdirp = require('mkdirp');


var outputbuffer = Buffer.concat([]);


var wav    = require('wav');



//function compute_features(audioconf, inputbuffer, targetbuffer, user, word_id, packetcode, maxpoint) {

function align_with_shell_script(conf, inputbuffer, word_reference, user, word_id) {

    var tmpdir = "/dev/shm/siak-"+process.pid+"-"+user+"_"+word_id+"_"+Date.now();
    var wavinput = tmpdir+"/feature_input";
    var labelinput = tmpdir+"/label_input";
    var recipeinput = tmpdir+"/recipe_input";
    var segmentoutput = tmpdir+"/segment_output";
 
    fs.mkdirSync(tmpdir);
    
    // 1. Write the float data into mem file system as 16bit PCM:


    var pcmindex = 0;
    var okcount = 0;
    var notokcount = 0;
    
    //print_debug("Writing "+inputbuffer.length + " bytes of float data into integer buffer");

    pcmbuffer = new Buffer(inputbuffer.length/2);

    for (var i = 0; i < inputbuffer.length; i+=4) {
	try {
	    fValue = inputbuffer.readFloatLE(i);
	    
	    pcmbuffer.writeInt16LE( fValue * 32767 , pcmindex );
	    pcmindex+=2;
	    if (debug) okcount++;
	}
	catch (err) {	    
	    pcmindex+=2;
	    print_debug(err.toString());
	    if (debug) notokcount++;
	}
    }
    
    print_debug(okcount + " values written, "+ notokcount +" values NOT written");


    var writer = new wav.FileWriter(wavinput, { sampleRate: conf.audioconf.fs , channels: 1});
    writer.write(pcmbuffer);    
    writer.end();

    // Make a copy of the wav file (async to save time):
    // #cp $3 "/l/data/siak-server-devel/server/upload_data/from_game/${1}_`date +"%Y-%m-%d-%H-%M-%S"`.wav"
    var target_dir =  'upload_data/from_game/'+user; // Kalle: added user

    mkdirp(target_dir, function(err) { 
    	// path exists unless there was an error
	});

    var wav_basename = user +'_'+ word_id +'_'+ word_reference  +'_'+ logging.get_date_time().datetime_for_file + ".wav" ;
    var target_wavfile = target_dir + '/' + wav_basename;
    var adaptation_wavfile = target_dir + '/ada/' + user +'_'+ word_id +'_'+ word_reference  +'_'+ logging.get_date_time().datetime_for_file + ".wav" ;
    var adaptation_matrix_name = target_dir + '/S'
    print_debug("target_wavfile :" + target_wavfile );
    //print_debug("wavinput :" + wavinput );

    fs.copy(wavinput, 
	    target_wavfile, 
	    function(err) { 
		if (err) {
		    logging.log_error( {user: user, 
					event: "save_wav", 
					word: word_reference,
					target: target_wavfile,
					error: err.toString() } );
		}
		else {
		    //console.log("Sending save event with "+wav_basename);
		    process.emit('user_event', user, word_id, 'wav_file_written', { wavfilename : wav_basename });
		}
	    });



    // 2. write the labels in to mem file system:
    
    // (This will be done by the script itself)

    // 3. write the recipe file into mem file system:

    // (This will be done by the script itself)


    //var lexicon = conf.recogconf.lexicon;
    var lexicon = conf.recogconf.word_modeldir + word_reference + '/' + word_reference +'.lex';
    var model = conf.recogconf.model
    var flag_use_adaptation = conf.recogconf.flag_use_adaptation;
    var featext_command = "./audio_handling/shell_script_aligner_quick.sh";
    var model_word = conf.recogconf.word_modeldir + word_reference + '/' + word_reference;
    var featext_args = [ word_reference, // $1
			 lexicon, // $2
			 wavinput, // $3
			 labelinput, // $4
			 model_word, // $5
			 segmentoutput, // $6
			 flag_use_adaptation,// $7
			 adaptation_matrix_name, // $8
			 model+".cfg"]; // $9

    var comm = featext_command;
    featext_args.forEach(function(arg){ comm += " "+arg });

    print_debug("Starting the shell script now: "+comm);

    process.emit('user_event', user, word_id, 'timestamp',{name: 'recog_start' }); 			

    var featext = spawn(featext_command, featext_args);
    
    //console.log(featext_command);
    //console.log(featext_args);

    featext.stderr.on('data',  function(data)  { print_debug(data); 
						//process.emit('user_event', user, word_id, 'segmented',{word:word_reference} ) 
					      } );
    
    featext.on('error',  function(err)  { show_error(err, 'Feat on error'); });
    
    featext.on('uncaughtException', function(err) { show_error(err, 'Feat on uncaughtexp');});
    
    featext.on('close',  function(exit_code)  { 
	print_debug("Shell script exit: "+exit_code.toString());

	if (exit_code == 0) {
	    
	    fs.readFile(segmentoutput, function (err, segmentation) {
		if (err) {
		    print_debug("Error reading segmentoutput!");
		    throw err;
		}
		
		print_debug('Segmentation done: '+ segmentation);	   
		
		process.emit('user_event', user, word_id, 'segmented',{word:word_reference, segmentation:segmentation}); 			
		process.emit('user_event', user, word_id, 'timestamp',{name: 'recog_stop' }); 			

		// TODO: merge Kalle's dbg with other events:
		process.emit('user_event', user, word_id, 'kalle_dbg',{word:word_reference, segmentation:segmentation, target_wavfile:target_wavfile, adaptation_wavfile:adaptation_wavfile, target_dir: target_dir, adaptation_matrix_name: adaptation_matrix_name});


		/*
		fs.unlink(wavinput);
		fs.unlink(labelinput);

		fs.unlink(segmentoutput);
		fs.rmdir(tmpdir);
*/
		// We don't use the recipe input, though I guess we could.
		//fs.unlink(recipeinput);

	    });
	}
	show_exit(exit_code, 'feat'); 
    });
}



function show_error(err, source) {
    print_debug("=ALIGN ERR== Error from "+source);
    print_debug(err);
}



function show_exit(exit_code, source) {
    if (DEBUG_TEXTS) {
	if (exit_code==0) 
	{
	    print_debug(source + " exited with code "+exit_code, 0);
	}
	else 
	{
	    print_debug(source + " exited with code "+exit_code, 0);
	}
    }
}


function print_debug( text , priority, user, word_id ) {
    // Did you set DEBUG_TEXTS == true there at the top?
    //if (DEBUG_TEXTS) 
    //{
    //  var cyan = "\x1b[36m";
    //	var bright = "\x1b[1m" ;
    //	var reset = "\x1b[0m";
    //	console.log(cyan + bright + "aligne " + logging.get_date_time().datetime + " " + text + reset);
    printdata = {
	source: 'aligner',
	message: text,
    }
    if (typeof(priority) != 'undefined') 
	printdata.priority = priority;
    else
	printdata.priority = 0;

    if (typeof(user) != 'undefined') 
	printdata.user = user;

    if (typeof(user) != 'word_id') 
	printdata.user = word_id;
    
    process.emit('print', printdata);
}




module.exports = { align_with_shell_script: align_with_shell_script };





