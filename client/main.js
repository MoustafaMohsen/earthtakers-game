
Moralis.initialize("TMokTBqX3iXQ4BEvXuWZckCKgcgZDOZkXSZNteLZ"); // Application id from moralis.io
Moralis.serverURL = "https://hc1fxngos0tw.moralishost.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0x3C08B0Ae9335eb29E3eF194C0D678f0B48eEAccA";
async function init() {
    try {
        let user = Moralis.User?.current();
        if (!user) {
            $("#login_button").click(async () => {
                user = await Moralis.Web3.authenticate();
                alert("User logged in");
                renderGame();
            })
        } else {
            renderGame();
        }
        console.log(user);
    } catch (error) {
        console.log(error);
    }
}

async function renderGame() {
    $("#login_button").hide();
    refreshRender();
    // Get and render properties from Smart Contract
    let petId = 0;
    window.web3 = await Moralis.Web3.enable();
    let abi = await getAbi();
    let contract = await new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    let array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({
        from: ethereum.selectedAddress
    });
    if (array.length == 0) return;
    console.log("getAllTokensForUser", array);
    for (let i = 0; i < array.length; i++) {
        let petId = array[i];
        let data = await contract.methods.getTokenDetails(petId).call({
            from: ethereum.selectedAddress
        });
        renderPet(petId, data);
    }
    $("#game").show();

}
function refreshRender() {
    intervals.forEach(i=>{clearInterval(i)});
    $("#pet_row").html("")
}
let intervals=[];
function renderPet(id, data) {
    console.log(id, data);
    let now = new Date();
    let maxTime = data.endurance;
    let currentUnix = Math.floor(now.getTime() / 1000);
    let secondsLeft = (parseInt(data.lastMeal) + parseInt(data.endurance)) - currentUnix;
    let percentageLeft = secondsLeft / maxTime;
    let percentageString = (percentageLeft * 100) + "%";
    console.log("percentage Left", percentageLeft);

    let deathTime = new Date((parseInt(data.lastMeal) + parseInt(data.endurance)) * 1000)
    
    var note = ""
    var disabled = ""
    if (now > deathTime) {
        note = "<b>DEAD</b>"
        disabled = "disabled"
    }
    let interval = setInterval(()=>{
        let now = new Date();
        let maxTime = data.endurance;
        let currentUnix = Math.floor(now.getTime() / 1000);
        let secondsLeft = (parseInt(data.lastMeal) + parseInt(data.endurance)) - currentUnix;
        let percentageLeft = secondsLeft / maxTime;
        let percentageString = (percentageLeft * 100) + "%";
        console.log("percentage Left", percentageLeft);
        console.log(`#pet_${id} .progress-bar`);
        $(`#pet_${id} .progress-bar`).css("width",percentageString)
    },5000)
    intervals.push(interval);
    let htmlString = `
    <div class="col-md-5 card mx-1" id="pet_${id}">
        <img class="card-img-top" src="./img/beast.png" alt="nft pet" id="pet_img">
        <div class="card-body">
        <!--<div>Id:<span class="pet_id"></span>${id}</div>-->
        <div>Ability:<span class="pet_damage">${data.damage}/255</span></div>
        <div>Strenght:<span class="pet_magic">${data.magic}/255</span></div>
        <div>LifeSpan:<span class="pet_endurance">${data.endurance}</span></div>
        <!--<div>Time to starvation:<span class="pet_starvation_time">${deathTime}/timestamp</span></div>-->
        <div class="progress">
            <div class="progress-bar" role="progressbar" style="width:${percentageString}"></div>${note}
        </div>
        </br>
        <button ${disabled} class="btn btn-primary btn-block feed_button" data-pet-id="${id}">Feed</button>
        <button ${disabled} class="btn btn-primary btn-block trade_button" data-pet-id="${id}">Trade</button>
        </div>
    </div>`
    let element = $.parseHTML(htmlString);
    $("#pet_row").append(element);
    $(".feed_button").click((e, element) => {
        let petId = $(e.target).attr("data-pet-id");
        console.log(petId);
        feed(petId)
    });
}

function getAbi() {
    return new Promise((res) => {
        $.getJSON("Token.json", (json) => {
            res(json.abi);
        })
    })
}
async function feed(petId) {
    let abi = await getAbi();
    let contract = await new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    contract.methods.feed(petId).send({
        from: ethereum.selectedAddress
    }).on("receipt", (() => {
        console.log("feed done");
        renderGame();
    }))
}


init();