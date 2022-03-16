'use strict';

const helper = require('./contractHelper.js');

async function main(companyCRN, companyName, Location, organisationRole, _identityLabel, _smartContractName) {
    
    try {

      const Contract = await helper.getContractInstance(_identityLabel, _smartContractName);

      const dataBuffer = await Contract.submitTransaction('registerCompany', companyCRN, companyName, Location, organisationRole);

      let newOrg = JSON.parse(dataBuffer.toString());
      console.log(newOrg);

      return newOrg;

    } catch (error) {

      throw new Error(error);

    } finally {

      console.log('Disconnect from fabric');
      helper.disconnect();
    }
  }
  
module.exports.execute = main;