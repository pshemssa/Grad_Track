import { useState } from 'react';
import { User, GraduationCap, DollarSign, Briefcase, CheckCircle, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { Graduate, PROGRAMS, SECTORS } from '../lib/types';

const DEGREE_LEVELS = ['bachelor', 'master', 'phd', 'diploma', 'mbbs', 'llb', 'mba'];
const FUNDING_TYPES = ['scholarship', 'loan', 'self_funded', 'government_grant', 'mixed'];
const EMPLOYMENT_STATUSES = ['employed', 'unemployed', 'self_employed', 'further_study', 'not_seeking'];
const COMPLETION_STATUSES = ['completed', 'incomplete', 'dropped_out', 'ongoing'];

const initialForm = {
  first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', gender: 'not_specified',
  primary_school: '', secondary_o_level_school: '', secondary_a_level_school: '',
  university_institution: '', university_program: '', university_program_other: '', degree_level: 'bachelor',
  university_start_year: '', university_end_year: '', completion_status: 'completed',
  study_location: 'local', study_country: '',
  funding_type: 'self_funded', sponsor_name: '', loan_amount: '', repayment_status: 'not_applicable',
  employment_status: 'unemployed', employer: '', job_role: '', sector: '',
  work_location: 'local', further_study_location: 'local', further_study_country: '', further_study_field: '', further_study_field_other: '', further_study_graduation_year: '', further_study_funding: 'self_funded',
  country_of_residence: '', employment_date: '', graduation_year: '',
};

type FormState = typeof initialForm;

function toFormState(g: Graduate): FormState {
  return {
    first_name: g.first_name,
    last_name: g.last_name,
    email: g.email || '',
    phone: g.phone || '',
    date_of_birth: g.date_of_birth || '',
    gender: g.gender,
    primary_school: g.primary_school || '',
    secondary_o_level_school: g.secondary_o_level_school || '',
    secondary_a_level_school: g.secondary_a_level_school || '',
    university_institution: g.university_institution || '',
    university_program: g.university_program || '',
    university_program_other: '',
    degree_level: g.degree_level,
    university_start_year: g.university_start_year ? String(g.university_start_year) : '',
    university_end_year: g.university_end_year ? String(g.university_end_year) : '',
    completion_status: g.completion_status,
    study_location: g.study_location,
    study_country: g.study_country || '',
    funding_type: g.funding_type,
    sponsor_name: g.sponsor_name || '',
    loan_amount: g.loan_amount ? String(g.loan_amount) : '',
    repayment_status: g.repayment_status,
    employment_status: g.employment_status,
    employer: g.employer || '',
    job_role: g.job_role || '',
    sector: g.sector || '',
    work_location: g.work_location || 'local',
    further_study_location: g.further_study_location || 'local',
    further_study_country: g.further_study_country || '',
    further_study_field: g.further_study_field || '',
    further_study_field_other: '',
    further_study_graduation_year: g.further_study_graduation_year ? String(g.further_study_graduation_year) : '',
    further_study_funding: g.further_study_funding || 'self_funded',
    country_of_residence: g.country_of_residence || '',
    employment_date: g.employment_date || '',
    graduation_year: g.graduation_year ? String(g.graduation_year) : '',
  };
}

// Per-step validation: returns error message or empty string
const isBlank = (value: string) => !value.trim();

function validateStep(step: number, form: FormState): string {
  if (step === 0) {
    if (isBlank(form.first_name)) return 'First name is required.';
    if (isBlank(form.last_name)) return 'Last name is required.';
    if (isBlank(form.email)) return 'Email address is required.';
    if (isBlank(form.phone)) return 'Phone number is required.';
    if (isBlank(form.date_of_birth)) return 'Date of birth is required.';
    if (isBlank(form.gender)) return 'Gender is required.';
  }
  if (step === 1) {
    if (isBlank(form.primary_school)) return 'Primary school is required.';
    if (isBlank(form.secondary_o_level_school)) return 'O-Level school name is required.';
    if (isBlank(form.secondary_a_level_school)) return 'A-Level school name is required.';
    if (isBlank(form.university_institution)) return 'University institution is required.';
    if (!form.university_program) return 'Please select a program.';
    if (form.university_program === 'Other' && isBlank(form.university_program_other)) return 'Please enter the other field of study.';
    if (isBlank(form.degree_level)) return 'Degree level is required.';
    if (isBlank(form.completion_status)) return 'Completion status is required.';
    if (isBlank(form.university_start_year)) return 'University start year is required.';
    if (isBlank(form.university_end_year)) return 'University end year is required.';
    if (isBlank(form.study_location)) return 'Study location is required.';
    if (isBlank(form.study_country)) return 'Country of study is required.';
  }
  if (step === 2) {
    if (!form.funding_type) return 'Please select a funding type.';
    if (isBlank(form.sponsor_name)) return 'Sponsor, scholarship body, or lender is required.';
    if (isBlank(form.loan_amount)) return 'Loan amount is required.';
    if (isBlank(form.repayment_status)) return 'Repayment status is required.';
  }
  if (step === 3) {
    if (isBlank(form.employment_status)) return 'Employment status is required.';
    if (isBlank(form.graduation_year)) return 'Graduation year is required.';
    if (isBlank(form.country_of_residence)) return 'Country of residence is required.';

    if (['employed', 'self_employed'].includes(form.employment_status)) {
      if (isBlank(form.employer)) return 'Employer or organization is required.';
      if (isBlank(form.job_role)) return 'Job role or position is required.';
      if (isBlank(form.sector)) return 'Sector is required.';
      if (isBlank(form.employment_date)) return 'Employment date is required.';
      if (isBlank(form.work_location)) return 'Work location is required.';
    }

    if (form.employment_status === 'further_study') {
      if (isBlank(form.further_study_location)) return 'Further study location is required.';
      if (isBlank(form.further_study_country)) return 'Further study country is required.';
      if (isBlank(form.further_study_field)) return 'Further study field is required.';
      if (form.further_study_field === 'Other' && isBlank(form.further_study_field_other)) return 'Please enter the other further study field.';
      if (isBlank(form.further_study_graduation_year)) return 'Further study graduation year is required.';
      if (isBlank(form.further_study_funding)) return 'Further study funding is required.';
    }
  }
  return '';
}

const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

interface FieldProps { label: string; required?: boolean; children: React.ReactNode; }
function Field({ label: lbl, required, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {lbl}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent';

interface Props {
  onSuccess: () => void;
  editGraduate?: Graduate | null;
}

export default function AddGraduate({ onSuccess, editGraduate }: Props) {
  const isEdit = !!editGraduate;
  const [form, setForm] = useState<FormState>(editGraduate ? toFormState(editGraduate) : initialForm);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const steps = [
    { label: 'Personal Info', icon: User },
    { label: 'Education', icon: GraduationCap },
    { label: 'Funding', icon: DollarSign },
    { label: 'Employment', icon: Briefcase },
  ];

  const handleNext = () => {
    const err = validateStep(step, form);
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    const err = validateStep(step, form);
    if (err) { setError(err); return; }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email,
        phone: form.phone,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender as Graduate['gender'],
        primary_school: form.primary_school,
        secondary_o_level_school: form.secondary_o_level_school,
        secondary_a_level_school: form.secondary_a_level_school,
        university_institution: form.university_institution,
        university_program: form.university_program === 'Other'
          ? form.university_program_other.trim()
          : form.university_program,
        degree_level: form.degree_level as Graduate['degree_level'],
        university_start_year: form.university_start_year ? parseInt(form.university_start_year) : null,
        university_end_year: form.university_end_year ? parseInt(form.university_end_year) : null,
        completion_status: form.completion_status as Graduate['completion_status'],
        study_location: form.study_location as Graduate['study_location'],
        study_country: form.study_country,
        funding_type: form.funding_type as Graduate['funding_type'],
        sponsor_name: form.sponsor_name,
        loan_amount: form.loan_amount ? parseFloat(form.loan_amount) : 0,
        repayment_status: form.repayment_status as Graduate['repayment_status'],
        employment_status: form.employment_status as Graduate['employment_status'],
        employer: form.employer,
        job_role: form.job_role,
        sector: form.sector,
        work_location: form.work_location,
        further_study_location: form.further_study_location as Graduate['study_location'],
        further_study_country: form.further_study_country,
        further_study_field: form.further_study_field === 'Other'
          ? form.further_study_field_other.trim()
          : form.further_study_field,
        further_study_graduation_year: form.further_study_graduation_year ? parseInt(form.further_study_graduation_year) : null,
        further_study_funding: form.further_study_funding as Graduate['funding_type'],
        country_of_residence: form.country_of_residence,
        employment_date: form.employment_date || null,
        graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
      };

      if (isEdit && editGraduate) {
        await api.updateGraduate(editGraduate.id, payload);
      } else {
        await api.createGraduate(payload);
      }
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-6">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {isEdit ? 'Graduate Updated Successfully' : 'Graduate Added Successfully'}
          </h2>
          <p className="text-slate-500 text-sm mb-6">The graduate record has been saved to the system.</p>
          <div className="flex gap-3 justify-center">
            {!isEdit && (
              <button
                onClick={() => { setForm(initialForm); setStep(0); setSuccess(false); }}
                className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:border-slate-300 transition-colors"
              >
                Add Another
              </button>
            )}
            <button
              onClick={onSuccess}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              View Graduates
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Graduate' : 'Add Graduate'}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {isEdit ? `Editing record for ${editGraduate?.first_name} ${editGraduate?.last_name}` : 'Register a new graduate and track their full journey'}
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center gap-1">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <button
                  key={i}
                  onClick={() => {
                    // Only allow going back, not skipping forward
                    if (i < step) { setError(''); setStep(i); }
                  }}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-lg transition-all text-xs font-medium ${
                    active ? 'bg-cyan-50 text-cyan-700' : done ? 'text-emerald-600 cursor-pointer' : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    active ? 'bg-cyan-600 text-white' : done ? 'bg-emerald-500 text-white' : 'bg-slate-100'
                  }`}>
                    {done ? <CheckCircle size={14} /> : <Icon size={14} />}
                  </div>
                  <span className="hidden sm:block">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 text-base mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" required>
                  <input className={inputCls} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="e.g. Amara" />
                </Field>
                <Field label="Last Name" required>
                  <input className={inputCls} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="e.g. Nkosi" />
                </Field>
                <Field label="Email Address">
                  <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="example@email.com" />
                </Field>
                <Field label="Phone Number">
                  <input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 234 567 8900" />
                </Field>
                <Field label="Date of Birth">
                  <input type="date" className={inputCls} value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
                </Field>
                <Field label="Gender">
                  <select className={inputCls} value={form.gender} onChange={e => set('gender', e.target.value)}>
                    {['not_specified', 'male', 'female', 'other'].map(g => <option key={g} value={g}>{label(g)}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800 text-base">Education History</h2>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Primary School</div>
                <Field label="School Name">
                  <input className={inputCls} value={form.primary_school} onChange={e => set('primary_school', e.target.value)} placeholder="e.g. Riverside Primary" />
                </Field>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Secondary School</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="O-Level School Name">
                    <input className={inputCls} value={form.secondary_o_level_school} onChange={e => set('secondary_o_level_school', e.target.value)} placeholder="e.g. Greenfield O-Level School" />
                  </Field>
                  <Field label="A-Level School Name">
                    <input className={inputCls} value={form.secondary_a_level_school} onChange={e => set('secondary_a_level_school', e.target.value)} placeholder="e.g. Greenfield A-Level School" />
                  </Field>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">University / Tertiary</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Institution Name" required>
                    <input className={inputCls} value={form.university_institution} onChange={e => set('university_institution', e.target.value)} placeholder="e.g. University of Cape Town" />
                  </Field>
                  <Field label="Program / Field of Study" required>
                    <select className={inputCls} value={form.university_program} onChange={e => set('university_program', e.target.value)}>
                      <option value="">Select program</option>
                      {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                  {form.university_program === 'Other' && (
                    <Field label="Other Field of Study" required>
                      <input className={inputCls} value={form.university_program_other} onChange={e => set('university_program_other', e.target.value)} placeholder="Enter your field of study" />
                    </Field>
                  )}
                  <Field label="Degree Level">
                    <select className={inputCls} value={form.degree_level} onChange={e => set('degree_level', e.target.value)}>
                      {DEGREE_LEVELS.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                    </select>
                  </Field>
                  <Field label="Completion Status">
                    <select className={inputCls} value={form.completion_status} onChange={e => set('completion_status', e.target.value)}>
                      {COMPLETION_STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
                    </select>
                  </Field>
                  <Field label="Start Year">
                    <input type="number" className={inputCls} value={form.university_start_year} onChange={e => set('university_start_year', e.target.value)} placeholder="e.g. 2015" min="1980" max="2030" />
                  </Field>
                  <Field label="End Year (Graduation)">
                    <input type="number" className={inputCls} value={form.university_end_year} onChange={e => set('university_end_year', e.target.value)} placeholder="e.g. 2019" min="1980" max="2030" />
                  </Field>
                  <Field label="Study Location">
                    <select className={inputCls} value={form.study_location} onChange={e => set('study_location', e.target.value)}>
                      <option value="local">Local (Home Country)</option>
                      <option value="abroad">Abroad</option>
                    </select>
                  </Field>
                  <Field label="Country of Study">
                    <input className={inputCls} value={form.study_country} onChange={e => set('study_country', e.target.value)} placeholder="e.g. South Africa" />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 text-base">Funding Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Funding Type" required>
                  <select className={inputCls} value={form.funding_type} onChange={e => {
                    set('funding_type', e.target.value);
                  }}>
                    {FUNDING_TYPES.map(f => <option key={f} value={f}>{label(f)}</option>)}
                  </select>
                </Field>
                <Field label="Sponsor / Scholarship Body / Lender">
                  <input className={inputCls} value={form.sponsor_name} onChange={e => set('sponsor_name', e.target.value)} placeholder="e.g. National Research Foundation" />
                </Field>
                <Field label="Loan Amount (USD)">
                  <input type="number" className={inputCls} value={form.loan_amount} onChange={e => set('loan_amount', e.target.value)} placeholder="Enter amount or 0" min="0" />
                </Field>
                <Field label="Repayment Status">
                  <select className={inputCls} value={form.repayment_status} onChange={e => set('repayment_status', e.target.value)}>
                    {['not_applicable', 'pending', 'in_progress', 'completed', 'defaulted'].map(s => <option key={s} value={s}>{label(s)}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 text-base">Employment Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Employment Status">
                  <select className={inputCls} value={form.employment_status} onChange={e => set('employment_status', e.target.value)}>
                    {EMPLOYMENT_STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
                  </select>
                </Field>
                <Field label="Graduation Year">
                  <input type="number" className={inputCls} value={form.graduation_year} onChange={e => set('graduation_year', e.target.value)} placeholder="e.g. 2022" min="1980" max="2030" />
                </Field>
                {['employed', 'self_employed'].includes(form.employment_status) && (
                  <>
                    <Field label="Employer / Organization">
                      <input className={inputCls} value={form.employer} onChange={e => set('employer', e.target.value)} placeholder="e.g. Acme Corp" />
                    </Field>
                    <Field label="Job Role / Position">
                      <input className={inputCls} value={form.job_role} onChange={e => set('job_role', e.target.value)} placeholder="e.g. Software Engineer" />
                    </Field>
                    <Field label="Sector">
                      <select className={inputCls} value={form.sector} onChange={e => set('sector', e.target.value)}>
                        <option value="">Select sector</option>
                        {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="Date of Employment">
                      <input type="date" className={inputCls} value={form.employment_date} onChange={e => set('employment_date', e.target.value)} />
                    </Field>
                    <Field label="Work Location">
                      <select className={inputCls} value={form.work_location} onChange={e => set('work_location', e.target.value)}>
                        <option value="local">Local</option>
                        <option value="abroad">Abroad</option>
                      </select>
                    </Field>
                  </>
                )}
                {form.employment_status === 'further_study' && (
                  <>
                    <Field label="Further Study Location">
                      <select className={inputCls} value={form.further_study_location} onChange={e => set('further_study_location', e.target.value)}>
                        <option value="local">Local</option>
                        <option value="abroad">Abroad</option>
                      </select>
                    </Field>
                    <Field label="Country of Study">
                      <input className={inputCls} value={form.further_study_country} onChange={e => set('further_study_country', e.target.value)} placeholder="e.g. Rwanda or Canada" />
                    </Field>
                    <Field label="Field of Study">
                      <select className={inputCls} value={form.further_study_field} onChange={e => set('further_study_field', e.target.value)}>
                        <option value="">Select field of study</option>
                        {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </Field>
                    {form.further_study_field === 'Other' && (
                      <Field label="Other Field of Study">
                        <input className={inputCls} value={form.further_study_field_other} onChange={e => set('further_study_field_other', e.target.value)} placeholder="Enter field of study" />
                      </Field>
                    )}
                    <Field label="Further Study Graduation Year">
                      <input type="number" className={inputCls} value={form.further_study_graduation_year} onChange={e => set('further_study_graduation_year', e.target.value)} placeholder="e.g. 2027" min="1980" max="2035" />
                    </Field>
                    <Field label="Who Is Funding It?">
                      <select className={inputCls} value={form.further_study_funding} onChange={e => set('further_study_funding', e.target.value)}>
                        {FUNDING_TYPES.map(f => <option key={f} value={f}>{label(f)}</option>)}
                      </select>
                    </Field>
                  </>
                )}
                <Field label="Country of Residence">
                  <input className={inputCls} value={form.country_of_residence} onChange={e => set('country_of_residence', e.target.value)} placeholder="e.g. Kenya" />
                </Field>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => { setError(''); setStep(s => Math.max(0, s - 1)); }}
            disabled={step === 0}
            className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:border-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {submitting ? 'Saving...' : isEdit ? 'Update Graduate' : 'Save Graduate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
