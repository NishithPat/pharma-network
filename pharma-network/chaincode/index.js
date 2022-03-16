"use strict";

const entityRegistration = require("./EntityRegistration.js");
const drugRegistration = require("./DrugRegistration");
const transferDrug = require("./TransferDrug");
const viewLifecycle = require("./ViewLifecycle");

module.exports.contracts = [entityRegistration, drugRegistration, transferDrug, viewLifecycle];