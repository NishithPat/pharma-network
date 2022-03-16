'use strict';

const helper = require('./contractHelper.js');

async function main(drugName, serialNo, mfgDate, expDate, companyCRN, _identityLabel, _smartContractName) {
    try {
        const Contract = await helper.getContractInstance(_identityLabel, _smartContractName);
        const dataBuffer = await Contract.submitTransaction('addDrug', drugName, serialNo, mfgDate, expDate, companyCRN);

        let data = JSON.parse(dataBuffer.toString());
        console.log(newOrg);

        return data;

    } catch (error) {

        throw new Error(error);

    } finally {

        helper.disconnect();
    }
}

module.exports.execute = main;