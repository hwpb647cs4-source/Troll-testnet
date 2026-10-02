const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Behavior Engine v0.1 / Troll adapter", function () {
  let engine;
  const tokenId = 42n;
  const rule = ethers.keccak256(ethers.toUtf8Bytes("troll-behavior-v0.1"));

  beforeEach(async () => {
    engine = await (await ethers.getContractFactory("VerifiableBehaviorEngineV01")).deploy();
  });

  function commitment(nonce, salt) {
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256","uint32","bytes32","bytes32"], [tokenId, nonce, rule, salt]
      )
    );
  }

  it("runs PRECOMMIT -> ACT -> RESOLVE -> LOCK and preserves burn-driven strength", async () => {
    const salt = ethers.keccak256(ethers.toUtf8Bytes("secret-a"));
    await engine.precommit(tokenId, rule, commitment(1, salt));
    const evidence = ethers.keccak256(ethers.toUtf8Bytes("verified-burn-tx-a"));
    await engine.recordAction(tokenId, evidence, ethers.parseEther("175000"));
    await engine.resolve(tokenId, salt, ethers.keccak256(ethers.toUtf8Bytes("entropy-a")));
    let j = await engine.journey(tokenId);
    expect(j.evolutionBps).to.equal(6000);
    expect(j.phase).to.equal(3);
    await engine.lock(tokenId);
    j = await engine.journey(tokenId);
    expect(j.phase).to.equal(4);
  });

  it("rejects evidence replay across NFTs", async () => {
    const salt = ethers.keccak256(ethers.toUtf8Bytes("s"));
    await engine.precommit(tokenId, rule, commitment(1, salt));
    const evidence = ethers.keccak256(ethers.toUtf8Bytes("same-evidence"));
    await engine.recordAction(tokenId, evidence, 1);
    const salt2 = ethers.keccak256(ethers.toUtf8Bytes("s2"));
    const c2 = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256","uint32","bytes32","bytes32"], [43n,1,rule,salt2]
    ));
    await engine.precommit(43, rule, c2);
    await expect(engine.recordAction(43, evidence, 1)).to.be.revertedWithCustomError(engine, "Replay");
  });

  it("rejects bad reveal and burn regression", async () => {
    const salt = ethers.keccak256(ethers.toUtf8Bytes("good"));
    await engine.precommit(tokenId, rule, commitment(1, salt));
    await engine.recordAction(tokenId, ethers.keccak256(ethers.toUtf8Bytes("e1")), 100);
    await expect(engine.resolve(tokenId, ethers.keccak256(ethers.toUtf8Bytes("bad")), ethers.ZeroHash))
      .to.be.revertedWithCustomError(engine, "BadReveal");
    await engine.resolve(tokenId, salt, ethers.ZeroHash);
    await engine.lock(tokenId);

    const salt2 = ethers.keccak256(ethers.toUtf8Bytes("next"));
    await engine.precommit(tokenId, rule, commitment(2, salt2));
    await expect(engine.recordAction(tokenId, ethers.keccak256(ethers.toUtf8Bytes("e2")), 99))
      .to.be.revertedWithCustomError(engine, "BurnRegression");
  });

  it("entropy can change branch but never burn-derived strength", async () => {
    async function run(id, entropyText) {
      const s = ethers.keccak256(ethers.toUtf8Bytes("shared-salt-" + id));
      const c = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256","uint32","bytes32","bytes32"], [id,1,rule,s]
      ));
      await engine.precommit(id, rule, c);
      await engine.recordAction(id, ethers.keccak256(ethers.toUtf8Bytes("e-" + id)), ethers.parseEther("500000"));
      await engine.resolve(id, s, ethers.keccak256(ethers.toUtf8Bytes(entropyText)));
      return engine.journey(id);
    }
    const a = await run(100n, "A");
    const b = await run(101n, "B");
    expect(a.evolutionBps).to.equal(8000);
    expect(b.evolutionBps).to.equal(8000);
  });
});
