import React from 'react';
import { IncidentPanel } from '../components/IncidentPanel';
import { IncidentData } from '../types';

interface IncidentsPageProps {
  incidents: IncidentData[];
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({ incidents }) => {
  return (
    <div className="max-w-3xl">
      <IncidentPanel incidents={incidents} />
    </div>
  );
};
