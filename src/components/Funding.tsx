import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, Award } from 'lucide-react';
import { api } from '../lib/api';
import { Graduate, isEmployedStatus } from '../lib/types';
import BarChart from './charts/BarChart';
import DonutChart from './charts/DonutChart';

export default function Funding() {
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAllGraduates()
      .then(data => {
        setGraduates(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load graduates:', err);
        setError(err.message || 'Failed to load data');
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

  const loanGrads = graduates.filter(g => ['loan', 'mixed'].includes(g.funding_type));
  const totalDisbursed = loanGrads.reduce((s, g) => s + (g.loan_amount || 0), 0);

  const repaymentData = [
    { label: 'Completed', value: loanGrads.filter(g => g.repayment_status === 'completed').length, color: '#10b981' },
    { label: 'In Progress', value: loanGrads.filter(g => g.repayment_status === 'in_progress').length, color: '#3b82f6' },
    { label: 'Pending', value: loanGrads.filter(g => g.repayment_status === 'pending').length, color: '#f59e0b' },
    { label: 'Defaulted', value: loanGrads.filter(g => g.repayment_status === 'defaulted').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const fundingTypeCounts = graduates.reduce<Record<string, number>>((acc, g) => {
    const f = g.funding_type || 'Unknown';
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {});
  const fundingColors: Record<string, string> = {
    scholarship: '#0891b2',
    loan: '#f59e0b',
    self_funded: '#64748b',
    government_grant: '#10b981',
    mixed: '#8b5cf6',
  };
  const fundingTypeData = Object.entries(fundingTypeCounts).map(([label, value]) => ({
    label: label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value,
    color: fundingColors[label] || '#94a3b8',
  }));

  const sponsorCounts = graduates
    .filter(g => g.sponsor_name)
    .reduce<Record<string, number>>((acc, g) => {
      acc[g.sponsor_name] = (acc[g.sponsor_name] || 0) + 1;
      return acc;
    }, {});
  const sponsorData = Object.entries(sponsorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, value]) => ({ label, value, color: '#0891b2' }));

  const sponsorEmployment = graduates
    .filter(g => g.sponsor_name && isEmployedStatus(g.employment_status))
    .reduce<Record<string, number>>((acc, g) => {
      acc[g.sponsor_name] = (acc[g.sponsor_name] || 0) + 1;
      return acc;
    }, {});
  const sponsorEmploymentData = Object.entries(sponsorEmployment)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value, color: '#10b981' }));

  const loanAmountByStatus = [
    {
      status: 'Completed',
      amount: loanGrads.filter(g => g.repayment_status === 'completed').reduce((s, g) => s + (g.loan_amount || 0), 0),
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      status: 'In Progress',
      amount: loanGrads.filter(g => g.repayment_status === 'in_progress').reduce((s, g) => s + (g.loan_amount || 0), 0),
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      status: 'Pending',
      amount: loanGrads.filter(g => g.repayment_status === 'pending').reduce((s, g) => s + (g.loan_amount || 0), 0),
      color: 'text-amber-700',
      bg: 'bg-amber-50',
    },
    {
      status: 'Defaulted',
      amount: loanGrads.filter(g => g.repayment_status === 'defaulted').reduce((s, g) => s + (g.loan_amount || 0), 0),
      color: 'text-red-700',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Funding & Recovery</h1>
        <p className="text-slate-500 text-sm mt-1">Loan tracking, scholarship distribution, and repayment analytics</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 text-center">
          <DollarSign size={20} className="mx-auto text-cyan-600 mb-2" />
          <div className="text-xl font-bold text-slate-800">{loanGrads.length}</div>
          <div className="text-xs text-slate-500 mt-1">Loan Recipients</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 text-center">
          <TrendingUp size={20} className="mx-auto text-emerald-600 mb-2" />
          <div className="text-xl font-bold text-slate-800">${totalDisbursed.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Total Disbursed</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 text-center">
          <Award size={20} className="mx-auto text-blue-600 mb-2" />
          <div className="text-xl font-bold text-slate-800">{graduates.filter(g => g.funding_type === 'scholarship').length}</div>
          <div className="text-xs text-slate-500 mt-1">Scholarship Recipients</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 text-center">
          <AlertCircle size={20} className="mx-auto text-amber-600 mb-2" />
          <div className="text-xl font-bold text-slate-800">{loanGrads.filter(g => g.repayment_status === 'defaulted').length}</div>
          <div className="text-xs text-slate-500 mt-1">Defaults</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Loan Repayment Status</h3>
          {repaymentData.length > 0 ? (
            <DonutChart data={repaymentData} size={150} thickness={26} />
          ) : (
            <div className="text-slate-400 text-sm text-center py-8">No loan data recorded</div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Funding Type Distribution</h3>
          <DonutChart data={fundingTypeData} size={150} thickness={26} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-semibold text-slate-800 mb-2">Loan Value by Repayment Status</h3>
        <p className="text-xs text-slate-400 mb-4">Total loan amounts across all borrowers grouped by current repayment status</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loanAmountByStatus.map((item, i) => (
            <div key={i} className={`${item.bg} rounded-lg p-4`}>
              <div className={`text-lg font-bold ${item.color}`}>${item.amount.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">{item.status}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={15} className="text-cyan-600" />
            <h3 className="font-semibold text-slate-800">Top Scholarship Bodies / Sponsors</h3>
          </div>
          {sponsorData.length > 0 ? (
            <BarChart data={sponsorData} />
          ) : (
            <div className="text-slate-400 text-sm text-center py-8">No sponsor data recorded</div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-emerald-600" />
            <h3 className="font-semibold text-slate-800">Sponsors Producing Most Employed Graduates</h3>
          </div>
          {sponsorEmploymentData.length > 0 ? (
            <BarChart data={sponsorEmploymentData} />
          ) : (
            <div className="text-slate-400 text-sm text-center py-8">No employment data by sponsor</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Loan Graduate Detail</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Graduate</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Program</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Lender</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Amount</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Repayment</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Employment</th>
              </tr>
            </thead>
            <tbody>
              {loanGrads.map((g, i) => {
                const repaymentColors: Record<string, string> = {
                  pending: 'bg-amber-100 text-amber-700',
                  in_progress: 'bg-blue-100 text-blue-700',
                  completed: 'bg-emerald-100 text-emerald-700',
                  defaulted: 'bg-red-100 text-red-700',
                };
                const empColors: Record<string, string> = {
                  employed: 'bg-emerald-100 text-emerald-700',
                  self_employed: 'bg-blue-100 text-blue-700',
                  unemployed: 'bg-red-100 text-red-700',
                  further_study: 'bg-amber-100 text-amber-700',
                  not_seeking: 'bg-slate-100 text-slate-600',
                };
                return (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-800">{g.first_name} {g.last_name}</div>
                      <div className="text-xs text-slate-400">{g.graduate_id}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{g.university_program || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{g.sponsor_name || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">${(g.loan_amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${repaymentColors[g.repayment_status] || 'bg-slate-100 text-slate-600'}`}>
                        {(g.repayment_status || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${empColors[g.employment_status] || 'bg-slate-100 text-slate-600'}`}>
                        {(g.employment_status || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
