import { useEffect, useState } from 'react';
import { Users, Briefcase, Clock, Globe, TrendingUp, Award, DollarSign, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Graduate, calcMonthsToEmployment, isEmployedStatus } from '../lib/types';
import BarChart from './charts/BarChart';
import DonutChart from './charts/DonutChart';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
}

function StatCard({ label, value, sub, icon: Icon, color, bg }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-start gap-4">
      <div className={`${bg} p-3 rounded-xl shrink-0`}>
        <Icon size={22} className={color} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-slate-800 leading-tight">{value}</div>
        <div className="text-sm text-slate-500 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDashboardGraduates()
      .then(data => {
        setGraduates(data);
        setError(null);
      })
      .catch(err => {
        console.error('Failed to load graduates:', err);
        setError(err.message || 'Failed to load data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Error Loading Data</h3>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  const total = graduates.length;
  const completed = graduates.filter(g => g.completion_status === 'completed');
  const employedAmongCompleted = completed.filter(g => isEmployedStatus(g.employment_status));
  const abroad = graduates.filter(g => g.study_location === 'abroad');
  const employmentRate = completed.length > 0 ? Math.round((employedAmongCompleted.length / completed.length) * 100) : 0;

  const monthsArr = graduates
    .map(g => calcMonthsToEmployment(g.graduation_year, g.employment_date))
    .filter((m): m is number => m !== null);
  const avgMonths = monthsArr.length > 0 ? Math.round(monthsArr.reduce((a, b) => a + b, 0) / monthsArr.length) : 0;

  const programCounts = graduates.reduce<Record<string, number>>((acc, g) => {
    const p = g.university_program || 'Unknown';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const programChartData = Object.entries(programCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value, color: '#0891b2' }));

  const fundingCounts = graduates.reduce<Record<string, number>>((acc, g) => {
    const f = g.funding_type || 'Unknown';
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {});
  const fundingColors: Record<string, string> = {
    scholarship: '#0891b2',
    loan: '#f59e0b',
    self_funded: '#64748b',
    government_grant: '#10b981',
    mixed: '#6366f1',
  };
  const fundingChartData = Object.entries(fundingCounts).map(([label, value]) => ({
    label: label.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value,
    color: fundingColors[label] || '#94a3b8',
  }));

  const completionCounts = graduates.reduce<Record<string, number>>((acc, g) => {
    const c = g.completion_status || 'Unknown';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const completionColors: Record<string, string> = {
    completed: '#10b981',
    ongoing: '#3b82f6',
    incomplete: '#f59e0b',
    dropped_out: '#ef4444',
  };
  const completionChartData = Object.entries(completionCounts).map(([label, value]) => ({
    label: label.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value,
    color: completionColors[label] || '#94a3b8',
  }));

  const countryCounts = graduates.reduce<Record<string, number>>((acc, g) => {
    const c = g.country_of_residence || g.study_country || 'Not specified';
    if (c) acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const countryChartData = Object.entries(countryCounts)
    .filter(([k]) => k && k !== 'Not specified')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value, color: '#10b981' }));

  const loanGrads = graduates.filter(g => g.funding_type === 'loan' || g.funding_type === 'mixed');
  const loansCompleted = loanGrads.filter(g => g.repayment_status === 'completed').length;
  const loansInProgress = loanGrads.filter(g => g.repayment_status === 'in_progress').length;
  const loansPending = loanGrads.filter(g => g.repayment_status === 'pending').length;
  const loansDefaulted = loanGrads.filter(g => g.repayment_status === 'defaulted').length;
  const totalLoanValue = loanGrads.reduce((s, g) => s + (g.loan_amount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of graduate outcomes and system metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Graduates" value={total}
          sub={`${completed.length} completed`}
          icon={Users} color="text-cyan-600" bg="bg-cyan-50"
        />
        <StatCard
          label="Employment Rate" value={`${employmentRate}%`}
          sub={`${employedAmongCompleted.length} of ${completed.length} completed graduates employed`}
          icon={Briefcase} color="text-emerald-600" bg="bg-emerald-50"
        />
        <StatCard
          label="Avg. Time to Job" value={avgMonths > 0 ? `${avgMonths} mo` : 'N/A'}
          sub="from graduation to employment"
          icon={Clock} color="text-amber-600" bg="bg-amber-50"
        />
        <StatCard
          label="Studied Abroad" value={abroad.length}
          sub={`${Math.round((abroad.length / Math.max(total, 1)) * 100)}% of all graduates`}
          icon={Globe} color="text-blue-600" bg="bg-blue-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-cyan-600" />
            <h2 className="font-semibold text-slate-800">Enrollment by Program</h2>
          </div>
          <BarChart data={programChartData} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} className="text-cyan-600" />
            <h2 className="font-semibold text-slate-800">Funding Sources</h2>
          </div>
          <DonutChart data={fundingChartData} size={140} thickness={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-cyan-600" />
            <h2 className="font-semibold text-slate-800">Completion Status</h2>
          </div>
          <DonutChart data={completionChartData} size={150} thickness={26} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-cyan-600" />
            <h2 className="font-semibold text-slate-800">Geographic Distribution</h2>
            <span className="text-xs text-slate-400">(country of residence)</span>
          </div>
          <BarChart data={countryChartData} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-amber-600" />
          <h2 className="font-semibold text-slate-800">Loan Recovery Summary</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-xl font-bold text-slate-800">{loanGrads.length}</div>
            <div className="text-xs text-slate-500 mt-1">Total Borrowers</div>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-xl font-bold text-emerald-700">{loansCompleted}</div>
            <div className="text-xs text-slate-500 mt-1">Fully Repaid</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-700">{loansInProgress}</div>
            <div className="text-xs text-slate-500 mt-1">In Progress</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-xl font-bold text-amber-700">{loansPending}</div>
            <div className="text-xs text-slate-500 mt-1">Pending</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-700">{loansDefaulted}</div>
            <div className="text-xs text-slate-500 mt-1">Defaulted</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500">
          Total loan value disbursed: <span className="font-semibold text-slate-700">
            ${totalLoanValue.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
