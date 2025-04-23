const {Web3} = require("web3");
const MedicalRecords = artifacts.require("MedicalRecords");

module.exports = async function (callback) {
  const web3 = new Web3("http://127.0.0.1:7545");
  const contract = await MedicalRecords.deployed();

  const accounts = await web3.eth.getAccounts();
  const govAccount = accounts[0];

  // 1. Create a new patient wallet
  const newPatient = web3.eth.accounts.create();
  const { address, privateKey } = newPatient;

  console.log("🧾 New Patient Wallet:", address) ;
  console.log("🔑 Private Key:", privateKey);
  

  // 2. Fund the patient wallet
  await web3.eth.sendTransaction({
    from: govAccount,
    to: address,
    value: web3.utils.toWei("1", "ether"),
  });

  // 3. Prepare registerWithTracking data
  const data = contract.contract.methods
    .registerWithTracking(2) // role 2 = patient
    .encodeABI();

  const txCount = await web3.eth.getTransactionCount(address);
  const baseFee = await web3.eth.getBlock("latest").then(b => Number(b.baseFeePerGas));
  const maxPriorityFee = web3.utils.toWei("2", "gwei"); // tip
  const maxFee = baseFee + Number(maxPriorityFee); // max total
  
  const tx = {
    to: contract.address,
    data,
    gas: 200000,
    maxPriorityFeePerGas: maxPriorityFee,
    maxFeePerGas: maxFee,
    nonce: txCount,
    type: 2,
    value: "0x0"
  };
  
  // 4. Sign and send
  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

  try {
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("✅ Patient registered! TxHash:", receipt.transactionHash);
  } catch (err) {
    console.error("❌ Error during registration:", err.message || err.reason);
  }

  callback();
};
