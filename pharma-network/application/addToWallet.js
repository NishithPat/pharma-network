'use strict';

const fs = require('fs'); 
const { FileSystemWallet, X509WalletMixin } = require('fabric-network'); 
const path = require('path'); 

const crypto_materials = path.resolve(__dirname, '../network/crypto-config'); 

let wallet;

async function main(certificatePath, privateKeyPath, _identityLabel) {

	try {
		const certificate = fs.readFileSync(certificatePath).toString();
		const privatekey = fs.readFileSync(privateKeyPath).toString();

		const identityLabel = _identityLabel;
        let identity;

        if(_identityLabel == "MANUFACTURER_ADMIN") {
            wallet = new FileSystemWallet("./identity/manufacturer");
            identity = X509WalletMixin.createIdentity('manufacturerMSP', certificate, privatekey);
        } else if (_identityLabel == "DISTRIBUTOR_ADMIN") {
            wallet = new FileSystemWallet("./identity/distributor");
            identity = X509WalletMixin.createIdentity('distributorMSP', certificate, privatekey);           
        } else if (_identityLabel == "RETAILER_ADMIN") {
            wallet = new FileSystemWallet("./identity/retailer");
            identity = X509WalletMixin.createIdentity('retailerMSP', certificate, privatekey);           
        } else if (_identityLabel == "CONSUMER_ADMIN") {
            wallet = new FileSystemWallet("./identity/consumer");
            identity = X509WalletMixin.createIdentity('consumerMSP', certificate, privatekey);           
        } else if (_identityLabel == "TRANSPORTER_ADMIN") {
            wallet = new FileSystemWallet("./identity/transporter");
            identity = X509WalletMixin.createIdentity('transporterMSP', certificate, privatekey);           
        }

		await wallet.import(identityLabel, identity);

	} catch (error) {
		console.log(`Error adding to wallet. ${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

// main('/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/signcerts/Admin@manufacturer.pharma-network.com-cert.pem', '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/keystore/fd99bc584202fc03f14a0ba1fe0e9c6ffde19630373c9176416b1e8333d05ab5_sk', 'MANUFACTURER_ADMIN').then(() => {
//   console.log('User identity added to wallet.');
// });

// main('/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/signcerts/Admin@distributor.pharma-network.com-cert.pem', '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/keystore/cb1a8835b4dd1182bb4b1dcf581eca4f3541938414c05c1d9802ebda4a4b3fa2_sk', 'DISTRIBUTOR_ADMIN').then(() => {
//     console.log('User identity added to wallet.');
//   });

// main('/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp/signcerts/Admin@retailer.pharma-network.com-cert.pem', '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp/keystore/b384d0a3f13d99e872f5aa374bdf2322baf909df288eec7766c060c6a342c8a6_sk', 'RETAILER_ADMIN').then(() => {
//     console.log('User identity added to wallet.');
//   });

// main('/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/consumer.pharma-network.com/users/Admin@consumer.pharma-network.com/msp/signcerts/Admin@consumer.pharma-network.com-cert.pem', '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/consumer.pharma-network.com/users/Admin@consumer.pharma-network.com/msp/keystore/fc994b7abba03ae6895ee380b2037ce6521570916393760c337eb6b9bb6778c5_sk', 'CONSUMER_ADMIN').then(() => {
//     console.log('User identity added to wallet.');
//   });

// main('/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/signcerts/Admin@transporter.pharma-network.com-cert.pem', '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/keystore/ec4d7c1e833e54b8257e7b7e073558a42712fcbdd06af4ed530c5c6c5aed57f5_sk', 'TRANSPORTER_ADMIN').then(() => {
//     console.log('User identity added to wallet.');
//   });

module.exports.execute = main;