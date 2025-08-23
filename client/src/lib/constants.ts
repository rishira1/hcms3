export const DISTRICTS = [
  "Ambala",
  "Bhiwani",
  "Charkhi Dadri",
  "Faridabad",
  "Fatehabad",
  "Gurugram",
  "Hisar",
  "Jhajjar",
  "Jind",
  "Kaithal",
  "Karnal",
  "Kurukshetra",
  "Mahendragarh",
  "Nuh",
  "Palwal",
  "Panchkula",
  "Panipat",
  "Rewari",
  "Rohtak",
  "Sirsa",
  "Sonipat",
  "Yamunanagar"
] as const;

export const DIRECTORATES = [
  { value: 'DME', label: 'DME' },
  { value: 'DMRHS', label: 'DMRHS' },
  { value: 'DPH&PM', label: 'DPH&PM' },
  { value: 'ESI', label: 'ESI' },
  { value: 'Other', label: 'Other' }
] as const;

export const MEMBERSHIP_TYPES = [
  { 
    value: 'New Membership', 
    label: 'New Membership',
    description: 'First time registration - ₹2,000'
  },
  { 
    value: 'Annual Subscription fee', 
    label: 'Annual Subscription',
    description: 'Renewal subscription - ₹2,000'
  }
] as const;

export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' }
] as const;
