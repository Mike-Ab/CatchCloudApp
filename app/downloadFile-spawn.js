function download(code) {
console.log (code);
var Promise = require('promise');
var path = require ('path');
var base64 = require ('base-64');
var fs = require ('fs');
var  Downloader  = require('./lib/Downloader')
var downloader = new Downloader();

var handleEvents = require('./_handleEvents');
var printStats = require('./_printStats');

var registerDlEvents = function(num, dl) {
	handleEvents(dl, num);
	printStats(dl, num);
};

var info = require ('./getFileInfo');
var customPromises = require ('./formPromises');

process.send(process.pid);
info.getInfo(code, (Data)=> {
	var mainData = Data;
			console.log(Data);
	customPromises.formPromises (Data, (fileData, promises, resolvers)=> {

	fileData.chunks.forEach(function(data){
		var fileSavePath = path.join(__dirname , 'downloads/'+fileData.fileName+'_'+data.chunk);
		var url = base64.decode(data.link);
		console.log(url);
		var dlName = 'dl'+data.chunk;
		var pName = 'p'+data.chunk
		var pResolve = pName+'Resolve';
		dlName = downloader.download(url, fileSavePath)
		dlName.start().on('end', function (){
			console.log ('resolving' + data.chunk);
			resolvers[pResolve]();
			process.send('finishedFile' + data.chunk);
			});
		registerDlEvents(data.chunk, dlName);
	});

})
	Promise.all(promises).then (function (data){
		console.log ('ALL PROMISES RESOLVED');
		console.log (mainData);
		var combine = require ('./combine-promises');
		combine.streamCombine(mainData, (mainData)=>{
			console.log ('ALL PIECES CONNECTED');
			process.send('finishedAllFiles');

	  })
	}); // end form promises
}); // end get info

} // end of fucntion
console.dir(process.argv);
download(process.argv[2])
