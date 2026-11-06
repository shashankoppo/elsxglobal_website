'use client';

import { useAdmin } from '../layout-client';
import { SecurityTab } from '../components/security-tab';

export default function AdminSecurityPage() {
  const context = useAdmin();
  if (!context) return null;
  const { showToast } = context;

  return <SecurityTab showToast={showToast} />;
}
