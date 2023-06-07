# Astog Token

### Installation

Install all the dependencies with npm, run the following command

```bash
  npm install
```

### Testing

To test the contract, run the following command

```bash
  npm run test
```

To clean all the temp files from the test, run the following command

```bash
  npm run clean
```

### Deployment

Create a secrets.json file in the root directory and add the following variables

```json
{
	"ALCHEMY_API_KEY": "your-mnemonic",
	"ROPSTEN_PRIVATE_KEY": "your-infura-key"
}
```

---

**NOTE**

Create an empty secrets.json file if you just need to run the tests

```json
{
	"ALCHEMY_API_KEY": "",
	"ROPSTEN_PRIVATE_KEY": ""
}
```

---

To deploy to a network, run the following command by replacing the `NETWORK` with one of the following valid values:

-   rinkeby

```bash
  npx hardhat run --network NETWORK scripts/deploy.js
```
