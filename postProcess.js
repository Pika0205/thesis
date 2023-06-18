function getBlock(block){
	receiveBlock = 1;
	
	blockBody = block.blockHash;
	
	if(!isVoteLock)
		myDeliver.VoteDeliver(height, round);
	
}


function isCommit(voteCollection){		//data = voteCollection[]		在S8-5./Vote
	
	if( commitBlock == null  ){
		commitBlock = legalVote(voteCollection, height, round);
		
		console.log("commitBlock : " + commitBlock);
		
		if(commitBlock != null){
			
			saveblock.push(height);		//紀錄已經commit了這個height的block
			mgdb.insertOne(commitBlock);
			
			lastBlockHash = commitBlock.blockHash;
			
			//另一個 要改/進入下一height或round 的地方在timeOut.js的timeOutStart的t3
			testTranTime();
			
		}
		
	}
	
}


function testTranTime(){
	
	if(testType == "to" || testType == "all"){
		
		var endVote_TO = new Date().getTime();		//S8-5的post('/Vote')開始
		nonAgg_handle_Buffer3.push(endVote_TO - handle_TO3);
		
		var nowTime = new Date().getTime();
		console.log("commit好了  " + nowTime % 1000000);
		
		if(testType == "to")	//準備測下一次的TO
			myDeliver.ReadyDeliver(ID, 0);	//0為編號為0的節點也為預備.1為開始
	}
	
	else if(newHeightTogether == "ntoget"){		//測tp中 好了就先進入下回合
		
		console.log("commit好了  " + nowTime % 1000000);
		myMain.newHeight();	
		
	}

}


function legalVote(lockset, height, round){	//找出大於cf+1張合法票的人
	var memberList = [], block = [], obj={}, max=0, ahead=0;
	
	for(var i in lockset)	//論文寫說4f+1投給同一個值
	
		if(memberList[lockset[i].sender] == null )		//檢查這個人的票是不是有被計算過
			
			if(lockset[i].vote != null &&  lockset[i].height == height  &&  lockset[i].round == round){
				
				block.push(lockset[i].vote);
				memberList[lockset[i].sender] = 1;	//每人的票只被計算一次.且只計算這回合的
			
			}
	
	
	for(var i in block){  	//找出最多人投的候選人
	
		var key = block[i]; 
		
		(obj[key]) ? obj[key]++ : obj[key] = 1;
		
		if(obj[key] > max){
			max =  obj[key];
			ahead = key;
			ahead2 = i;
		}
		
		if(obj[ahead] >= threshold)
			return block[ahead2]
		
	}
	
	return null;
}


function customVerify(message, type){
	
	if(type == 0)
		publicKey = ec.keyFromPublic(publicKeyList[message.sender], 'hex');
	
	if(type == 1)
		publicKey = ec.keyFromPublic(publicKeyList[message.maker], 'hex');
	
	return publicKey.verify(message.blockHash, message.signature);
}


//========== Msig-BFT ==========
//找出兩個陣列不同的值
function getArrDifference(arr1, arr2){	//S8-5/Witness

    return arr1.concat(arr2).filter(function(value, i, arr) {

        return arr.indexOf(value) === arr.lastIndexOf(value);
    });
	
}



module.exports = {
	customVerify,
	isCommit,
	legalVote,
	getBlock,
	getArrDifference
}