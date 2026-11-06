'use client';

import { useAdmin } from '../layout-client';
import { AiGovernanceTab } from '../components/ai-governance-tab';

export default function AdminAiGovernancePage() {
  const context = useAdmin();
  if (!context) return null;
  const { showToast } = context;

  return <AiGovernanceTab showToast={showToast} />;
}
