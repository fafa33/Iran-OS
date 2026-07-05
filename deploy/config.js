// SPDX-License-Identifier: MIT
// Deployment configuration loader — reads the address book variables documented
// in docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §1 from environment
// variables. No addresses are hardcoded or invented here.

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Deployment config: required environment variable ${name} is not set. ` +
      `See docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §1 (Address Book).`
    );
  }
  return value;
}

function requiredCourtMembers() {
  const members = [];
  for (let i = 1; i <= 9; i++) {
    members.push(required(`COURT_${i}`));
  }
  return members;
}

function requiredFeeders() {
  const raw = required("FEEDER_ADDRESSES");
  const feeders = raw.split(",").map((a) => a.trim()).filter(Boolean);
  if (feeders.length === 0) {
    throw new Error(
      "Deployment config: FEEDER_ADDRESSES must contain at least one address " +
      "(comma-separated), matching DEPLOYMENT_MANIFEST_PROTOCOL.md §1 FEEDER_1..N."
    );
  }
  return feeders;
}

function loadConfig() {
  const court = requiredCourtMembers();
  return {
    sovereignAddress: required("SOVEREIGN_ADDRESS"),
    court1: court[0],
    courtMembers2to9: court.slice(1),
    oracleInitial: required("ORACLE_INITIAL"),
    swfMultisig: required("SWF_MULTISIG"),
    feederAddresses: requiredFeeders(),
    recognizerAddress: required("RECOGNIZER_ADDRESS"),
    initialReserves: required("INITIAL_RESERVES"),
  };
}

module.exports = { loadConfig };
