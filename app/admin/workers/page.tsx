'use client';

import { useAdmin } from '../layout-client';
import { WorkersTab } from '../components/workers-tab';

export default function AdminWorkersPage() {
  const context = useAdmin();
  if (!context) return null;
  const { showToast } = context;

  return <WorkersTab showToast={showToast} />;
}
