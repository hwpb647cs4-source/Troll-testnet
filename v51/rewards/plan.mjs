import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { getAddress, ZeroAddress } from 'ethers';

const MAX = (1n << 256n) - 1n;
const UNIT = 10n ** 18n;
function raw(value, field) {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)$/.test(value)) throw new Error(`${field}: exact raw-unit string required`);
  const n = BigInt(value);
  if (n > MAX) throw new Error(`${field}: exceeds uint256`);
  return n;
}
function integer(value, min, max, field) {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error(`${field}: invalid integer`);
  return value;
}
function address(value) {
  const a = getAddress(value);
  if (a === ZeroAddress) throw new Error('zero address');
  return a;
}
export function rewardWeight(burnedRaw) {
  const b = raw(burnedRaw, 'burned_raw');
  for (const [threshold, weight] of [[1000000n,50000],[400000n,30000],[175000n,20000],[75000n,15000],[30000n,12500],[10000n,11000]]) {
    if (b >= threshold * UNIT) return weight;
  }
  return 10000;
}

// Offline proposal only. Input provenance and treasury availability require independent verification.
export function planEpoch(input) {
  if (!input || typeof input.epoch_id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(input.epoch_id)) throw new Error('invalid epoch_id');
  const chain = integer(input.chain_id, 1, Number.MAX_SAFE_INTEGER, 'chain_id');
  const block = integer(input.snapshot_block, 1, Number.MAX_SAFE_INTEGER, 'snapshot_block');
  if (!/^0x[0-9a-fA-F]{64}$/.test(input.snapshot_hash) || /^0x0{64}$/.test(input.snapshot_hash)) throw new Error('invalid snapshot_hash');
  const collection = address(input.collection);
  const asset = address(input.asset_contract);
  const decimals = integer(input.decimals, 0, 36, 'decimals');
  if (input.lane !== 'DIRECT_VAULT') throw new Error('regulated settlement requires a separate approved process');
  if (typeof input.funding_reference !== 'string' || !input.funding_reference.trim()) throw new Error('funding_reference required');
  const budget = raw(input.budget_raw, 'budget_raw');
  const balance = raw(input.treasury_balance_raw, 'treasury_balance_raw');
  const committed = raw(input.already_committed_raw, 'already_committed_raw');
  if (committed > balance || budget > balance - committed) throw new Error('insufficient uncommitted funding');
  const minted = integer(input.minted_supply, 1, 5000, 'minted_supply');
  if (!Array.isArray(input.tokens) || input.tokens.length !== minted) throw new Error('complete minted snapshot required');
  const family = input.family_filter === null ? null : integer(input.family_filter, 0, 10, 'family_filter');
  const tokens = input.tokens.map(t => ({
    token_id: integer(t.token_id, 1, minted, 'token_id'),
    burned_raw: raw(t.burned_raw, 'burned_raw').toString(),
    family: integer(t.family, 0, 10, 'family'),
    family_revealed: t.family_revealed
  })).sort((a,b) => a.token_id - b.token_id);
  tokens.forEach((t,i) => {
    if (t.token_id !== i + 1) throw new Error('missing or duplicate token_id');
    if (typeof t.family_revealed !== 'boolean') throw new Error('family_revealed must be boolean');
    if (family !== null && !t.family_revealed) throw new Error('family-filtered epoch requires complete family reveals');
  });
  const eligible = tokens.filter(t => family === null || t.family === family);
  if (!eligible.length) throw new Error('no eligible NFTs');
  const total = eligible.reduce((sum,t) => sum + BigInt(rewardWeight(t.burned_raw)), 0n);
  const allocations = eligible.map(t => ({token_id:t.token_id, weight_bps:rewardWeight(t.burned_raw), amount_raw:(budget * BigInt(rewardWeight(t.burned_raw)) / total).toString()}));
  const allocated = allocations.reduce((sum,t) => sum + BigInt(t.amount_raw), 0n);
  const plan = {
    schema_version:'51.0.0', status:'PROPOSAL_REQUIRES_FUNDING_AND_SNAPSHOT_VERIFICATION',
    epoch_id:input.epoch_id, chain_id:chain, collection, asset_contract:asset, decimals,
    lane:'DIRECT_VAULT', snapshot_block:block, snapshot_hash:input.snapshot_hash.toLowerCase(),
    funding_reference:input.funding_reference.trim(), treasury_balance_raw:balance.toString(), already_committed_raw:committed.toString(),
    budget_raw:budget.toString(), family_filter:family, minted_supply:minted, snapshot_tokens:tokens,
    total_weight_bps:total.toString(), allocations, allocated_raw:allocated.toString(),
    unallocated_raw:(budget-allocated).toString(),
    execution_status:'NOT_EXECUTED', settlement_status:'NO_RECEIPTS'
  };
  return {...plan, manifest_sha256:createHash('sha256').update(JSON.stringify(plan)).digest('hex')};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length !== 3) throw new Error('Usage: node rewards/plan.mjs input.json');
  process.stdout.write(JSON.stringify(planEpoch(JSON.parse(readFileSync(process.argv[2], 'utf8'))), null, 2) + '\n');
}
