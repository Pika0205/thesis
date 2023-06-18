express = require('express');
app = express();
app.use(express.json());

MongoClient = require('mongodb').MongoClient;
global.mgdb;

fs = require('fs');
args = process.argv;

myDeliver = require("./myDeliver.js");
myRecord = require("./myRecord.js");


height=0, round=0, num_member = 6;
fault=0, coefficient=0, threshold=0;
ipList = [], publicKeyList = [], witnessList = [];


//========== argv =====
TOs1 = parseInt(args[2]);
TOs2 = parseInt(args[3]);

dataSize = parseInt(args[4]);	//用來選擇不同大小的buffer
testTime = parseInt(args[5]);	//實驗要跑多久
testType = args[6];	//to : 測TO,	tp : 測Throughput,	all : 兩個都測		用於postProcess myDeliver myRecord

newHeightTogether = args[7];	//toget	ntoget		用於postProcess、timeOut
TimeRate = parseFloat(args[8]);

TOType = args[9];		//max	mean	95%	- Adv才有用
Advanced = args[10];	//不同DC設不同的TO	nAdv:沒有	Adv:有
ID = parseInt(args[11]);


//=====main=====		t 5f+1, m 3f+1
node();


function node(){	
	console.log(args);
	
	fault = (num_member-1)/5;
	coefficient = 4;
	threshold = coefficient * fault + 1;
	
	port = 3000;
	app.listen(port);
	
	
	var readfile = 'key&url-6node-sameDC.txt';
	
	fs.readFile(readfile, function(err, data){
		if (err) return console.log(err);
		
		readfile = data.toString().split('\n');
		
		
		for(var i=0; i < num_member; i++)
			ipList[i] = readfile[i].replace(/[\r\n]/g,"");
		
		for(var i=0; i < num_member; i++)
			publicKeyList[i] = readfile[num_member + i].replace(/[\r\n]/g,"");
		
		privateKey = ec.keyFromPrivate( readfile[2*num_member + ID].replace(/[\r\n]/g,"") );
		
		for(var i=0; i < 6; i++)
			dataBuffer[i] = readfile[3*num_member + i].replace(/[\r\n]/g,"");
		
		
		if(TOType == "max"){
			TOs1_List = readfile[4*num_member].replace(/[\r\n]/g,"");
			TOs2_List = readfile[4*num_member + 1].replace(/[\r\n]/g,"");
		}

		if(TOType == "mean"){
			TOs1_List = readfile[4*num_member + 2].replace(/[\r\n]/g,"");
			TOs2_List = readfile[4*num_member + 3].replace(/[\r\n]/g,"");
		}
		if(TOType == "95%"){
			TOs1_List = readfile[4*num_member + 4].replace(/[\r\n]/g,"");
			TOs2_List = readfile[4*num_member + 5].replace(/[\r\n]/g,"");
		}
		
		
		myDeliver.ReadyDeliver(ID, 0);	//0為編號為0的節點也為預備.1為開始
		myRecord.endRecordTime_Of();
		
	});
	
}
