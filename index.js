'use strict';


const secp256k1 = require('secp256k1-wasm');
const blake2b = require('blake2b-wasm');

var spectrecore = module.exports;

spectrecore.secp256k1 = secp256k1;

// module information
spectrecore.version = 'v' + require('./package.json').version;
spectrecore.versionGuard = function(version) {
	if (version !== undefined) {
		var message = 'More than one instance of spectrecore-lib found. ' +
			'Please make sure to require spectrecore-lib and check that submodules do' +
			' not also include their own spectrecore-lib dependency.';
		throw new Error(message);
	}
};
spectrecore.versionGuard(global._spectrecoreLibVersion);
global._spectrecoreLibVersion = spectrecore.version;


const wasmModulesLoadStatus = new Map();
spectrecore.wasmModulesLoadStatus = wasmModulesLoadStatus;
wasmModulesLoadStatus.set("blake2b", false);
wasmModulesLoadStatus.set("secp256k1", false);

const setWasmLoadStatus = (mod, loaded) => {
	//console.log("setWasmLoadStatus:", mod, loaded)
	wasmModulesLoadStatus.set(mod, loaded);
	let allLoaded = true;
	wasmModulesLoadStatus.forEach((loaded, mod) => {
		//console.log("wasmModulesLoadStatus:", mod, loaded)
		if (!loaded)
			allLoaded = false;
	})

	if (allLoaded)
		spectrecore.ready();
}


blake2b.ready(() => {
	setWasmLoadStatus("blake2b", true);
})

secp256k1.onRuntimeInitialized = () => {
	//console.log("onRuntimeInitialized")
	setTimeout(() => {
		setWasmLoadStatus("secp256k1", true);
	}, 1);
}

secp256k1.onAbort = (error) => {
	console.log("secp256k1:onAbort:", error)
}
const deferred = ()=>{
	let methods = {};
	let promise = new Promise((resolve, reject)=>{
		methods = {resolve, reject};
	})
	Object.assign(promise, methods);
	return promise;
}
const readySignal = deferred();

spectrecore.ready = ()=>{
	readySignal.resolve(true);
}
spectrecore.initRuntime = ()=>{
	return readySignal;
}


// crypto
spectrecore.crypto = {};
spectrecore.crypto.BN = require('./lib/crypto/bn');
spectrecore.crypto.ECDSA = require('./lib/crypto/ecdsa');
spectrecore.crypto.Schnorr = require('./lib/crypto/schnorr');
spectrecore.crypto.Hash = require('./lib/crypto/hash');
spectrecore.crypto.Random = require('./lib/crypto/random');
spectrecore.crypto.Point = require('./lib/crypto/point');
spectrecore.crypto.Signature = require('./lib/crypto/signature');

// encoding
spectrecore.encoding = {};
spectrecore.encoding.Base58 = require('./lib/encoding/base58');
spectrecore.encoding.Base58Check = require('./lib/encoding/base58check');
spectrecore.encoding.BufferReader = require('./lib/encoding/bufferreader');
spectrecore.encoding.BufferWriter = require('./lib/encoding/bufferwriter');
spectrecore.encoding.Varint = require('./lib/encoding/varint');

// utilities
spectrecore.util = {};
spectrecore.util.buffer = require('./lib/util/buffer');
spectrecore.util.js = require('./lib/util/js');
spectrecore.util.preconditions = require('./lib/util/preconditions');
spectrecore.util.base32 = require('./lib/util/base32');
spectrecore.util.convertBits = require('./lib/util/convertBits');
spectrecore.setDebugLevel = (level)=>{
	spectrecore.util.js.debugLevel = level;
}

// errors thrown by the library
spectrecore.errors = require('./lib/errors');

// main bitcoin library
spectrecore.Address = require('./lib/address');
spectrecore.Block = require('./lib/block');
spectrecore.MerkleBlock = require('./lib/block/merkleblock');
spectrecore.BlockHeader = require('./lib/block/blockheader');
spectrecore.HDPrivateKey = require('./lib/hdprivatekey.js');
spectrecore.HDPublicKey = require('./lib/hdpublickey.js');
spectrecore.Networks = require('./lib/networks');
spectrecore.Opcode = require('./lib/opcode');
spectrecore.PrivateKey = require('./lib/privatekey');
spectrecore.PublicKey = require('./lib/publickey');
spectrecore.Script = require('./lib/script');
spectrecore.Transaction = require('./lib/transaction');
spectrecore.URI = require('./lib/uri');
spectrecore.Unit = require('./lib/unit');

// dependencies, subject to change
spectrecore.deps = {};
spectrecore.deps.bnjs = require('bn.js');
spectrecore.deps.bs58 = require('bs58');
spectrecore.deps.Buffer = Buffer;
spectrecore.deps.elliptic = require('elliptic');
spectrecore.deps._ = require('lodash');

// Internal usage, exposed for testing/advanced tweaking
spectrecore.Transaction.sighash = require('./lib/transaction/sighash');
