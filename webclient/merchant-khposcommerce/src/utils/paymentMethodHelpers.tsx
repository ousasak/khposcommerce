import {
  Banknote,
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  Wallet,
  Landmark,
  CircleDollarSign,
  type LucideIcon,
} from 'lucide-react'

export interface PaymentProviderMeta {
  englishName: string
  shortDesc: string
  icon: LucideIcon
  monogram: string
  colorTheme: {
    bg: string
    text: string
    border: string
    badgeBg: string
    ringColor: string
    gradient: string
  }
  supportedBrands?: string[]
}

/**
 * Returns comprehensive visual styling, English names, descriptions,
 * and Lucide icons for authentic Cambodian and global payment methods.
 */
export const getPaymentMethodMeta = (method: any): PaymentProviderMeta => {
  const code = (method?.code || '').toLowerCase()
  const name = (method?.name || '').toLowerCase()
  const type = (method?.type || '').toLowerCase()

  // 1. Bakong KHQR / National QR (KHQR / Bakong: Blue)
  if (code.includes('bakong') || name.includes('bakong') || (type === 'qris' && !code.includes('aba'))) {
    return {
      englishName: 'Bakong KHQR',
      shortDesc: 'Scan & pay via Bakong National QR standard',
      icon: QrCode,
      monogram: 'KHQR',
      colorTheme: {
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200/60 dark:border-blue-800/60',
        badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        ringColor: 'focus-visible:ring-blue-500',
        gradient: 'from-blue-500 to-indigo-600',
      },
    }
  }

  // 2. ABA Pay / ABA KHQR (KHQR / Bakong: Blue)
  if (code.includes('aba') || name.includes('aba')) {
    return {
      englishName: 'ABA Pay / Mobile',
      shortDesc: 'Instant payments via ABA Mobile or Standee QR',
      icon: Smartphone,
      monogram: 'ABA',
      colorTheme: {
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200/60 dark:border-blue-800/60',
        badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        ringColor: 'focus-visible:ring-blue-500',
        gradient: 'from-blue-600 to-sky-600',
      },
    }
  }

  // 3. ACLEDA Mobile (Bank Transfer: Purple)
  if (code.includes('acleda') || name.includes('acleda')) {
    return {
      englishName: 'ACLEDA Mobile Pay',
      shortDesc: 'Fast payment via ACLEDA Mobile or KHQR',
      icon: Building2,
      monogram: 'ACL',
      colorTheme: {
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200/60 dark:border-purple-800/60',
        badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        ringColor: 'focus-visible:ring-purple-500',
        gradient: 'from-purple-600 to-indigo-600',
      },
    }
  }

  // 4. Wing Bank / WingPay
  if (code.includes('wing') || name.includes('wing')) {
    return {
      englishName: 'Wing Bank',
      shortDesc: 'Quick payments via Wing App and agent network',
      icon: Wallet,
      monogram: 'WING',
      colorTheme: {
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200/60 dark:border-purple-800/60',
        badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        ringColor: 'focus-visible:ring-purple-500',
        gradient: 'from-purple-600 to-indigo-600',
      },
    }
  }

  // 5. Credit / Debit Card (Credit/Debit Card: Orange)
  if (code.includes('card') || code.includes('visa') || code.includes('master') || type.includes('card')) {
    return {
      englishName: 'Credit / Debit Card',
      shortDesc: 'Accept international cards (Visa, Mastercard, JCB)',
      icon: CreditCard,
      monogram: 'CARD',
      colorTheme: {
        bg: 'bg-orange-50 dark:bg-orange-950/40',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200/60 dark:border-orange-800/60',
        badgeBg: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        ringColor: 'focus-visible:ring-orange-500',
        gradient: 'from-orange-500 to-amber-600',
      },
      supportedBrands: ['Visa', 'Mastercard', 'UnionPay'],
    }
  }

  // 6. Cash / Cash on Delivery / Counter (Cash: Green)
  if (code.includes('cash') || code.includes('cod') || type.includes('cash')) {
    const isCod = code.includes('cod') || name.includes('delivery')
    return {
      englishName: isCod ? 'Cash on Delivery (COD)' : 'Cash at Counter',
      shortDesc: isCod
        ? 'Cash payment collected upon product delivery'
        : 'Direct in-person cash settlement at checkout counter',
      icon: Banknote,
      monogram: 'CASH',
      colorTheme: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200/60 dark:border-emerald-800/60',
        badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        ringColor: 'focus-visible:ring-emerald-500',
        gradient: 'from-emerald-500 to-teal-600',
      },
    }
  }

  // 7. Bank Transfer / Canadia / Sathapana (Bank Transfer: Purple)
  if (code.includes('bank') || code.includes('transfer') || code.includes('canadia') || code.includes('sathapana') || type.includes('bank')) {
    return {
      englishName: 'Direct Bank Transfer',
      shortDesc: 'Customer transfers directly into merchant bank account',
      icon: Landmark,
      monogram: 'BANK',
      colorTheme: {
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200/60 dark:border-purple-800/60',
        badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        ringColor: 'focus-visible:ring-purple-500',
        gradient: 'from-purple-600 to-indigo-600',
      },
    }
  }

  // Default fallback for custom methods
  const words = (method?.name || 'PM').trim().split(/\s+/)
  const initials =
    words.length > 1
      ? (words[0][0] + words[1][0]).toUpperCase()
      : (method?.name || 'PM').slice(0, 3).toUpperCase()

  return {
    englishName: method?.name || 'Payment Method',
    shortDesc: method?.description || 'Payment method for POS and Online store',
    icon: CircleDollarSign,
    monogram: initials,
    colorTheme: {
      bg: 'bg-primary/10 dark:bg-primary/20',
      text: 'text-primary dark:text-primary',
      border: 'border-primary/20 dark:border-primary/40',
      badgeBg: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
      ringColor: 'focus-visible:ring-primary',
      gradient: 'from-primary to-primary/80',
    },
  }
}

/**
 * Formats transaction fee information cleanly.
 */
export const formatFeeDisplay = (
  feePercent: string | number = 0,
  feeFixed: string | number = 0
): { label: string; isFree: boolean; percentVal: number; fixedVal: number } => {
  const p = Number(feePercent) || 0
  const f = Number(feeFixed) || 0

  if (p === 0 && f === 0) {
    return {
      label: 'Free (0%)',
      isFree: true,
      percentVal: 0,
      fixedVal: 0,
    }
  }

  if (p > 0 && f > 0) {
    return {
      label: `${p}% + $${f.toFixed(2)}`,
      isFree: false,
      percentVal: p,
      fixedVal: f,
    }
  }

  if (p > 0) {
    return {
      label: `${p}%`,
      isFree: false,
      percentVal: p,
      fixedVal: 0,
    }
  }

  return {
    label: `$${f.toFixed(2)}`,
    isFree: false,
    percentVal: 0,
    fixedVal: f,
  }
}

/**
 * Quick templates for creating common payment methods effortlessly.
 */
export const PAYMENT_METHOD_PRESETS = [
  {
    name: 'Bakong KHQR (National QR)',
    code: 'bakong_khqr',
    type: 'qris',
    fee_percent: '0.00',
    fee_fixed: '0.00',
    available_pos: true,
    available_online: true,
    description: 'Scan & pay via Bakong National QR standard across Cambodian banks',
  },
  {
    name: 'Cash on Delivery (COD)',
    code: 'cod',
    type: 'cash',
    fee_percent: '0.00',
    fee_fixed: '0.00',
    available_pos: true,
    available_online: true,
    description: 'Cash payment collected upon delivery to customer',
  },
  {
    name: 'Credit / Debit Card (Visa/MC)',
    code: 'credit_card',
    type: 'credit_card',
    fee_percent: '2.50',
    fee_fixed: '0.25',
    available_pos: true,
    available_online: true,
    description: 'Accept international cards (Visa, Mastercard, UnionPay)',
  },
  {
    name: 'ABA Pay / ABA KHQR',
    code: 'aba_khqr',
    type: 'qris',
    fee_percent: '0.00',
    fee_fixed: '0.00',
    available_pos: true,
    available_online: true,
    description: 'Direct payment via ABA Mobile app or merchant QR standee',
  },
  {
    name: 'ACLEDA Mobile / Bank Transfer',
    code: 'acleda_mobile',
    type: 'bank_transfer',
    fee_percent: '0.00',
    fee_fixed: '0.00',
    available_pos: true,
    available_online: true,
    description: 'Pay via ACLEDA Mobile app or scan ACLEDA KHQR',
  },
  {
    name: 'Wing Bank / WingPay',
    code: 'wing_bank',
    type: 'ewallet',
    fee_percent: '0.00',
    fee_fixed: '0.00',
    available_pos: true,
    available_online: true,
    description: 'Fast payments via Wing App or nationwide agent counters',
  },
]
