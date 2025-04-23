const {Web3} = require('web3');
const fs = require('fs');
const doctors = require('./Doctors.json');

const web3 = new Web3('http://127.0.0.1:7545');

const contractJson = JSON.parse(fs.readFileSync('../build/contracts/MedicalRecords.json', 'utf8'));
const contractABI = contractJson.abi;

const contractAddress = '0x7F82834523D987067bf6317fE3c7Fa13641E3519'; // Replace with your contract address

async function registerDoctor() {
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    for (const doc of doctors){
        try {
            web3.eth.accounts.wallet.add(doc.privateKey);

            const receipt = await contract.methods
                .registerWithTracking(1)
                .send({
                    from: doc.address,
                    gas: 200000,
                });
            console.log(`✅ ${doc.name} (${doc.address}) registered. TxHash: ${receipt.transactionHash}`);
        } catch (err){
            console.log(`❌ ${doc.name} (${doc.address}) failed to register. Error: ${err.message}`);
        } 
    }
}

registerDoctor()
    .then(() => {
        console.log('All doctors registered successfully');
    })
    .catch((err) => {
        console.error('Error registering doctors:', err);
    });