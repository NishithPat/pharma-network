'use strict';

const {Contract} = require('fabric-contract-api');

class DrugRegistrationContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.pharma-network.drugRegistration');
	}
	
	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Smart Contract Instantiated');
	}

    //function to add drug to the ledger
    async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN) {

        try {

            //only a maufacturer can add drug
            if(ctx.ClientIdentitiy.getMSPID() !== "manufacturerMSP") {
                return "only a manufacturer can add drugs to the ledger";
            }
            
            //composite key for drug registration
            let drugKey = ctx.stub.createCompositeKey('org.pharma-network.drugRegistration.drug', [serialNo, drugName]);
    
            let iterator = ctx.stub.getStateByPartialCompositeKey('org.pharma-network.entityRegistration.entity', [companyCRN]);
            
            //composite key of the manufacturing company
            let companyKey;
    
            let res = await iterator.next();
    
            if(res.value) {
                companyKey = res.value.key;
            } else {
                return "Company key not found";
            }
            
            await iterator.close();
            
            
            let drugObject = {
                productID: drugKey,
                name: drugName,
                manufacturer: companyKey,
                manufacuringDate: mfgDate,
                expiryDate: expDate,
                owner: companyKey,
                shipment: [],
            }
            
            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(drugObject));
            await ctx.stub.putState(drugKey, dataBuffer);
    
            return drugObject;

        } catch (e) {
            console.log(e);
        }
        
    }

    // async getAllResults(iterator) {
    //     const allResults = [];
    //     while (true) {
    //         const res = await iterator.next();
    //         if (res.value) {
    //             // if not a getHistoryForKey iterator then key is contained in res.value.key
    //             allResults.push(res.value.value.toString('utf8'));
    //         }
    
    //         // check to see if we have reached then end
    //         if (res.done) {
    //             // explicitly close the iterator            
    //             await iterator.close();
    //             return allResults;
    //         }
    //     }
    // }
    
    
}

module.exports = DrugRegistrationContract;