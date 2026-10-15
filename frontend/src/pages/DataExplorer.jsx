import { useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, Download, Search } from 'lucide-react';
import { fetchRecords } from '../services/api';
import { LoadingSpinner, ErrorBanner, EmptyState } from '../components/StatusComponents';
import { fmt } from '../utils/format';

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const PAGE_SIZES = [25, 50, 100];

function SortIcon({ column, sortBy, ascending }) {
  if (sortBy !== column) return <span className="text-slate-300">↕</span>;
  return ascending ? <ChevronUp size={14} className="text-teal-500" />
                   : <ChevronDown size={14} className="text-teal-500" />;
}

export default function DataExplorer() {
  const [startYear,   setStartYear]   = useState('');
  const [endYear,     setEndYear]     = useState('');
  const [subdivision, setSubdivision] = useState('');
  const [page,        setPage]        = useState(0);
  const [pageSize,    setPageSize]    = useState(50);
  const [sortBy,      setSortBy]      = useState('year');
  const [ascending,   setAscending]   = useState(true);
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  const filters = {
    startYear: startYear || undefined,
    endYear:   endYear   || undefined,
    subdivision: subdivision || undefined,
  };

  const load = useCallback(async (p = 0) => {
    setLoading(true); setError(null);
    try {
      const res = await fetchRecords(filters, p, pageSize, sortBy, ascending);
      setData(res);
      setPage(p);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startYear, endYear, subdivision, pageSize, sortBy, ascending]);

  const handleSort = (col) => {
    if (sortBy === col) setAscending(a => !a);
    else { setSortBy(col); setAscending(true); }
  };

  // CSV export of current page
  function exportCSV() {
    if (!data?.records?.length) return;
    const headers = ['SUBDIVISION','YEAR',...MONTHS,'ANNUAL','Jan-Feb','Mar-May','Jun-Sep','Oct-Dec'];
    const rows = data.records.map(r => [
      r.subdivision, r.year,
      r.jan, r.feb, r.mar, r.apr, r.may, r.jun, r.jul, r.aug, r.sep, r.oct, r.nov, r.dec,
      r.annual, r.janFeb, r.marMay, r.junSep, r.octDec,
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'rainfall_export.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const records    = data?.records    || [];
  const totalPages = data?.totalPages || 0;
  const totalCount = data?.totalCount || 0;

  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Data Explorer</h1>
        <p className="text-slate-500 text-sm mt-1">
          Browse, search, sort, and export the raw rainfall dataset
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Start Year</label>
            <input id="explorer-start" type="number" min="1901" max="2015"
                   value={startYear} onChange={e => setStartYear(e.target.value)}
                   placeholder="1901" className="form-input w-28" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">End Year</label>
            <input id="explorer-end" type="number" min="1901" max="2015"
                   value={endYear} onChange={e => setEndYear(e.target.value)}
                   placeholder="2015" className="form-input w-28" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Subdivision contains</label>
            <input id="explorer-subdivision" type="text"
                   value={subdivision} onChange={e => setSubdivision(e.target.value)}
                   placeholder="e.g. Kerala" className="form-input w-48" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Rows per page</label>
            <select id="explorer-page-size" value={pageSize}
                    onChange={e => setPageSize(+e.target.value)} className="form-input w-24">
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button id="explorer-search-btn" className="btn btn-primary" onClick={() => load(0)}>
            <Search size={15} /> Search
          </button>
          <button id="explorer-export-btn" className="btn btn-ghost" onClick={exportCSV}
                  disabled={!records.length}>
            <Download size={15} /> Export CSV
          </button>
        </div>
        {totalCount > 0 && !loading && (
          <p className="text-xs text-slate-400 mt-3">
            {totalCount.toLocaleString('en-IN')} records found
          </p>
        )}
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {!data && (
            <div className="card text-center text-slate-400 py-16">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Use the filters above and click <strong>Search</strong> to load records.</p>
            </div>
          )}

          {data && records.length === 0 && <EmptyState />}

          {records.length > 0 && (
            <div className="card overflow-x-auto p-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-slate-50 cursor-pointer whitespace-nowrap"
                        onClick={() => handleSort('subdivision')}>
                      <span className="flex items-center gap-1">
                        Subdivision <SortIcon column="subdivision" sortBy={sortBy} ascending={ascending} />
                      </span>
                    </th>
                    <th className="cursor-pointer" onClick={() => handleSort('year')}>
                      <span className="flex items-center gap-1">
                        Year <SortIcon column="year" sortBy={sortBy} ascending={ascending} />
                      </span>
                    </th>
                    {MONTHS.map(m => <th key={m}>{m}</th>)}
                    <th className="cursor-pointer" onClick={() => handleSort('annual')}>
                      <span className="flex items-center gap-1">
                        Annual <SortIcon column="annual" sortBy={sortBy} ascending={ascending} />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i}>
                      <td className="sticky left-0 bg-white font-medium text-slate-600 whitespace-nowrap">
                        {r.subdivision}
                      </td>
                      <td className="font-mono text-slate-500">{r.year}</td>
                      {[r.jan,r.feb,r.mar,r.apr,r.may,r.jun,r.jul,r.aug,r.sep,r.oct,r.nov,r.dec].map((v, mi) => (
                        <td key={mi} className="text-right text-slate-600 font-mono">{fmt(v, 1)}</td>
                      ))}
                      <td className="text-right font-semibold text-teal-700 font-mono">
                        {fmt(r.annual, 1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs text-slate-400">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button id="explorer-prev-btn" className="btn btn-ghost py-1.5 text-xs"
                        onClick={() => load(page - 1)} disabled={page === 0}>
                  ← Prev
                </button>
                {/* Page number buttons (show up to 5 around current) */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p0 = Math.max(0, Math.min(page - 2, totalPages - 5));
                  const n  = p0 + i;
                  return (
                    <button key={n}
                            className={`btn py-1.5 px-3 text-xs ${n === page ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => load(n)}>
                      {n + 1}
                    </button>
                  );
                })}
                <button id="explorer-next-btn" className="btn btn-ghost py-1.5 text-xs"
                        onClick={() => load(page + 1)} disabled={page >= totalPages - 1}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-slate-400 mt-6">
        All rainfall values in millimetres (mm). Source: India Meteorological Department, data.gov.in.
      </p>
    </div>
  );
}
