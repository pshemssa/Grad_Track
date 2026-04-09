import { ArrowLeft, Pencil } from 'lucide-react';
import { Graduate } from '../lib/types';

interface Props {
  graduate: Graduate;
  onBack: () => void;
  onEdit: () => void;
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function DetailField({ label, value }: { label: string; value: string | number | null | undefined }) {
  const display = value === null || value === undefined || value === '' ? 'Not provided' : String(value);
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-slate-800">{display}</div>
    </div>
  );
}

export default function GraduateDetails({ graduate, onBack, onEdit }: Props) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={16} />
            Back to graduates
          </button>
          <h1 className="mt-3 text-2xl font-bold text-slate-800">
            {graduate.first_name} {graduate.last_name}
          </h1>
          <p className="text-sm text-slate-500">{graduate.graduate_id}</p>
        </div>
        <button
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
        >
          <Pencil size={16} />
          Edit Graduate
        </button>
      </div>

      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Personal Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="First Name" value={graduate.first_name} />
          <DetailField label="Last Name" value={graduate.last_name} />
          <DetailField label="Email" value={graduate.email} />
          <DetailField label="Phone" value={graduate.phone} />
          <DetailField label="Date of Birth" value={graduate.date_of_birth} />
          <DetailField label="Gender" value={formatLabel(graduate.gender)} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Education</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="Primary School" value={graduate.primary_school} />
          <DetailField label="O-Level School" value={graduate.secondary_o_level_school} />
          <DetailField label="A-Level School" value={graduate.secondary_a_level_school} />
          <DetailField label="University Institution" value={graduate.university_institution} />
          <DetailField label="Program" value={graduate.university_program} />
          <DetailField label="Degree Level" value={graduate.degree_level?.toUpperCase()} />
          <DetailField label="Start Year" value={graduate.university_start_year} />
          <DetailField label="End Year" value={graduate.university_end_year} />
          <DetailField label="Completion Status" value={formatLabel(graduate.completion_status)} />
          <DetailField label="Study Location" value={formatLabel(graduate.study_location)} />
          <DetailField label="Country of Study" value={graduate.study_country} />
          <DetailField label="Graduation Year" value={graduate.graduation_year} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Funding</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="Funding Type" value={formatLabel(graduate.funding_type)} />
          <DetailField label="Sponsor Name" value={graduate.sponsor_name} />
          <DetailField label="Loan Amount" value={graduate.loan_amount} />
          <DetailField label="Repayment Status" value={formatLabel(graduate.repayment_status)} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Employment</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="Employment Status" value={formatLabel(graduate.employment_status)} />
          <DetailField label="Employer" value={graduate.employer} />
          <DetailField label="Job Role" value={graduate.job_role} />
          <DetailField label="Sector" value={graduate.sector} />
          <DetailField label="Work Location" value={formatLabel(graduate.work_location)} />
          <DetailField label="Further Study Location" value={formatLabel(graduate.further_study_location)} />
          <DetailField label="Further Study Country" value={graduate.further_study_country} />
          <DetailField label="Further Study Field" value={graduate.further_study_field} />
          <DetailField label="Further Study Graduation Year" value={graduate.further_study_graduation_year} />
          <DetailField label="Further Study Funding" value={formatLabel(graduate.further_study_funding)} />
          <DetailField label="Country of Residence" value={graduate.country_of_residence} />
          <DetailField label="Employment Date" value={graduate.employment_date} />
          <DetailField label="Created At" value={graduate.created_at ? new Date(graduate.created_at).toLocaleString() : ''} />
        </div>
      </section>
    </div>
  );
}
