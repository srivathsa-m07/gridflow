import React from 'react';
import { TopologyView } from '../components/TopologyView';
import { InfrastructurePanel } from '../components/InfrastructurePanel';
import { AgentData, IncidentData } from '../types';

interface TopologyPageProps {
  agents: AgentData[];
  incidents: IncidentData[];
}

export const TopologyPage: React.FC<TopologyPageProps> = ({ agents, incidents }) => {
  return (
    <div className="space-y-5">
      <TopologyView agents={agents} incidents={incidents} />
      <InfrastructurePanel agents={agents} />
    </div>
  );
};
