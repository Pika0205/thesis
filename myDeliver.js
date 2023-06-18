require("./myPost.js");


function BlockDeliver(height, round, ID){
	var oriData = {
		type: "Block",
		height: height,
		round: round,
		sender: ID,
		maker: ID,
		lockset: lastLockset
	}
	
	if(lastRoundBlock == null)	//創新block
		oriData.transaction = dataBuffer[dataSize];
	else
		oriData.maker = lastRoundBlock.maker;
	
	
	data = signature(oriData);	//產生blockHash和signature
	data.blockHash = (lastRoundBlock == null) ? data.blockHash : lastRoundBlock.blockHash;
	
	
	if(testType == "to" || testType == "all")
		data.start_TO1 = tranBlockRecord();
	
	console.log("= = 送block了喔  " + data.start_TO1 % 1000000);
	
	for(var i in ipList)
		mesDeliver(i, data);
}

function tranBlockRecord(){
	var endHandle_TO1 = new Date().getTime();		//myMain.newHeight開始
	Handle1_Buffer.push(endHandle_TO1 - handle_TO1);
	
	return endHandle_TO1;
}



function VoteDeliver(height, round){
	isVoteLock = 1;
	
	var data = {
		type: "Vote",
		height: height, round: round, sender: ID,
		vote : blockBody
	}
	
	data = signature(data);
	lastRoundVote = data.vote;
	
	
	if(testType == "to" || testType == "all")
		data.start_TO2 = tranVoteRecord();
	
	console.log("= = 送vote了喔 : " + data.start_TO2 % 1000000);
	
	
	for(var i in ipList)
		mesDeliver(i, data);
}

function tranVoteRecord(){
	var endHandle_TO2 = new Date().getTime();		//myPost的post('/Block')開始
	
	if(endHandle_TO2 - handle_TO2 < 10000)
		Handle2_Buffer.push(endHandle_TO2 - handle_TO2);
	
	return endHandle_TO2;
}


function TimeOutVoteDeliver(height, round, ID){
	
	var nowTime = new Date().getTime();
	isVoteLock = 1;
	
	console.log("lastRoundVote : ", lastRoundVote + nowTime % 1000000);
	
	
	var oriData = {
		type: "Vote",
		height: height, round: round, sender: ID,
		vote : lastRoundVote,		//投上回合的投的票
		timeout: 1
	}
	
	data = signature(oriData);
	
	for(var i in ipList)
		mesDeliver(i, data);
	
}



function SynReqDeliver(recipient, myHeight, myRound, myReq_Height, myReq_Round){
	
	var oriData = {
		type: "SynReq",
		height: height, round: round, sender: ID,
		reqH : myReq_Height,
		reqR : myReq_Round
	}
	
	
	data = signature(oriData);
	mesDeliver(recipient, data);
}



function SynResDeliver(recipient, yourReq_Height, items){
	
	var oriData = {
		type: "SynRes",
		height: height, round: round, sender: ID,
		items : items,
		synHeight : height,
		synRound : round
		synHeight : yourReq_Height
	}
	
	
	data = signature(oriData);
	mesDeliver(recipient, data);
}



function ReadyDeliver(ID, i){
	var oriData = {	type: "Ready", height: 0, round: 0, sender: ID	}
	
	data = signature(oriData);
	
	if(i == 1)
		for(var j = 1; j < ipList.length; j++)
			mesDeliver(j, data);
	else
		mesDeliver(i, data);

	console.log("i : " + i + " : " + ipList[i]);
	console.log("傳READY");
}



function mesDeliver(recipient, data){
	//console.log("要傳送 " + data.type + " 了喔");
	
	axios({
		method: 'post',
		url: 'http://' + ipList[recipient].concat(":3000/" + data.type),
		data: data
	}).then(function(res){/*console.log(res);*/}).catch(function(err){/*console.log(err);*/});
	
}



function signature(data){
	
	const blockHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
	const signature = privateKey.sign(blockHash, 'base64').toDER('hex');
	
	data.blockHash = blockHash;
	data.signature = signature;
	
	return data;
}


//========== Msig-BFT ==========

function toAaggregateDeliver(height, round, blockHash){
	isVoteLock = 1;
	
	var data = {
		type: "toAggregateVote",
		height: height, round: round, sender: ID,
		vote : blockHash
	}
	
	
	data = signature(data);
	lastRoundVote = data.vote;
	
	//console.log("傳給aggregate : " + aggregate);
	
	mesDeliver(aggregate, data);
}


function fromAggregateDeliver(height, round){
	var data = {
		type: "fromAggregateVote",
		height: height, round: round, sender: ID,
		voteCollection : thisLockset
	}
	
	
	data = signature(data);
	
	for(var i in ipList)
		mesDeliver(i, data);
}

//========== Msig-BFT ==========



module.exports = {
	BlockDeliver,
	VoteDeliver,
	TimeOutVoteDeliver,
	SynReqDeliver,
	SynResDeliver,
	toAaggregateDeliver,
	fromAggregateDeliver,
	ReadyDeliver
}


/*放在mesDeliver

if(data.type == "toAggregateVote"){
			var endHandle_TO2 = new Date().getTime();	//S8-5的post('/Block')開始
			
			if(endHandle_TO2 - handle_TO2 < 10000)
				Handle2_Buffer.push(endHandle_TO2 - handle_TO2);
			
			data.start_TO2 = new Date().getTime();
			console.log("要傳給AGG了 : " + data.start_TO2%1000000);
		}
		
		
		if(data.type == "fromAggregateVote"){
			//var endHandle_TO3 = new Date().getTime();	//S8-5的post('/toAggregateVote')開始
			//Handle3_Buffer.push(endHandle_TO3 - handle_TO3);
			
			data.start_TO3 = new Date().getTime();
			console.log("AGG要回傳囉了 : " + data.start_TO3%1000000);
		}
*/