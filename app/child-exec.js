function download(code){
		console.log('clicked');
		var exec = require('child_process').exec;
		var child = exec('node ./downloadFile.js '+code , { cwd: 'app' , stdio: [null, 'inherit', 'inherit', 'ipc']}, (error, stdout, stderr) => {
		  if (error) {
		    console.error(`exec error: ${error}`);
		    return;
		  }
	  console.log(`stdout: ${stdout}`);
	  console.log(`stderr: ${stderr}`);
	});
	
	
		console.log('spawned');
	  child.stdout.on('data', function(data) {
	  console.log('stdout: ' + data);
  });
  child.stderr.on('data', function(data) {
	  console.log('stdout: ' + data);
  });
  child.on('close', function(code) {
	  console.log('closing code: ' + code);
  });
}
exports.download = download;