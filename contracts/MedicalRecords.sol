// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalRecords {
    enum Role {
        None,
        Patient,
        Doctor,
        Government
    }

    struct Record {
        string cid; // IPFS CID
        string description; // Optional file description
        uint timestamp;
        address addedBy; // Doctor address
    }

    struct User {
        Role role;
        bool exists;
    }

    mapping(address => User) public users;
    mapping(address => Record[]) private medicalHistory;
    
    // Patient to doctor access control
    mapping(address => mapping(address => bool)) public accessControl;
    
    // Track all registered users for government statistics
    address[] private allUsers;

    // Events
    event RecordAdded(address indexed patient, address indexed doctor);
    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);

    modifier onlyRole(Role _role) {
        require(users[msg.sender].role == _role, "Unauthorized");
        _;
    }

    constructor() {
        // Initial government registration
        users[msg.sender] = User({role: Role.Government, exists: true});
    }

    // Register users with specific roles
    function register(Role _role) external {
        require(!users[msg.sender].exists, "Already registered");
        require(_role != Role.None && _role != Role.Government, "Invalid role");
        users[msg.sender] = User({role: _role, exists: true});
    }

    // Enhanced register to keep track of all users
    function registerWithTracking(Role _role) external {
        require(!users[msg.sender].exists, "Already registered");
        require(_role != Role.None && _role != Role.Government, "Invalid role");
        users[msg.sender] = User({role: _role, exists: true});
        allUsers.push(msg.sender);
    }

    // Grant access to a doctor
    function grantAccess(address _doctor) external onlyRole(Role.Patient) {
        require(users[_doctor].role == Role.Doctor, "Not a doctor");
        accessControl[msg.sender][_doctor] = true;
        emit AccessGranted(msg.sender, _doctor);
    }

    // Revoke access from a doctor
    function revokeAccess(address _doctor) external onlyRole(Role.Patient) {
        accessControl[msg.sender][_doctor] = false;
        emit AccessRevoked(msg.sender, _doctor);
    }

    // Doctor adds a record to a patient (if they have access)
    function addRecord(address _patient, string calldata _cid, string calldata _description) external onlyRole(Role.Doctor) {
        require(accessControl[_patient][msg.sender], "No access to patient");
        
        medicalHistory[_patient].push(Record({
            cid: _cid,
            description: _description,
            timestamp: block.timestamp,
            addedBy: msg.sender
        }));
        
        emit RecordAdded(_patient, msg.sender);
    }

    // Patient views their own records
    function getMyRecords()
        external
        view
        onlyRole(Role.Patient)
        returns (Record[] memory)
    {
        return medicalHistory[msg.sender];
    }

    // Doctor views records of a patient they have access to
    function getPatientRecords(
        address _patient
    ) external view onlyRole(Role.Doctor) returns (Record[] memory) {
        require(accessControl[_patient][msg.sender], "No access to patient");
        return medicalHistory[_patient];
    }

    // Government fetches anonymous data
    function getAnonymizedData()
        external
        view
        onlyRole(Role.Government)
        returns (uint totalPatients, uint totalRecords)
    {
        // Pseudo-anonymity: counts only
        totalPatients = 0;
        totalRecords = 0;

        for (uint i = 0; i < allUsers.length; i++) {
            address user = allUsers[i];
            if (users[user].role == Role.Patient) {
                totalPatients++;
                totalRecords += medicalHistory[user].length;
            }
        }
        
        return (totalPatients, totalRecords);
    }
}
