// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title   EviChain
 * @author  Muhammad Bilal Mukhtar — BS-DFCS, Lahore Garrison University (2025)
 * @notice  Blockchain-Based Digital Evidence Assurance
 *
 * @dev     All records are append-only and permanently immutable once written.
 *          Evidence files live on IPFS; this contract stores their metadata:
 *            - SHA-256 fingerprint (integrity proof)
 *            - IPFS CID            (decentralised storage address)
 *            - Case reference      (linking evidence to investigations)
 *            - Submitter address   (who anchored the evidence)
 *            - Block timestamp     (when it was anchored)
 *          A tamper-proof chain-of-custody log is maintained for every record.
 *
 *          Tested on Ethereum Sepolia testnet.
 */
contract EviChain {

    // ─── Data Structures ─────────────────────────────────────────────────────

    struct Evidence {
        string  evidenceId;    // Human-readable ID  e.g. "EV-2025-0001"
        string  sha256Hash;    // 64-char lowercase hex SHA-256 of original file
        string  ipfsCid;       // IPFS Content Identifier (v1)
        string  caseId;        // Case reference (e.g. "CASE-LGU-2025-001")
        string  description;   // Free-text description of the evidence
        address submittedBy;   // Investigator's wallet address
        uint256 timestamp;     // Unix timestamp of submission (block.timestamp)
        bool    exists;        // Existence sentinel — prevents double-submit
    }

    struct CustodyEntry {
        address actor;         // Who performed this action
        string  action;        // "UPLOADED" | "ACCESSED" | "VERIFIED" | custom
        uint256 timestamp;     // When the action occurred
        string  notes;         // Free-text audit note
    }

    // ─── Storage ─────────────────────────────────────────────────────────────

    mapping(string => Evidence)        private _evidence;
    mapping(string => CustodyEntry[])  private _custody;
    mapping(string => string[])        private _caseEvidence;  // caseId → evidenceIds
    string[]                           private _allIds;

    // ─── Events ──────────────────────────────────────────────────────────────

    event EvidenceSubmitted(
        string indexed evidenceId,
        string indexed caseId,
        string         sha256Hash,
        string         ipfsCid,
        address        submittedBy,
        uint256        timestamp
    );

    event CustodyEvent(
        string  indexed evidenceId,
        address indexed actor,
        string          action,
        uint256         timestamp
    );

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier mustExist(string memory id) {
        require(_evidence[id].exists, "EviChain: record not found");
        _;
    }

    modifier mustNotExist(string memory id) {
        require(!_evidence[id].exists, "EviChain: record already exists");
        _;
    }

    // ─── Write Functions ─────────────────────────────────────────────────────

    /**
     * @notice Submit a new digital evidence record.
     *
     * @param evidenceId  Unique human-readable ID (generated off-chain).
     * @param sha256Hash  Lowercase hex SHA-256 of the evidence file (64 chars).
     * @param ipfsCid     IPFS CID referencing the pinned file.
     * @param caseId      Case reference the evidence belongs to.
     * @param description Short description of the evidence item.
     *
     * Emits:
     *   EvidenceSubmitted(evidenceId, caseId, sha256Hash, ipfsCid, msg.sender, block.timestamp)
     *   CustodyEvent(evidenceId, msg.sender, "UPLOADED", block.timestamp)
     */
    function submitEvidence(
        string calldata evidenceId,
        string calldata sha256Hash,
        string calldata ipfsCid,
        string calldata caseId,
        string calldata description
    )
        external
        mustNotExist(evidenceId)
    {
        require(bytes(evidenceId).length  >  0,  "EviChain: evidenceId required");
        require(bytes(sha256Hash).length  == 64, "EviChain: SHA-256 must be 64 hex chars");
        require(bytes(ipfsCid).length     >  0,  "EviChain: IPFS CID required");
        require(bytes(caseId).length      >  0,  "EviChain: caseId required");

        _evidence[evidenceId] = Evidence({
            evidenceId:  evidenceId,
            sha256Hash:  sha256Hash,
            ipfsCid:     ipfsCid,
            caseId:      caseId,
            description: description,
            submittedBy: msg.sender,
            timestamp:   block.timestamp,
            exists:      true
        });

        _custody[evidenceId].push(CustodyEntry({
            actor:     msg.sender,
            action:    "UPLOADED",
            timestamp: block.timestamp,
            notes:     "Initial submission to EviChain"
        }));

        _caseEvidence[caseId].push(evidenceId);
        _allIds.push(evidenceId);

        emit EvidenceSubmitted(evidenceId, caseId, sha256Hash, ipfsCid, msg.sender, block.timestamp);
        emit CustodyEvent(evidenceId, msg.sender, "UPLOADED", block.timestamp);
    }

    /**
     * @notice Append a chain-of-custody event to an existing evidence record.
     *
     * @param evidenceId  The evidence record to annotate.
     * @param action      Short label e.g. "ACCESSED", "VERIFIED", "EXPORTED".
     * @param notes       Audit note e.g. "Read by Officer Khan via API".
     *
     * Emits: CustodyEvent(evidenceId, msg.sender, action, block.timestamp)
     */
    function logCustodyEvent(
        string calldata evidenceId,
        string calldata action,
        string calldata notes
    )
        external
        mustExist(evidenceId)
    {
        _custody[evidenceId].push(CustodyEntry({
            actor:     msg.sender,
            action:    action,
            timestamp: block.timestamp,
            notes:     notes
        }));

        emit CustodyEvent(evidenceId, msg.sender, action, block.timestamp);
    }

    // ─── Read Functions ──────────────────────────────────────────────────────

    /// @notice Retrieve a complete evidence record.
    function getEvidence(string calldata evidenceId)
        external view
        mustExist(evidenceId)
        returns (Evidence memory)
    {
        return _evidence[evidenceId];
    }

    /// @notice Return all chain-of-custody entries for an evidence record.
    function getCustodyLog(string calldata evidenceId)
        external view
        mustExist(evidenceId)
        returns (CustodyEntry[] memory)
    {
        return _custody[evidenceId];
    }

    /// @notice Return all evidence IDs associated with a case.
    function getEvidenceByCase(string calldata caseId)
        external view
        returns (string[] memory)
    {
        return _caseEvidence[caseId];
    }

    /**
     * @notice Verify a file hash against the on-chain record.
     *
     * @param evidenceId       The evidence record to check.
     * @param sha256HashToTest The hash computed from the file being verified.
     *
     * @return isValid    true  → hashes match (evidence is intact)
     *                   false → hashes differ (possible tampering)
     * @return ipfsCid    The stored IPFS CID (useful for re-fetching the file).
     * @return timestamp  Unix timestamp of original submission.
     */
    function verifyEvidence(
        string calldata evidenceId,
        string calldata sha256HashToTest
    )
        external view
        returns (bool isValid, string memory ipfsCid, uint256 timestamp)
    {
        if (!_evidence[evidenceId].exists) {
            return (false, "", 0);
        }
        Evidence storage ev = _evidence[evidenceId];
        isValid   = keccak256(bytes(ev.sha256Hash)) == keccak256(bytes(sha256HashToTest));
        ipfsCid   = ev.ipfsCid;
        timestamp = ev.timestamp;
    }

    /// @notice Check whether an evidence ID has been registered.
    function evidenceExists(string calldata evidenceId) external view returns (bool) {
        return _evidence[evidenceId].exists;
    }

    /// @notice Total number of evidence records submitted.
    function getTotalEvidence() external view returns (uint256) {
        return _allIds.length;
    }

    /**
     * @notice Paginated list of all evidence IDs.
     *
     * @param offset  Starting index (0-based).
     * @param limit   Maximum number of IDs to return.
     */
    function getAllEvidenceIds(uint256 offset, uint256 limit)
        external view
        returns (string[] memory result)
    {
        uint256 total = _allIds.length;
        if (offset >= total) return new string[](0);

        uint256 end  = offset + limit > total ? total : offset + limit;
        result = new string[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = _allIds[i];
        }
    }
}
