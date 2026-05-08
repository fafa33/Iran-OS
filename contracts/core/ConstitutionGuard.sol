// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ConstitutionGuard
 * @dev نگهبان قانون اساسی — تطبیق‌دهنده تمام مصوبات با اصول منشور
 *
 * هر پیشنهاد قانون باید صراحتاً اعلام کند با کدام اصول منشور در تضاد نیست.
 * دادگاه (از طریق Kernel) مسئول تایید یا رد انطباق است.
 * نسخه ۱.۱ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract ConstitutionGuard {

    address public kernel;

    // اصول پنج‌گانه منشور رفاه و عدالت
    uint8 public constant PRINCIPLE_SECULAR     = 1; // سکولاریسم ساختاری (فرگرد ۱)
    uint8 public constant PRINCIPLE_RIGHTS      = 2; // حقوق بنیادین ملت (فرگرد ۲)
    uint8 public constant PRINCIPLE_TERRITORIAL = 3; // یکپارچگی سرزمینی (فرگرد ۸)
    uint8 public constant PRINCIPLE_MONETARY    = 4; // استقلال صندوق ثروت ملی (فرگرد ۷)
    uint8 public constant PRINCIPLE_JUDICIAL    = 5; // استقلال دادگستری (فرگرد ۶)

    uint8 public constant TOTAL_PRINCIPLES = 5;

    struct LawProposal {
        bytes32 hash;
        address proposer;
        uint256 proposedAt;
        uint8   principlesMask;   // بیت‌ماسک اصولی که قانون با آن‌ها مرتبط است
        bool    isCompliant;
        string  rejectionReason;
        bool    executed;
    }

    mapping(bytes32 => LawProposal) public proposals;
    mapping(bytes32 => bool)        public approvedLaws;

    // اصولی که هرگز نمی‌توانند نادیده گرفته شوند
    // بیت ۱ = سکولاریسم، بیت ۲ = حقوق، بیت ۳ = ارضی، بیت ۴ = پولی، بیت ۵ = قضایی
    uint8 public constant IMMUTABLE_PRINCIPLES_MASK = 0x07; // اصول ۱، ۲، ۳ همیشه اجباری

    event LawProposed(bytes32 indexed hash, address indexed proposer, uint8 principlesMask, uint256 timestamp);
    event LawApproved(bytes32 indexed hash, uint8 principlesMask, uint256 timestamp);
    event LawRejected(bytes32 indexed hash, string reason, uint256 timestamp);
    event PrincipleViolationDetected(bytes32 indexed hash, uint8 violatedPrinciple, uint256 timestamp);

    modifier onlyKernel() {
        require(msg.sender == kernel, "ConstitutionGuard: caller is not the Kernel");
        _;
    }

    constructor(address _kernel) {
        require(_kernel != address(0), "ConstitutionGuard: invalid kernel");
        kernel = _kernel;
    }

    /**
     * @notice پیشنهاد قانون جدید همراه با اعلام اصول منشور مرتبط
     * @param lawHash هش قانون پیشنهادی
     * @param principlesMask بیت‌ماسک اصولی که این قانون با آن‌ها در ارتباط است
     *        بیت ۰ (مقدار ۱) = سکولاریسم
     *        بیت ۱ (مقدار ۲) = حقوق بنیادین
     *        بیت ۲ (مقدار ۴) = یکپارچگی ارضی
     *        بیت ۳ (مقدار ۸) = استقلال پولی
     *        بیت ۴ (مقدار ۱۶) = استقلال قضایی
     */
    function proposeLaw(bytes32 lawHash, uint8 principlesMask) external returns (bool) {
        require(lawHash != bytes32(0),           "ConstitutionGuard: invalid hash");
        require(proposals[lawHash].proposedAt == 0, "ConstitutionGuard: already proposed");
        require(principlesMask > 0,              "ConstitutionGuard: must declare affected principles");
        require(principlesMask <= 0x1F,          "ConstitutionGuard: invalid principles mask");

        proposals[lawHash] = LawProposal({
            hash:            lawHash,
            proposer:        msg.sender,
            proposedAt:      block.timestamp,
            principlesMask:  principlesMask,
            isCompliant:     false,
            rejectionReason: "",
            executed:        false
        });

        emit LawProposed(lawHash, msg.sender, principlesMask, block.timestamp);
        return true;
    }

    /**
     * @notice تایید انطباق قانون با منشور توسط Kernel (پس از بررسی دادگاه)
     * @param lawHash هش قانون
     */
    function approveLaw(bytes32 lawHash) external onlyKernel {
        LawProposal storage proposal = proposals[lawHash];
        require(proposal.proposedAt > 0, "ConstitutionGuard: proposal not found");
        require(!proposal.executed,      "ConstitutionGuard: already executed");

        proposal.isCompliant = true;
        proposal.executed    = true;
        approvedLaws[lawHash] = true;

        emit LawApproved(lawHash, proposal.principlesMask, block.timestamp);
    }

    /**
     * @notice رد قانون با ذکر اصل نقض‌شده
     * @param lawHash هش قانون
     * @param reason دلیل رد (اصل نقض‌شده)
     * @param violatedPrinciple کد اصل نقض‌شده (۱ تا ۵، یا صفر اگر نامشخص)
     */
    function rejectLaw(bytes32 lawHash, string calldata reason, uint8 violatedPrinciple) external onlyKernel {
        LawProposal storage proposal = proposals[lawHash];
        require(proposal.proposedAt > 0, "ConstitutionGuard: proposal not found");
        require(!proposal.executed,      "ConstitutionGuard: already executed");
        require(violatedPrinciple <= TOTAL_PRINCIPLES, "ConstitutionGuard: invalid principle code");

        proposal.isCompliant     = false;
        proposal.rejectionReason = reason;
        proposal.executed        = true;
        approvedLaws[lawHash]    = false;

        if (violatedPrinciple > 0) {
            emit PrincipleViolationDetected(lawHash, violatedPrinciple, block.timestamp);
        }

        emit LawRejected(lawHash, reason, block.timestamp);
    }

    /**
     * @notice بررسی اینکه آیا یک قانون با اصول غیرقابل تغییر منشور در تضاد است
     * @dev این تابع قبل از پیشنهاد رسمی قابل فراخوانی است
     * @param principlesMask بیت‌ماسک اصولی که قانون با آن‌ها تداخل دارد
     */
    function checkImmutableConflict(uint8 principlesMask) external pure returns (bool hasConflict) {
        return (principlesMask & IMMUTABLE_PRINCIPLES_MASK) != 0;
    }

    /**
     * @notice بررسی انطباق یک قانون با یک اصل خاص
     * @param lawHash هش قانون
     * @param principle کد اصل (۱ تا ۵)
     */
    function isCompliantWithPrinciple(bytes32 lawHash, uint8 principle) external view returns (bool) {
        require(principle >= 1 && principle <= TOTAL_PRINCIPLES, "ConstitutionGuard: invalid principle");
        LawProposal storage proposal = proposals[lawHash];
        if (!proposal.isCompliant) return false;
        uint8 bit = uint8(1 << (principle - 1));
        return (proposal.principlesMask & bit) == 0;
    }

    function isLawApproved(bytes32 lawHash) external view returns (bool) {
        return approvedLaws[lawHash];
    }

    function getProposal(bytes32 lawHash) external view returns (LawProposal memory) {
        require(proposals[lawHash].proposedAt > 0, "ConstitutionGuard: not found");
        return proposals[lawHash];
    }
}
