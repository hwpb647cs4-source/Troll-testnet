const assert = require('node:assert/strict');
const { ethers } = require('hardhat');

async function deploy(name, ...args) {
  const c = await (await ethers.getContractFactory(name)).deploy(...args);
  await c.waitForDeployment();
  return c;
}
async function rejects(promise, reason) {
  await assert.rejects(async () => {
    const tx = await promise;
    if (tx.wait) await tx.wait();
  }, new RegExp(reason));
}
async function fixture() {
  const [owner, buyer, stranger] = await ethers.getSigners();
  const nft = await deploy('TrollInHoodGenesisV51', owner.address, owner.address, 500);
  const factory = await deploy('TrollBoundVaultFactoryV51', await nft.getAddress());
  await nft.setVaultFactory(await factory.getAddress());
  await nft.setMintController(owner.address, true);
  await nft.mintFromController(owner.address, 2);
  const registry = await deploy('TrollAssetRegistryV51', owner.address);
  const router = await deploy('TrollRewardRouterV51', owner.address, await factory.getAddress(), await registry.getAddress());
  const anchor = await deploy('TrollAssetSnapshotAnchorV51', owner.address, await nft.getAddress());
  const token = await deploy('MockAssetV51', 'Test USD', 'USD', 6);
  const chain = (await ethers.provider.getNetwork()).chainId;
  return { owner, buyer, stranger, nft, factory, registry, router, anchor, token, chain };
}

describe('V51 security finding regressions', function () {
  it('retains passive ERC20/ERC721/ERC1155 custody through transfer of the Genesis NFT', async () => {
    const {owner, buyer, nft, factory, token} = await fixture();
    await factory.createVault(1);
    const vaultAddress = await factory.vaultOf(1);
    const vault = await ethers.getContractAt('TrollBoundVaultV51', vaultAddress);
    const extra = await deploy('CustodyTestNFT');
    const multi = await deploy('CustodyTest1155');
    await token.faucet(vaultAddress, 100);
    await extra.mint(owner.address, 99);
    await extra['safeTransferFrom(address,address,uint256)'](owner.address, vaultAddress, 99);
    await multi.mint(vaultAddress, 7, 2);
    await multi.mint(owner.address, 8, 3);
    await multi.safeBatchTransferFrom(owner.address, vaultAddress, [8], [3], '0x');
    await nft.transferFrom(owner.address, buyer.address, 1);
    assert.equal(await token.balanceOf(vaultAddress), 100n);
    assert.equal(await extra.ownerOf(99), vaultAddress);
    assert.equal(await multi.balanceOf(vaultAddress, 7), 2n);
    assert.equal(await multi.balanceOf(vaultAddress, 8), 3n);
    await rejects(token.connect(buyer).transferFrom(vaultAddress, buyer.address, 1), 'ERC20InsufficientAllowance');
    const funcs = vault.interface.fragments.filter(x=>x.type==='function').map(x=>x.name).sort();
    assert.deepEqual(funcs, ['factory','nftCollection','onERC1155BatchReceived','onERC1155Received','onERC721Received','supportsInterface','tokenId'].sort());
  });

  it('receiver rejects safe Genesis deposits into separately deployed passive vaults', async () => {
    const {owner,nft,factory} = await fixture();
    const separate = await deploy('TrollBoundVaultV51',await nft.getAddress(),1,await factory.getAddress());
    await rejects(nft['safeTransferFrom(address,address,uint256)'](owner.address,await separate.getAddress(),1),'genesis deposit forbidden');
    assert.equal(await nft.ownerOf(1),owner.address);
  });

  it('rejects own predicted vault before deployment, including mint and unsafe transfer', async () => {
    const {owner, nft, factory} = await fixture();
    const predicted = await factory.predictVault(1);
    await rejects(nft.transferFrom(owner.address, predicted, 1), 'passive vault destination');
    await rejects(nft['safeTransferFrom(address,address,uint256)'](owner.address, predicted, 1), 'passive vault destination');
    await rejects(nft.mintFromController(await factory.predictVault(3), 1), 'passive vault destination');
    assert.equal(await nft.ownerOf(1), owner.address);
    assert.equal(await nft.totalSupply(), 2n);
    assert.equal(await nft.nextTokenId(), 3n);
  });

  it('blocks collection transfers to every deployed canonical vault but preserves normal A-to-B transfer', async () => {
    const {owner, buyer, nft, factory} = await fixture();
    await factory.createVault(1);
    await factory.createVault(2);
    const otherVault = await factory.vaultOf(2);
    assert.equal(await factory.isVault(otherVault), true);
    await rejects(nft.transferFrom(owner.address, otherVault, 1), 'passive vault destination');
    await rejects(nft['safeTransferFrom(address,address,uint256)'](owner.address, otherVault, 1), 'passive vault destination');
    await nft.transferFrom(owner.address, buyer.address, 1);
    assert.equal(await nft.ownerOf(1), buyer.address);
    assert.equal(await factory.vaultOf(2), otherVault);
  });

  it('requires the correct one-time factory before minting', async () => {
    const {owner, stranger, nft, factory} = await fixture();
    await rejects(nft.setVaultFactory(await factory.getAddress()), 'factory frozen');
    const fresh = await deploy('TrollInHoodGenesisV51', owner.address, owner.address, 500);
    await fresh.setMintController(owner.address, true);
    await rejects(fresh.mintFromController(owner.address, 1), 'factory not configured');
    await rejects(fresh.setVaultFactory(await factory.getAddress()), 'wrong collection');
    await rejects(fresh.connect(stranger).setVaultFactory(await factory.getAddress()), 'OwnableUnauthorizedAccount');
  });

  it('rejects missing NFTs for vault creation, entitlement writes, deposits and snapshots', async () => {
    const {factory, router, anchor, registry, token, chain} = await fixture();
    await registry.registerAsset(chain, await token.getAddress(), 6, 4, 1, true, 'STOCK');
    const key = await registry.keyFor(chain, await token.getAddress());
    const block = await ethers.provider.getBlockNumber();
    for (const id of [0, 3, 5001]) {
      await rejects(factory.createVault(id), 'ERC721NonexistentToken');
      await rejects(router.recordRegulatedEntitlement(id, key, 10, ethers.id('proof')), 'ERC721NonexistentToken');
      await rejects(router.depositDirect(id, key, 10), 'ERC721NonexistentToken');
      await rejects(anchor.publish(id, ethers.id('proof'), block), 'ERC721NonexistentToken');
      assert.equal(await router.entitlementAmount(id, key), 0n);
    }
    await anchor.publish(1, ethers.id('valid'), block);
    assert.equal((await anchor.latest(1)).manifestHash, ethers.id('valid'));
  });

  it('rejects foreign-chain regulated writes and retains same-chain evidence across ownership transfer', async () => {
    const {owner, buyer, nft, registry, router, token, chain} = await fixture();
    const address = await token.getAddress();
    await registry.registerAsset(chain + 1n, address, 6, 4, 1, true, 'FOREIGN');
    await registry.registerAsset(chain, address, 6, 4, 1, true, 'LOCAL');
    const wrong = await registry.keyFor(chain + 1n, address);
    const local = await registry.keyFor(chain, address);
    await rejects(router.recordRegulatedEntitlement(1, wrong, 10, ethers.id('wrong')), 'wrong chain');
    assert.equal(await router.entitlementAmount(1, wrong), 0n);
    await router.recordRegulatedEntitlement(1, local, 10, ethers.id('one'));
    await nft.transferFrom(owner.address, buyer.address, 1);
    await router.recordRegulatedEntitlement(1, local, 20, ethers.id('two'));
    assert.equal(await router.entitlementAmount(1, local), 30n);
    assert.equal(await router.entitlementManifestHash(1, local), ethers.id('two'));
  });

  it('prevents identity rewrites while allowing authorized, evented disable/enable', async () => {
    const {stranger, registry, router, token, chain} = await fixture();
    const address = await token.getAddress();
    await registry.registerAsset(chain, address, 6, 4, 1, true, 'STOCK');
    const key = await registry.keyFor(chain, address);
    const before = await registry.asset(key);
    for (const [decimals, cls, lane, symbol] of [[18,4,1,'STOCK'],[6,1,1,'STOCK'],[6,4,0,'STOCK'],[6,4,1,'CHANGED']]) {
      await rejects(registry.registerAsset(chain, address, decimals, cls, lane, true, symbol), 'asset identity frozen');
    }
    await rejects(registry.connect(stranger).setAssetEnabled(key, false), 'OwnableUnauthorizedAccount');
    await rejects(registry.setAssetEnabled(ethers.ZeroHash, false), 'unknown asset');
    const receipt = await (await registry.setAssetEnabled(key, false)).wait();
    assert(receipt.logs.some(l => { try { return registry.interface.parseLog(l)?.name === 'AssetEnabled'; } catch { return false; } }));
    await rejects(router.recordRegulatedEntitlement(1, key, 1, ethers.id('disabled')), 'asset disabled');
    await registry.setAssetEnabled(key, true);
    assert.deepEqual(Array.from(await registry.asset(key)), Array.from(before));
  });

  it('rolls back an entire batch containing an attempted identity overwrite', async () => {
    const {registry, token, chain, stranger} = await fixture();
    const address = await token.getAddress();
    await registry.registerAsset(chain, address, 6, 1, 0, true, 'USD');
    await rejects(registry.registerAssets([
      [chain, stranger.address, 18, 5, 0, true, 'NEW'],
      [chain, address, 18, 1, 0, true, 'OVERWRITE']
    ]), 'asset identity frozen');
    assert.equal((await registry.asset(await registry.keyFor(chain, stranger.address))).token, ethers.ZeroAddress);
  });
});
