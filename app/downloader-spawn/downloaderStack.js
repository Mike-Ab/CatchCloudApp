// stacker Class
'use strict'
var Downloader = require('./lib/Downloader');
var path = require('path');
var os = require('os');
var Promise = require ('promise');
/*
var handleEvents = require('./_handleEvents');
var printStats = require('./_printStats');

var registerDlEvents = function(num, dl) {
	handleEvents(dl, num);
	printStats(dl, num);
};
*/
var downloader = new Downloader();

class DownloaderStack {
	
	constructor(concurrent)
	{
		// defaults
		this.concurrent = concurrent;
		this.threads = 4;
		this.downloadersTotal = 0;
		this.downloaders = [];
		this.promises = [];
		this.resolvers = [];
		this.singleResolvers = [];
		this.completed = 0;
		this.activeDls = 0;
	}
			
	setOpt(opt, val)
	{
		this[opt] = val;		
	}
	
	createOptionsObject (chunk)
	{
		return ({
			threadsCount: this.threads, 
    		method: this.method, 	 
		    port: this.port,
		})
	}
	
	startDownload (dl){
		
	}
	
	pushDownload (dl, resolver)
	{
		//console.log(this.downloaders);
		this.downloaders.push(dl);
		this.singleResolvers.push(resolver);
		this.downloadersTotal ++;
		this.startDownloaders ()
		//console.log(this.downloadersTotal);
	}
	
	
	startDownloaders ()
	{
		var parent = this;
		if (this.completed < this.downloadersTotal){
  		  if (this.activeDls < this.concurrent) {	
		  		//if (this.downloaders.length > 0)
				this.activeDls ++;
				let dl = this.downloaders.splice(0,1);
				let resolve = this.singleResolvers.splice(0,1);
				if (dl[0] != undefined){
				dl[0].start()
				.on('start' , () =>{
					
					})
				.on('end', () =>{
					this.activeDls --;
					parent.completed++;
					parent.resolvers[resolve]();
					console.log('resolved From Stacker ' +dl[0]);
					if (parent.completed < parent.downloadersTotal) {						
						process.send('starting next download');
						parent.startDownloaders ()
					  }
					})
				.on('error', function() {
	    			process.send('EVENT - Download error !' + dl.error);
					console.log(dl.error); // if the error is "The .mtd file is corrupt. Start a new download. then start a new download
		          });
				}
		  		//}
		  } // end if
		}// end if
	}
	
	
	startDownloadersPromises ()
	{
		if (this.completed.length < this.downloadersTotal){
  		  while (this.activeDls.length < this.concurrent) {
		    let pr = new Promise ((resolve, reject) => {
				let dl = parent.downloaders.pop();
				parent.activeDls.push(dl);
				dl.start().on('end', () =>{					
					resolve;
					process.send('resolved From Stacker ' +dl);
					})
				});
			this.promises.push(pr);
		  } // end while
		}// end if
	}
}
module.exports = DownloaderStack;