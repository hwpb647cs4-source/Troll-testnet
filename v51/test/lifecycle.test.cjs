const assert = require("assert");
const { ethers } = require("hardhat");

const PROOF = [
  "0x16cc16068311df73a29f26ad57d131874a4c223eccc4fddc8e298d567f3eb135",
  "0x6d700807fe5169f2fa6a53449d0c5887db17d5192a84260aae6a7937bbd5f87d",
  "0x04d70c457d284f1c6469376a395a4a470aa2281e665ab4fdfdfcfc754b2a9c14",
  "0x5ce57088c6e70b6b5b776e655b88f5a001b2c6e6d809253cec8a565ea06c7aa4",
  "0xec99e8153a32d8104542ffe6043c25685c45d1ef45587dc484dd40468a650394",
  "0xf2fc372a26ec40365e83345fd95aee1bafa739cfb4a607b2e25118a6d4261dbe",
  "0x1278965eb71ae8e9f46ac01bfc181474882506b76ed05edf551d7d5ef5b404db",
  "0xf4915fd4e57205e68b015ebd56f2f0f55e59018ef9a1e32b1a2a76d2e5912d2d",
  "0xec2541fcf0a552a75e77673ce0e53244c2cfcb8a5d6021006523df3fb48f0f82",
  "0x40ebd048a3c6cb7d92297f93471bfbe5572263b2fbdf4199225a461b889758c5",
  "0x0a911de1c9dd3ae2894c6b0fc78fb28824bb5cd744f12194e50265e08f5abf35",
  "0x339303b0efed56ea2a34c0cd7fe7860c66525f329a94fe01d17d7ff7f516196e",
  "0xaf7241106b7c3008bfe447e02f1888b12c04d7b8283d7dd3cb02d7881b1224b1"
];

const DEAD = "0x000000000000000000000000000000000000dEaD";
const GENESIS_SHA = "0x7658b0b924dfa9578a7172798a94ac8f799993ff9f9045fed13022a360adcdbe";
const FAMILY_ROOT = "0x6f1c3a173b47ed7551c72dacbe1a5b69ef2e08dce33c1d8e78eaa627bf76d1a3";

async function deploy(name, ...args) {
  const F = await ethers.getContractFactory(name);
  const c = await F.deploy(...args);
  await c.waitForDeployment();
  return c;
}

async function expectRevert(p) {
  let ok = false;
  try {
    const tx = await p;
    if (tx && tx.wait) await tx.wait();
  } catch (_) {
    ok = true;
  }
  assert.equal(ok, true, "expected revert");
}

describe("TROLL NFT 2.0 V51 Slither remediation", function () {
  this.timeout(240000);

  it("rejects native ETH sent directly to the passive vault", async function () {
    const [walletA] = await ethers.getSigners();
    const nft = await deploy("TrollInHoodGenesisV51", walletA.address, walletA.address, 500);
    const factory = await deploy("TrollBoundVaultFactoryV51", await nft.getAddress());
    await (await nft.setVaultFactory(await factory.getAddress())).wait();
    await (await nft.setMintController(walletA.address, true)).wait();
    await (await nft.mintFromController(walletA.address, 1)).wait();
    await (await factory.createVault(1)).wait();
    const vault = await factory.vaultOf(1);

    await expectRevert(walletA.sendTransaction({ to: vault, value: 1n }));
    assert.equal(await ethers.provider.getBalance(vault), 0n);
  });

  it("blocks safeMint callback reentrancy and reserves state before callbacks", async function () {
    const [walletA, dummyEvolution, dummyMetadata] = await ethers.getSigners();
    const nft = await deploy("TrollInHoodGenesisV51", walletA.address, walletA.address, 500);
    const factory = await deploy("TrollBoundVaultFactoryV51", await nft.getAddress());
    await (await nft.setVaultFactory(await factory.getAddress())).wait();
    const receiver = await deploy("ReentrantMintReceiverV51", await nft.getAddress());

    await (
      await nft.configureCore(
        await receiver.getAddress(),
        dummyEvolution.address,
        dummyMetadata.address,
        true
      )
    ).wait();

    await (await receiver.attackMint()).wait();

    assert.equal(await receiver.attempted(), true);
    assert.equal(await receiver.reentrySucceeded(), false);
    assert.equal(await nft.totalSupply(), 1n);
    assert.equal(await nft.nextTokenId(), 2n);
    assert.equal(
      (await nft.ownerOf(1)).toLowerCase(),
      (await receiver.getAddress()).toLowerCase()
    );
    assert.ok((await nft.mintTimestamp(1)) > 0n);
    assert.ok((await nft.holderSince(1)) > 0n);
  });

  it("preserves the proven lifecycle after Slither remediation", async function () {
    const [walletA, walletB, stranger, feeSink] = await ethers.getSigners();
    const chainId = Number((await ethers.provider.getNetwork()).chainId);

    const troll = await deploy("MockAssetV51", "Test TROLL", "tTROLL", 18);
    const stable = await deploy("MockAssetV51", "Test USD", "tUSD", 6);
    const gold = await deploy("MockAssetV51", "Test Gold", "tGOLD", 18);
    const silver = await deploy("MockAssetV51", "Test Silver", "tSILVER", 18);
    const stock = await deploy("MockAssetV51", "Test NVIDIA", "tNVDA", 18);
    const feeAsset = await deploy("FeeOnTransferAssetV51", "Fee Asset", "FEE", 1000, feeSink.address);

    const nft = await deploy("TrollInHoodGenesisV51", walletA.address, walletA.address, 500);
    const evolution = await deploy("TrollEvolutionEngineV51", await troll.getAddress(), await nft.getAddress(), DEAD);
    const factory = await deploy("TrollBoundVaultFactoryV51", await nft.getAddress());
    await (await nft.setVaultFactory(await factory.getAddress())).wait();
    const metadata = await deploy("TrollMetadataRouterV51", "ipfs://troll-v13/", await evolution.getAddress());
    const registry = await deploy("TrollAssetRegistryV51", walletA.address);
    const router = await deploy("TrollRewardRouterV51", walletA.address, await factory.getAddress(), await registry.getAddress());
    const lens = await deploy("TrollLensV51", await nft.getAddress(), await evolution.getAddress(), await factory.getAddress());
    const snapshots = await deploy("TrollAssetSnapshotAnchorV51", walletA.address, await nft.getAddress());

    // Access-control negative tests.
    await expectRevert(nft.connect(stranger).setMintController(stranger.address, false));
    await expectRevert(registry.connect(stranger).registerAsset(chainId, await stable.getAddress(), 6, 1, 0, true, "BAD"));
    await expectRevert(router.connect(stranger).recordRegulatedEntitlement(1, ethers.ZeroHash, 1, ethers.id("x")));

    await (await nft.configureCore(walletA.address, await evolution.getAddress(), await metadata.getAddress(), true)).wait();

    // Frozen configuration cannot be changed.
    await expectRevert(nft.setMintController(walletA.address, false));
    await expectRevert(nft.setEvolutionEngine(await evolution.getAddress(), false));
    await expectRevert(nft.setMetadataRouter(await metadata.getAddress(), false));

    assert.equal(await nft.maxSupply(), 5000n);
    assert.equal((await nft.genesisManifestSHA256()).toLowerCase(), GENESIS_SHA);
    assert.equal((await nft.familyMerkleRoot()).toLowerCase(), FAMILY_ROOT);

    // Non-controller cannot mint.
    await expectRevert(nft.connect(stranger).mintFromController(stranger.address, 1));

    // Over-cap mint rejects before loop.
    await expectRevert(nft.mintFromController(walletA.address, 5001));

    await (await nft.mintFromController(walletA.address, 1)).wait();

    // Invalid proof and repeated reveal are blocked.
    await expectRevert(nft.revealFamily(1, 4, PROOF));
    await (await nft.revealFamily(1, 5, PROOF)).wait();
    await expectRevert(nft.revealFamily(1, 5, PROOF));

    const predicted = await factory.predictVault(1);
    await (await factory.createVault(1)).wait();
    const vault = await factory.vaultOf(1);
    assert.equal(vault.toLowerCase(), predicted.toLowerCase());
    await expectRevert(factory.createVault(1));

    await (await troll.faucet(walletA.address, ethers.parseEther("175000"))).wait();
    await (await troll.approve(await evolution.getAddress(), ethers.MaxUint256)).wait();
    await (await evolution.evolve(1, ethers.parseEther("175000"))).wait();

    assert.equal(Number(await evolution.stateOf(1)), 4);
    assert.equal(await evolution.rewardWeightBps(1), 20000n);

    const configs = [
      [stable, 6, 1, 0, "tUSD"],
      [gold, 18, 2, 0, "tGOLD"],
      [silver, 18, 3, 0, "tSILVER"],
      [stock, 18, 4, 1, "tNVDA"],
      [feeAsset, 18, 5, 0, "FEE"]
    ];

    const keys = {};
    for (const [token, decimals, assetClass, lane, symbol] of configs) {
      await (await registry.registerAsset(
        chainId,
        await token.getAddress(),
        decimals,
        assetClass,
        lane,
        true,
        symbol
      )).wait();
      keys[symbol] = await registry.keyFor(chainId, await token.getAddress());
    }

    // Wrong-chain asset is impossible to route directly.
    const wrongChainToken = await deploy("MockAssetV51", "Wrong Chain", "WRONG", 18);
    await (await registry.registerAsset(chainId + 1, await wrongChainToken.getAddress(), 18, 5, 0, true, "WRONG")).wait();
    const wrongKey = await registry.keyFor(chainId + 1, await wrongChainToken.getAddress());
    await (await wrongChainToken.faucet(walletA.address, ethers.parseEther("1"))).wait();
    await (await wrongChainToken.approve(await router.getAddress(), ethers.MaxUint256)).wait();
    await expectRevert(router.depositDirect(1, wrongKey, ethers.parseEther("1")));

    const usdAmount = ethers.parseUnits("1000", 6);
    const goldAmount = ethers.parseEther("0.10");
    const silverAmount = ethers.parseEther("2.50");

    for (const [token, amount, key] of [
      [stable, usdAmount, keys.tUSD],
      [gold, goldAmount, keys.tGOLD],
      [silver, silverAmount, keys.tSILVER]
    ]) {
      await (await token.faucet(walletA.address, amount)).wait();
      await (await token.approve(await router.getAddress(), amount)).wait();
      await (await router.depositDirect(1, key, amount)).wait();
    }

    // Fee-on-transfer accounting uses actual vault credit, not requested amount.
    const feeRequest = ethers.parseEther("100");
    await (await feeAsset.faucet(walletA.address, feeRequest)).wait();
    await (await feeAsset.approve(await router.getAddress(), feeRequest)).wait();
    await (await router.depositDirect(1, keys.FEE, feeRequest)).wait();
    assert.equal(await feeAsset.balanceOf(vault), ethers.parseEther("90"));
    assert.equal(await feeAsset.balanceOf(feeSink.address), ethers.parseEther("10"));

    // Regulated lane cannot be directly deposited.
    const stockAmount = ethers.parseEther("5");
    await (await stock.faucet(walletA.address, stockAmount)).wait();
    await (await stock.approve(await router.getAddress(), stockAmount)).wait();
    await expectRevert(router.depositDirect(1, keys.tNVDA, stockAmount));

    const entitlementHash = ethers.id("TROLL-V51-NVDA-ENTITLEMENT-1");
    await (await router.recordRegulatedEntitlement(1, keys.tNVDA, stockAmount, entitlementHash)).wait();

    // Snapshot cannot cite future chain state.
    const nowBlock = await ethers.provider.getBlockNumber();
    await expectRevert(snapshots.publish(1, ethers.id("future"), nowBlock + 100));
    const snapshotHash = ethers.id("TROLL-V51-ASSET-SNAPSHOT-1");
    await (await snapshots.publish(1, snapshotHash, nowBlock)).wait();

    const before = await lens.passport(1);
    const balancesBefore = {
      usd: await stable.balanceOf(vault),
      gold: await gold.balanceOf(vault),
      silver: await silver.balanceOf(vault),
      fee: await feeAsset.balanceOf(vault),
      entitlement: await router.entitlementAmount(1, keys.tNVDA)
    };

    assert.equal(await nft.tokenURI(1), "ipfs://troll-v13/1/4.json");

    await (await nft.transferFrom(walletA.address, walletB.address, 1)).wait();

    const after = await lens.passport(1);
    assert.equal(after.owner.toLowerCase(), walletB.address.toLowerCase());
    assert.equal(after.family, 5n);
    assert.equal(after.trollBurned, before.trollBurned);
    assert.equal(after.evolutionState, before.evolutionState);
    assert.equal(after.rewardWeightBps, before.rewardWeightBps);
    assert.equal(after.boundVault.toLowerCase(), before.boundVault.toLowerCase());

    assert.equal(await stable.balanceOf(vault), balancesBefore.usd);
    assert.equal(await gold.balanceOf(vault), balancesBefore.gold);
    assert.equal(await silver.balanceOf(vault), balancesBefore.silver);
    assert.equal(await feeAsset.balanceOf(vault), balancesBefore.fee);
    assert.equal(await router.entitlementAmount(1, keys.tNVDA), balancesBefore.entitlement);
    assert.equal(await router.entitlementManifestHash(1, keys.tNVDA), entitlementHash);

    const latest = await snapshots.latest(1);
    assert.equal(latest.manifestHash, snapshotHash);

    const [minted, totalBurn] = await lens.collectionStats();
    assert.equal(minted, 1n);
    assert.equal(totalBurn, ethers.parseEther("175000"));
  });
});
