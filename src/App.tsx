import { useState } from 'react';
import Layout, { Page } from './components/Layout';
import Dashboard from './components/Dashboard';
import GraduateList from './components/GraduateList';
import AddGraduate from './components/AddGraduate';
import Programs from './components/Programs';
import Analytics from './components/Analytics';
import Funding from './components/Funding';
import GraduateDetails from './components/GraduateDetails';
import { Graduate } from './lib/types';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [editGraduate, setEditGraduate] = useState<Graduate | null>(null);
  const [selectedGraduate, setSelectedGraduate] = useState<Graduate | null>(null);

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

  return (
    <Layout page={page} onNavigate={(p) => { setEditGraduate(null); setSelectedGraduate(null); setPage(p); }}>
      {renderPage()}
    </Layout>
  );
}
