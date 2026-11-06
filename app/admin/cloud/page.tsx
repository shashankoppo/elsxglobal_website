'use client';

import { useAdmin } from '../layout-client';
import { CloudTab } from '../components/cloud-tab';

export default function AdminCloudPage() {
  const context = useAdmin();
  if (!context) return null;
  const { showToast } = context;

  return <CloudTab showToast={showToast} />;
}
