async function main() {
	const [deployer] = await ethers.getSigners()

	console.log('Deploying contracts with the account:', deployer.address)

	console.log('Account balance:', (await deployer.getBalance()).toString())

	const Astog = await ethers.getContractFactory('Astog')
	const AstogToken = await Astog.deploy()

	console.log('Token address:', AstogToken.address)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
