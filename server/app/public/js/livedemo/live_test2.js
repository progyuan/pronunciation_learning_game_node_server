



var testnr = 0;

var fs = 16000;
var sampleRate = 44100;

var packets_per_second = 3;

var logging;

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

/* FIRs created by MATLAB 

    N    = 80;     % Order
    F6dB = 16000;  % 6-dB Frequency
    Fs   = 44100;  % Sampling Frequency (96000, 48000, 22500...)
    
    h = fdesign.lowpass('n,fc', N, F6dB, Fs);
    
    Hd = design(h, 'window');
    
    set(Hd, 'Arithmetic', 'single');
  
    

*/
var filters = { "44100_to_16000" :   [-0.000049823647714219987392425537109375,
				      0.0005366410478018224239349365234375  ,
				      -0.00069825234822928905487060546875    ,
				      0.00036630246904678642749786376953125 ,
				      0.0003400691202841699123382568359375  ,
				      -0.00099130929447710514068603515625    ,
				      0.0010460852645337581634521484375     ,
				      -0.000242475987761281430721282958984375,
				      -0.001063841045834124088287353515625   ,
				      0.001952343969605863094329833984375   ,
				      -0.0015132748521864414215087890625     ,
				      -0.000357240322045981884002685546875   ,
				      0.00257413275539875030517578125       ,
				      -0.0033858348615467548370361328125     ,
				      0.0016539287753403186798095703125     ,
				      0.001980415545403957366943359375      ,
				      -0.005088292062282562255859375         ,
				      0.0049576540477573871612548828125     ,
				      -0.00077001121826469898223876953125    ,
				      -0.0051939529366791248321533203125     ,
				      0.008585714735090732574462890625      ,
				      -0.0059891645796597003936767578125     ,
				      -0.00206819013692438602447509765625    ,
				      0.010538090951740741729736328125      ,
				      -0.012765868566930294036865234375      ,
				      0.0053985058329999446868896484375     ,
				      0.008140726946294307708740234375      ,
				      -0.018682301044464111328125            ,
				      0.01708475314080715179443359375       ,
				      -0.001382133923470973968505859375      ,
				      -0.019848413765430450439453125         ,
				      0.0313168503344058990478515625        ,
				      -0.02086484618484973907470703125       ,
				      -0.01045764982700347900390625          ,
				      0.0451544038951396942138671875        ,
				      -0.0565099976956844329833984375        ,
				      0.02345109544694423675537109375       ,
				      0.0552449561655521392822265625        ,
				      -0.1563635766506195068359375           ,
				      0.2412388622760772705078125           ,
				      0.725449860095977783203125            ,
				      0.2412388622760772705078125           ,
				      -0.1563635766506195068359375           ,
				      0.0552449561655521392822265625        ,
				      0.02345109544694423675537109375       ,
				      -0.0565099976956844329833984375        ,
				      0.0451544038951396942138671875        ,
				      -0.01045764982700347900390625          ,
				      -0.02086484618484973907470703125       ,
				      0.0313168503344058990478515625        ,
				      -0.019848413765430450439453125         ,
				      -0.001382133923470973968505859375      ,
				      0.01708475314080715179443359375       ,
				      -0.018682301044464111328125            ,
				      0.008140726946294307708740234375      ,
				      0.0053985058329999446868896484375     ,
				      -0.012765868566930294036865234375      ,
				      0.010538090951740741729736328125      ,
				      -0.00206819013692438602447509765625    ,
				      -0.0059891645796597003936767578125     ,
				      0.008585714735090732574462890625      ,
				      -0.0051939529366791248321533203125     ,
				      -0.00077001121826469898223876953125    ,
				      0.0049576540477573871612548828125     ,
				      -0.005088292062282562255859375         ,
				      0.001980415545403957366943359375      ,
				      0.0016539287753403186798095703125     ,
				      -0.0033858348615467548370361328125     ,
				      0.00257413275539875030517578125       ,
				      -0.000357240322045981884002685546875   ,
				      -0.0015132748521864414215087890625     ,
				      0.001952343969605863094329833984375   ,
				      -0.001063841045834124088287353515625   ,
				      -0.000242475987761281430721282958984375,
				      0.0010460852645337581634521484375     ,
				      -0.00099130929447710514068603515625    ,
				      0.0003400691202841699123382568359375  ,
				      0.00036630246904678642749786376953125 ,
				      -0.00069825234822928905487060546875    ,
				      0.0005366410478018224239349365234375  ,
				      -0.000049823647714219987392425537109375
				     ],

		"48000_to_16000" : [  0.0005509300972335040569305419921875     ,
				      0.000000000000000002603915971455943630119,
				      -0.000620980630628764629364013671875      ,
				      0.0006902248715050518512725830078125     ,
				      -0.00000000000000000266218774368300735596 ,
				      -0.0009052208042703568935394287109375     ,
				      0.001054358668625354766845703125         ,
				      -0.000000000000000013959324655155033799263,
				      -0.00144491903483867645263671875          ,
				      0.00169022916816174983978271484375       ,
				      -0.000000000000000005576349591200692896184,
				      -0.00229162140749394893646240234375       ,
				      0.0026525198481976985931396484375        ,
				      -0.000000000000000007781632129421153397028,
				      -0.00350862345658242702484130859375       ,
				      0.00401039235293865203857421875          ,
				      -0.000000000000000010331829130741525165629,
				      -0.0051813195459544658660888671875        ,
				      0.005860395729541778564453125            ,
				      -0.000000000000000013086015488562373983075,
				      -0.0074375565163791179656982421875        ,
				      0.00835226289927959442138671875          ,
				      -0.000000000000000015891994106077005522327,
				      -0.010490112006664276123046875            ,
				      0.011744243092834949493408203125         ,
				      -0.000000000000000018594707495920517086648,
				      -0.014734146185219287872314453125         ,
				      0.01653530634939670562744140625          ,
				      -0.000000000000000021044801581051559105119,
				      -0.02100411243736743927001953125          ,
				      0.0238351412117481231689453125           ,
				      -0.000000000000000023106885093168677113972,
				      -0.0314081050455570220947265625           ,
				      0.0366846434772014617919921875           ,
				      -0.000000000000000024667005631086566020717,
				      -0.0531639046967029571533203125           ,
				      0.067315809428691864013671875            ,
				      -0.000000000000000025638952777003724175023,
				      -0.13695250451564788818359375             ,
				      0.2750744521617889404296875              ,
				      0.666184484958648681640625               ,
				      0.2750744521617889404296875              ,
				      -0.13695250451564788818359375             ,
				      -0.000000000000000025638952777003724175023,
				      0.067315809428691864013671875            ,
				      -0.0531639046967029571533203125           ,
				      -0.000000000000000024667005631086566020717,
				      0.0366846434772014617919921875           ,
				      -0.0314081050455570220947265625           ,
				      -0.000000000000000023106885093168677113972,
				      0.0238351412117481231689453125           ,
				      -0.02100411243736743927001953125          ,
				      -0.000000000000000021044801581051559105119,
				      0.01653530634939670562744140625          ,
				      -0.014734146185219287872314453125         ,
				      -0.000000000000000018594707495920517086648,
				      0.011744243092834949493408203125         ,
				      -0.010490112006664276123046875            ,
				      -0.000000000000000015891994106077005522327,
				      0.00835226289927959442138671875          ,
				      -0.0074375565163791179656982421875        ,
				      -0.000000000000000013086015488562373983075,
				      0.005860395729541778564453125            ,
				      -0.0051813195459544658660888671875        ,
				      -0.000000000000000010331829130741525165629,
				      0.00401039235293865203857421875          ,
				      -0.00350862345658242702484130859375       ,
				      -0.000000000000000007781632129421153397028,
				      0.0026525198481976985931396484375        ,
				      -0.00229162140749394893646240234375       ,
				      -0.000000000000000005576349591200692896184,
				      0.00169022916816174983978271484375       ,
				      -0.00144491903483867645263671875          ,
				      -0.000000000000000013959324655155033799263,
				      0.001054358668625354766845703125         ,
				      -0.0009052208042703568935394287109375     ,
				      -0.00000000000000000266218774368300735596 ,
				      0.0006902248715050518512725830078125     ,
				      -0.000620980630628764629364013671875      ,
				      0.000000000000000002603915971455943630119,
				      0.0005509300972335040569305419921875      ],

		"96000_to_16000" : [ -0.0005513262585736811161041259765625     ,
				    -0.000000000000000001302894147386228704131,
				    0.00062142708338797092437744140625       ,
				    0.0006907211500220000743865966796875     ,
				    -0.000000000000000001332050919810227531   ,
				    -0.0009058716823346912860870361328125     ,
				    -0.001055116765201091766357421875         ,
				    0.000000000000000006984680832353876118535,
				    0.001445958041585981845855712890625      ,
				    0.00169144454412162303924560546875       ,
				    -0.000000000000000002790179467814868710662,
				    -0.00229326891712844371795654296875       ,
				    -0.00265442696399986743927001953125       ,
				    0.00000000000000000389361358954223103811 ,
				    0.0035111461766064167022705078125        ,
				    0.00401327572762966156005859375          ,
				    -0.000000000000000005169629019911431953588,
				    -0.0051850448362529277801513671875        ,
				    -0.0058646094985306262969970703125        ,
				    0.000000000000000006547712334015082336438,
				    0.0074429041706025600433349609375        ,
				    0.00835826806724071502685546875          ,
				    -0.000000000000000007951710389529406523314,
				    -0.010497654788196086883544921875         ,
				    -0.011752687394618988037109375            ,
				    0.000000000000000009304038194490299559965,
				    0.0147447399795055389404296875           ,
				    0.016547195613384246826171875            ,
				    -0.000000000000000010529967011588802096702,
				    -0.02101921476423740386962890625          ,
				    -0.0238522775471210479736328125           ,
				    0.000000000000000011561749921476208613925,
				    0.0314306877553462982177734375           ,
				    0.03671102225780487060546875             ,
				    -0.000000000000000012342371018890464020061,
				    -0.0532021336257457733154296875           ,
				    -0.067364208400249481201171875            ,
				    0.000000000000000012828693662067540474893,
				    0.13705097138881683349609375             ,
				    0.2752722203731536865234375              ,
				    0.3333317339420318603515625              ,
				    0.2752722203731536865234375              ,
				    0.13705097138881683349609375             ,
				    0.000000000000000012828693662067540474893,
				    -0.067364208400249481201171875            ,
				    -0.0532021336257457733154296875           ,
				    -0.000000000000000012342371018890464020061,
				    0.03671102225780487060546875             ,
				    0.0314306877553462982177734375           ,
				    0.000000000000000011561749921476208613925,
				    -0.0238522775471210479736328125           ,
				    -0.02101921476423740386962890625          ,
				    -0.000000000000000010529967011588802096702,
				    0.016547195613384246826171875            ,
				    0.0147447399795055389404296875           ,
				    0.000000000000000009304038194490299559965,
				    -0.011752687394618988037109375            ,
				    -0.010497654788196086883544921875         ,
				    -0.000000000000000007951710389529406523314,
				    0.00835826806724071502685546875          ,
				    0.0074429041706025600433349609375        ,
				    0.000000000000000006547712334015082336438,
				    -0.0058646094985306262969970703125        ,
				    -0.0051850448362529277801513671875        ,
				    -0.000000000000000005169629019911431953588,
				    0.00401327572762966156005859375          ,
				    0.0035111461766064167022705078125        ,
				    0.00000000000000000389361358954223103811 ,
				    -0.00265442696399986743927001953125       ,
				    -0.00229326891712844371795654296875       ,
				    -0.000000000000000002790179467814868710662,
				    0.00169144454412162303924560546875       ,
				    0.001445958041585981845855712890625      ,
				    0.000000000000000006984680832353876118535,
				    -0.001055116765201091766357421875         ,
				    -0.0009058716823346912860870361328125     ,
				    -0.000000000000000001332050919810227531   ,
				    0.0006907211500220000743865966796875     ,
				    0.00062142708338797092437744140625       ,
				    -0.000000000000000001302894147386228704131,
				    -0.0005513262585736811161041259765625 
				   ]
 }

var firbuffer=[0,0,0,0,0,0,0,0,0,0,
		  0,0,0,0,0,0,0,0,0,0,
		  0,0,0,0,0,0,0,0,0,0,
		  0,0,0,0,0,0,0,0,0,0,
		  0,0,0,0,0,0,0,0,0,0,
		  0,0,0,0,0,0,0,0,0,0,
		  0,0,0,0,0,0,0,0,0,0,
		  0,0,0,0,0,0,0,0,0,0,
		  0 ]; // 81 zeros!


var foo = function () {
    connect_and_test(); 
};


var connect_and_test = function(word, item, callback) {
    word = 
    connect_and_maybe_test(true, document.getElementById("transcription").value, null,  null);
}


var get_score_for_word = function(word, item, callback) {
    connect_and_maybe_test(true, word, item,  callback);
};



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
    var global_item, global_callback;

    window.setItemAndCallback = function(item, callback) {
	global_item = item;
	global_callback = callback;
    }

    window.getItemAndCallback = function() {
	return {item: global_item, callback: global_callback }
    }

    window.startRecording = function() {
	document.getElementById("recbutton").style.visibility = "visible";
        document.getElementById("connect_and_test").disabled = true;
	recording = true;
    }

    window.stopRecording = function() {
	recording = false;
	document.getElementById("recbutton").style.visibility = "hidden";
	document.getElementById("connect_and_test").disabled = false;
    }

    function success(stream) {
	audioContext = window.AudioContext || window.webkitAudioContext;
	context = new audioContext();

	sampleRate = context.sampleRate;

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

	    var buffer = new ArrayBuffer(  Math.floor(bufferSize * fs / sampleRate )*4 );
	    var dataview = new Float32Array(buffer);

            for (var i = 0; i < dataview.byteLength; i++) {
		// Downsampling interpolation:
		j=i*sampleRate/fs;
		
		dataview[i] = (1-j%1)*filtered(left, Math.floor(j)) +  (j%1)*filtered(left, Math.floor(j)+1);
	    }
	    firbuffer = left.slice(-firbuffer.length);
	    
	    //console.log(left);
	    //console.log(dataview);

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

    function filtered(data, index) {
	sum=0;
	filter = filters[sampleRate+"_to_"+fs];
	
	for (i=0;i<filter.length; i++) {
	    if (index-filter.length+i < 0) {		
		sum += filter[i]*firbuffer[index+i];
	    }
	    else 
		sum += filter[i]*data[index-filter.length+i];
	}
	return sum;
    }

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




/*
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

console.log('loading live_test.js 2');

var connect_and_test = function () {
    connect_and_maybe_test(true);
}

console.log('loading live_test.js 2');

function reinit_and_test() {
    reinit_and_maybe_test(true, null)
}
*/


if (1==1) {
    server='/siak-devel/start-level';
    
    var test = false;
    var username = "foo1";
    var password = "bar1";
    
    var formData = new FormData();

    var sessionstart = new XMLHttpRequest();

    sessionstart.open('POST', server, true);

    sessionstart.setRequestHeader("x-siak-user", username);
    sessionstart.setRequestHeader("x-siak-password", password);
    sessionstart.setRequestHeader("x-siak-packetnr", "-2");

    sessionstart.onreadystatechange = function(e) {
        if ( 4 == this.readyState ) {
	
	    if (sessionstart.status === 200) {

		server_ok = true;
		if (logging == null) {
		    logging = get_new_logdiv();
		}

		logging.innerHTML += "<br>" + timestamp() + " Server started ok!";

		// Check for the various File API support.
		if (window.File && window.FileReader && window.FileList && window.Blob) {
		    // Great success! All the File APIs are supported.
		} else {
		    alert('The File APIs are not fully supported in this browser.');
		}
		
		if (test) {
		    reinit_and_maybe_test(test, logging, word, item, callback); //send_file(logging);
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

    sessionstart.send(formData);
    
}



var connect_and_maybe_test = function(test, word, item,  callback) {
    
    // Set up the request.

    logging = get_new_logdiv();

    var server = document.getElementById("server_address").value;
    if (typeof(word) == 'undefined')
	var transcr = document.getElementById("transcription").value;
    else
	var transcr = word;

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
		    reinit_and_maybe_test(test, logging, word, item, callback); //send_file(logging);
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

function reinit_and_maybe_test(test, logging, word, item,  callback) {
    
    // Set up the request.

    if (logging == null) {
	logging = get_new_logdiv();
    }


    var server = document.getElementById("server_address").value;

    if (typeof(word) == 'undefined')
	var transcr = document.getElementById("transcription").value;
    else
	var transcr = word;

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
		    start_rec_and_upload(logging, item, callback);
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

function start_rec_and_upload(logging, item, callback) {
    setItemAndCallback(item, callback);
    startRecording();
    starttime = (new Date()).getTime();    
    logging.innerHTML += '<br>' +timestamp() + ' Started microphone';
}


var n = 0;


var lastpacket = false;
var time_to_send_the_final_packet = false;

function send_file_part(leftaudio, n, callback) {

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
    
	var startbyte = Math.floor(n * bufferSize*fs/sampleRate );
	var endbyte = Math.floor((n+1) * bufferSize*fs/sampleRate );

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
	//xhr.setRequestHeader("x-siak-current-word", transcr);
	
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
			                 + xhr.responseText.toString().replace(/,/g, ',<br>') +"</b>";
		    time_to_send_the_final_packet = false;
		    finalpacketsent=false;
		    lastpacket =false;
		    packetn=0;

		    logging.innerHTML += "<br><b>Last packet sent:</b> After "+(time_it_took/1000.0)+"s server returns <b>" + xhr.responseText.toString().replace(/,/g, ',<br>') +"</b>";

		    var fancy_result_area = document.getElementById("fancy_result_area");

		    var resj = JSON.parse(xhr.responseText);

		    // Create an empty <tr> element and add it to the 1st position of the table:
		    var row = fancy_result_area.insertRow(1);

		    var cell0 = row.insertCell(0);
		    cell0.innerHTML = resj.word;

		    var cell1 = row.insertCell(1);
		    cell1.innerHTML = resj.dnn_score;		    

		    var cell2 = row.insertCell(2);
		    cell2.innerHTML = resj.kalles_score;		    

		    var cell3 = row.insertCell(3);
		    cell3.innerHTML = resj.total_score;		    

		    var cell4 = row.insertCell(4);
		    cell4.innerHTML = "["+resj.reference_phones+"]";

		    var cell5 = row.insertCell(5);
		    cell5.innerHTML = "["+resj.guess_phones+"]";

		    var cell6 = row.insertCell(6);
		    cell6.innerHTML = resj.phoneme_scores;

		    var cell7 = row.insertCell(7);
		    cell7.innerHTML = (time_it_took/1000.0)+"s";
		    
		    var cell8 = row.insertCell(8);
		    cell8.innerHTML = "<audio src=\""+
			BASEURL+
			"/audio/"+
			document.getElementById("username").value+
			"/"+
			resj.wavfilename +"\" controls class='small-audio'></audio>";

		    /*
		    fancy_result_area.innerHTML += "word: "+transcr+" ";
		    fancy_result_area.innerHTML += "kalles_score: "+resj.kalles_score+" ";
		    fancy_result_area.innerHTML += "dnn_score: "+resj.dnn_score+" ";
		    fancy_result_area.innerHTML += "total_score: "+resj.total_score+" ";
		    fancy_result_area.innerHTML += "partial_score: "+resj.phoneme_scores+" ";
		    fancy_result_area.innerHTML += "reference: "+resj.reference_phones+" ";
		    fancy_result_area.innerHTML += "guess: "+resj.guess_phones+" ";
		    fancy_result_area.innerHTML += "time: "+(time_it_took/1000.0)+"s<br>";
		    */

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


		    /* update phone counts in side bar: */
		    if (resj.total_score > 0) {
			resj.reference_phones.forEach( function (phone, index) {
			    console.log("Trying to set "+"p_"+phone+"_counter");
			    document.getElementById("p_"+phone+"_counter").innerHTML =
				parseInt(document.getElementById("p_"+phone+"_counter").innerHTML)+1|1;
			    document.getElementById("p_"+phone+"_stars").innerHTML =
				Math.max( document.getElementById("p_"+phone+"_stars").innerHTML|0,
					  resj.phoneme_scores[index]);
			});
			document.getElementById("w_"+transcr+"_counter").innerHTML =
			    parseInt(document.getElementById("w_"+transcr+"_counter").innerHTML)+1|1;
			document.getElementById("w_"+transcr+"_stars").innerHTML = 
				Math.max( document.getElementById("w_"+transcr+"_stars").innerHTML|0, 
					  resj.total_score );
		    }

		    callback = getItemAndCallback().callback;
		    callback(getItemAndCallback().item, resj.total_score);
		}
		else {
		    if (xhr.responseText == -1) {
			logging.innerHTML += "<br>" + timestamp() 
			                     + "Server says to stop recording!";
			time_to_send_the_final_packet = true;
		    }
		    
		    logging.innerHTML += "<br> Foo! server returns <b>" + xhr.responseText.toString().replace(/,/g, ',<br>') +"</b>";
		    
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
