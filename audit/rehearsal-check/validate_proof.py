#!/usr/bin/env python3
"""Fail-closed V19 evidence validation. No signing, broadcasting, or file repair."""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
import re
import sys
import urllib.request

FROZEN = "c3750b9458156e962393059f78c92e79802bf622"
RPC = "https://rpc.testnet.chain.robinhood.com"
ADDRESS = re.compile(r"0x[0-9a-fA-F]{40}\Z")
HASH = re.compile(r"0x[0-9a-fA-F]{64}\Z")
TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
CONTRACTS = ("tTROLL", "tUSD", "tGOLD", "tSILVER", "tNVDA", "TrollInHoodGenesisV19",
             "TrollEvolutionEngineV19", "TrollMetadataRouterV19", "TrollBoundVaultFactoryV19",
             "TrollAssetRegistryV19", "TrollRewardRouterV19", "TrollLensV19",
             "TrollAssetSnapshotAnchorV19")


def get(data, path):
    for key in path.split("."):
        if not isinstance(data, dict) or key not in data:
            return None
        data = data[key]
    return data


def valid_address(value):
    return isinstance(value, str) and bool(ADDRESS.fullmatch(value)) and int(value[2:], 16) != 0


def validate(data):
    """Validate structure/consistency only; a claimed PASS is not proof."""
    errors = []
    paths = ["observed.owner_after_transfer", "observed.persistent_vault", "transfer.from", "transfer.to"]
    paths += ["contracts." + name for name in CONTRACTS]
    for path in paths:
        value = get(data, path)
        if not valid_address(value):
            width = len(value) - 2 if isinstance(value, str) and value.startswith("0x") else None
            errors.append({"field": path, "error": "invalid_nonzero_evm_address", "hex_digits": width})
    if type(get(data, "chain_id")) is not int or get(data, "chain_id") != 46630:
        errors.append({"field": "chain_id", "error": "testnet_46630_required"})
    if get(data, "frozen_source_commit") != FROZEN:
        errors.append({"field": "frozen_source_commit", "error": "wrong_frozen_target"})
    tx_hash = get(data, "transfer.transaction_hash")
    if not isinstance(tx_hash, str) or not HASH.fullmatch(tx_hash):
        errors.append({"field": "transfer.transaction_hash", "error": "invalid_transaction_hash"})
    if type(get(data, "transfer.token_id")) is not int or get(data, "transfer.token_id") != 1:
        errors.append({"field": "transfer.token_id", "error": "token_1_required_for_this_record"})
    owner, recipient = get(data, "observed.owner_after_transfer"), get(data, "transfer.to")
    if valid_address(owner) and valid_address(recipient) and owner.lower() != recipient.lower():
        errors.append({"field": "observed.owner_after_transfer", "error": "owner_recipient_mismatch"})
    return errors


def rpc_read(method, params):
    allowed = {"eth_chainId", "eth_getTransactionByHash", "eth_getTransactionReceipt", "eth_getBlockByNumber", "eth_getCode"}
    if method not in allowed:
        raise ValueError("RPC method not allowed: " + method)
    payload = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode()
    request = urllib.request.Request(RPC, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(request, timeout=20) as response:
        if response.geturl().rstrip("/") != RPC:
            raise ValueError("Unexpected RPC redirect")
        raw = response.read(2_000_001)
        if len(raw) > 2_000_000:
            raise ValueError("RPC response exceeds size limit")
    result = json.loads(raw)
    if result.get("id") != 1 or result.get("jsonrpc") != "2.0" or "error" in result or "result" not in result:
        raise ValueError("Invalid/error JSON-RPC response")
    return result["result"]


def check_transfer(data, read=rpc_read):
    """Recover a candidate only from a consistent receipt; never repair the record."""
    tx_hash = get(data, "transfer.transaction_hash")
    if not isinstance(tx_hash, str) or not HASH.fullmatch(tx_hash):
        raise ValueError("Invalid transaction hash")
    if int(read("eth_chainId", []), 16) != 46630:
        raise ValueError("Wrong network; expected 46630")
    tx = read("eth_getTransactionByHash", [tx_hash])
    receipt = read("eth_getTransactionReceipt", [tx_hash])
    if not isinstance(tx, dict) or not isinstance(receipt, dict):
        raise ValueError("Transaction or receipt unavailable")
    if tx.get("hash", "").lower() != tx_hash.lower() or receipt.get("transactionHash", "").lower() != tx_hash.lower():
        raise ValueError("Transaction hash mismatch")
    if "chainId" in tx and int(tx["chainId"], 16) != 46630:
        raise ValueError("Transaction chain mismatch")
    to = tx.get("to")
    if not valid_address(to) or str(receipt.get("to", "")).lower() != to.lower():
        raise ValueError("Transaction destination mismatch")
    if int(receipt.get("status", "0x0"), 16) != 1:
        raise ValueError("Transfer reverted")
    height = receipt.get("blockNumber")
    if not isinstance(height, str) or not re.fullmatch(r"0x[0-9a-fA-F]+", height):
        raise ValueError("Invalid block number")
    block_hash = receipt.get("blockHash", "")
    if not HASH.fullmatch(block_hash) or tx.get("blockHash") != block_hash or tx.get("blockNumber") != height:
        raise ValueError("Inconsistent mined block")
    block = read("eth_getBlockByNumber", [height, False])
    if not isinstance(block, dict) or block.get("hash") != block_hash or block.get("number") != height:
        raise ValueError("Receipt block is not canonical at lookup")
    sender, recipient = get(data, "transfer.from"), get(data, "transfer.to")
    token = get(data, "transfer.token_id")
    if not valid_address(sender) or not valid_address(recipient) or type(token) is not int or token != 1:
        raise ValueError("Invalid expected transfer fields")
    expected = [TRANSFER, "0x" + sender[2:].lower().zfill(64), "0x" + recipient[2:].lower().zfill(64), "0x" + format(token, "064x")]
    matches = [log for log in receipt.get("logs", []) if isinstance(log, dict)
               and str(log.get("address", "")).lower() == to.lower()
               and log.get("removed") is not True
               and [str(x).lower() for x in log.get("topics", [])] == expected]
    if len(matches) != 1:
        raise ValueError("Expected unique ERC721 Transfer event not found")
    code = read("eth_getCode", [to, height])
    if not isinstance(code, str) or not re.fullmatch(r"0x(?:[0-9a-fA-F]{2})+", code):
        raise ValueError("No valid runtime bytecode at transfer block")
    recorded = get(data, "contracts.TrollInHoodGenesisV19")
    return {"status": "TRANSFER_RECEIPT_OBSERVED", "chain_id": 46630, "transaction_hash": tx_hash,
            "block_number": int(height, 16), "block_hash": block_hash, "genesis_from_receipt": to,
            "recorded_genesis_matches": valid_address(recorded) and recorded.lower() == to.lower(),
            "runtime_sha256": hashlib.sha256(bytes.fromhex(code[2:])).hexdigest(),
            "limits": "One public RPC observation; no frozen-build bytecode match, current owner, admin transfer, or finality verification."}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("proof", type=Path)
    parser.add_argument("--rpc-read", action="store_true")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    raw = args.proof.read_bytes()
    data = json.loads(raw)
    errors = validate(data)
    live = {"status": "NOT_RUN"}
    if args.rpc_read:
        try:
            live = check_transfer(data)
            if not live["recorded_genesis_matches"]:
                errors.append({"field": "contracts.TrollInHoodGenesisV19", "error": "receipt_address_mismatch"})
        except Exception as exc:
            live = {"status": "UNVERIFIED", "error": type(exc).__name__ + ": " + str(exc)}
            errors.append({"field": "live_transfer", "error": "live_verification_incomplete"})
    result = {"checked_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
              "scope": "evidence_only_not_security_approval", "source_sha256": hashlib.sha256(raw).hexdigest(),
              "historical_claim": get(data, "status"),
              "status": "BLOCKED" if errors else "FORMAT_CHECKS_PASS",
              "errors": errors, "live_transfer": live,
              "limitations": ["No EIP55 checksum validation", "No contract changes", "No public transaction broadcast",
                              "No deployed-build/configuration verification", "No mainnet gate closed"]}
    output = json.dumps(result, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output)
    print(output, end="")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
