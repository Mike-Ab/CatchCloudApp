process.send ('fileLoaded');
function download(code) {
process.send (code);
console.log(code);
var Promise = require('promise');
var path = require ('path');
var base64 = require ('base-64');
var fs = require ('fs');
var  Downloader  = require('./lib/Downloader')
var downloader = new Downloader();
var info = require ('./getFileInfo');
var customPromises = require ('./formPromises');
var tracer = require ('./total-stats');
var mtdInfo = require ('./readMTD');
var stats  = null;
var alreadyDownloaded = 0;
var shouldDownload = require ('./shouldDownload');
var controller = require ('./downloaderStack');
var Stacker = new controller(5); // number of concurrent downloads
console.log('THIS IS OUT MESSAGE STDOUT');
info.getInfo(code, (Data)=> {
	var mainData = Data;
	var downloadersStack = [];
	customPromises.formPromises (Data, (fileData, promises, resolvers)=> {
	Stacker.setOpt('promises', promises);
	Stacker.setOpt('resolvers', resolvers);
	fileData.chunks.forEach(function(data){
		var fileSavePath = path.join(__dirname , 'downloads/'+fileData.fileName+'_'+data.chunk);
		var fileTempPath = fileSavePath + '.mtd';
		var url = base64.decode(data.link);
		var dlName = 'dl'+data.chunk;
		var pName = 'p'+data.chunk
		var pResolve = pName+'Resolve';
		
		shouldDownload.fileExists(fileSavePath, (download, fileSavePath) => {
			if (!download) {
				process.send('file already downloaded');
				if (stats) {
					stats.alreadyDownloaded += parseInt( data.size );
				}
				else {
					alreadyDownloaded += parseInt( data.size );
				}
				resolvers[pResolve]();
			}
			else {
		  	mtdInfo.localInfo (fileTempPath, data.size, (err, localSize) => {
			  if (!err) {
				 console.log('found the file and its accessable ... resuming');
				 dlName = downloader.resumeDownload(fileSavePath);
				 dlName['curSize'] = localSize;
				  }else {
					  process.send('no data file ... starting over');
					  /* requires node v 6.0 + 
					   *
												 class CustomWarning extends Error {
							constructor(message) {
							  super(message);
							  this.name = 'CustomWarning';
							  Error.captureStackTrace(this, CustomWarning);
							}
						  }
						  const myWarning = new CustomWarning('no data file ... starting over!');
					   * process.emitWarning(myWarning);
					   */
					  dlName = downloader.download(url, fileSavePath);
					  dlName['curSize'] = 0;
				  }
			  Stacker.pushDownload(dlName, pResolve);
			  downloadersStack.push(dlName);
			  
			  })
			} // file does not exist			 
		   }) // file exists check
    	})
		
		stats = new tracer(downloadersStack, mainData.totalSize, alreadyDownloaded );
		stats.trace();
})
	
	Promise.all(promises).then (function (data){
		stats.stopTracing();
		process.send ('ALL PROMISES RESOLVED');
		var combine = require ('./combine-promises');
		combine.streamCombine(mainData, (mainData)=>{
			process.send ('ALL PIECES CONNECTED');
			})
	}); // end form promises
}); // end get info

} // end of fucntion
download(process.argv[2])
