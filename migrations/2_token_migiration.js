const Token = artifacts.require("Token");
const starting_count = 3;
module.exports = async function(deployer) {
    await deployer.deploy(Token, "NFT Game", "NFTG");
    let tokenInstance = await Token.deployed();
    var generatePet = async ()=>{
        let baseLifespan = 1000;
        let ability = Math.floor(Math.random()*255)
        let strenght = Math.floor(Math.random()*255)
        let lifespan = Math.floor(baseLifespan-baseLifespan*((ability+strenght)/2)/255)
        await tokenInstance.mint(ability, strenght, lifespan); // token id 0
        console.log("Generated pet",ability,strenght,lifespan);

    }
    for (let i = 0; i < starting_count; i++) {
        generatePet();
    }
};