



var testnr = 0;

var fs = 16000;

var packets_per_second = 3;


var bufferSize = 16384;
var packetsize = 4 * bufferSize; // 4* 6 * Math.floor(fs/packets_per_second/6);

var packetinterval = Math.floor(1000.0/packets_per_second);


var time_to_send_the_final_packet = 0;
var finalpacketsent = 0;

var reader = new FileReader();	

var server_ok = false;

var starttime = 0;

var packetn = 0;

var analyserContext = null;
var maxVal=1.0;

var wordcounter=0;

var time_it_took;
var lastpacketsenttime
var processed_word_count = 0;
var total_processing_time = 0;
var total_align_time = 0;
var total_feat_time = 0;
var total_dnn_time = 0;



// from https://subvisual.co/blog/posts/39-tutorial-html-audio-capture-streaming-to-node-js-no-browser-extensions
// --> https://github.com/gabrielpoca/browser-pcm-stream/blob/master/public/recorder.js

(function(window) {

    if (!navigator.getUserMedia)
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio:true}, success, function(e) {
        alert('Error capturing audio.');
      });
    } else alert('getUserMedia not supported in this browser.');

    var recording = false;

    window.startRecording = function() {
      recording = true;
    }

    window.stopRecording = function() {
      recording = false;
    }

    function success(stream) {
	audioContext = window.AudioContext || window.webkitAudioContext;
	context = new audioContext();

	// Audio Analyser: 
	inputPoint = context.createGain();

	// the sample rate is in context.sampleRate
	audioInput = context.createMediaStreamSource(stream);
	audioInput.connect(inputPoint);


	analyserNode = context.createAnalyser();
	analyserNode.fftSize = 2048;
	inputPoint.connect( analyserNode );
	
	//audioRecorder = new Recorder( inputPoint );
	
	zeroGain = context.createGain();
	zeroGain.gain.value = 0.0;
	inputPoint.connect( zeroGain );
	zeroGain.connect( context.destination );
	updateAnalysers();


	//var bufferSize = 4096;
	recorder = context.createScriptProcessor(bufferSize, 1, 1);
	
	recorder.onaudioprocess = function(e){
            
	    if(!recording) 
		return;
            console.log ('recording');

            var left = e.inputBuffer.getChannelData(0);

            // Copy your data in the AudioBuffer                                                  

	    var buffer = new ArrayBuffer(  Math.floor(bufferSize * 16.0 / 44.1)*4 );
	    var dataview = new Float32Array(buffer);

            for (var i = 0; i < dataview.byteLength; i++) {
		dataview[i] =  left[Math.round(i*44.1/16)];
	    }

	    send_file_part( new Blob([buffer], { type: "application/octet-stream" }),
			    packetn++);
	}

	audioInput.connect(recorder)
	recorder.connect(context.destination); 
    }

/* The above source also says:

We have now PCM data samples from the left channel. 
Since we are recording in mono we only need the left 
channel. Now moving on to streaming these chunks to 
the server.

*/

 function convertoFloat32ToInt16(buffer) {
     var l = buffer.length;
     var buf = new Int16Array(l)
     
     while (l--) {
         buf[l] = buffer[l]*0xFFFF;    //convert to 16 bit
     }
     return buf.buffer
 }

function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

})(this);


// Audio analyser view:

function updateAnalysers(time) {
    if (!analyserContext) {
        var canvas = document.getElementById("analyser");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
    }

    /* Modified: Analyser code completely ovarhauled in style of voice-change-o-matic!  */

    {
	var bufferLength=analyserNode.frequencyBinCount

	var dataArray = new Uint8Array(analyserNode.frequencyBinCount);
	analyserNode.getByteTimeDomainData(dataArray); 

        analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
        analyserContext.fillStyle = '#F6D565';
        analyserContext.lineCap = 'round';

	analyserContext.fillStyle = 'rgb(200, 200, 200)';
	analyserContext.fillRect(0, 0, canvasWidth, canvasHeight);

	analyserContext.lineWidth = 2;
	analyserContext.strokeStyle = 'rgb(0, 0, 0)';

	analyserContext.beginPath();

	var sliceWidth = canvasWidth * 1.0 / bufferLength;
	var x = 0;
	maxVal -= 0.02;
	
	for(var i = 0; i < bufferLength; i++) {
	    
	    var v = dataArray[i] / 128.0;
	    var y = v * canvasHeight/2;

	    if (Math.abs(v-1) > maxVal) {
		maxVal=Math.abs(v-1);
	    }
	    
	    if(i === 0) {
		analyserContext.moveTo(x, y);
	    } else {
		analyserContext.lineTo(x, y);
	    }
	    
	    x += sliceWidth;
	}
	
	analyserContext.stroke();
	barHeight=maxVal*canvasHeight;

	if (maxVal>0.8) {

	    barHeight=maxVal*canvasHeight;
	    analyserContext.fillStyle = 'rgb(' + Math.round(maxVal*canvasHeight+100) + ',50,50)';
	    analyserContext.fillRect(0,canvasHeight/2-barHeight/2,20,barHeight );
	}

	if (maxVal>0.5) {
	    barHeight=Math.min(maxVal,0.8)*canvasHeight;
	    
	    analyserContext.fillStyle = 'rgb(255,255,50)';	
	    analyserContext.fillRect(0,canvasHeight/2-barHeight/2,20,barHeight );
	}


	barHeight=Math.min(maxVal,0.5)*canvasHeight;
	
	analyserContext.fillStyle = 'rgb(50,' + Math.round(maxVal*canvasHeight+150) + ',50)';	
	analyserContext.fillRect(0,canvasHeight/2-barHeight/2,20,barHeight );	

    }
    
    rafID = window.requestAnimationFrame( updateAnalysers );
}





function upload_only() {

    logging = get_new_logdiv();

    //if (server_ok) {
	send_file(logging );
    //}
    //else {
    //	logging += "<br> Server not ready";
    //}

}


function connect_only() {
    connect_and_maybe_test(false);
}


function connect_and_test() {
    connect_and_maybe_test(true);
}

function reinit_and_test() {
    reinit_and_maybe_test(true, null)
}

function connect_and_maybe_test(test) {
    
    // Set up the request.

    logging = get_new_logdiv();

    var server = document.getElementById("server_address").value;
    var transcr = document.getElementById("transcription").value;

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    var formData = new FormData();

    var sessionstart = new XMLHttpRequest();

    starttime = (new Date()).getTime();



    // Open the connection.
    sessionstart.open('POST', server, true);


    sessionstart.setRequestHeader("x-siak-user", username);
    sessionstart.setRequestHeader("x-siak-password", password);
    sessionstart.setRequestHeader("x-siak-packetnr", "-2");
    sessionstart.setRequestHeader("x-siak-currentword", transcr);

    sessionstart.setRequestHeader("x-siak-profiler", true);
   
    // Set up a handler for when the request finishes.
    //sessionstart.onload = function () {

    sessionstart.onreadystatechange = function(e) {
        if ( 4 == this.readyState ) {
	
	    if (sessionstart.status === 200) {

		server_ok = true;

		logging.innerHTML += "<br>" + timestamp() + " Server started ok!";

		

		// Check for the various File API support.
		if (window.File && window.FileReader && window.FileList && window.Blob) {
		    // Great success! All the File APIs are supported.
		} else {
		    alert('The File APIs are not fully supported in this browser.');
		}
		
		if (test) {
		    reinit_and_maybe_test(test, logging); //send_file(logging);
		}
		
	    } else if (sessionstart.status === 502) {
		server_ok=false;
		logging.innerHTML += "<br>-2 Problem: Server down!";

	    } else {
		logging.innerHTML += '<br>-2 Problem: Server responded '+sessionstart.status;
	    }
	}
	else {
	    console.log("sessionstart in state "+this.readyState);
	}
    };

    logging.innerHTML += "<br>" + timestamp() + " Asking the server to start...";    
    sessionstart.send(formData);

}

function reinit_and_maybe_test(test, logging) {
    
    // Set up the request.

    if (logging == null) {
	logging = get_new_logdiv();
    }


    var server = document.getElementById("server_address").value;
    var transcr = document.getElementById("transcription").value;

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
   

    var formData = new FormData();

    var sessionstart = new XMLHttpRequest();

    starttime = (new Date()).getTime();



    // Open the connection.
    sessionstart.open('POST', server, true);

    sessionstart.setRequestHeader("x-siak-user", username);
    sessionstart.setRequestHeader("x-siak-password", password);
    sessionstart.setRequestHeader("x-siak-packetnr", "-1");
    sessionstart.setRequestHeader("x-siak-current-word", transcr);
    
    // Set up a handler for when the request finishes.
    //sessionstart.onload = function () {

    sessionstart.onreadystatechange = function(e) {
        if ( 4 == this.readyState ) {
	
	    if (sessionstart.status === 200) {

		server_ok = true;

		logging.innerHTML += "<br>" + timestamp() + " Server ready to receive!";		

		// Check for the various File API support.
		if (window.File && window.FileReader && window.FileList && window.Blob) {
		    // Great success! All the File APIs are supported.
		} else {
		    alert('The File APIs are not fully supported in this browser.');
		}
		
		if (test) {
		    logging.innerHTML += "<br>" + timestamp() + " Starting file upload!";		
		    
		    //send_file(logging);
		    start_rec_and_upload(logging);
		}
		
	    } else if (sessionstart.status === 502) {
		server_ok=false;
		logging.innerHTML += "<br>-1 Problem: Server down!";

	    } else {
		logging.innerHTML += '<br>-1 Problem: Server responded '+sessionstart.status;
	    }
	}
	else {
	    console.log("sessionstart in state "+this.readyState);
	}
    };

    logging.innerHTML += "<br>" + timestamp() + " Setting the word to "+transcr +"...";    
    sessionstart.send(formData);

}


function send_file(logging) {
    starttime = (new Date()).getTime();
    var files = document.getElementById("test_file").files;		   
    var f = files[0];
    logging.innerHTML += '<br>' +timestamp() + ' Starting upload of '+f.size+' bytes in chunks of ' +packetsize;
    send_file_in_parts(f, 0, logging);
}





var session, recordRTC;

function start_rec_and_upload(logging) {
    startRecording();
    starttime = (new Date()).getTime();    
    logging.innerHTML += '<br>' +timestamp() + ' Started microphone';
}


var n = 0;


var lastpacket = false;
var time_to_send_the_final_packet = false;

function send_file_part(leftaudio, n) {

    if (lastpacket == true) {
	console.log("Already sent the last packet!");
	return;
    }

    if (n > 10)
	time_to_send_the_final_packet = true;

    if (time_to_send_the_final_packet == true) {
	lastpacket = true;
	stopRecording();
    }

    //reader.readAsDataURL(left); 


    reader.readAsDataURL(leftaudio);     
    //reader.readAsBinaryString(blob);
    //reader.readAsArrayBuffer(blob);
    reader.onloadend = function() {
    //if (1==1)
    
	var startbyte = Math.floor(n * bufferSize*16.0/44.1 );
	var endbyte = Math.floor((n+1) * bufferSize*16.0/44.1 );

	base64data = reader.result;
	base64data = base64data.replace(/^data:application\/octet-stream;base64,/, "");

	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	
	// Set up the request.
	var xhr = new XMLHttpRequest();	
	
	var transcr = document.getElementById("transcription").value;
	var server = document.getElementById("server_address").value;
	// Open the connection.
	xhr.open('POST', server, true);
	
	xhr.setRequestHeader("x-siak-user", username);
	xhr.setRequestHeader("x-siak-password", password);
	xhr.setRequestHeader("x-siak-packetnr", n);
	xhr.setRequestHeader("x-siak-current-word", transcr);
	
	xhr.setRequestHeader("x-siak-packet-arraystart", startbyte);
	xhr.setRequestHeader("x-siak-packet-arrayend", endbyte);
	xhr.setRequestHeader("x-siak-packet-arraylength", (endbyte-startbyte));
	
	xhr.setRequestHeader("x-siak-final-packet", time_to_send_the_final_packet);

	xhr.setRequestHeader("x-siak-profiler", true);

	
	// Set up a handler for when the request finishes.
	xhr.onload = function (reply) {
	    if (xhr.status === 200) {
		logging.innerHTML += "<br>" + timestamp() + " Server says ok!";	
		if (lastpacket) {
		    time_it_took = timestamp()-lastpacketsenttime;

		    logging.innerHTML += "<br><b>Last packet sent:</b> Server returns <b>" 
			                 + xhr.responseText +"</b>";
		    time_to_send_the_final_packet = false;
		    finalpacketsent=false;
		    lastpacket =false;
		    packetn=0;

		    logging.innerHTML += "<br><b>Last packet sent:</b> After "+(time_it_took/1000.0)+"s server returns <b>" + xhr.responseText +"</b>";

		    var fancy_result_area = document.getElementById("fancy_result_area");
		    
		    var resj = JSON.parse(xhr.responseText);

		    fancy_result_area.innerHTML += "word: "+transcr+" ";
		    fancy_result_area.innerHTML += "kalles_score: "+resj.kalles_score+" ";
		    fancy_result_area.innerHTML += "dnn_score: "+resj.dnn_score+" ";
		    fancy_result_area.innerHTML += "total_score: "+resj.total_score+" ";
		    fancy_result_area.innerHTML += "partial_score: "+resj.phoneme_scores+" ";
		    fancy_result_area.innerHTML += "reference: "+resj.reference_phones+" ";
		    fancy_result_area.innerHTML += "guess: "+resj.guess_phones+" ";
		    fancy_result_area.innerHTML += "time: "+(time_it_took/1000.0)+"s<br>";


		    var profiling_area = document.getElementById("profiling_area");
		    
		    processed_word_count += 1;
		    total_processing_time += time_it_took;

		    total_align_time += resj.timestamps.recog_stop - resj.timestamps.recog_start;
		    total_feat_time += resj.timestamps.feat_stop - resj.timestamps.feat_start;
		    total_dnn_time += resj.timestamps.dnn_stop - resj.timestamps.dnn_start;

		    profiling_area.innerHTML = "<p>";
		    profiling_area.innerHTML += "Word count: " + processed_word_count +"<br>";
		    profiling_area.innerHTML +="Average processing time: " + (total_processing_time / processed_word_count / 1000.0)+"s<br>";;
		    profiling_area.innerHTML +="Average align time: " + (total_align_time / processed_word_count / 1000.0)+"s<br>";;
		    profiling_area.innerHTML +="Average featext time: " + (total_feat_time / processed_word_count / 1000.0)+"s<br>";;
		    profiling_area.innerHTML +="Average dnn time: " + (total_dnn_time / processed_word_count / 1000.0)+"s<br>";;

		    time_to_send_the_final_packet = false;
		    finalpacketsent=false;


		}
		else {
		    if (xhr.responseText == -1) {
			logging.innerHTML += "<br>" + timestamp() 
			                     + "Server says to stop recording!";
			time_to_send_the_final_packet = true;
		    }
		    
		    logging.innerHTML += "<br> Foo! server returns <b>" + xhr.responseText +"</b>";
		    
		}
		// File(s) uploaded.
	    } else if (xhr.status === 502) {
		server_ok=false;
		logging.innerHTML += "<br>" + timestamp() + " Problem: Server down!";
		
	    } else {
		logging.innerHTML += "<br>" + timestamp() + " Problem: Server responded "+ xhr.status;
	    }
	};
	
	// Send the Data.
	xhr.send( base64data );
	lastpacketsenttime=timestamp();	
	
    }
}

/* If I at some point switch from float to 16bit signed integer 
on the siak server, then this becomes necessary:

function convertFloat32ToInt16(buffer) {
  l = buffer.length;
  buf = new Int16Array(l);
  while (l--) {
    buf[l] = Math.min(1, buffer[l])*0x7FFF;
  }
  return buf.buffer;
}

function recorderProcess(e) {
  var left = e.inputBuffer.getChannelData(0);
  window.Stream.write(convertFloat32ToInt16(left));
}*/






function send_file_in_parts(f, n, logging) {

    var server = document.getElementById("server_address").value;

    var transcr = document.getElementById("transcription").value;

    startbyte= (n)*packetsize;

    endbyte = Math.min( ((n+1) * packetsize)-1, f.size);
   
    var lastpacket = false;
    var last = ""
    if ((endbyte == f.size) || (time_to_send_the_final_packet) ) {
	lastpacket = true;
	logging.innerHTML += "<br>" + timestamp() + " It's the last packet!";
	finalpacketsent = true;
    }

    if (lastpacket) {
	last = " (<b>last!</b>)";
    }
	
    
    logging.innerHTML += "<br>" + timestamp() + "  Sending packet "+n+last+", bytes "+startbyte+"-"+endbyte;

    
    var blob = f.slice(startbyte, endbyte);
    
    //logging.innerHTML += "<br>" + timestamp() + "  Blob size: "+blob.size;    

    reader.readAsDataURL(blob);     
    //reader.readAsBinaryString(blob);
    //reader.readAsArrayBuffer(blob);
    reader.onloadend = function() {

        //var base64data = reader.result;                
	//remove "data:application/octet-stream;base64," from the beginning:
	//base64data = base64data.substr(37,base64data.length);
	//console.log(base64data.substr(0,200));

	// Encode the String
	//base64data = Base64.encode(reader.result);

	base64data = reader.result;
	//base64data = btoa(reader.result);

	//console.log("Start of this packet before and after removing stuff:");
	//console.log(base64data.substr(0,60));

	base64data = base64data.replace(/^data:application\/octet-stream;base64,/, "");

	//console.log(base64data.substr(0,10)+ " ... " + base64data.substr(base64data.length-10, base64data.length));

	//logging.innerHTML += "<br> base64 string length: "+base64data.length;

	//var formData = new FormData();
	//formData.append('photos[]', base64data);
	

	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;



	// Set up the request.
	var xhr = new XMLHttpRequest();	
	

	// Open the connection.
	xhr.open('POST', server, true);
	
	xhr.setRequestHeader("x-siak-user", username);
	xhr.setRequestHeader("x-siak-password", password);
	xhr.setRequestHeader("x-siak-packetnr", n);
	xhr.setRequestHeader("x-siak-current-word", transcr);

	xhr.setRequestHeader("x-siak-packet-arraystart", startbyte/4);
	xhr.setRequestHeader("x-siak-packet-arrayend", endbyte/4);
	xhr.setRequestHeader("x-siak-packet-arraylength", (endbyte-startbyte));
	
	xhr.setRequestHeader("x-siak-final-packet", lastpacket);
	
	
	// Set up a handler for when the request finishes.
	xhr.onload = function (reply) {
	    if (xhr.status === 200) {
		logging.innerHTML += "<br>" + timestamp() + " Server says ok!";	
		if (lastpacket) {
		    logging.innerHTML += "<br><b>Last packet sent:</b> Server returns <b>" + xhr.responseText +"</b>";
		    time_to_send_the_final_packet = false;
		    finalpacketsent=false;
		    packetn=0;
		}
		else {
		    if (xhr.responseText == -1) {
			logging.innerHTML += "<br>" + timestamp() + "Server says to stop recording!";
			time_to_send_the_final_packet = true;
		    }
		    
		    logging.innerHTML += "<br> Foo! server returns <b>" + xhr.responseText +"</b>";

		    if ((!finalpacketsent) && ( (n+1) * packetsize < f.size) )  {
			var myVar = setTimeout( function() {
			    send_file_in_parts(f, ++n, logging)
			}, packetinterval );
		    }
		}
		// File(s) uploaded.
	    } else if (xhr.status === 502) {
		server_ok=false;
		logging.innerHTML += "<br>" + timestamp() + " Problem: Server down!";

	    } else {
		logging.innerHTML += "<br>" + timestamp() + " Problem: Server responded "+ xhr.status;
	    }
	};
	
	// Send the Data.
	xhr.send(base64data);
    }
}


function get_new_logdiv() {
    var parentNode = document.getElementById("logging");
    
    var refChild = document.getElementById("log"+(testnr++));
    
    var logging = document.createElement("div");
    logging.className = 'logpart'
    
    logging.id="log" + testnr;
    
    logging.innerHTML=(new Date()).toString(); 

    parentNode.insertBefore(logging, refChild)

    return logging;
}


function timestamp() {
    return ( (new Date()).getTime() - starttime );
}
