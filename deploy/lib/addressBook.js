// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
// Shared deployed-address persistence for the deploy/ scripts. Each script
// reads the addresses produced by earlier steps and writes its own output
// here, so scripts can be run standalone (one at a time, per the manifest's
// operator checklist) or in sequence via deploy/index.js.

const fs = require("fs");
const path = require("path");

const DEPLOYMENTS_DIR = path.join(__dirname, "..", "deployments");

function filePathFor(networkName) {
  return path.join(DEPLOYMENTS_DIR, `${networkName}.json`);
}

function loadAddresses(networkName) {
  const file = filePathFor(networkName);
  if (!fs.existsSync(file)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveAddresses(networkName, addresses) {
  if (!fs.existsSync(DEPLOYMENTS_DIR)) {
    fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true });
  }
  fs.writeFileSync(
    filePathFor(networkName),
    JSON.stringify(addresses, null, 2) + "\n"
  );
}

function requireAddress(addresses, key, producingScript) {
  const value = addresses[key];
  if (!value) {
    throw new Error(
      `Address book: ${key} not found. Run ${producingScript} first.`
    );
  }
  return value;
}

module.exports = { loadAddresses, saveAddresses, requireAddress };
