const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER
} = require("../helper-hardhat-config")

const { network } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    //if the contract doesn't exist, we deploy a minimal verios for our local testing

    if (developmentChains.includes(network.name)) {
        log("local network detected! deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true
        })
        log("Mockls deployed")
        log("------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
