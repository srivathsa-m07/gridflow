import React from 'react';
import { MarketingShell } from '../components/layout/MarketingShell';
import { H1, Lead } from '../components/ui/Typography';

export const TermsPage: React.FC = () => (
  <MarketingShell>
    <section style={{ padding: '64px 0 80px' }}>
      <H1>Terms of Service</H1>
      <Lead style={{ marginTop: 16, maxWidth: 680 }}>
        By using GRIDFLOW you agree to operate agents only on infrastructure you own or are authorized to monitor,
        and to keep issued credentials confidential.
      </Lead>
    </section>
  </MarketingShell>
);
