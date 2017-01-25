var fs = require ('fs');

function resumeFileInfo (mtdPath, chunkSize, callback) {
fs.open(mtdPath, 'r',  fs.O_RDONLY,  (err, fd) => {
		if (err) callback (err, 0);
			
		else {
			fs.stat(mtdPath, (error, stats) => {
				var buf = new Buffer (1024+256); // standard buffer alocation size that caters for different heads and file meta data
				fs.read(fd, buf, 0, /* stats.size - chunkSize */ 1024+256, chunkSize - 256, (err, bytesRead, buffer) => {
					var BufferStrVal = buffer.toString();
					var startTrimPos = BufferStrVal.indexOf('{');
					var endTrimPos = BufferStrVal.lastIndexOf('}}') + 2;
					var cleanBuff = BufferStrVal.substr(startTrimPos, (endTrimPos - startTrimPos))
					data = JSON.parse(cleanBuff);
					var chunkDownloaded = 0;					
					data.threads.forEach (thread => {
						if (thread.connection == 'open'){							
							chunkDownloaded += thread.position - thread.start;
						}else {
							chunkDownloaded += thread.end;
							}
						})
						// clear buffer
					buf = null;
					callback (err, chunkDownloaded);
					})								
				})
		}		
	})
}

exports.localInfo = resumeFileInfo;