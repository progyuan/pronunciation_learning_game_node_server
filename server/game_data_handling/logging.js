
var game_data_handler=require('./game_data_handler');


var log_event = function( worthy_stuff) {
    var table = 'game_events';
    game_data_handler.insert_to_db(  worthy_stuff, table);

} 
    
var log_scoring = function( worthy_stuff ) {
    var table = 'game_events';
    game_data_handler.insert_to_db( worthy_stuff, table);
 

    if (worthy_stuff.score > 0) {
	game_data_handler.update_word_count(worthy_stuff, function(e,o){
	    if (e)
		console.log("logging.log_scoring Error: ",e);
	});
	
	game_data_handler.update_phoneme_count(worthy_stuff, function(e,o){
	    if (e)
		console.log("logging.log_scoring Error: ",e);
	});
    }
}
 
    
var log_phoneme = function( worthy_stuff ) {
    var table = 'phoneme_scores';
    game_data_handler.insert_to_db( worthy_stuff, table);

}

 




var log_error = function( worthy_stuff ) {
    var table = 'error-log';
    game_data_handler.insert_to_db( worthy_stuff, table);

}

var get_date_time = function( ) {
    return game_data_handler.get_date_time();
}


module.exports = { log_event : log_event, 
		   log_scoring: log_scoring , 
		   get_date_time: get_date_time,
		   log_phoneme: log_phoneme,
		   log_error: log_error
};
