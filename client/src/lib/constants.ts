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

export const DESIGNATIONS = [
  { value: 'Medical Officer', label: 'Medical Officer' },
  { value: 'Senior Medical Officer', label: 'Senior Medical Officer' },
  { value: 'Chief Medical Officer', label: 'Chief Medical Officer' },
  { value: 'Civil Surgeon', label: 'Civil Surgeon' },
  { value: 'Joint Civil Surgeon', label: 'Joint Civil Surgeon' },
  { value: 'Assistant Civil Surgeon', label: 'Assistant Civil Surgeon' },
  { value: 'Block Medical Officer', label: 'Block Medical Officer' },
  { value: 'District Programme Officer', label: 'District Programme Officer' },
  { value: 'Programme Officer', label: 'Programme Officer' },
  { value: 'Specialist Doctor', label: 'Specialist Doctor' },
  { value: 'Senior Specialist', label: 'Senior Specialist' },
  { value: 'Chief Specialist', label: 'Chief Specialist' },
  { value: 'Consultant', label: 'Consultant' },
  { value: 'Senior Consultant', label: 'Senior Consultant' },
  { value: 'Professor', label: 'Professor' },
  { value: 'Associate Professor', label: 'Associate Professor' },
  { value: 'Assistant Professor', label: 'Assistant Professor' },
  { value: 'Lecturer', label: 'Lecturer' },
  { value: 'Senior Resident', label: 'Senior Resident' },
  { value: 'Junior Resident', label: 'Junior Resident' },
  { value: 'House Surgeon', label: 'House Surgeon' },
  { value: 'Intern', label: 'Intern' },
  { value: 'Registrar', label: 'Registrar' },
  { value: 'Senior Registrar', label: 'Senior Registrar' },
  { value: 'General Practitioner', label: 'General Practitioner' },
  { value: 'Family Physician', label: 'Family Physician' },
  { value: 'Emergency Medical Officer', label: 'Emergency Medical Officer' },
  { value: 'Casualty Medical Officer', label: 'Casualty Medical Officer' },
  { value: 'Medical Superintendent', label: 'Medical Superintendent' },
  { value: 'Deputy Medical Superintendent', label: 'Deputy Medical Superintendent' },
  { value: 'Assistant Medical Superintendent', label: 'Assistant Medical Superintendent' },
  { value: 'Director', label: 'Director' },
  { value: 'Joint Director', label: 'Joint Director' },
  { value: 'Deputy Director', label: 'Deputy Director' },
  { value: 'Assistant Director', label: 'Assistant Director' },
  { value: 'Other', label: 'Other' }
] as const;

export const QUALIFICATIONS = [
  { value: 'MBBS', label: 'MBBS - Bachelor of Medicine and Bachelor of Surgery' },
  { value: 'MBBS, MD', label: 'MBBS, MD - Doctor of Medicine' },
  { value: 'MBBS, MS', label: 'MBBS, MS - Master of Surgery' },
  { value: 'MBBS, DNB', label: 'MBBS, DNB - Diplomate of National Board' },
  { value: 'MBBS, DM', label: 'MBBS, DM - Doctorate of Medicine (Super Specialty)' },
  { value: 'MBBS, MCh', label: 'MBBS, MCh - Master of Chirurgiae (Super Specialty Surgery)' },
  { value: 'MBBS, MRCP', label: 'MBBS, MRCP - Member of Royal College of Physicians' },
  { value: 'MBBS, MRCS', label: 'MBBS, MRCS - Member of Royal College of Surgeons' },
  { value: 'MBBS, FRCP', label: 'MBBS, FRCP - Fellow of Royal College of Physicians' },
  { value: 'MBBS, FRCS', label: 'MBBS, FRCS - Fellow of Royal College of Surgeons' },
  { value: 'MBBS, FICS', label: 'MBBS, FICS - Fellow of International College of Surgeons' },
  { value: 'MBBS, FICP', label: 'MBBS, FICP - Fellow of Indian College of Physicians' },
  { value: 'MBBS, MNAMS', label: 'MBBS, MNAMS - Member of National Academy of Medical Sciences' },
  { value: 'MBBS, FAMS', label: 'MBBS, FAMS - Fellow of Academy of Medical Sciences' },
  { value: 'MBBS, Diploma', label: 'MBBS with Medical Council Recognized Diploma' },
  { value: 'MBBS, Certificate Course', label: 'MBBS with Certified Medical Course' },
  { value: 'MBBS, Fellowship', label: 'MBBS with Medical Fellowship' },
  { value: 'MBBS, PhD', label: 'MBBS, PhD - Doctor of Philosophy' },
  { value: 'Other', label: 'Other Medical Qualification' }
] as const;

export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' }
] as const;
