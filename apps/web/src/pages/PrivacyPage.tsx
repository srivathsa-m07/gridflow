import React from 'react';
import { MarketingShell } from '../components/layout/MarketingShell';
import { H1, Lead } from '../components/ui/Typography';

export const PrivacyPage: React.FC = () => (
  <MarketingShell>
    <section style={{ padding: '64px 0 80px' }}>
      <H1>Privacy Policy</H1>
      <Lead style={{ marginTop: 16, maxWidth: 680 }}>
        GRIDFLOW collects only the telemetry and account data required to operate your monitoring workspace.
        We do not sell customer data. Agent credentials are stored hashed and are never visible after issuance.
      </Lead>
    </section>
  </MarketingShell>
);
