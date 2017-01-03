

var sample_from_gmm = function() {
    w = [ 0.74938572, 0.09777443,  0.15283985]
    mu = [ 9.63709677,  15.86056114,  13.07197732]
    sigma = [ 0.90764711,  2.59926561,  1.47380714]

    // Choose which component to sample from:
    comp_rand = Math.random();
    weightsum = 0;
    comp = 0;
    for (comp=0; comp< w.length; comp++) {
	weightsum += w[comp];
	if (comp_rand < weightsum) {
	    //console.log("use comp",comp)
	    break;
	}
    }
    
    // A random sample (according to limit theorem):
    rand_sample =((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3

    // Scale to our mean and std:
    return (rand_sample * Math.sqrt(sigma[comp]) + mu[comp])
}

var get_next_game_move_time = function( sample) {
    // Scale to out 10*log10 -distribution in ms:
    return 1000 * Math.max( Math.pow(10, sample/10) - 7 , 0.2)
}















// Data sending functions:







var fs = 16000;

var packetsize = 4000*4; // 4000 bits in 4 bit floats
var packetinterval = 250;
var packets_per_second = 4;










var logging = document.getElementById("logging");
var testnr = 1;

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







var init_and_send_data = function(ind) {

    if (game_time > test_len_seconds * 1000)
	return 0;

    var user = testusers[ind].username;
    var pass = testusers[ind].password;
    var word = "look";
    var datafile = null;
    
    
    
    //var time_to_send_the_final_packet = 0;
    //var finalpacketsent = false;
    //var gotresults = false;

    var word_id = "-1";

    var server_ok = false;

    var logging;

    function init_and_start_sending(ind) {

	logging = get_new_logdiv();
	
	var server = document.getElementById("server_address").value;
	var username = document.getElementById("username").value + "_"+ind;
	var password = document.getElementById("password").value + "_"+ind;;

	var word_to_send = Math.floor( Math.random() * files.length);
	var transcr = filenames[word_to_send];
	
	var formData = new FormData();

	var sessionstart = new XMLHttpRequest();

	starttime = (new Date()).getTime();

	// Open the connection.
	sessionstart.open('POST', server, true);

	sessionstart.setRequestHeader("x-siak-user", username);
	sessionstart.setRequestHeader("x-siak-password", password);
	sessionstart.setRequestHeader("x-siak-packetnr", "-1");
	sessionstart.setRequestHeader("x-siak-current-word", transcr);
	sessionstart.setRequestHeader("x-siak-current-word-id", word_id);
	
	// Set up a handler for when the request finishes.
	//sessionstart.onload = function () {

	sessionstart.onreadystatechange = function(e) {
            if ( 4 == this.readyState ) {
		
		if (sessionstart.status === 200) {
		    draw_happening(ind, false, 'received_ok');
		    server_ok = true;

		    word_id = sessionstart.responseText;

		    logging.innerHTML += "<br>" + timestamp() + " <b>user " + username+ " wid "+word_id+"</b> Server ready!";
		    // Check for the various File API support.
		    if (window.File && window.FileReader && window.FileList && window.Blob) {
			// Great success! All the File APIs are supported.
		    } else {
			alert('The File APIs are not fully supported in this browser.');
		    }
		    
		    if (test) {
			logging.innerHTML += "<br>" + timestamp() + " Starting file upload in one second!";
			setTimeout(function() {send_file(word_to_send, logging); }, 1000);
		    }
		    
		} else if (sessionstart.status === 502) {
		    draw_happening(ind, false, 'received_error');
		    server_ok=false;
		    failures++;
		    logging.innerHTML += "<br>-1 Problem: Server down!";
		    set_next_happening( ind );

		} else {
		    draw_happening(ind, false, 'received_error');
		    failures++;
		    logging.innerHTML += '<br>-1 Problem: Server responded '+sessionstart.status;
		    set_next_happening( ind );
		    
		}
	    }
	    else {
		dummy = 1;
		//console.log("sessionstart in state "+this.readyState);
	    }
	};

	logging.innerHTML += "<br>" + timestamp() + " Setting the word to <b>"+transcr +"</b>.";    
	sessionstart.send(formData);

    }


    function send_file(f, logging) {
	//starttime = (new Date()).getTime();
	//var files = document.getElementById("test_file2").files;		   
	//var f = files[0];
	file = files[f];
	logging.innerHTML += '<br>' +timestamp() + ' Starting upload of '+file.name+' ('+file.size+' bytes) in chunks of ' +packetsize;	
	[0,2,1,3,4,5,7,6,8,9,10].forEach( function(n, lag) {//for (n=0;n<=10;n++) {
	    send_file_in_parts(file, n, lag,  logging);
	});
    }

    function send_file_in_parts(f, n, lag, logging) {
	
	setTimeout( function() {
	    send_file_part(f,n,logging, 0);
	}, lag * packetinterval);
    }
    
    var reader = new FileReader(); 

    function send_file_part(f, n, logging, resend) {

	if (n > finalpacketsent) {
	    logging.innerHTML += '<br>' +timestamp() + ' final packet ('+finalpacketsent+') already sent';
	    return;
	}
	if (gotresults) {
	    logging.innerHTML += '<br>' +timestamp() + ' already got results';
	    return;
	}


	//console.log(files);
	//console.log(f);
	//console.log(file);

	var server = document.getElementById("server_address").value;
	var username = document.getElementById("username").value + "_"+ind;;
	var password = document.getElementById("password").value + "_"+ind;;

	transcr = f.name;

	startbyte= (n)*packetsize;

	endbyte = Math.min( ((n+1) * packetsize)-4, f.size);
	
	var lastpacket = false;
	var last = ""
	if ((endbyte == f.size) || n== 10 || time_to_send_the_final_packet ) {
	    lastpacket = true;
	    logging.innerHTML += "<br>" + timestamp() + " It's the last packet!";
	    finalpacketsent = n;
	    time_to_send_the_final_packet = false;
	}

	if (lastpacket) {
	    last = " (<b>last!</b>)";
	}
	
	
	logging.innerHTML += "<br>" + timestamp() + "  Sending packet "+n+last; //+", bytes "+startbyte+"-"+endbyte;
	
	var blob = f.slice(startbyte, endbyte);

	reader.readAsDataURL(blob);     
	reader.onloadend = function() {

	    base64data = reader.result;

	    base64data = base64data.replace(/^data:application\/octet-stream;base64,/, "");

	    var username = document.getElementById("username").value + "_"+ind;;
	    var password = document.getElementById("password").value + "_"+ind;;

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
	    xhr.setRequestHeader("x-siak-current-word-id", word_id);
	    
	    
	    // Set up a handler for when the request finishes.
	    xhr.onload = function (reply) {
	        if (xhr.status === 200) {
		    //logging.innerHTML += "<br>" + timestamp() + " Server says ok!";
		    if (lastpacket || typeof(JSON.parse(xhr.responseText).total_score) != 'undefined') {

			if (typeof(JSON.parse(xhr.responseText).total_score) != 'undefined')
			    got_score = JSON.parse(xhr.responseText).total_score;
			else
			    got_score = xhr.responseText; 

			draw_happening(ind, false, "response"+got_score);

			if (got_score != -7) {

			    reply_counts[ got_score ]++;
			    testusers[ind].status="playing";
			    
			    //logging.innerHTML += "<br><b>Last packet sent:</b> Server returns <b>" + xhr.responseText +"</b>";
			    if (got_score > 0 && num_users > 1) {
				var parent = document.getElementById("logging");
				parent.removeChild(logging);
			    }
			    else {
				logging.innerHTML += "<br> Server reply to packet <b>"+n+"</b> is " + xhr.responseText +"</b>";
			    }

			    if (got_score > 0)
				successes ++;
			    else
				failures++;

			    set_next_happening( ind );
			}
		    }
		    else {			
		    draw_happening(ind, false, "received_ok");
			if (xhr.responseText == "-1") {
			    logging.innerHTML += "<br>" + timestamp() + "Server says to stop recording!";
			    time_to_send_the_final_packet = true;
			}

			logging.innerHTML += "<br> Server reply to packet <b>"+n+"</b> is " + xhr.responseText +"</b>";
		    }
		    // File(s) uploaded.
		} else if (xhr.status === 502) {
		    gotresults = true;
		    testusers[ind].status="playing";
		    failures++;
		    draw_happening(ind, false, "received_error");
		    server_ok=false;
		    logging.innerHTML += "<br>" + timestamp() + " Problem: Server down!";
		    
		} else {
		    gotresults = true;
		    testusers[ind].status="playing";
		    failures++;
		    draw_happening(ind, false, "received_error");
		    reply_counts[ JSON.parse(xhr.responseText).total_score ]++;
		    logging.innerHTML += "<br>" + timestamp() + " Problem: Server responded "+ xhr.status;
		}
	    };
	    
	    // Send the Data.
	    draw_happening(ind, false, "sending_data");
	    testusers[ind].status="waiting";
	    
	    if (lastpacket) 
		xhr.timeout = 6000; // time in milliseconds
	    
	    else
		xhr.timeout = 3000; // time in milliseconds

	    xhr.ontimeout = function (e) {

		// XMLHttpRequest timed out. Try resending!
		if (lastpacket)
		    draw_happening(ind, false, "timeout_lastpacket");
		else
		    draw_happening(ind, false, "timeout");
		
		logging.innerHTML += "<br>" + timestamp() + " Server timed out on packet <b>"+n+"</b>  - <b>Resending ("+(resend+1)+")!</b>";
		//finalpacketsent = ;
		if (resend < 2) {
		    timeout_resends++;
		    send_file_part(f, n, logging, resend+1);
		}
		else if (lastpacket)
		    annoying_failures ++;
		    //set_next_happening( ind );
		
	    };
	   

	    xhr.send(base64data);
	}
    }


    var n = 0;
    var lastpacket = false;
    var time_to_send_the_final_packet = false;
    var lastpacketnr = -1;
    var finalpacketsent = Math.Infinity;
    var gotresults = false;

    var test=true;

    /*
    if (testusers[ind].status != 'playing') {
	annoying_failures ++;
        draw_happening( ind, false, 'annoying_failures' );
	set_next_happening(ind);
    } else*/

    init_and_start_sending(ind);
}











// Running the test:




num_users = 6;
test_len_seconds = 180;

successes = 0;
failures = 0;
annoying_failures = 0;

reply_counts = {
"-100" : 0,
"-8" : 0,
"-7" : 0,
"-6" : 0,
"-5" : 0,
"-4" : 0,
"-3" : 0,
"-2" : 0,
"-1" : 0,
"0" : 0,
"1" : 0,
"2" : 0,
"3" : 0,
"4" : 0,
"5" : 0,
};

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");




var get_time_coord = function( moment ) {
    return ctx.canvas.clientWidth * moment / (test_len_seconds * 1000); 
}

var status_colors = {
    'starting' : 'lightgray',
    'get_word' : 'green',
    'sending_data' : 'lightgreen',
    'waiting' : 'red',
    'playing' : 'lightgray',
    'future' : 'white',
    'received_ok' : 'lightgreen',
    'received_error' : 'red',
    'annoying_failures' : 'darkred',
    'timeout' : 'orange',
    'timeout_lastpacket' : 'yellow',
    'response-9' : 'red',
    'response-8' : 'red',
    'response-7' : 'blue',
    'response-6' : 'yellow',
    'response-5' : 'yellow',
    'response-4' : 'pink',
    'response-3' : 'pink',
    'response-2' : 'pink',
    'response-1' : 'red',
    'response0' : 'black',
    'response1' : 'darkgreen',
    'response2' : 'darkgreen',
    'response3' : 'darkgreen',
    'response4' : 'darkgreen',
    'response5' : 'darkgreen'

}

var event_yoffsets = {
    'starting' : -4,
    'get_word' : -4,
    'sending_data' : -4,
    'future' : -4,
    'received_ok': 4,
    'received_error': 6,
    'annoying_failures' : 4,
    'timeout' : 4,
    'timeout_lastpacket' : 4,
    'response-9' : 4,
    'response-8' : 4,
    'response-7' : 4,
    'response-6' : 4,
    'response-5' : 4,
    'response-4' : 4,
    'response-3' : 4,
    'response-2' : 4,
    'response-1' : 4,
    'response0' : 4,
    'response1' : 4,
    'response2' : 4,
    'response3' : 4,
    'response4' : 4,
    'response5' : 4

}

var draw_happening = function ( user, time, status) {
    if (!time) 
	time = Date.now()-game_start_time
    ctx.beginPath();
    ctx.arc(get_time_coord(time),
	    10 + user * 25 + event_yoffsets[status],
	    3,
	    0,2*Math.PI);
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.fillStyle = status_colors[status];
    ctx.fill();
}


var set_first_happening = function(ind) {
    next_time = 10000*Math.random();
    testusers[ind].total_time += next_time;
    draw_happening( ind, testusers[ind].total_time, 'future' );
    setTimeout( function() {
	init_and_send_data(ind); 
	draw_happening( ind, false, 'get_word' );
    }, ( testusers[ind].total_time + game_start_time ) - Date.now() );

}


var set_next_happening = function(ind) {
    next_time = get_next_game_move_time( sample_from_gmm());
    testusers[ind].total_time += next_time
 //   if (testusers[ind].total_time < test_len_seconds * 1000) {
   if (game_time + next_time < test_len_seconds * 1000) {
	draw_happening( ind, game_time + next_time, 'future' );
	setTimeout( function() {
	    draw_happening( ind, false, 'get_word' );
	    init_and_send_data(ind); 
	    //console.log(ind, testusers);
	}, next_time ); //( testusers[ind].total_time + game_start_time ) - Date.now() );	
    }
}

var game_start_time = 0;
var game_time = 0;
var time_step = 500

function timestamp() {
    return ( (new Date()).getTime() - game_start_time );
}





// Timer to draw status:
var testusers;
var files;
var filenames;

var startTest = function() {

    ctx.clearRect(0, 0, c.width, c.height);


    num_users = document.getElementById("num_players").value;
    test_len_seconds = document.getElementById("test_len_seconds").value;


    successes = 0;
    failures = 0;
    annoying_failures = 0;
    timeout_resends = 0;

    files = [];
    filenames = [];
    
    testFiles = document.getElementById("test_file2");
    filesLength = testFiles.files.length;
    for (var i = 0; i < filesLength; i++) {
	files.push(testFiles.files[i]);
	filenames.push(testFiles.files[i].name);
    }
    
    //document.getElementById("test_file2").disabled = true;
    //document.getElementById("start_test").disabled = true;
    
    testusers = [];

    game_start_time = Date.now();

    for (i=0; i<num_users; i++) {
	userobj = {
	    index: i,
	    total_time: 0,
	    status: 'playing'
	};
	
	testusers.push(userobj);
	//draw_happening( i, next_time, 'get_word' );    
	set_first_happening( i);
    }



    setInterval(
	function() {
	    game_time = (Date.now() - game_start_time);
	    //console.log(game_time);
	    testusers.forEach(function(user) {
		ctx.beginPath();
		ctx.moveTo( get_time_coord(game_time), 10+user.index*25);
		ctx.lineTo( get_time_coord(game_time - 200), 10+user.index*25);
		ctx.strokeStyle = status_colors[user.status];
		ctx.stroke();
	    });
	    //console.log("Reply counts: ", reply_counts);
	    reply_count_string = "";
	    Object.keys(reply_counts).forEach( function (key) {
		if (reply_counts[key] > 0)
		    reply_count_string += " <b>"+key+":</b> "+ reply_counts[key];
	    });
	    document.getElementById("stats").innerHTML = 
		"<br>Success: " + successes +
		"<br>Instant failures: " + failures +
		"<br>Timeouts/ resends " + annoying_failures +" / "+ timeout_resends +
		"<br>Success rate: " + (successes ) * 1.0 / (successes + failures + annoying_failures)+
		"<br>Replies: "+reply_count_string;
	    
	    
	}, 500-(Date.now()-game_start_time) % 500 );
}








