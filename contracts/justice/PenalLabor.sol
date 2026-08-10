// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PenalLabor
 * @dev مدل کار جبرانی — جایگزین اعدام
 * - هزینه صفر: تمام هزینه‌ها از درآمد کار محکوم تأمین می‌شود
 * - اولویت: ۱)نگهداری ۲)غرامت قربانی ۳)مالیات ملی ۴)حداقل بقا
 * - کار از نوع سخت است — نه کار اداری
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract PenalLabor is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE      = keccak256("KERNEL_ROLE");
    bytes32 public constant COURT_ROLE       = keccak256("COURT_ROLE");
    bytes32 public constant EMPLOYER_ROLE    = keccak256("EMPLOYER_ROLE");
    bytes32 public constant VICTIM_FUND_ROLE = keccak256("VICTIM_FUND_ROLE");

    uint256 public constant MAINTENANCE_RATIO  = 200;
    uint256 public constant VICTIM_RATIO       = 400;
    uint256 public constant NATIONAL_TAX_RATIO = 300;
    uint256 public constant SURVIVAL_RATIO     = 100;

    struct ConvictRecord {
        address convict;
        uint256 caseId;
        address assignedProject;
        uint256 sentenceMonths;
        uint256 monthsServed;
        uint256 totalEarned;
        uint256 maintenancePaid;
        uint256 victimCompensation;
        uint256 nationalTaxPaid;
        uint256 survivalAllowance;
        bool    isActive;
        bool    completedSentence;
    }

    struct NationalProject {
        string  name;
        string  projectType;
        address employer;
        uint256 hourlyRate;
        uint256 difficultyScore;
        bool    isActive;
        uint256 totalConvicts;
    }

    mapping(address => ConvictRecord)   public convicts;
    mapping(uint256 => NationalProject) public projects;
    uint256 public projectCount;
    address public victimFundAddress;

    event ConvictAssigned(address indexed convict, uint256 caseId, uint256 projectId);
    event MonthlyIncomeDistributed(address indexed convict, uint256 totalEarned, uint256 maintenancePaid, uint256 victimCompensation, uint256 nationalTax, uint256 survivalAllowance);
    event SentenceCompleted(address indexed convict, uint256 totalCompensationPaid);
    event ProjectRegistered(uint256 indexed projectId, string name, uint256 difficultyScore);

    // _admin receives DEFAULT_ADMIN_ROLE (real signer — e.g. the Sovereign —
    // so post-deploy role wiring is reachable on mainnet); _kernel continues
    // to receive only KERNEL_ROLE. Mirrors SovereignWealthFund.sol's
    // constructor(sovereign, kernel) split — see CHANGELOG "P0 deployment-path
    // parity" for the originating finding on Treasury/VictimFund/etc.
    constructor(address _admin, address _kernel, address _victimFund) {
        require(_admin != address(0), "PenalLabor: invalid admin");
        require(_kernel != address(0), "PenalLabor: invalid kernel");
        require(_victimFund != address(0), "PenalLabor: invalid victim fund");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(KERNEL_ROLE, _kernel);
        victimFundAddress = _victimFund;
    }

    function registerProject(string calldata name, string calldata projectType, address employer, uint256 hourlyRate, uint256 difficultyScore) external onlyRole(KERNEL_ROLE) nonReentrant returns (uint256 projectId) {
        require(employer != address(0), "PenalLabor: invalid employer");
        require(hourlyRate > 0, "PenalLabor: zero rate");
        require(difficultyScore >= 5 && difficultyScore <= 10, "PenalLabor: difficulty 5-10 only");
        projectCount++; projectId = projectCount;
        projects[projectId] = NationalProject({ name: name, projectType: projectType, employer: employer, hourlyRate: hourlyRate, difficultyScore: difficultyScore, isActive: true, totalConvicts: 0 });
        _grantRole(EMPLOYER_ROLE, employer);
        emit ProjectRegistered(projectId, name, difficultyScore);
        return projectId;
    }

    function assignConvict(address convict, uint256 caseId, uint256 projectId, uint256 sentenceMonths) external onlyRole(COURT_ROLE) nonReentrant {
        require(convict != address(0), "PenalLabor: invalid convict");
        require(!convicts[convict].isActive, "PenalLabor: already assigned");
        require(projects[projectId].isActive, "PenalLabor: project not active");
        require(sentenceMonths > 0, "PenalLabor: zero sentence");
        convicts[convict] = ConvictRecord({ convict: convict, caseId: caseId, assignedProject: projects[projectId].employer, sentenceMonths: sentenceMonths, monthsServed: 0, totalEarned: 0, maintenancePaid: 0, victimCompensation: 0, nationalTaxPaid: 0, survivalAllowance: 0, isActive: true, completedSentence: false });
        projects[projectId].totalConvicts++;
        emit ConvictAssigned(convict, caseId, projectId);
    }

    function distributeMonthlyIncome(address convict, uint256 grossIncome) external onlyRole(EMPLOYER_ROLE) nonReentrant {
        ConvictRecord storage cr = convicts[convict];
        require(cr.isActive, "PenalLabor: not active");
        require(grossIncome > 0, "PenalLabor: zero income");
        require(cr.assignedProject == msg.sender, "PenalLabor: not assigned employer");
        uint256 maintenancePaid   = (grossIncome * MAINTENANCE_RATIO)  / 1000;
        uint256 victimComp        = (grossIncome * VICTIM_RATIO)        / 1000;
        uint256 nationalTax       = (grossIncome * NATIONAL_TAX_RATIO)  / 1000;
        uint256 survivalAllowance = (grossIncome * SURVIVAL_RATIO)      / 1000;
        cr.totalEarned        += grossIncome;
        cr.maintenancePaid    += maintenancePaid;
        cr.victimCompensation += victimComp;
        cr.nationalTaxPaid    += nationalTax;
        cr.survivalAllowance  += survivalAllowance;
        cr.monthsServed++;
        emit MonthlyIncomeDistributed(convict, grossIncome, maintenancePaid, victimComp, nationalTax, survivalAllowance);
        if (cr.monthsServed >= cr.sentenceMonths) {
            cr.isActive = false;
            cr.completedSentence = true;
            emit SentenceCompleted(convict, cr.victimCompensation);
        }
    }

    function getConvictRecord(address convict) external view returns (ConvictRecord memory) { return convicts[convict]; }
    function getProject(uint256 projectId) external view returns (NationalProject memory) { return projects[projectId]; }
    function calculateDistribution(uint256 grossIncome) external pure returns (uint256 maintenance, uint256 victimComp, uint256 nationalTax, uint256 survival) {
        return ((grossIncome * MAINTENANCE_RATIO) / 1000, (grossIncome * VICTIM_RATIO) / 1000, (grossIncome * NATIONAL_TAX_RATIO) / 1000, (grossIncome * SURVIVAL_RATIO) / 1000);
    }
}