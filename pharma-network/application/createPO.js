
"use strict";

const helper = require('./contractHelper.js');

async function main(buyerCRN, sellerCRN, drugName, quantity, _identityLabel, _smartContractName) {
  try {
    const Contract = await helper.getContractInstance(_identityLabel, _smartContractName);

    const dataBuffer = await Contract.submitTransaction("createPO", buyerCRN, sellerCRN, drugName, quantity);

    let data = JSON.parse(dataBuffer.toString());
    console.log(data);

    return data;

  } catch (error) {

    throw new Error(error);

  } finally {

    helper.disconnect();
  }
}


module.exports.execute = main;