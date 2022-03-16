const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');

let gateway;

async function getContractInstance(_identityLabel, _smartContractName) {
	
	gateway = new Gateway();
	
    const fabricUserName = _identityLabel;

    let wallet;
    let connectionProfile;

    if(fabricUserName == "MANUFACTURER_ADMIN") {
        wallet = new FileSystemWallet('./identity/manufacturer'); 
        connectionProfile = yaml.safeLoad(fs.readFileSync('./manufacturer-connection-profile.yaml', 'utf8'));
    } else if (fabricUserName == "DISTRIBUTOR_ADMIN") {
        wallet = new FileSystemWallet('./identity/distributor'); 
        connectionProfile = yaml.safeLoad(fs.readFileSync('./distributor-connection-profile.yaml', 'utf8'));       
    } else if (fabricUserName == "RETAILER_ADMIN") {
        wallet = new FileSystemWallet('./identity/retailer'); 
        connectionProfile = yaml.safeLoad(fs.readFileSync('./retailer-connection-profile.yaml', 'utf8'));       
    } else if (fabricUserName == "CONSUMER_ADMIN") {
        wallet = new FileSystemWallet('./identity/consumer'); 
        connectionProfile = yaml.safeLoad(fs.readFileSync('./consumer-connection-profile.yaml', 'utf8'));       
    } else if (fabricUserName == "TRANSPORTER_ADMIN") {
        wallet = new FileSystemWallet('./identity/transporter'); 
        connectionProfile = yaml.safeLoad(fs.readFileSync('./transporter-connection-profile.yaml', 'utf8'));       
    }
	
	let connectionOptions = {
		wallet: wallet,
		identity: fabricUserName,
		discovery: { enabled: false, asLocalhost: true }
	};
	
	console.log('.....Connecting to Fabric Gateway');
	await gateway.connect(connectionProfile, connectionOptions);
	
	console.log('.....Connecting to channel - pharmachannel');
	const channel = await gateway.getNetwork('pharmachannel');
	
	console.log('.....Connecting to Smart Contract');
	return channel.getContract('pharmanet', `org.pharma-network.${_smartContractName}`);
}

function disconnect() {
    console.log('.....Disconnecting from Fabric Gateway');
    gateway.disconnect();
}

module.exports.getContractInstance = getContractInstance;
module.exports.disconnect = disconnect;