'use client';

import { useAdmin } from '../layout-client';
import { DnsTab } from '../components/dns-tab';

export default function AdminDnsPage() {
  const context = useAdmin();
  if (!context) return null;
  const { showToast } = context;

  return <DnsTab showToast={showToast} />;
}
