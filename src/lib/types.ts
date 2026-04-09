export type DegreeLevel = 'bachelor' | 'master' | 'phd' | 'diploma' | 'mbbs' | 'llb' | 'mba';
export type CompletionStatus = 'completed' | 'incomplete' | 'dropped_out' | 'ongoing';
export type StudyLocation = 'local' | 'abroad';
export type FundingType = 'scholarship' | 'loan' | 'self_funded' | 'government_grant' | 'mixed';
export type RepaymentStatus = 'not_applicable' | 'pending' | 'in_progress' | 'completed' | 'defaulted';
export type EmploymentStatus = 'employed' | 'unemployed' | 'self_employed' | 'further_study' | 'not_seeking';
export type Gender = 'male' | 'female' | 'other' | 'not_specified';

export interface Graduate {
  id: string;
  graduate_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: Gender;

  primary_school: string;
  secondary_o_level_school: string;
  secondary_a_level_school: string;

  university_institution: string;
  university_program: string;
  degree_level: DegreeLevel;
  university_start_year: number | null;
  university_end_year: number | null;
  completion_status: CompletionStatus;
  study_location: StudyLocation;
  study_country: string;

  funding_type: FundingType;
  sponsor_name: string;
  loan_amount: number;
  repayment_status: RepaymentStatus;

  employment_status: EmploymentStatus;
  employer: string;
  job_role: string;
  sector: string;
  work_location: string;
  further_study_location: StudyLocation;
  further_study_country: string;
  further_study_field: string;
  further_study_graduation_year: number | null;
  further_study_funding: FundingType;
  country_of_residence: string;
  employment_date: string | null;
  graduation_year: number | null;

  created_at: string;
}

export interface GraduateFormData extends Omit<Graduate, 'id' | 'created_at'> {}

export function calcMonthsToEmployment(graduationYear: number | null, employmentDate: string | null): number | null {
  if (!graduationYear || !employmentDate) return null;
  const gradDate = new Date(graduationYear, 6, 1);
  const empDate = new Date(employmentDate);
  const months = (empDate.getFullYear() - gradDate.getFullYear()) * 12 + (empDate.getMonth() - gradDate.getMonth());
  return Math.max(0, months);
}

export function formatMonths(months: number | null): string {
  if (months === null) return 'N/A';
  if (months === 0) return '< 1 mo';
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}mo` : `${years}y`;
}

export const PROGRAMS = [
  'Computer Science',
  'Civil Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Business Administration',
  'Medicine',
  'Law',
  'Education',
  'Nursing',
  'Agriculture',
  'Architecture',
  'Pharmacy',
  'Accounting',
  'Economics',
  'Psychology',
  'Other',
];

export const SECTORS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Energy',
  'Consulting',
  'Construction',
  'Infrastructure',
  'Agriculture',
  'Legal',
  'Telecommunications',
  'Government',
  'Manufacturing',
  'Media',
  'Other',
];

export const STATUS_COLORS: Record<EmploymentStatus, string> = {
  employed: 'bg-emerald-100 text-emerald-800',
  self_employed: 'bg-blue-100 text-blue-800',
  further_study: 'bg-amber-100 text-amber-800',
  unemployed: 'bg-red-100 text-red-800',
  not_seeking: 'bg-slate-100 text-slate-600',
};

export const COMPLETION_COLORS: Record<CompletionStatus, string> = {
  completed: 'bg-emerald-100 text-emerald-800',
  ongoing: 'bg-blue-100 text-blue-800',
  incomplete: 'bg-amber-100 text-amber-800',
  dropped_out: 'bg-red-100 text-red-800',
};
