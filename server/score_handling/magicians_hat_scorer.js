

/* Module for calculating score for a pronunciation: 




      /\
     //\\       /\
    /'  \\     //\\
         \\   //  `\
          \\ //
         .-'^'-.
       .' a___a `.
      ==  (___)  ==
       '. ._I_. .'
   ____/.`-----'.\____
  [###(__)#####(__)###]
   ~~|#############|~~
     |#############|
     |#############|
     |#############|
     |#############|
     |#############|
     |#############|
     |#############|
     ~~~~~~~~~~~~~~~


(thanks to http://www.chris.com/ascii/index.php?art=animals/rabbits)

*/





/*

Input is like this:

user: foo
word: choose
wordid: 1
guesses: 0.00002538027911214158,0.005043511278927326,0.00020036376372445375,7.929241974125034e-8,0.000036144825571682304,0.000004606672519003041,0.049489643424749374,1.3071714022316883e-7,4.6780905904597603e-7,1.144674910413812e-9,0.0007044899393804371,1.972058605304028e-8,0.000009749945093062706,0.0003862702287733555,0.000008326346687681507,1.717751985097493e-8,0.0000918901278055273,0.000008543332114641089,0.00022318454284686595,9.291576930081646e-7,0.007322159595787525,0.000004777699359692633,0.00025028304662555456,0.00016626715660095215,...
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
var class_definitions = require('./phone_classes.js');

var magicians_hat_scorer = function(user, word, wordid, guesses, segmentation, likelihood) {



    scores=[];

    reference_phones=[];
    guess_phones=[];
    
    if (typeof(segmentation) == 'undefined') {
	score_event_object = { 'total_score' :  -4,
			       'phoneme_scores' : [-1],
			       'reference_phones' : reference_phones,
			       'guess_phones' : [-1],
			       'error': 'DNN classifier error' };
	process.emit('user_event', user, wordid,'classification_error', score_event_object );
	return false;
    }

    else if (Math.min.apply(Math, guess_phones) < 0 ) {
	score_event_object = { 'total_score' :  -2,
			       'phoneme_scores' : [-2],
			       'reference_phones' : reference_phones,
			       'guess_phones' : [-1],
			       'error': 'DNN classifier error' };
    }
    else {

	total_score=0;

	for (var i = 0; i < segmentation.length; i++) {
	    ref=segmentation[i];
	    ref_phone = ref[0].state.replace(/.*\-([^+]+)\+.*/g, '$1');

	    ref_ipa =  class_definitions.festival_unilex_to_ipa [
                class_definitions.arpa_to_festival_unilex [
                    class_definitions.aalto_to_arpa[ ref_phone] ] ];


	    reference_phones.push(ref_ipa)

	    classcount = Object.keys(class_definitions.classes_to_aalto).length;

	    // A deep copy of the guess class values:
	    target_guesses = guesses.slice( i * classcount, (i+1)*classcount-1);
	    //debugout(user, "guess.slice from " +(i * classcount) + " to "+ ((i+1)*classcount) + ":  "+target_guesses.toString())
	    guess_class = indexOfMax(target_guesses);

	    if (guess_class < 0 ) {

		process.emit('user_event', user, wordid,'classification_error', score_event_object );
		return false;
		//scores.push(-1);
		//total_score =0;
		
		//break;
	    }

	    //debugout(user, " Guess class "+guess_class);
	    guess_ipa = class_definitions.festival_unilex_to_ipa [
                class_definitions.arpa_to_festival_unilex [
                    class_definitions.aalto_to_arpa[
                        class_definitions.classes_to_aalto [ guess_class ] ] ] ];

	    guess_phones.push(guess_ipa)

	    debugout(user,  "Ref: "+ref_phone +"->" + ref_ipa + " Guess: "+ guess_class +"->" + class_definitions.classes_to_aalto [ guess_class ] +"->"+guess_ipa);
	    if (guess_ipa == ref_ipa) {
		scores.push(100);
		total_score+=100;
	    }

	    else {
		target_guesses[ indexOfMax(target_guesses) ] = -1;
		second_guess_class = indexOfMax(target_guesses);

		second_guess_ipa = class_definitions.festival_unilex_to_ipa [
                    class_definitions.arpa_to_festival_unilex [
                        class_definitions.aalto_to_arpa[
                            class_definitions.classes_to_aalto [ second_guess_class ] ] ] ];

		debugout(user,  "Second guess: " +second_guess_class + "->" +second_guess_ipa);

		if ( second_guess_ipa == ref_ipa ) {
		    scores.push(75);
		    total_score+=75;
		}
		else {

		    guess = class_definitions.phone_properties[guess_ipa];
		    if (typeof(guess) == 'undefined') {
			process.emit('user_event', user, wordid, 'error', { 'error': guess_ipa +" not found in models!",
									   'source': "magicians_hat_scorer.js" } );			
			score += 0;
		    }
		    else {
			ref = class_definitions.phone_properties[ref_ipa];

			//console.log(  parseInt(guess.frontness.value) +  parseInt(ref.frontness.value)  );

			var score = 0.0;
			
			
			if ( guess.type.name == 'consonant' && ref.type.name == 'consonant') {
			    score += 25;
			    
			    if (guess.voiced == ref.voiced)
				score += 25;
			    if (guess.place == ref.place)
				score += 25;
			    if (guess.manner == ref.manner)
				score += 25;
			}	    
			
			else if (guess.type.name === 'vowel' && ref.type.name === 'vowel' ) {

			    score += 20;
			    
			    if (parseInt(guess.vowel_length.value) == parseInt(ref.vowel_length.value) ) 
				score += 10;
			    
			    if (parseInt(guess.frontness.value) == parseInt(ref.frontness.value) ) 
				score += 10;

			    else 
				if ( Math.abs( parseInt(guess.frontness.value) - parseInt(ref.frontness.value) )<2 ) 
				    score +=5;

			    if (guess.openness == ref.openness ) 
				score += 10;
			    else 
				if ( Math.abs(guess.openness.value - ref.openness.value)<2 ) 
				    score +=5;
			    
			    if (guess.diphtong_frontness == ref.diphtong_frontness ) 
				score += 10;
			    else 
				if ( Math.abs(guess.diphtong_frontness.value - ref.diphtong_frontness.value)<2 ) 
				    score +=5;

			    if (guess.diphtong_openness == ref.diphtong_openness ) 
				score += 10;		
			    else 
				if ( Math.abs(guess.diphtong_openness.value - ref.diphtong_openness.value)<2 ) 
				    score +=5;

			    if (guess.roundness == ref.roundness ) 
				score += 20;		

			}
		    }
		    scores.push(score);
		    total_score += score;
		}	
	    }
	}


	

	debugout(user, "user: "+user);
	debugout(user, "word: "+word);
	debugout(user, "wordid: "+wordid);    
	debugout(user, "Scores: "+scores);
	debugout(user, "Total score: "+ total_score + " --> " + Math.ceil( total_score   / 20.0 / segmentation.length  ));

	total_score =  Math.ceil(total_score  / 20.0 / segmentation.length );

	if (total_score == 0)
	    total_score = -2;

	// Here some processing could be made


	

	/* phoneme scoring results should be stored in an array that can
	   be passed to a logging module. */




	/* When ready, return the score by emitting an event.
	   The event call should include an object with score field
	   and some classification info to be logged (ie. which phonemes 
	   were good, which ones bad etc. */

	score_event_object = { 'total_score' :  total_score,
			       'phoneme_scores' : scores,
			       'reference_phones' : reference_phones,
			       'guess_phones' : guess_phones,
			       'error': null };


    }

    process.emit('user_event', user, wordid,'dnn_scoring_done', score_event_object );
   

}


// From: 
// http://stackoverflow.com/questions/11301438/return-index-of-greatest-value-in-an-array
function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}





/* Text output through this function will be green */
//var debugout = function(user,msg) {
//    console.log("\x1b[32mscorer %s\x1b[0m", logging.get_date_time().datetime + ' '+user+': '+ msg);
//}



function debugout( user, text , priority, word_id ) {
    // Did you set DEBUG_TEXTS == true there at the top?
    //if (DEBUG_TEXTS) 
    //{
    //  var cyan = "\x1b[36m";
    //	var bright = "\x1b[1m" ;
    //	var reset = "\x1b[0m";
    //	console.log(cyan + bright + "aligne " + logging.get_date_time().datetime + " " + text + reset);
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





module.exports = { magicians_hat_scorer : magicians_hat_scorer };
