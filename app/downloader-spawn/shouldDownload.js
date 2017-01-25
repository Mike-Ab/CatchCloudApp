var fs = require ('fs').access;
var Rtest = require ('fs').R_OK;
var Wtest = require ('fs').W_OK;

function fileExists (path, callback) {
	
fs(path, Rtest | Wtest , (err)=>{
	if (err) callback (err, path); // file does not exist
		else {
	callback (false, path);
	}
})
}

exports.fileExists = fileExists;