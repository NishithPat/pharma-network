'use strict';

const {Contract} = require('fabric-contract-api');

class ViewLifecycleContract extends Contract {
    constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.pharma-network.viewLifecycle');
	}
	
	async instantiate(ctx) {
		console.log('Smart Contract Instantiated');
	}

  //View history
  async viewHistory(ctx, drugName, serialNo) {
    try {
      let drugKey = ctx.stub.createCompositeKey('org.pharma-network.drugRegistration.drug', [serialNo, drugName]);
      
      const promiseOfIterator = ctx.stub.getHistoryForKey(drugKey);

      const results = [];
      for await (const keyMod of promiseOfIterator) {
        const resp = {
          timestamp: keyMod.timestamp,
          txid: keyMod.txId
        }
        if (keyMod.isDelete) {
          resp.data = 'KEY DELETED';
        } else {
          resp.data = keyMod.value.toString('utf8');
        }
        results.push(resp);
      }
      // results array contains the key history

      return results;

    } catch (e) {
      return e;
    }
  }

  //view current state
  async viewDrugCurrentState(ctx, drugName, serialNo) {
      try {
        let drugKey = ctx.stub.createCompositeKey('org.pharma-network.drugRegistration.drug', [serialNo, drugName]);

        let dataBuffer = await ctx.stub.getState(drugKey)
          .catch((err) => console.log(err));

        return JSON.parse(dataBuffer.toString());
          
      } catch (e) {
        return e;
      }
  }

}

module.exports = ViewLifecycleContract;