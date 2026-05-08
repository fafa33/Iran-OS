export type EmploymentStatus = 'employed' | 'unemployed' | 'retired' | 'disabled';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'bill' | 'stake' | 'welfare';
  amount: number;
  label: string;
  date: string;
  txHash: string;
}

export interface Bill {
  id: string;
  type: 'electricity' | 'water' | 'gas' | 'internet';
  label: string;
  amount: number;
  dueDate: string;
  paid: boolean;
}

export interface StakePosition {
  locked: number;
  apy: number;
  earned: number;
  unlockDate: string;
}

export interface CitizenData {
  fullName: string;
  nationalId: string;
  province: string;
  employmentStatus: EmploymentStatus;
  balancePAH: number;
  balanceSare: number;
  healthCredit: number;
  drugQuota: number;
  unemploymentMonthsLeft: number;
  walletAddress: string;
  biometricVerified: boolean;
  stake: StakePosition;
  transactions: Transaction[];
  bills: Bill[];
}

export const mockCitizen: CitizenData = {
  fullName: 'علی رضایی',
  nationalId: '0012345678',
  province: 'تهران',
  employmentStatus: 'employed',
  balancePAH: 1250,
  balanceSare: 47,
  healthCredit: 500,
  drugQuota: 100,
  unemploymentMonthsLeft: 0,
  walletAddress: '0x7f3A...c4B2',
  biometricVerified: true,
  stake: {
    locked: 500,
    apy: 15,
    earned: 12.5,
    unlockDate: '۱۵ تیر ۱۴۰۵',
  },
  transactions: [
    {
      id: '1',
      type: 'receive',
      amount: 1000,
      label: 'حقوق — فروردین ۱۴۰۵',
      date: '۱ فروردین ۱۴۰۵',
      txHash: '0xabc...001',
    },
    {
      id: '2',
      type: 'bill',
      amount: 45,
      label: 'قبض برق — اسفند',
      date: '۲۸ اسفند ۱۴۰۴',
      txHash: '0xabc...002',
    },
    {
      id: '3',
      type: 'welfare',
      amount: 500,
      label: 'اعتبار سلامت سالانه',
      date: '۱ فروردین ۱۴۰۵',
      txHash: '0xabc...003',
    },
    {
      id: '4',
      type: 'stake',
      amount: 500,
      label: 'قفل در صندوق L2',
      date: '۱۵ اسفند ۱۴۰۴',
      txHash: '0xabc...004',
    },
    {
      id: '5',
      type: 'send',
      amount: 200,
      label: 'انتقال به مریم رضایی',
      date: '۱۰ اسفند ۱۴۰۴',
      txHash: '0xabc...005',
    },
  ],
  bills: [
    {
      id: 'b1',
      type: 'electricity',
      label: 'برق',
      amount: 45,
      dueDate: '۱۵ فروردین ۱۴۰۵',
      paid: false,
    },
    {
      id: 'b2',
      type: 'water',
      label: 'آب',
      amount: 28,
      dueDate: '۲۰ فروردین ۱۴۰۵',
      paid: false,
    },
    {
      id: 'b3',
      type: 'gas',
      label: 'گاز',
      amount: 62,
      dueDate: '۱۰ فروردین ۱۴۰۵',
      paid: true,
    },
    {
      id: 'b4',
      type: 'internet',
      label: 'اینترنت',
      amount: 35,
      dueDate: '۲۵ فروردین ۱۴۰۵',
      paid: false,
    },
  ],
};

export const kernelStatus = {
  systemLocked: false,
  redLines: [
    { code: 'TR-01', label: 'پادشاهی مشروطه سکولار', status: 'ok' as const },
    { code: 'TR-02', label: 'سکولاریسم ساختاری',     status: 'ok' as const },
    { code: 'TR-03', label: 'یکپارچگی سرزمینی',       status: 'ok' as const },
    { code: 'TR-04', label: 'حقوق بنیادین ملت',       status: 'ok' as const },
    { code: 'TR-05', label: 'استقلال صندوق ثروت',    status: 'ok' as const },
    { code: 'TR-06', label: 'سقف نقدینگی ۹۰۰B',      status: 'ok' as const },
  ],
  signaturesCollected: 0,
  signaturesRequired: 7,
  lastBlock: 18_420_001,
  totalPAHMinted: 12_400_000_000,
  liquidityCap: 900_000_000_000,
};
