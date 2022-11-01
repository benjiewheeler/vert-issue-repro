import { Blockchain } from "@proton/vert";
import chai, { assert } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

const blockchain = new Blockchain();
const [alice, bob] = blockchain.createAccounts("alice", "bob");
const vertContract = blockchain.createContract("vert", "contract/atomicvert");
const atomicassetsContract = blockchain.createContract("atomicassets", "node_modules/proton-tsc/external/atomicassets/atomicassets");

async function createDummyCollection() {
	// initialize AA contract
	await atomicassetsContract.actions.init().send();
	await atomicassetsContract.actions
		.admincoledit([
			[
				{ name: "name", type: "string" },
				{ name: "img", type: "ipfs" },
				{ name: "description", type: "string" },
				{ name: "url", type: "string" },
			],
		])
		.send();

	// create a dummy collection (and add the contract to the notified accounts list)
	await atomicassetsContract.actions.createcol(["vert", "vertdummycol", true, ["vert"], ["vert"], 0.01, []]).send("vert@active");

	// create a dummy schema
	await atomicassetsContract.actions
		.createschema([
			"vert",
			"vertdummycol",
			"vertschema",
			[
				{ name: "image", type: "string" },
				{ name: "name", type: "string" },
			],
		])
		.send("vert@active");

	// create a dummy template
	await atomicassetsContract.actions
		.createtempl([
			"vert",
			"vertdummycol",
			"vertschema",
			true,
			true,
			100000,
			[
				{ key: "image", value: ["string", "dummy.png"] },
				{ key: "name", value: ["string", "Dummy"] },
			],
		])
		.send("vert@active");

	// mint an asset to alice
	await atomicassetsContract.actions.mintasset(["vert", "vertdummycol", "vertschema", 1, "alice", [], [], []]).send("vert@active");
}

before(async () => {
	// prepare the assets
	await createDummyCollection();
});

describe("Transfer", () => {
    // it should be rejected because of the notification
	it("fail on first asset", async () => {
		await assert.isRejected(
			atomicassetsContract.actions.transfer(["alice", "bob", ["1099511627776"], ""]).send("alice@active"),
			"Transfers are closed"
		);
	});

    // this shouldn't fail (but it does)
	it("asset should be still in alice's account", async () => {
		const aliceAssets = await atomicassetsContract.tables.assets(alice.name.value.value).getTableRows();
		const bobAssets = await atomicassetsContract.tables.assets(bob.name.value.value).getTableRows();

		// check alice's assets
		assert.deepEqual(aliceAssets, [
			{
				asset_id: "1099511627776",
				collection_name: "vertdummycol",
				schema_name: "vertschema",
				template_id: 1,
				ram_payer: "vert",
				backed_tokens: [],
				immutable_serialized_data: [],
				mutable_serialized_data: [],
			},
		]);

		// check bob's assets
		assert.deepEqual(bobAssets, []);
	});
});
