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
  { value: 'DGHS', label: 'DGHS - Directorate General of Health Services' },
  { value: 'DME', label: 'DME - Directorate of Medical Education' },
  { value: 'DMRHS', label: 'DMRHS - Directorate of Medical & Rural Health Services' },
  { value: 'DPH&PM', label: 'DPH&PM - Directorate of Public Health & Preventive Medicine' },
  { value: 'DFWS', label: 'DFWS - Directorate of Family Welfare Services' },
  { value: 'AYUSH', label: 'AYUSH - Directorate of AYUSH' },
  { value: 'ESI', label: 'ESI - Employee State Insurance' },
  { value: 'CGHS', label: 'CGHS - Central Government Health Scheme' },
  { value: 'Railways', label: 'Railway Health Services' },
  { value: 'Defence', label: 'Defence Medical Services' },
  { value: 'DRDO', label: 'DRDO - Defence Research & Development Organisation' },
  { value: 'AIIMS', label: 'AIIMS - All India Institute of Medical Sciences' },
  { value: 'PGI', label: 'PGI - Post Graduate Institute of Medical Sciences' },
  { value: 'GMCH', label: 'GMCH - Government Medical College & Hospital' },
  { value: 'District Hospital', label: 'District Hospital' },
  { value: 'CHC', label: 'CHC - Community Health Centre' },
  { value: 'PHC', label: 'PHC - Primary Health Centre' },
  { value: 'Sub Centre', label: 'Sub Centre' },
  { value: 'Urban Health', label: 'Urban Health Services' },
  { value: 'NRHM', label: 'NRHM - National Rural Health Mission' },
  { value: 'Private Sector', label: 'Private Healthcare Sector' },
  { value: 'NGO', label: 'NGO - Non-Governmental Organisation' },
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
