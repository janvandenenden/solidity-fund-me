# Solidity fund me contract exercise

This project demonstrates a basic Hardhat use case. Participants can send funds to the smart contract and only the owner, using a modifier, can withdraw them.

Only fund transactions > \$50 dollars can be send. To convert ETH to the current USD price the chainlink price feed is used.

When ETH is "randomly" sent to the contract it gets automatically staked.

Basic tests are written of local development and Ethereum test networks.

## Requirements

-   [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
    -   You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`
-   [Nodejs](https://nodejs.org/en/)
    -   You'll know you've installed nodejs right if you can run:
        -   `node --version` and get an ouput like: `vx.x.x`
-   [Yarn](https://yarnpkg.com/getting-started/install) instead of `npm`
    -   You'll know you've installed yarn right if you can run:
        -   `yarn --version` and get an output like: `x.x.x`
        -   You might need to [install it with `npm`](https://classic.yarnpkg.com/lang/en/docs/install/) or `corepack`

# Usage

yarn hardhat deploy

yarn hardhat test

yarn hardhat coverage
