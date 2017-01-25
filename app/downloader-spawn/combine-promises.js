 var fs = require ('fs');
 var os = require ('os');
 var path  = require ('path');
 var customPromises = require ('./formPromises');

 
 function loggStream (Data, callback){
	 var cusPromise = require('promise');
	customPromises.formPromises (Data, (fileData, comPromises, comResolvers)=> {
		console.dir(comPromises);
		console.log('asyenc streams with promises');
		var fileName = fileData.fileName;
		var resultingFile = path.join(__dirname , 'downloads/'+fileName);
		var fileToWriteIno = fs.open (resultingFile, 'w', (err, fileOpened) => {
		
		fileData.chunks.forEach(function(data){
			var fd = fileOpened;
			var totalChukns = fileData.chunksCount
			var startPos = data.startPos;
			var chunkPath = path.join(__dirname , 'downloads/'+fileName+'_'+data.chunk);
			var chunkSize = data.size;
			var pName = 'p'+data.chunk
			var pResolve = pName+'Resolve';
			var rstream = fs.readFile(chunkPath, function (err, fileData){
				if (!err){
						console.log (fileData.length, startPos, chunkSize);
						fs.write(fd, fileData, 0, fileData.length,  parseInt(startPos), () => {
							console.log ('written data from position ' + startPos);
							fs.unlink (chunkPath);
							comResolvers[pResolve]();
							console.log ('Resolved ' + pResolve);
							
						});
				}else {
						console.log (err);
				}					
			});
		})
	 });
	  
	  cusPromise.all(comPromises).then ( function (data) {	
		callback (data);
	  }); 

  });
 
} // end logStream

exports.streamCombine = loggStream;