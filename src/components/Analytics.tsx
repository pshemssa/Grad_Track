import { useEffect, useState } from 'react';
import { BarChart2, CheckCircle, Globe, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Graduate, calcMonthsToEmployment } from '../lib/types';
import BarChart from './charts/BarChart';
import DonutChart from './charts/DonutChart';

type Tab = 'employment' | 'completion' | 'mobility';
const HOME_COUNTRY = 'rwanda';

function normalizeCountry(value: string | null | undefined) {
  return (value || '').trim().toLowerCase();
}

export default function Analytics() {
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('employment');

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

  const employmentStatusData = [
    { label: 'Employed', value: graduates.filter(g => g.employment_status === 'employed').length, color: '#10b981' },
    { label: 'Self Employed', value: graduates.filter(g => g.employment_status === 'self_employed').length, color: '#3b82f6' },
    { label: 'Further Study', value: graduates.filter(g => g.employment_status === 'further_study').length, color: '#f59e0b' },
    { label: 'Unemployed', value: graduates.filter(g => g.employment_status === 'unemployed').length, color: '#ef4444' },
    { label: 'Not Seeking', value: graduates.filter(g => g.employment_status === 'not_seeking').length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const sectorCounts = graduates
    .filter(g => g.sector)
    .reduce<Record<string, number>>((acc, g) => {
      acc[g.sector] = (acc[g.sector] || 0) + 1;
      return acc;
    }, {});
  const sectorData = Object.entries(sectorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value, color: '#0891b2' }));

  const monthsArr = graduates
    .map(g => calcMonthsToEmployment(g.graduation_year, g.employment_date))
    .filter((m): m is number => m !== null);

  const histogramBuckets = [
    { label: '0-3 mo', min: 0, max: 3 },
    { label: '4-6 mo', min: 4, max: 6 },
    { label: '7-12 mo', min: 7, max: 12 },
    { label: '13-18 mo', min: 13, max: 18 },
    { label: '19-24 mo', min: 19, max: 24 },
    { label: '25+ mo', min: 25, max: Infinity },
  ].map(b => ({
    label: b.label,
    value: monthsArr.filter(m => m >= b.min && m <= b.max).length,
    color: '#0891b2',
  }));

  const completionByProgram = Object.entries(
    graduates.reduce<Record<string, { total: number; completed: number; durations: number[] }>>((acc, g) => {
      const p = g.university_program || 'Unknown';
      if (!acc[p]) acc[p] = { total: 0, completed: 0, durations: [] };
      acc[p].total++;
      if (g.completion_status === 'completed') acc[p].completed++;
      if (g.university_start_year && g.university_end_year) {
        acc[p].durations.push(g.university_end_year - g.university_start_year);
      }
      return acc;
    }, {})
  ).map(([program, stats]) => ({
    program,
    rate: Math.round((stats.completed / stats.total) * 100),
    avgDuration: stats.durations.length > 0 ? Math.round(stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length * 10) / 10 : null,
    total: stats.total,
  })).sort((a, b) => b.rate - a.rate);

  const completionRateData = completionByProgram.map(r => ({
    label: r.program, value: r.rate, color: r.rate >= 80 ? '#10b981' : r.rate >= 60 ? '#f59e0b' : '#ef4444',
  }));

  const abroadByProgram = Object.entries(
    graduates.reduce<Record<string, { total: number; abroad: number }>>((acc, g) => {
      const p = g.university_program || 'Unknown';
      if (!acc[p]) acc[p] = { total: 0, abroad: 0 };
      acc[p].total++;
      if (g.study_location === 'abroad') acc[p].abroad++;
      return acc;
    }, {})
  ).filter(([, v]) => v.abroad > 0)
    .map(([label, v]) => ({
      label, value: v.abroad, color: '#3b82f6',
    }))
    .sort((a, b) => b.value - a.value);

  const returnedHome = graduates.filter(g =>
    g.study_location === 'abroad' &&
    normalizeCountry(g.country_of_residence) === HOME_COUNTRY
  ).length;
  const stayedAbroad = graduates.filter(g =>
    g.study_location === 'abroad' &&
    !!normalizeCountry(g.country_of_residence) &&
    normalizeCountry(g.country_of_residence) !== HOME_COUNTRY
  ).length;
  const abroadUnknown = graduates.filter(g => g.study_location === 'abroad').length - returnedHome - stayedAbroad;

  const mobilityReturnData = [
    { label: 'Stayed Abroad', value: stayedAbroad, color: '#3b82f6' },
    { label: 'Returned Home', value: returnedHome, color: '#10b981' },
    { label: 'Unknown', value: Math.max(0, abroadUnknown), color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'employment', label: 'Employment', icon: BarChart2 },
    { id: 'completion', label: 'Completion', icon: CheckCircle },
    { id: 'mobility', label: 'Mobility', icon: Globe },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Deep dive into employment, academic, and mobility data</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-1.5 flex gap-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'employment' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Employment Status Breakdown</h3>
              <DonutChart data={employmentStatusData} size={160} thickness={28} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Time to Employment Distribution</h3>
              {monthsArr.length > 0 ? (
                <div className="space-y-2">
                  <BarChart data={histogramBuckets} horizontal={false} />
                  <p className="text-xs text-slate-400 text-center mt-2">Months from graduation to first employment</p>
                </div>
              ) : (
                <div className="text-slate-400 text-sm text-center py-8">No time-to-employment data</div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Employment by Sector</h3>
            <BarChart data={sectorData} />
          </div>
        </div>
      )}

      {tab === 'completion' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Completion Rate by Program (%)</h3>
            <BarChart data={completionRateData} unit="%" />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Study Duration vs. Completion</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Program</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600">Students</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600">Completion Rate</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600">Avg. Study Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {completionByProgram.map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-800">{row.program}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{row.total}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex-1 max-w-20 bg-slate-100 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${row.rate}%`, backgroundColor: row.rate >= 80 ? '#10b981' : row.rate >= 60 ? '#f59e0b' : '#ef4444' }}
                            />
                          </div>
                          <span className="text-slate-700 font-medium w-10 text-right">{row.rate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">{row.avgDuration !== null ? `${row.avgDuration} yr` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'mobility' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Study Abroad by Program</h3>
              {abroadByProgram.length > 0 ? (
                <BarChart data={abroadByProgram} />
              ) : (
                <div className="text-slate-400 text-sm text-center py-8">No abroad study data</div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Return vs. Stay Abroad</h3>
              {mobilityReturnData.length > 0 ? (
                <DonutChart data={mobilityReturnData} size={150} thickness={26} />
              ) : (
                <div className="text-slate-400 text-sm text-center py-8">No mobility data</div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Abroad Graduates Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{graduates.filter(g => g.study_location === 'abroad').length}</div>
                <div className="text-xs text-slate-500 mt-1">Total Studied Abroad</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-700">{returnedHome}</div>
                <div className="text-xs text-slate-500 mt-1">Returned Home</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-700">{stayedAbroad}</div>
                <div className="text-xs text-slate-500 mt-1">Remained Abroad</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-slate-700">
                  {graduates.filter(g => g.study_location === 'abroad').length > 0
                    ? Math.round((returnedHome / graduates.filter(g => g.study_location === 'abroad').length) * 100)
                    : 0}%
                </div>
                <div className="text-xs text-slate-500 mt-1">Return Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
