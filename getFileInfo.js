
function callAjax(fileId, callback){
var request = require('request');

var options = {
  url: 'http://files.catchsolutions.com.au/multi-server/provider.php?id='+fileId,
  json: true
};
console.log('sent request');
request(options, function (error, response, body){
	if (!error && response.statusCode === 200) {
    //    console.log(body.chunks) // Print the json response
		callback (body);
    	}else {
			console.log (error);
		}
	})
}

exports.getInfo = callAjax;