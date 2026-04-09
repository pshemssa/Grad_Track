import { useEffect, useState } from 'react';
import { BookOpen, Clock, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Graduate, calcMonthsToEmployment } from '../lib/types';
import BarChart from './charts/BarChart';

const CHART_COLORS = ['#0891b2', '#0e7490', '#155e75', '#164e63', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe'];

export default function Programs() {
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

  const programCounts = graduates.reduce<Record<string, number>>((acc, g) => {
    const p = g.university_program || 'Unknown';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  const enrollmentData = Object.entries(programCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({ label, value, color: CHART_COLORS[i % CHART_COLORS.length] }));

  const programMonths: Record<string, number[]> = {};
  graduates.forEach(g => {
    if (!g.university_program) return;
    const m = calcMonthsToEmployment(g.graduation_year, g.employment_date);
    if (m !== null) {
      if (!programMonths[g.university_program]) programMonths[g.university_program] = [];
      programMonths[g.university_program].push(m);
    }
  });

  const avgMonthsData = Object.entries(programMonths)
    .map(([label, months]) => ({
      label,
      value: Math.round(months.reduce((a, b) => a + b, 0) / months.length),
    }))
    .sort((a, b) => a.value - b.value)
    .map((item, i) => ({ ...item, color: CHART_COLORS[i % CHART_COLORS.length] }));

  const programStats = Object.entries(programCounts).map(([program, count]) => {
    const grads = graduates.filter(g => g.university_program === program);
    const completed = grads.filter(g => g.completion_status === 'completed').length;
    const employed = grads.filter(g => ['employed', 'self_employed'].includes(g.employment_status)).length;
    const months = grads
      .map(g => calcMonthsToEmployment(g.graduation_year, g.employment_date))
      .filter((m): m is number => m !== null);
    const avgTime = months.length > 0 ? Math.round(months.reduce((a, b) => a + b, 0) / months.length) : null;
    return { program, count, completed, employed, avgTime };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Programs</h1>
        <p className="text-slate-500 text-sm mt-1">Enrollment and employment metrics by academic program</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={16} className="text-cyan-600" />
            <h2 className="font-semibold text-slate-800">Enrollment by Program</h2>
            <span className="text-xs text-slate-400 ml-auto">(most popular first)</span>
          </div>
          <BarChart data={enrollmentData} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={16} className="text-cyan-600" />
            <h2 className="font-semibold text-slate-800">Avg. Months to Employment</h2>
            <span className="text-xs text-slate-400 ml-auto">by program</span>
          </div>
          {avgMonthsData.length > 0 ? (
            <BarChart data={avgMonthsData} unit=" mo" />
          ) : (
            <div className="text-slate-400 text-sm text-center py-8">No employment data available</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <BookOpen size={16} className="text-cyan-600" />
          <h2 className="font-semibold text-slate-800">Program Summary Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Program</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Enrolled</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Completed</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Employed</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Employment Rate</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Avg. Time to Job</th>
              </tr>
            </thead>
            <tbody>
              {programStats.map((row, i) => {
                const empRate = row.completed > 0 ? Math.round((row.employed / row.completed) * 100) : 0;
                return (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">{row.program}</td>
                    <td className="px-4 py-3 text-center text-slate-700">{row.count}</td>
                    <td className="px-4 py-3 text-center text-slate-700">{row.completed}</td>
                    <td className="px-4 py-3 text-center text-slate-700">{row.employed}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        empRate >= 70 ? 'bg-emerald-100 text-emerald-700' :
                        empRate >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {empRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {row.avgTime !== null ? `${row.avgTime} mo` : '—'}
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
