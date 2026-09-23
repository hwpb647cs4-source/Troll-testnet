import copy
import unittest
from validate_proof import CONTRACTS, FROZEN, TRANSFER, check_transfer, validate

A, B, C = ("0x" + c * 40 for c in ("1", "2", "3"))
H, BH = "0x" + "4" * 64, "0x" + "5" * 64


def fixture():
    return {"chain_id": 46630, "frozen_source_commit": FROZEN, "status": "PASS",
            "contracts": {name: C for name in CONTRACTS},
            "observed": {"owner_after_transfer": B, "persistent_vault": A},
            "transfer": {"token_id": 1, "from": A, "to": B, "transaction_hash": H}}


def reader(overrides=None):
    answers = {"eth_chainId": hex(46630),
               "eth_getTransactionByHash": {"hash": H, "to": C, "blockHash": BH, "blockNumber": "0x10", "chainId": hex(46630)},
               "eth_getTransactionReceipt": {"transactionHash": H, "to": C, "status": "0x1", "blockHash": BH, "blockNumber": "0x10",
                    "logs": [{"address": C, "topics": [TRANSFER, "0x" + A[2:].zfill(64), "0x" + B[2:].zfill(64), "0x" + format(1, "064x")]}]},
               "eth_getBlockByNumber": {"number": "0x10", "hash": BH}, "eth_getCode": "0x60006000"}
    answers.update(overrides or {})
    return lambda method, params: copy.deepcopy(answers[method])


class EvidenceTests(unittest.TestCase):
    def test_valid_fixture(self):
        self.assertEqual(validate(fixture()), [])

    def test_reject_41_digits_without_repair(self):
        data = fixture()
        data["contracts"]["TrollInHoodGenesisV19"] += "a"
        before = copy.deepcopy(data)
        self.assertEqual(validate(data)[0]["hex_digits"], 41)
        self.assertEqual(data, before)

    def test_missing_contract(self):
        data = fixture(); del data["contracts"]["tUSD"]
        self.assertTrue(validate(data))

    def test_zero_address(self):
        data = fixture(); data["transfer"]["from"] = "0x" + "0" * 40
        self.assertTrue(validate(data))

    def test_wrong_chain(self):
        data = fixture(); data["chain_id"] = 4663
        self.assertTrue(validate(data))

    def test_wrong_frozen_target(self):
        data = fixture(); data["frozen_source_commit"] = "main"
        self.assertTrue(validate(data))

    def test_owner_mismatch(self):
        data = fixture(); data["observed"]["owner_after_transfer"] = A
        self.assertTrue(validate(data))

    def test_invalid_hash(self):
        data = fixture(); data["transfer"]["transaction_hash"] = H[:-1]
        self.assertTrue(validate(data))

    def test_live_receipt_matching(self):
        self.assertTrue(check_transfer(fixture(), reader())["recorded_genesis_matches"])

    def test_live_receipt_does_not_fix_record(self):
        data = fixture(); data["contracts"]["TrollInHoodGenesisV19"] = C + "a"
        before = copy.deepcopy(data)
        self.assertFalse(check_transfer(data, reader())["recorded_genesis_matches"])
        self.assertEqual(data, before)

    def test_live_wrong_chain(self):
        with self.assertRaises(ValueError):
            check_transfer(fixture(), reader({"eth_chainId": hex(4663)}))

    def test_missing_receipt(self):
        with self.assertRaises(ValueError):
            check_transfer(fixture(), reader({"eth_getTransactionReceipt": None}))

    def test_no_code(self):
        with self.assertRaises(ValueError):
            check_transfer(fixture(), reader({"eth_getCode": "0x"}))

    def test_reorg(self):
        with self.assertRaises(ValueError):
            check_transfer(fixture(), reader({"eth_getBlockByNumber": {"hash": H, "number": "0x10"}}))

    def test_wrong_transfer_event(self):
        receipt = reader()("eth_getTransactionReceipt", [])
        receipt["logs"][0]["topics"][2] = "0x" + C[2:].zfill(64)
        with self.assertRaises(ValueError):
            check_transfer(fixture(), reader({"eth_getTransactionReceipt": receipt}))

    def test_claimed_pass_is_not_accepted(self):
        self.assertTrue(validate({"status": "PASS"}))


if __name__ == "__main__":
    unittest.main()
