'use strict';

const {Contract} = require('fabric-contract-api');

class TransferDrugContract extends Contract {

    constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.pharma-network.transferDrug');
	}
	
    // This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Smart Contract Instantiated');
	}

    //function used to create a purchase order by distributor or retailer
    async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {

        try {
            
            //can only be called by a distributor or retailer
            if(ctx.ClientIdentitiy.getMSPID() !== "distributorMSP" && ctx.ClientIdentitiy.getMSPID() !== "retailerMSP") {
                return "only a distributor or retailer can create a Purchase Order";
            }
            
            //Purchase order composite key
            let POKey = ctx.stub.createCompositeKey('org.pharma-network.transferDrug.purchaseOrder', [buyerCRN, drugName]);

            let buyerIterator = ctx.stub.getStateByPartialCompositeKey('org.pharma-network.entityRegistration.entity', [buyerCRN]);

            //composite key of the buyer
            let buyerKey;
    
            let buyerRes = await buyerIterator.next();
    
            if(buyerRes.value) {
                buyerKey = buyerRes.value.key;
            } else {
                return "Buyer Company key not found";
            }
            
            await buyerIterator.close();

            let buyerBuffer = await ctx.stub
                .getState(buyerKey)
                .catch(err => console.log(err));

            //buyerObj contains the details of the buyer company
            let buyerObj = JSON.parse(buyerBuffer.toString());



            let sellerIterator = ctx.stub.getStateByPartialCompositeKey('org.pharma-network.entityRegistration.entity', [sellerCRN]);

            //composite key of the seller
            let sellerKey;
    
            let SellerRes = await sellerIterator.next();
    
            if(SellerRes.value) {
                sellerKey = SellerRes.value.key;
            } else {
                return "Buyer Company key not found";
            }
            
            await sellerIterator.close();

            let sellerBuffer = await ctx.stub
                .getState(sellerKey)
                .catch(err => console.log(err));

            //sellerObj contains the details of the seller company
            sellerObj = JSON.parse(sellerBuffer.toString());

            if ((buyerObj.organisationRole === "Retailer" && sellerObj.organisationRole === "Distributor") || 
                (buyerObj.organisationRole === "Distributor" && sellerObj.organisationRole === "Manufacturer")) {
                
                //POObj contains detials of the purchase order
                let POObj = {
                    poID: POKey,
                    drugName: drugName,
                    quantity: quantity,
                    buyer: buyerKey,
                    seller: sellerKey
                }

                //POObj is stored in the ledger
                let dataBuffer = Buffer.from(JSON.stringify(POObj));
                await ctx.stub.putState(POKey, dataBuffer);
    
                return POObj;

            } else {
                throw new Error("not proper heirarchy for drug transfer");
            }
    
        } catch (e) {
            console.log(e);
        }

    } 

    //seller invokes this transaction after createPO transaction, to transport consignment via the transporter
    async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN) {
        try {
            //only a distributor or manufacutere can call this function
            if(ctx.ClientIdentitiy.getMSPID() !== "distributorMSP" && ctx.ClientIdentitiy.getMSPID() !== "ManufacturerMSP") {
                return "only a distributor or manufacturer can create shipments";
            }

            //composite key of the shipment
            shipmentKey = ctx.stub.createCompositeKey('org.pharma-network.transferDrug.shipmentOrder', [buyerCRN, drugName]);

            //Purchase order composite key
            let POKey = ctx.stub.createCompositeKey('org.pharma-network.transferDrug.purchaseOrder', [buyerCRN, drugName]);

            let POBuffer = await ctx.stub
                .getState(POKey)
                .catch(err => console.log(err));

            //POObj contains details of the purchase order
            POObj = JSON.parse(POBuffer.toString());


            let transporterIterator = ctx.stub.getStateByPartialCompositeKey('org.pharma-network.entityRegistration.entity', [transporterCRN]);

            //composite key of the transporter
            let transporterKey;
    
            let transporterRes = await transporterIterator.next();
    
            if(transporterRes.value) {
                transporterKey = transporterRes.value.key;
            } else {
                return "Buyer Company key not found";
            }
            
            await transporterIterator.close();

            //listOfAssets assumed to be array of composite keys of assets
            if(listOfAssets.length === POObj.quantity) {
                for(let i = 0; i < listOfAssets.length; i++) {

                    //changing the owner of the asset
                    let drugObjBuffer = await ctx.stub
                        .getState(listOfAssets[i])
                        .catch(err => console.log(err));

                    let drugObj = JSON.parse(drugObjBuffer.toString());

                    //owner updated
                    drugObj.owner = transporterKey;

                    //updated object is stored in the ledger
                    let updatedDrugObjBuffer = Buffer.from(JSON.stringify(drugObj));
                    await ctx.stub.putState(listOfAssets[i], updatedDrugObjBuffer);
                }
            } else {
                return "list of Assets dont match quantity in PO";
            }

            //shipmentObj contains details of the shipment
            let shipmentObj = {
                shipmentID: shipmentKey,
                creator: POObj.seller,
                assets: listOfAssets,
                transporter: transporterKey,
                status: "in-transit"
            }
            
            //storing shipment object in the ledger
            let shipmentBuffer = Buffer.from(JSON.stringify(shipmentObj));
            await ctx.stub.putState(shipmentKey, shipmentBuffer);

            return shipmentObj;

        } catch (e) {
            console.log(e);
        }

    }

    //function to updtae the status of the shipment to 'Delivered'
    async updateShipment(ctx, buyerCRN, drugName, transporterCRN) {
        try {

            //only transporter can call the function
            if(ctx.ClientIdentitiy.getMSPID() !== "transporterMSP") {
                return "only transporter can update shipment";
            }

            //composite key of the shipment
            shipmentKey = ctx.stub.createCompositeKey('org.pharma-network.transferDrug.shipmentOrder', [buyerCRN, drugName]);

            let shipmentBuffer = await ctx.stub
                .getState(shipmentKey)
                .catch((err) => console.log(err));
            
            //fetchec shipment Object from the ledger
            let shipmentObj = JSON.parse(shipmentBuffer.toString());

            //status updated to 'Delivered'
            shipmentObj.status = "Delivered";

            let buyerIterator = ctx.stub.getStateByPartialCompositeKey('org.pharma-network.entityRegistration.entity', [buyerCRN]);

            //composite key of the buyer
            let buyerKey;
    
            let buyerRes = await buyerIterator.next();
    
            if(buyerRes.value) {
                buyerKey = buyerRes.value.key;
            } else {
                return "Buyer Company key not found";
            }
            
            await buyerIterator.close();

            let transporterIterator = ctx.stub.getStateByPartialCompositeKey('org.pharma-network.entityRegistration.entity', [transporterCRN]);

            //composite key of the transporter
            let transporterKey;
    
            let transporterRes = await transporterIterator.next();
    
            if(transporterRes.value) {
                transporterKey = transporterRes.value.key;
            } else {
                return "Buyer Company key not found";
            }
            
            await transporterIterator.close();

            if(shipmentObj.transporter != transporterKey) {
                return "function can only be invoked by the transporter of the shipment";
            }

            for(let i = 0; i < shipmentObj.assets.length; i++) {
                
                let drugObjBuffer = await ctx.stub
                    .getState(shipmentObj.assets[i])
                    .catch(err => console.log(err));

                let drugObj = JSON.parse(drugObjBuffer.toString())

                //owner of the drugObj is updated to the buyerKey
                drugObj.owner = buyerKey;
                drugObj.shipment.push(shipmentKey);

                //updated Drug Object is stored in the ledger
                let updatedDrugObjBuffer = Buffer.from(JSON.stringify(drugObj));
                await ctx.stub.putState(shipmentObj.assets[i], updatedDrugObjBuffer);
            }

            //updated shipment object is stored in the ledger
            let shipmentBuffer = Buffer.from(JSON.stringify(shipmentObj));
            await ctx.stub.putState(shipmentKey, shipmentBuffer);
            return shipmentObj;

        } catch (e) {
            console.log(e);
        }
    }

    //function called by retailer while selling drug to consumer
    async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {
        try {

            //only a retailer can call the function
            if(ctx.ClientIdentitiy.getMSPID() !== "retailerMSP") {
                return "only retailer can invoke this function";
            }

            let retailerIterator = ctx.stub.getStateByPartialCompositeKey('org.pharma-network.entityRegistration.entity', [retailerCRN]);

            //retailerKey will store the composite key of the retailer
            let retailerKey;
    
            let retailerRes = await retailerIterator.next();
    
            if(retailerRes.value) {
                retailerKey = retailerRes.value.key;
            } else {
                return "Retailer Company key not found";
            }
            
            await retailerIterator.close();

            let drugKey = ctx.stub.createCompositeKey('org.pharma-network.drugRegistration.drug', [serialNo, drugName]);
            let drugBuffer = await ctx.stub
                .getState(drugKey)
                .catch((err) => console.log(err));

            let drugObj = JSON.parse(drugBuffer.toString());

            //check to verify that the retailerKey is the owner of the drugObj
            if(retailerKey !== drugObj.owner) {
                return "retailer is not the owner";
            }
            
            //drugObj owner is updated to customer Aadhar card number
            drugObj.owner = customerAadhar;

            //updated drug Object is tored in the ledger
            let updatedDrugObjBuffer = Buffer.from(JSON.stringify(drugObj));
            await ctx.stub.putState(drugKey, updatedDrugObjBuffer);

            return drugObj;
            
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = TransferDrugContract;