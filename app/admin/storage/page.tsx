'use client';

import { useAdmin } from '../layout-client';
import { StorageTab } from '../components/storage-tab';

export default function AdminStoragePage() {
  const context = useAdmin();
  if (!context) return null;
  const { showToast } = context;

  return <StorageTab showToast={showToast} />;
}
