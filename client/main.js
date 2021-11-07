Moralis.initialize("TMokTBqX3iXQ4BEvXuWZckCKgcgZDOZkXSZNteLZ"); // Application id from moralis.io
Moralis.serverURL = "https://hc1fxngos0tw.moralishost.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0xb3CF674b5f43a8A17A7710a25b016055A5aadE0B";
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
    // Get and render properties from Smart Contract
    let petId = 0;
    window.web3 = await Moralis.Web3.enable();
    let abi = await getAbi();
    let contract = await new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    let data = await contract.methods.getTokenDetails(petId).call({from: ethereum.selectedAddress});
    renderPet(petId, data);
    $("#game").show();

}

function renderPet(id, data) {
    console.log(id, data);
    $("#pet_id").html(id);
    $("#pet_damage").html(data.damage);
    $("#pet_magic").html(data.magic);
    $("#pet_endurance").html(data.endurance);
    let deathTime = new Date( (parseInt(data.lastMeal) + parseInt(data.endurance))*1000)
    $("#pet_starvation_time").html(deathTime);
}

function getAbi(){
    return new Promise((res)=>{
        $.getJSON("Token.json", (json)=>{
            res(json.abi);
        })
    })
}

init();