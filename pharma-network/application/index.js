const express = require('express');
const app = express();
const port = 3000;

const addToWallet = require('./addToWallet');
const registerCompany = require('./registerCompany.js');
const addDrug = require('./addDrug.js');
const createPO = require('./createPO.js');
const createShipment = require('./createShipment');
const updateShipment = require('./updateShipment.js');
const retailDrug = require('./retailDrug.js');
const viewHistory = require('./viewHistory.js');
const viewDrugCurrentState = require('./viewDrugCurrentState.js');

app.use(express.json());

app.post('/addToWallet', (req, res) => {

    let certificatePath;
    let privateKeyPath;

    if(req.body.identityLabel == 'MANUFACTURER_ADMIN') {
        certificatePath = '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/signcerts/Admin@manufacturer.pharma-network.com-cert.pem';
        privateKeyPath = '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/keystore/fd99bc584202fc03f14a0ba1fe0e9c6ffde19630373c9176416b1e8333d05ab5_sk';
    } else if(req.body.identityLabel == 'DISTRIBUTOR_ADMIN') {
        certificatePath = '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/signcerts/Admin@distributor.pharma-network.com-cert.pem';
        privateKeyPath = '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/keystore/cb1a8835b4dd1182bb4b1dcf581eca4f3541938414c05c1d9802ebda4a4b3fa2_sk';
    } else if(req.body.identityLabel == 'RETAILER_ADMIN') {
        certificatePath = '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp/signcerts/Admin@retailer.pharma-network.com-cert.pem';
        privateKeyPath = '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp/keystore/b384d0a3f13d99e872f5aa374bdf2322baf909df288eec7766c060c6a342c8a6_sk';
    } else if(req.body.identityLabel == 'CONSUMER_ADMIN') {
        certificatePath = '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/consumer.pharma-network.com/users/Admin@consumer.pharma-network.com/msp/signcerts/Admin@consumer.pharma-network.com-cert.pem';
        privateKeyPath = '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/consumer.pharma-network.com/users/Admin@consumer.pharma-network.com/msp/keystore/fc994b7abba03ae6895ee380b2037ce6521570916393760c337eb6b9bb6778c5_sk';
    } else if(req.body.identityLabel == 'TRANSPORTER_ADMIN') {
        certificatePath = '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/signcerts/Admin@transporter.pharma-network.com-cert.pem';
        privateKeyPath = '/home/upgrad/Desktop/pharma-network/network/crypto-config/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/keystore/ec4d7c1e833e54b8257e7b7e073558a42712fcbdd06af4ed530c5c6c5aed57f5_sk';
    } else {
        const result = {
            message: 'User creation failed',
        };
        res.status(500).json(result);
    }

	addToWallet.execute(certificatePath, privateKeyPath, req.body.identityLabel)
		.then(() => {
			const result = {
				message: 'User created'
			};
			res.json(result);
		})
		.catch((e) => {
			const result = {
				message: 'User creation failed',
			};
			res.status(500).json(result);
		})
})


app.post('/registerCompany', (req, res) => {
	registerCompany.execute(req.body.companyCRN, req.body.companyName, req.body.Location, req.body.organisationRole, req.body.identityLabel, 'entityRegistration')
		.then((company) => {

			let result = {
                company: company
            };

			res.json(result);
		})
		.catch((e) => {
			let result = {
                message: e.message
			};

			res.json(result);
		})
})

app.post('/addDrug', (req, res) => {
	addDrug.execute(req.body.drugName, req.body.serialNo, req.body.mfgDate, req.body.expDate, req.body.companyCRN, req.body.identityLabel, 'drugRegistration')
		.then((drug) => {
			
			let result = {
                drug: drug
            }

			res.json(result);
		})
		.catch((e) => {
			let result = {
				message: e.message
			};
			res.json(result);
		})
})

app.post('/createPO', (req, res) => {
	createPO.execute(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity, req.body.identityLabel, 'transferDrug')
		.then((purchaseOrder) => {

			let result;
			
			result = {
				purchaseOrder: purchaseOrder
			}

			res.json(result);
		})
		.catch((e) => {

			let result = {
				message: e.message
			};

			res.json(result);
		})
})

app.post('/createShipment', (req, res) => {
	createShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN, req.body.identityLabel, 'transferDrug')
		.then((shipmentOrder) => {
			let result;
			
			result = {
				shipmentOrder: shipmentOrder
			}

			res.json(result);
		})
		.catch((e) => {

			let result = {
				message: e.message
			};

			res.json(result);
		})
})

app.post('/updateShipment', (req, res) => {
	updateShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN, req.body.identityLabel, 'transferDrug')
		.then((shipmentOrder) => {
			let result;
			
			result = {
				shipmentOrder: shipmentOrder
			}

			res.json(result);
		})
		.catch((e) => {

			let result = {
				message: e.message
			};

			res.json(result);
		})
})

app.post('/retailDrug', (req, res) => {
	retailDrug.execute(req.body.drugName, req.body.serialNo, req.body.retailerCRN, req.body.customerAadhar, req.body.identityLabel, 'transferDrug')
		.then((drug) => {
			let result;
			
			result = {
				drug: drug
			}

			res.json(result);
		})
		.catch((e) => {

			let result = {
				message: e.message
			};

			res.json(result);
		})
})

app.post('/viewHistory', (req, res) => {
	viewHistory.execute(req.body.drugName, req.body.serialNo, req.body.identityLabel, 'viewLifecycle')
		.then((drugHistory) => {
			let result;
		
			result = {
				drugHistory: drugHistory
			}

			res.json(result);
		})
		.catch((e) => {

			let result = {
				message: e.message
			};

			res.json(result);
		})
})

app.post('/viewDrugCurrentState', (req, res) => {
	viewDrugCurrentState.execute(req.body.drugName, req.body.serialNo, req.body.identityLabel, 'viewLifecycle')
		.then((drug) => {
			let result;
			
			result = {
				drug: drug
			}

			res.json(result);
		})
		.catch((e) => {

			let result = {
				message: e.message
			};

			res.json(result);
		})
})

app.listen(port, () => console.log(`listening on port ${port}`));