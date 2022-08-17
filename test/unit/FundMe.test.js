const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function() {
          let fundMe
          let deployer
          let mockV3Aggregator
          let sendValue
          beforeEach(async function() {
              //deploy fund me contract
              // const accounts = await ethers.getSigners()
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
              sendValue = await ethers.utils.parseEther("1")
          })
          describe("constructor", async function() {
              it("sets the aggregator addresses correctly", async function() {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async function() {
              it("fails if you don't send enough ETH", async function() {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "didn't send enough"
                  )
              })
              it("updates the amount funded data structure", async function() {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("updates the funders array", async function() {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert(funder, deployer)
              })
          })

          describe("withdraw", async function() {
              beforeEach(async function() {
                  await fundMe.fund({ value: sendValue })
              })
              it("withdraw ETH from a single founder", async function() {
                  //arrange
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  //act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  //assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })
              it("allows us to withdraw with multiple funders", async function() {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
              })

              const startingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              const startingDeployerBalance = await fundMe.provider.getBalance(
                  deployer
              )
              const transactionResponse = await fundMe.withdraw()
              const transactionReceipt = await transactionResponse.wait(1)
              const { gasUsed, effectiveGasPrice } = transactionReceipt
              const gasCost = gasUsed.mul(effectiveGasPrice)
              assert.equal(endingFundMeBalance, 0)
              assert.equal(
                  startingFundMeBalance.add(startingDeployerBalance).toString(),
                  endingDeployerBalance.add(gasCost).toString()
              )

              await expect(fundMe.getFunders(0)).to.be.reverted
              for (i = 1; i < 6; i++) {
                  assert.equal(
                      await fundMe.getAddressToAmountFunded(
                          accounts[i].address
                      ),
                      0
                  )
              }
          })
          it("only allows the owner to withdraw", async function() {
              const accounts = await ethers.getSigners()
              const attacker = accounts[1]
              const attackerConnectedContract = await fundMe.connect(attacker)
              await expect(
                  attackerConnectedContract.withdraw()
              ).to.be.revertedWith("FundMe__NotOwner")
          })

          describe("cheaper withdraw...", async function() {
              beforeEach(async function() {
                  await fundMe.fund({ value: sendValue })
              })
              it("withdraw ETH from a single founder", async function() {
                  //arrange
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  //act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  //assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })
              it("allows us to withdraw with multiple funders", async function() {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
              })

              const startingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              const startingDeployerBalance = await fundMe.provider.getBalance(
                  deployer
              )
              const transactionResponse = await fundMe.cheaperWithdraw()
              const transactionReceipt = await transactionResponse.wait(1)
              const { gasUsed, effectiveGasPrice } = transactionReceipt
              const gasCost = gasUsed.mul(effectiveGasPrice)
              assert.equal(endingFundMeBalance, 0)
              assert.equal(
                  startingFundMeBalance.add(startingDeployerBalance).toString(),
                  endingDeployerBalance.add(gasCost).toString()
              )

              await expect(fundMe.getFunders(0)).to.be.reverted
              for (i = 1; i < 6; i++) {
                  assert.equal(
                      await fundMe.getAddressToAmountFunded(
                          accounts[i].address
                      ),
                      0
                  )
              }
          })
          it("only allows the owner to withdraw", async function() {
              const accounts = await ethers.getSigners()
              const attacker = accounts[1]
              const attackerConnectedContract = await fundMe.connect(attacker)
              await expect(
                  attackerConnectedContract.withdraw()
              ).to.be.revertedWith("FundMe__NotOwner")
          })
      })
