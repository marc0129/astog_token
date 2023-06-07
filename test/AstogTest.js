const { expect } = require('chai')
const { ethers } = require('hardhat')
const { solidity } = require('ethereum-waffle')
const chai = require('chai')
chai.use(solidity)
const hre = require('hardhat')
const { network } = hre
const { BigNumber } = require('ethers')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const SECS_IN_YR = 31449600
const AMOUNT = BigNumber.from(1000 * 10 ** 9)
const TEN_YR_FEE = AMOUNT.mul(10).div(10000)
const TWENTY_YR_FEE = AMOUNT.mul(9).div(10000)
const THIRTY_YR_FEE = AMOUNT.mul(8).div(10000)
const FOURTY_YR_FEE = AMOUNT.mul(7).div(10000)
const FIFTY_YR_FEE = AMOUNT.mul(6).div(10000)
const SIXTY_YR_FEE = AMOUNT.mul(5).div(10000)
const SEVENTY_YR_FEE = AMOUNT.mul(4).div(10000)
const EIGHTY_YR_FEE = AMOUNT.mul(3).div(10000)
const NIGHTY_YR_FEE = AMOUNT.mul(2).div(10000)
const HUNDRED_YR_FEE = AMOUNT.mul(1).div(10000)

const time = [5, 12, 23, 37, 45, 53, 66, 72, 81, 99]
const fee = [
	TEN_YR_FEE,
	TWENTY_YR_FEE,
	THIRTY_YR_FEE,
	FOURTY_YR_FEE,
	FIFTY_YR_FEE,
	SIXTY_YR_FEE,
	SEVENTY_YR_FEE,
	EIGHTY_YR_FEE,
	NIGHTY_YR_FEE,
	HUNDRED_YR_FEE,
]

const now = async () => (await ethers.provider.getBlock('latest')).timestamp

const increaseTimeAndMineBlock = async (durationInSec) => {
	await network.provider.send('evm_increaseTime', [durationInSec])
	await network.provider.send('evm_mine')
}

describe('Astog contract', () => {
	let Astog
	let AstogToken
	let owner
	let addr1
	let addr2
	let devWallet
	let addrs

	beforeEach(async () => {
		// Get the ContractFactory and Signers here.
		Astog = await ethers.getContractFactory('Astog')
		;[owner, addr1, addr2, devWallet, ...addrs] = await ethers.getSigners()

		AstogToken = await Astog.deploy()
	})

	describe('Deployment', () => {
		it('returns correct token info', async () => {
			expect((await AstogToken.name()).toString()).to.equal('AstogEtoken')
			expect((await AstogToken.symbol()).toString()).to.equal('ASTG')
			expect((await AstogToken.decimals()).toString()).to.equal('9')
			expect((await AstogToken.totalSupply()).toString()).to.equal(
				(900000000 * 10 ** 9).toLocaleString('fullwide', {
					useGrouping: false,
				})
			)
		})

		it('Should assign the total supply of tokens to the owner', async function () {
			const ownerBalance = await AstogToken.balanceOf(owner.address)
			expect(await AstogToken.totalSupply()).to.equal(ownerBalance)
		})

		it('returns correct token balances', async () => {
			expect(
				(await AstogToken.balanceOf(owner.address)).toString()
			).to.equal(
				(900000000 * 10 ** 9).toLocaleString('fullwide', {
					useGrouping: false,
				})
			)
			expect(
				(await AstogToken.balanceOf(addr1.address)).toString()
			).to.equal('0')
		})

		it('returns correct dev rate', async () => {
			expect(await AstogToken.currentDevRate()).to.be.equal('1000')
		})
	})

	describe('Approve and Allowance Functionalities', () => {
		it('can approve tokens', async () => {
			await AstogToken.approve(
				addr1.address,
				(10 ** 9).toLocaleString('fullwide', {
					useGrouping: false,
				})
			)
			expect(
				(
					await AstogToken.allowance(owner.address, addr1.address)
				).toString()
			).to.be.equal(
				(10 ** 9).toLocaleString('fullwide', {
					useGrouping: false,
				})
			)
		})

		it('can increase allowance of tokens', async () => {
			await AstogToken.approve(
				addr1.address,
				(10 ** 9).toLocaleString('fullwide', {
					useGrouping: false,
				})
			)
			await AstogToken.increaseAllowance(
				addr1.address,
				(10 ** 9).toLocaleString('fullwide', {
					useGrouping: false,
				})
			)

			expect(
				(
					await AstogToken.allowance(owner.address, addr1.address)
				).toString()
			).to.be.equal(
				(2 * 10 ** 9).toLocaleString('fullwide', {
					useGrouping: false,
				})
			)
		})

		// it('cannot increase allowance if receipent is zero address', async () => {
		// 	await expect(
		// 		AstogToken.approve(
		// 			ZERO_ADDRESS,
		// 			(10 ** 9).toLocaleString('fullwide', {
		// 				useGrouping: false,
		// 			})
		// 		)
		// 	).to.be.revertedWith('ERC20: approve to the zero address')
		// })

		it('can decrease allowance of tokens', async () => {
			await AstogToken.approve(
				addr1.address,
				(10 ** 9).toLocaleString('fullwide', {
					useGrouping: false,
				})
			)
			await AstogToken.decreaseAllowance(
				addr1.address,
				(10 ** 9).toLocaleString('fullwide', {
					useGrouping: false,
				})
			)

			expect(
				(
					await AstogToken.allowance(owner.address, addr1.address)
				).toString()
			).to.be.equal('0')
		})
	})

	describe('Overriden Tranfer Functionalites', () => {
		for (let i = 0; i < time.length; i++) {
			const currYr = time[i]

			describe(`For ${currYr}yrs since start`, () => {
				it('can transfer tokens (transfer)', async () => {
					await increaseTimeAndMineBlock(currYr * SECS_IN_YR)

					await AstogToken.transfer(addr1.address, AMOUNT)
					// expect(
					// 	(await AstogToken.balanceOf(owner.address)).toString()
					// ).to.be.equal(
					// 	((900000000 - 1000) * 10 ** 9).toLocaleString(
					// 		'fullwide',
					// 		{
					// 			useGrouping: false,
					// 		}
					// 	)
					// )
					// expect(
					// 	(await AstogToken.balanceOf(addr1.address)).toString()
					// ).to.be.equal(AMOUNT.sub(fee[i]))
					// expect(
					// 	(
					// 		await AstogToken.balanceOf(devWallet.address)
					// 	).toString()
					// ).to.be.equal(fee[i])
				})

				// it('cannot transfer tokens if recipient is zero address (transfer)', async () => {
				// 	await increaseTimeAndMineBlock(currYr * SECS_IN_YR)

				// 	await expect(
				// 		AstogToken.transfer(
				// 			ZERO_ADDRESS,
				// 			(10 ** 18).toLocaleString('fullwide', {
				// 				useGrouping: false,
				// 			})
				// 		)
				// 	).to.be.revertedWith('ERC20: transfer to the zero address')
				// })

				// it('cannot transfer tokens when balance is not sufficient (transfer)', async () => {
				// 	await increaseTimeAndMineBlock(currYr * SECS_IN_YR)

				// 	await expect(
				// 		AstogToken.connect(addr1).transfer(
				// 			owner.address,
				// 			(10 ** 18).toLocaleString('fullwide', {
				// 				useGrouping: false,
				// 			})
				// 		)
				// 	).to.be.revertedWith(
				// 		'ERC20: transfer amount exceeds balance'
				// 	)
				// })

				it('can transfer tokens (transferFrom)', async () => {
					await increaseTimeAndMineBlock(currYr * SECS_IN_YR)

					await AstogToken.approve(owner.address, AMOUNT)
					await AstogToken.transferFrom(
						owner.address,
						addr1.address,
						AMOUNT
					)
				})

				it('can transfer tokens on behalf of sender (transferFrom)', async () => {
					await increaseTimeAndMineBlock(currYr * SECS_IN_YR)

					await AstogToken.approve(addr1.address, AMOUNT)
					await AstogToken.connect(addr1).transferFrom(
						owner.address,
						addr1.address,
						AMOUNT
					)
				})
			})
		}
	})
})
