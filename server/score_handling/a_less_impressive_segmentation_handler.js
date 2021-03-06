

var net = require('net');

var fs = require('fs');

var logging = require('../game_data_handling/logging.js');

var HOST = 'localhost'; // The remote host
var PORT = 50007;       // The same port as used by the server
var ack  = -1;
var ackbuffer;
var dnn_server_timeout = 2000; // in ms

var payload_length = 270;
var pause_between_packets = 20;

var got_phone_index = -200;
var got_data_len = -300;
var got_data = -400;
var here_comes_answer = -500;

var conf = require('../config.js');


// Redundant as we're using tcp sockets?
//var classifier_command = "./score_handling/keras_classifier_server.py";


// constructor

function SegmentationHandler(user) {

    this.user = user;

    this.word = null;

    this.word_id = null;

    this.classifications = [];
    this.classifier_queue = [];
    this.classifier = null;

    this.connected;

    this.classified_count = 0;

    this.state = "waitforacc";

    debugout("New segmentation handler started for user "+user, 0, this.user);


    this.sizebuffer = new Buffer(4);
    this.sizebuffer.writeInt32LE(payload_length);

    //this.data_to_send = null;
    this.payloadbuffer = null;
    
    


    this.datadim = conf.dnnconf.datadim;
    this.timesteps = conf.dnnconf.timesteps;
    this.datasize = conf.dnnconf.datasize;
    
    ackbuffer = new Buffer(4);
    ackbuffer.writeInt32LE(-1);

    SegmentationHandler.prototype.init_classification = function(word, word_id) {
	// placeholder for things to come:
	this.word_id = word_id;
    }
    
    SegmentationHandler.prototype.shell_segmentation_to_state_list = function(segmentation_string) {
	/* Input string like this:
	   0 128 __.0 
	   128 256 __.1 
	   256 384 __.2 
	   384 1408 _-C+u.0 
	   1408 1920 _-C+u.1 
	   1920 2432 _-C+u.2 
	   2432 8832 C-u+z.0 
	   8832 9344 C-u+z.1 
	   9344 9472 C-u+z.2 
	   9472 11648 u-z+_.0 
	   11648 12160 u-z+_.1 
	   12160 12288 u-z+_.2 
	   12288 12416 __.0 
	   12416 12544 __.1 
	   12544 12800 __.2 

	

	and output:
	[ [state0start,state0end], [state1start,state1end],... ]
	*/

	if (segmentation_string != null) {

	    
	    var segmentation_array = [];   
	    var ct = 0;
	    var states = [];

	    /* This is some heavy kludging to use the Aalto ASR server segmentation
	       which seems to give the segmentation in a pretty sneaky format;
	    */

	    var startframe=0;
	    
	    segmentation_array = [];

	    var state = 458;
	    var start = 0;

	    segmentation_string.toString().split("\n").forEach( function(line, index) {

		if (line) {
		    begin_end_and_model = line.split(" ");
		    
		    if (begin_end_and_model[2].substr(0,2) != '__') {
			
			start = begin_end_and_model[0];
			end = begin_end_and_model[1];//-1;
			length = Math.round((end-start)/conf.audioconf.frame_step_samples) + " frames"
			state = begin_end_and_model[2]
			
			states.push({ 'state':state, 'start':start, 'end': end , 'length': length  })
			
			if ( (index+1) %3 == 0) {		    
			    segmentation_array.push( states );
			    states = [];
			}
		    }
		}


	    });



	    debugout("Setting the classification array length to: "+segmentation_array.length, 0, this.user);

	    this.classifications = new Array(segmentation_array.length);
	    


	    
	    return segmentation_array;
	}

	else return [];
    }


    SegmentationHandler.prototype.segmentation_to_state_list = function(segmentation_string) {
	// Input string like this:
	// "1:459;37:460;41:30;51:32;55:36;58:1325;95:1334;98:1347;102:1431;115:1448;120:1463;123:458;"
	// and output:
	// [ [state0start,state0end], [state1start,state1end],... ]


	if (segmentation_string != null) {

	    
	    var segmentation_array = [];   
	    var ct = 0;
	    var states = [];

	    /* This is some heavy kludging to use the Aalto ASR server segmentation
	       which seems to give the segmentation in a pretty sneaky format;
	    */

	    var startframe=0;
	    
	    segmentation_array = [];

	    var state = 458;
	    var start = 0;

	    segmentation_string.split(";").forEach( function(line, index) {
		
		border_and_state = line.split(":");

		end = border_and_state[0]-1;

		if (state != 458 && state != 459 && state != 460) {
		    states.push({ 'state':state, 'start':start, 'end': end  })

		    if ( (index+1) %3 == 0) {
			segmentation_array.push( states );
			states = [];
		    }
		}

		start = border_and_state[0];

		state = border_and_state[1];

	    });


	    debugout("Setting the classification array length to: "+segmentation_array.length, 0, this.user);
	    this.classifications = new Array(segmentation_array.length);


	    return segmentation_array;

	}

	else return [];
    }

    get_zero_array = function(dim) {

	// from: 
	// http://stackoverflow.com/questions/1295584/most-efficient-way-to-create-a-zero-filled-javascript-array

	return Array.apply(null, Array( dim  )).map(Number.prototype.valueOf,0);
    }



    SegmentationHandler.prototype.get_classifiable_thing = function(segmentation, features) {


	// Sanity checks:
	if ( !segmentation ||  segmentation.length < 1) {
	    debugout("Something funny about the segmentation (length zero)", 0, this.user)
	    process.emit('user_event', 
			 this.user, 
			 this.word_id,
			 'classification_error', {});
	    return null;
	}


	// Hastily copied from a test script, this could be so much better...
	// Schedule for rewriting when I have some extra time and energy. Maybe 2023?

	var state = "start";


	var returnsizebuffer = new Buffer(4,0);
	
	var payloadbuffer = new Buffer( segmentation.length *  this.datadim * this.timesteps * this.datasize);
	payloadbuffer.fill(0);

	for (var i = 0; i < segmentation.length; i++) {
	    segment=segmentation[i];
	    
	    segmentstartpoint = segment[0]['start'] / conf.audioconf.frame_step_samples * this.datadim * this.datasize;
	    segmentendpoint = segment[2]['end'] / conf.audioconf.frame_step_samples * this.datadim * this.datasize;

	    //debugout(this.user, "Copying bytes "+ segmentstartpoint +"-"+segmentendpoint + " of features to the buffer");
	    //debugout(this.user, "Copying "+ Math.min(segmentendpoint-segmentstartpoint, this.datadim * this.timesteps * 4) + " bytes of features to the buffer");

	    payloadstartpoint =  i *  this.datadim * this.timesteps * this.datasize;

	    //debugout(this.user, "Put that data in the payload buffer starting at " + payloadstartpoint );

	    //debugout(this.user, "And end at Math.min("+segmentendpoint+", "+segmentstartpoint+" + "+this.datadim +" * "+ this.timesteps + " * " +this.datasize +" ) --> " + (Math.min(segmentendpoint, segmentstartpoint + this.datadim * this.timesteps * this.datasize  ) ) );

	    debugout( "payloadstartpoint: "+payloadstartpoint + "  segmentstartpoint: "+ segmentstartpoint + " important thing: "+ Math.min(segmentendpoint, segmentstartpoint + this.datadim * this.timesteps * this.datasize ) , 0, this.user);

	    features.copy(payloadbuffer, 			 
			  payloadstartpoint,
			  segmentstartpoint,
			  Math.min(segmentendpoint, segmentstartpoint + this.datadim * this.timesteps * this.datasize ) );
	    

	    // Tested if there was something wrong in transferring the features to the python script; - No, there's no problem there!
	    //var this_works_buffer = fs.readFileSync('/tmp/working_features.float');
	    //this_works_buffer.copy(payloadbuffer, 0, 0);

	    //for (var n=0; n<30; n+=4) {
	    //debugout(user, "n="+n);
	    //debugout( user, (n/4)+ " "+ features.readFloatLE(segmentstartpoint+n) +" -> " + 
	    //payloadbuffer.readFloatLE( payloadstartpoint +  n) );
	    //}
	    
	} 

	this.payloadbuffer = payloadbuffer;

	return this;

	/*
	var sizebuffer = new Buffer(4);
	sizebuffer.writeInt32LE(payloadbuffer.length/4); // 'Cause this the bad programming is! We'll send the number of data points,
 	                                                 // not the number of bytes we're sending!

	
	var that = this;
	
	fs.writeFile("/tmp/payloaddata", payloadbuffer); 

	fs.readFile(conf.dnnconf.port_number_file, function(err, port) {
	    

	    debugout(  "Connecting to port >"+port+"<", 0, this.user);

	    process.emit('user_event', that.user, that.word_id, 'timestamp',{name: 'dnn_start' }); 			

	    var client = net.connect({port: ""+port},
				     function() { //'connect' listener
					 debugout('connected to server!', 0, this.user);
					 client.write( sizebuffer );
					 state ="waitforacc";
				     });

	    client.setTimeout(dnn_server_timeout);
	    
	    
	    client.on('data', function(data) {

		debugout("Got "+Object.prototype.toString.call(data)+" of length "+ data.length+" in state "+state, 0, that.user);
		
		if (state == "waitforacc") {
		    debugout("Got ack: "+data.readInt32LE(0), 0, that.user);
		    client.write( payloadbuffer );
		    state = "waitforreturnlen";
		}
		
		else if (state == "waitforreturnlen") {
		    var returnsizebuffer = new Buffer( new Int8Array(data) );
		    debugout( "Got data length: "+ returnsizebuffer.readInt32LE(0,4), 0, that.user);
		    client.write( ackbuffer );
		    state = "waitforreturndata";
		}
		else if (state == "waitforreturndata") {
		    // From http://stackoverflow.com/questions/8609289/
		    // convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
		    var returneddata = new Buffer( new Int8Array(data) );
		    var classes=[]

		    debugout("Got returned data: ", 0, that.user);
		    for (var i =0; i< returneddata.length; i+=4) {
			classes.push(returneddata.readFloatLE(i))
		    }
		    process.emit('user_event', that.user, that.word_id, 'timestamp',{name: 'dnn_stop' }); 			
		    process.emit('user_event', 
				 that.user, 
				 that.word_id,
				 'classification_done', {
				     'guessed_classes' : classes 
				 });		
		    state = "done"; 
		    client.end();

		    
		}
	    });

	    client.on('end', function() {
		client.destroy();
		debugout('disconnected from classification server', 0, that.user);
	    });
	    
	    client.on('timeout', function() {
		var classes = [-2];

		process.emit('user_event', that.user, that.word_id, 'timestamp',{name: 'dnn_stop' }); 			

		process.emit('user_event', 
			     that.user, 
			     that.word_id,
			     'classification_done', {
				 'guessed_classes' : classes 
			     });		
		client.end();
		client.destroy();
	    });
	}); */
    }
}




//var debugout = function(user, msg) {
//    console.log("\x1b[34msegmen %s\x1b[0m",logging.get_date_time().datetime + ' '+ user+ ': '+msg);
//}

function debugout( text , priority, user, word_id ) {

    printdata = {
	source: 'segmen',
	message: text,
    }
    if (typeof(priority) != 'undefined') 
	printdata.priority = 0;//priority;
    else
	printdata.priority = priority;

    if (typeof(user) != 'undefined') 
	printdata.user = user;

    if (typeof(user) != 'word_id') 
	printdata.user = word_id;
    
    process.emit('print', printdata);
}


module.exports = SegmentationHandler;

