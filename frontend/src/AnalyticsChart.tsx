import React from 'react';
import type { Incident } from './types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface Props {
  incidents: Incident[];
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

const STATUS_COLORS: Record<string, string> = {
  'Açık': '#ef4444',
  'İşlemde': '#f59e0b',
  'Çözüldü': '#10b981',
  'Kapatıldı': '#94a3b8',
};

export const AnalyticsChart: React.FC<Props> = ({ incidents }) => {
  const priorityData = [
    { name: 'Low', count: incidents.filter(i => i.priority === 'LOW').length, fill: PRIORITY_COLORS.LOW },
    { name: 'Medium', count: incidents.filter(i => i.priority === 'MEDIUM').length, fill: PRIORITY_COLORS.MEDIUM },
    { name: 'High', count: incidents.filter(i => i.priority === 'HIGH').length, fill: PRIORITY_COLORS.HIGH },
    { name: 'Critical', count: incidents.filter(i => i.priority === 'CRITICAL').length, fill: PRIORITY_COLORS.CRITICAL },
  ];

  const statusData = [
    { name: 'Açık', value: incidents.filter(i => i.status === 'OPEN').length },
    { name: 'İşlemde', value: incidents.filter(i => i.status === 'IN_PROGRESS').length },
    { name: 'Çözüldü', value: incidents.filter(i => i.status === 'RESOLVED').length },
    { name: 'Kapatıldı', value: incidents.filter(i => i.status === 'CLOSED').length },
  ].filter(d => d.value > 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
      {/* Çubuk Öncelik */}
      <div className="dash-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
          Öncelik Seviyeleri
        </h4>
        <div style={{ width: '100%', height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Durum */}
      <div className="dash-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
          Çözüm Durum Dağılımı
        </h4>
        <div style={{ width: '100%', height: '180px' }}>
          {statusData.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '13px' }}>
              Henüz veri yok
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};