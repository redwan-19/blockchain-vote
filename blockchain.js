/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let votes0 = 0;
let votes1 = 0;

let voteRecords = [];


/* =====================================================
   SHA256 HASH FUNCTION
===================================================== */

async function sha256(message){
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2,"0")).join("");
}


/* =====================================================
   BLOCK CLASS
===================================================== */

class Block{

    constructor(index, timestamp, vote, previousHash=''){
        this.index = index;
        this.timestamp = timestamp;
        this.vote = vote;
        this.previousHash = previousHash;
        this.hash = "";
    }

    async calculateHash(){
        return await sha256(
            this.index +
            this.timestamp +
            JSON.stringify(this.vote) +
            this.previousHash
        );
    }

}


/* =====================================================
   BLOCKCHAIN CLASS
===================================================== */

class Blockchain{

    constructor(){
        this.chain = [];
        this.init();
    }

    async init(){
        const genesis = await this.createGenesisBlock();
        this.chain.push(genesis);
    }

    async createGenesisBlock(){

        const block = new Block(
            0,
            "01/01/2026",
            "Genesis Block",
            "0"
        );

        block.hash = await block.calculateHash();

        return block;
    }

    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    async addBlock(newBlock){

        newBlock.previousHash = this.getLatestBlock().hash;

        newBlock.hash = await newBlock.calculateHash();

        this.chain.push(newBlock);
    }

}

let voteChain = new Blockchain();



/* =====================================================
   VOTE FUNCTION
===================================================== */

async function vote(party){

    let candidateName = "";

    if(party === 0){
        votes0++;
        candidateName = "Awami League";
    }
    else{
        votes1++;
        candidateName = "BNP";
    }

    let voteData = {
        voter: "anonymous",
        candidate: candidateName,
        time: new Date().toLocaleString()
    };

    voteRecords.push(voteData);

    const newBlock = new Block(
        voteChain.chain.length,
        new Date().toLocaleString(),
        voteData
    );

    await voteChain.addBlock(newBlock);

    updateResults();
    updateVoteRecord();
}



/* =====================================================
   UPDATE RESULTS
===================================================== */

function updateResults(){

    let total = votes0 + votes1;

    let percent0 = total ? ((votes0/total)*100).toFixed(1) : 0;
    let percent1 = total ? ((votes1/total)*100).toFixed(1) : 0;

    document.getElementById("results").innerText =
`Awami League: ${votes0} votes
BNP: ${votes1} votes`;

    document.getElementById("bar0").style.width = percent0 + "%";
    document.getElementById("bar1").style.width = percent1 + "%";

    document.getElementById("bar0").innerText = percent0 + "%";
    document.getElementById("bar1").innerText = percent1 + "%";
}



/* =====================================================
   UPDATE VOTE RECORD LIST
===================================================== */

function updateVoteRecord(){

    let list = document.getElementById("voteRecordList");

    list.innerHTML = "";

    voteRecords.forEach((vote,index)=>{

        let li = document.createElement("li");

        li.innerText =
        `Vote ${index+1} - ${vote.candidate} (${vote.time})`;

        list.appendChild(li);

    });

}



/* =====================================================
   SHOW BLOCKCHAIN DATA
===================================================== */

function showBlockchain(){

    let container = document.getElementById("blockchainData");

    container.innerHTML = "";

    voteChain.chain.forEach(block => {

        let div = document.createElement("div");

        div.style.border = "1px solid #ccc";
        div.style.padding = "10px";
        div.style.margin = "10px";

        div.innerHTML = `
        <b>Index:</b> ${block.index}<br>
        <b>Time:</b> ${block.timestamp}<br>
        <b>Vote:</b> ${JSON.stringify(block.vote)}<br>
        <b>Hash:</b> ${block.hash}<br>
        <b>Prev Hash:</b> ${block.previousHash}
        `;

        container.appendChild(div);

    });

}



/* =====================================================
   PAGE LOAD
===================================================== */

window.onload = function(){

    updateResults();

}