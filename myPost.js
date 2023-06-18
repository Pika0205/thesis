saveblock = [], feedbackVote = [], aheadBlock = {};;
receiveBlock = 0, lastBlockHash = 0;
//stopRecMsig = 0, broMsig = 0, notSignedWitness = [];	//Msig-BFT

myMain = require("./myMain.js");
myDeliver = require("./myDeliver.js");
postProcess = require("./postProcess.js");
myRecord = require("./myRecord.js");



app.post('/Block', function(req, res) {
	if(postProcess.customVerify(req.body, 0)){
		
		myRecord.recordTime_Of_TO1(req.body.start_TO1, req.body.sender);
		handle_TO2 = new Date().getTime();	//在myDeliver.tranVoteRecord處理
		
		
		if(receiveBlock == null && req.body.height == height  &&  req.body.round == round)
			postProcess.getBlock(req.body);
		
		
		else if(req.body.height > height  &&  saveblock.indexOf(req.body.height) == -1)
			myDeliver.SynReqDeliver(req.body.sender, req.body.height, req.body.round);
		
	}
	
	res.end();
});


app.post('/Vote', function(req, res) {
	if(postProcess.customVerify(req.body, 0)){
		
		myRecord.recordTime_Of_TO2(req.body.start_TO2, req.body.sender);
		
		if(thisLockset.length == 0)
			handle_TO3 = new Date().getTime();
		
		
		thisLockset.push(req.body);		//將票存到lockset
		
		if(thisLockset.length >= threshold)		//當票達到足夠的門檻
			postProcess.isCommit(thisLockset);
		
		
		//同步height
		if(req.body.height > height  &&  saveblock.indexOf(req.body.height) == -1)
			myDeliver.SynReqDeliver(req.body.sender, height, round, req.body.height, req.body.round);
		
	}
	
	res.end();
});


app.post('/Ready', function(req, res) {
	if(postProcess.customVerify(req.body, 0)){
		var startRound = -1;
		
		console.log("=== 收到ready ===");
		
		if(ID == 0){
			readyMem++;
			//console.log("readyMem : " + readyMem + " ID : " + req.body.sender);
			
			if(readyMem == num_member){
				
				myDeliver.ReadyDeliver(ID, 1);	//0為預備.1為開始
				
				setTimeout(function(){	myMain.newHeight(startRound);	},315);
				
			}
		}
		
	}
	
	res.end();
});



//========== Msig-BFT ==========
app.post('/Witness', function(req, res) {
	if(postProcess.customVerify(req.body, 0)){
		if(req.body.height == height  &&  req.body.round == round){
			delete req.body.transaction;
			
			//檢查自己簽了沒
			if(req.body.witSig.indexOf(ID) == -1)
				req.body.witSig.push(ID);
			
			//找出還沒簽的人
			notSignedWitness = postProcess.getArrDifference(witnessList, req.body.witSig);
			req.body.sender = ID;
			
			//傳給還沒簽的人
			if(notSignedWitness.length != 0)
				msigDeliver.witToWitDeliver(req.body, notSignedWitness);	//witness互傳
			
			//大家都簽了
			else if(!broMsig){	//還沒廣播過
					broMsig = 1;
					msigDeliver.msigDeliver(req.body);
			}
		}
		
		else if(req.body.height >= height  &&  req.body.round > round){
				
			//synround為要同步到的回合
			var timeout = -1, synround = req.body.round;
			
			timeOut.timeOutStop();
			
			myMain.newRound(timeout, synround, req);
		}
	}
	
	res.end();
});



app.post('/toAggregateVote', function(req, res) {
	if(postProcess.customVerify(req.body, 0)  &&  height > 0){
		
		var nowTime = new Date().getTime();
		
		myRecord.recordTime_Of_TO2(req.body.start_TO2);
		
		if(thisLockset.length == 0  &&  ID == leader)
			handle_TO3 = nowTime;	//在myDeliver.mesDeliver處理
		
		/*
		if(ID == aggregate)
			console.log("AGG收到民眾投票 " + req.body.sender + "  " + nowTime%1000000);
		else
			console.log("已非AGG收到過期投票 " + req.body.sender + "  " + nowTime%1000000);
		*/
		
		//DataSize2.push( postProcess.roughSizeOfObject(req.body) );	//測封包大小
		
		
		thisLockset.push(req.body);		//將票存到lockset
		
		
		if(thisLockset.length == num_member  &&  ID == leader){
			var endHandle_TO3 = new Date().getTime();
			Handle3_Buffer.push(endHandle_TO3 - handle_TO3);
		}
		
	}
	
	res.end();
});



app.post('/fromAggregateVote', function(req, res) {
	if(postProcess.customVerify(req.body, 0)  &&  height > 0){
		
		myRecord.recordTime_Of_TO3(req.body.start_TO3);
		handle_TO4 = new Date().getTime();	//在timeOut.timeOutStart處理
		
		console.log("收到AGG整理好的投票  " + handle_TO4 % 1000000);
		
		
		postProcess.isCommit(req.body.voteCollection);
		
	}
	
	res.end();
});

//========== Msig-BFT ==========


app.post('/SynReq', function(req, res){	
	if(postProcess.customVerify(req.body, 0)){
		
		mgdb.find({
			
			height:{
				"$gte": req.body.height,
				"$lt": req.body.reqH
			}
		
		}).toArray(function(err,items){
			if(err) throw err;
			myDeliver.SynResDeliver(req.body.sender, req.body.reqH, items);
		});
		
		
	}
	
	res.end();
});


app.post('/SynRes', function(req, res) {
	if(postProcess.customVerify(req.body, 0)){
		console.log(" height : ", req.body.height, " round", req.body.round, " sender", req.body.sender);
		
		
		for(var j in req.body.items){
					
			verifyblock = {
				height: req.body.items[j].height,
				maker: req.body.items[j].maker,
				blockHash: req.body.items[j].blockHash,
				signature: req.body.items[j].signature
			}
				
			if(saveblock.indexOf(req.body.items[j].height) == -1){
				saveblock.push(req.body.items[j].height);
				lastBlockHash = req.body.items[j].blockHash;
				//console.log("~~~~~Commit the syn block~~~~~");
				mgdb.insertOne(verifyblock);
			}
				
		}
		
			
		//synH用來確定這個回傳的h比我高.有時我可能先收到更高的
		if(synH < req.body.synHeight){
			synH = req.body.synHeight;
			
			aheadBlock = req.body;
			
			var synround = req.body.round-1;
			
			if(height <  req.body.synHeight){
				height = req.body.synHeight-1;
				myMain.newHeight();
			}
			
		}
		
		
	}
	
	res.end();
});
