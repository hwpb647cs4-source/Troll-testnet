import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planEpoch, rewardWeight } from './plan.mjs';

const burn = n => (BigInt(n) * 10n ** 18n).toString();
function input() {
  return {epoch_id:'test-1',chain_id:46630,collection:'0x1111111111111111111111111111111111111111',asset_contract:'0x2222222222222222222222222222222222222222',decimals:6,lane:'DIRECT_VAULT',snapshot_block:100,snapshot_hash:'0x'+'ab'.repeat(32),funding_reference:'TEST_ONLY: simulated treasury at block 100',budget_raw:'300000000',treasury_balance_raw:'400000000',already_committed_raw:'100000000',minted_supply:2,family_filter:null,tokens:[{token_id:1,burned_raw:'0',family:5,family_revealed:true},{token_id:2,burned_raw:burn(175000),family:5,family_revealed:true}]};
}
test('allocates a capped budget in the exact 1x:2x ratio and never claims execution', () => {
  const p=planEpoch(input());
  assert.deepEqual(p.allocations.map(x=>x.amount_raw),['100000000','200000000']);
  assert.equal(p.allocated_raw,'300000000');
  assert.equal(p.unallocated_raw,'0');
  assert.equal(p.execution_status,'NOT_EXECUTED');
  assert.equal(p.settlement_status,'NO_RECEIPTS');
});
test('derives every threshold exactly, including just below each transition', () => {
  let previous=10000;
  for (const [n,w] of [[10000,11000],[30000,12500],[75000,15000],[175000,20000],[400000,30000],[1000000,50000]]) {
    assert.equal(rewardWeight((BigInt(burn(n))-1n).toString()),previous);
    assert.equal(rewardWeight(burn(n)),w); previous=w;
  }
});
test('preserves integer conservation and deterministic hashes across snapshot ordering', () => {
  for (const amount of ['0','1','2','7','999999999999999999999999999']) {
    const i=input(); i.budget_raw=amount;i.treasury_balance_raw=amount;i.already_committed_raw='0';
    const a=planEpoch(i); const b=planEpoch({...i,tokens:[...i.tokens].reverse()});
    assert.deepEqual(a,b);
    assert.equal(BigInt(a.allocated_raw)+BigInt(a.unallocated_raw),BigInt(amount));
    assert(BigInt(a.unallocated_raw)<2n);
  }
});
test('rejects unfunded budgets, unsafe numbers and incomplete/duplicate snapshots', () => {
  assert.throws(()=>planEpoch({...input(),budget_raw:'300000001'}),/funding/);
  assert.throws(()=>planEpoch({...input(),already_committed_raw:'500000000'}),/funding/);
  assert.throws(()=>planEpoch({...input(),budget_raw:300000000}),/raw-unit string/);
  assert.throws(()=>planEpoch({...input(),tokens:input().tokens.slice(0,1)}),/complete minted/);
  assert.throws(()=>planEpoch({...input(),tokens:[input().tokens[0],input().tokens[0]]}),/duplicate/);
  assert.throws(()=>rewardWeight('-1'),/raw-unit/);
  assert.throws(()=>rewardWeight((1n<<256n).toString()),/uint256/);
});
test('family eligibility uses a complete revealed snapshot, with a separate regulated lane', () => {
  const i=input();i.tokens[1].family=4;i.family_filter=5;
  assert.deepEqual(planEpoch(i).allocations.map(x=>x.token_id),[1]);
  i.tokens[1].family_revealed=false;
  assert.throws(()=>planEpoch(i),/complete family reveals/);
  assert.throws(()=>planEpoch({...input(),lane:'REGULATED_ENTITLEMENT'}),/separate approved/);
  assert.throws(()=>planEpoch({...input(),family_filter:10}),/no eligible/);
});
