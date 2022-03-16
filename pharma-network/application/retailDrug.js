'use strict';

const helper = require('./contractHelper.js');

async function main(drugName, serialNo, retailerCRN, customerAadhar, _identityLabel, _smartContractName) {
    try {
        const Contract = await helper.getContractInstance(_identityLabel, _smartContractName);

        const dataBuffer = await Contract.submitTransaction('retailDrug', drugName, serialNo, retailerCRN, customerAadhar);

        let data = JSON.parse(dataBuffer.toString());

        return data;
    } catch (error) {

        throw new Error(error);

    } finally {

        helper.disconnect();
    }
}

module.exports.execute = main;