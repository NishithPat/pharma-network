'use strict';

const {Contract} = require('fabric-contract-api');

class EntityRegistrationContract extends Contract {
	
	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.pharma-network.entityRegistration');
	}
	
	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Smart Contract Instantiated');
	}
	
    //Function for entity registration
    async registerCompany(ctx, companyCRN, companyName, Location, organisationRole) {

        try {

            //check for msp of users. Everyone other than the consumer is allowed.
            if(ctx.ClientIdentitiy.getMSPID() === "consumerMSP") {
                return "Consumer cannot register a company";
            }

            let companyKey = ctx.stub.createCompositeKey('org.pharma-network.entityRegistration.entity', [companyCRN, companyName]);

            let hierarchyValue;

            //setting hierarchyValue value for different orgs
            if(organisationRole === "Manufacturer") {
                hierarchyValue = 1;
            } else if(organisationRole === "Distributor") {
                hierarchyValue = 2;
            } else if (organisationRole === "Retailer") {
                hierarchyValue = 3;
            }
            
            let entityObject;

            if(hierarchyValue === 1 || hierarchyValue === 2 || hierarchyValue === 3) {

                entityObject = {
                    companyID: companyKey,
                    name: companyName,
                    location: Location,
                    organisationRole: organisationRole,
                    hierarchyKey: hierarchyValue
                }

            } else {
                
                //transporter does not have a hierarchyKey
                entityObject = {
                    companyID: companyKey,
                    name: companyName,
                    location: Location,
                    organisationRole: organisationRole
                }
                
            }

            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(entityObject));
            await ctx.stub.putState(companyKey, dataBuffer);

            return entityObject;

        } catch (e) {
            console.log(e);
        }
    
    }
	
}

module.exports = EntityRegistrationContract;