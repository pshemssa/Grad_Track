import { useEffect, useState } from 'react';
import Layout, { Page } from './components/Layout';
import Dashboard from './components/Dashboard';
import GraduateList from './components/GraduateList';
import AddGraduate from './components/AddGraduate';
import Programs from './components/Programs';
import Analytics from './components/Analytics';
import Funding from './components/Funding';
import GraduateDetails from './components/GraduateDetails';
import AdminLogin from './components/AdminLogin';
import { adminAuth, AdminUser } from './lib/api';
import { Graduate } from './lib/types';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [editGraduate, setEditGraduate] = useState<Graduate | null>(null);
  const [selectedGraduate, setSelectedGraduate] = useState<Graduate | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    adminAuth.me()
      .then(user => setAdminUser(user))
      .catch(() => {
        adminAuth.clear();
        setAdminUser(null);
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  const handleLogout = () => {
    adminAuth.clear();
    setAdminUser(null);
    setEditGraduate(null);
    setSelectedGraduate(null);
    setPage('dashboard');
  };

  const handleView = (graduate: Graduate) => {
    setSelectedGraduate(graduate);
    setPage('view');
  };

  const handleEdit = (graduate: Graduate) => {
    setEditGraduate(graduate);
    setPage('add');
  };

  const handleAddNew = () => {
    setEditGraduate(null);
    setPage('add');
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'graduates': return <GraduateList onAdd={handleAddNew} onView={handleView} onEdit={handleEdit} />;
      case 'add': return <AddGraduate onSuccess={() => { setEditGraduate(null); setPage('graduates'); }} editGraduate={editGraduate} />;
      case 'view':
        return selectedGraduate
          ? <GraduateDetails graduate={selectedGraduate} onBack={() => setPage('graduates')} onEdit={() => handleEdit(selectedGraduate)} />
          : <Dashboard />;
      case 'programs': return <Programs />;
      case 'analytics': return <Analytics />;
      case 'funding': return <Funding />;
      default: return <Dashboard />;
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-cyan-600" />
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLogin onSuccess={(user) => { setAdminUser(user); setPage('dashboard'); }} />;
  }

  return (
    <Layout page={page} onNavigate={(p) => { setEditGraduate(null); setSelectedGraduate(null); setPage(p); }}>
      <div className="flex justify-end border-b border-slate-200 bg-white px-6 py-3">
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300"
        >
          Sign Out
        </button>
      </div>
      {renderPage()}
    </Layout>
  );
}
