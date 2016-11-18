
var conf = require('../config');

var fs = require('fs');
var colorcodes =  {'event' : '\x1b[36mserver %s\x1b[0m' };


var fsSync = require("fs-sync");



/* Module for calculating score for a pronunciation: */

/*

Input is like this:

user: foo
word: choose
wordid: 1
Segmentation:
0:
  0:
    state: 30
    start: 4
    end: 12
  1:
    state: 32
    start: 13
    end: 16
  2:
    state: 36
    start: 17
    end: 19
1:
  0:
    state: 1325
    start: 20
    end: 69
  1:
    state: 1334
    start: 70
    end: 72
  2:
    state: 1347
    start: 73
    end: 76
2:
  0:
    state: 1431
    start: 77
    end: 90
  1:
    state: 1448
    start: 91
    end: 96
  2:
    state: 1463
    start: 97
    end: 98
Likelihood: -2.429732261225581




Output should be a score between 1 and 5.


*/

var logging = require('../game_data_handling/logging.js');


var fur_hat_scorer = function(user, word, wordid, currentword, eventdata) {
	
    currentword.wavfilename = eventdata.target_wavfile;
    currentword.adawavfilename = eventdata.adaptation_wavfile; 
    currentword.target_dir = eventdata.target_dir; 
    currentword.adaptation_matrix_name = eventdata.adaptation_matrix_name

    cmd="./audio_handling/word_cross_likelihood_score.py " + eventdata.word + " " + eventdata.target_wavfile + " " + eventdata.target_dir + " " + eventdata.adaptation_matrix_name + " " + conf.recogconf.flag_use_adaptation + " " + conf.recogconf.lexicon;
    debugout("word_cross_likelihood scoring command: " + cmd)	
    var process2 = require("child_process");
    ls = process2.execSync(cmd);

    cmd ="./audio_handling/audio_cross_likelihood_score.py " + eventdata.word + " " + eventdata.target_wavfile + " " + eventdata.target_dir + " " + eventdata.adaptation_matrix_name + " " + conf.recogconf.flag_use_adaptation + " " + conf.recogconf.lexicon;
    debugout("audio_cross_likelihood scoring command: " + cmd)	
    //var process3 = require("child_process");
    //ls = process3.execSync(cmd);
    var score_file_name = eventdata.target_dir + '/score_out.txt'
    var score_string = fs.readFileSync(score_file_name).toString();
    debugout('score string' + score_string)
    score_event_object = { 'total_score' :  parseInt(score_string), 'error': null};
    //score_event_object = { 'total_score' :  5};// parseInt(score_string)};

    process.emit('user_event', user, currentword.id, 'kalles_scoring_done',score_event_object);


    //debugout(colorcodes.event,'kalle score: ' + eventdata.total_score)
    //debugout(colorcodes.event,'kalle wav: ' + currentword.wavfilename);
    //debugout(colorcodes.event,'kalle ada wav: ' + currentword.adawavfilename);

    if (eventdata.total_score>4 && conf.recogconf.flag_use_adaptation) {
	var from_file=currentword.wavfilename;
	var to_file=currentword.adawavfilename;
	var temp_file=currentword.adawavfilename + "temp";
	var adaptation_matrix_name=currentword.adaptation_matrix_name;
	var target_dir=currentword.target_dir;
	debugout('adptation_matrix_name ' + adaptation_matrix_name);
	var fileSize = getFilesizeInBytes(from_file)
	debugout("File size: " + fileSize)
	debugout("target_dir: " + target_dir)

	fsSync.copy(from_file, temp_file)
	fs.renameSync(temp_file, to_file); // is this atomic i.e. does it produce full file immediatedly?
	if (flag_ada_running ==0) {
	    //var target_dir=currentword.target_dir;
	    //var adaptation = require('./audio_handling/adaptation_dbg.js');
	    var process3 = require('child_process');
	    var lexicon = conf.recogconf.lexicon;
    	    var model = conf.recogconf.model
	    flag_ada_running=1;
	    debugout("adaptation running " + target_dir);
	    cmd = 'node ./audio_handling/adaptation_dbg.js ' + target_dir + ' ' + lexicon + ' ' + model + ' ' + adaptation_matrix_name;
	    debugout(cmd);
	    ls = process3.exec(cmd, function (error, stdout, stderr) {
		//console.log('stdout: ' + stdout);
		//console.log('stderr: ' + stderr);
		
		if (error==null) {
		    debugout("no error in ada"); 
		}
		if (error !== null) {
    		    console.log('exec error: ' + error);
  		}
	    });

 	    ls.on('exit', function (code) {
   		debugout('Child process exited with exit code '+code);
		debugout('kekkonen '+ flag_ada_running.toString());
		flag_ada_running=0;
 	    });
	}
    }




}



/* Text output through this function will be green */
//var debugout = function(user,msg) {
//    console.log("\x1b[32mscorer %s\x1b[0m", logging.get_date_time().datetime + ' '+user+': '+ msg);
//}


function debugout( text , priority, user, word_id ) {

    printdata = {
	source: 'scorer',
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





module.exports = { fur_hat_scorer : fur_hat_scorer };
