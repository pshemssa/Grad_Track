import { useEffect, useState, useCallback } from 'react';
import { Search, Filter, ChevronDown, User, MapPin, Calendar, Briefcase, Pencil, Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { api } from '../lib/api';
import { Graduate, STATUS_COLORS, COMPLETION_COLORS, calcMonthsToEmployment, formatMonths } from '../lib/types';

const PROGRAMS_FILTER = ['All Programs', 'Computer Science', 'Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Business Administration', 'Medicine', 'Law', 'Education', 'Nursing', 'Agriculture'];
const STATUS_FILTER = ['All Statuses', 'employed', 'self_employed', 'further_study', 'unemployed', 'not_seeking'];

interface Props {
  onAdd: () => void;
  onView: (graduate: Graduate) => void;
  onEdit: (graduate: Graduate) => void;
}

export default function GraduateList({ onAdd, onView, onEdit }: Props) {
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGraduates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getGraduates({
        page,
        search,
        status: statusFilter,
        program: programFilter,
      });
      setGraduates(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, programFilter]);

  useEffect(() => { fetchGraduates(); }, [fetchGraduates]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this graduate record? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.deleteGraduate(id);
      fetchGraduates();
    } finally {
      setDeletingId(null);
    }
  };

  const applyFilter = (status: string, program: string) => {
    setStatusFilter(status === 'All Statuses' ? '' : status);
    setProgramFilter(program === 'All Programs' ? '' : program);
    setPage(1);
  };

  const statusLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Graduates</h1>
          <p className="text-slate-500 text-sm mt-1">{total} total records</p>
        </div>
        <button
          onClick={onAdd}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          + Add Graduate
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, program, employer..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${showFilters ? 'border-cyan-500 text-cyan-600 bg-cyan-50' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
          >
            <Filter size={15} />
            Filters
            <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {showFilters && (
          <div className="flex gap-3 pt-1 flex-wrap">
            <select
              value={statusFilter || 'All Statuses'}
              onChange={e => applyFilter(e.target.value, programFilter || 'All Programs')}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {STATUS_FILTER.map(s => <option key={s}>{s}</option>)}
            </select>
            <select
              value={programFilter || 'All Programs'}
              onChange={e => applyFilter(statusFilter || 'All Statuses', e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {PROGRAMS_FILTER.map(p => <option key={p}>{p}</option>)}
            </select>
            {(statusFilter || programFilter) && (
              <button
                onClick={() => applyFilter('All Statuses', 'All Programs')}
                className="text-sm text-red-500 hover:text-red-700 px-2"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
        </div>
      ) : graduates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <User size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No graduates found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {graduates.map(g => {
            const months = calcMonthsToEmployment(g.graduation_year, g.employment_date);
            const statusCls = STATUS_COLORS[g.employment_status] || 'bg-slate-100 text-slate-600';
            const completionCls = COMPLETION_COLORS[g.completion_status] || 'bg-slate-100 text-slate-600';

            return (
              <div key={g.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:border-cyan-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-slate-600 font-semibold text-sm">
                      {g.first_name.charAt(0)}{g.last_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800">{g.first_name} {g.last_name}</span>
                        <span className="text-xs text-slate-400 font-mono">{g.graduate_id}</span>
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">{g.university_program || 'No program'} — {g.degree_level?.toUpperCase()}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{g.university_institution}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 shrink-0">
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusCls}`}>
                        {statusLabel(g.employment_status)}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${completionCls}`}>
                        {statusLabel(g.completion_status)}
                      </span>
                    </div>
                    <div className="flex gap-1 ml-1">
                      <button
                        onClick={() => onView(g)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => onEdit(g)}
                        className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        disabled={deletingId === g.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>Graduated {g.graduation_year || 'N/A'}</span>
                  </div>
                  {g.employer && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={12} />
                      <span>{g.employer}{g.job_role ? ` — ${g.job_role}` : ''}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} />
                    <span>{g.country_of_residence || g.study_country || 'N/A'}</span>
                  </div>
                  {months !== null && (
                    <div className="flex items-center gap-1.5 text-cyan-600 font-medium">
                      <span>Time to job: {formatMonths(months)}</span>
                    </div>
                  )}
                  <div className="ml-auto">
                    <span className="text-slate-400">
                      {g.funding_type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      {g.sponsor_name ? ` (${g.sponsor_name})` : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages} · {total} records
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === p ? 'bg-cyan-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
