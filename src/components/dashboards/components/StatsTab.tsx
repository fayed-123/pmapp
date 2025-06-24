
import React from 'react';
import { Card } from '@/components/ui/card';
import { loadProjects } from '@/lib/db';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatsTab: React.FC = () => {
  return (
    <div>
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <i className="fa fa-chart-bar" /> إحصائيات عامة المشاريع
      </h3>
      <Card className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={loadProjects().map(p => ({
              name: p.name,
              completion: p.completion || 0,
              timeElapsed: p.timeElapsed || 0,
              performance: parseFloat(p.performance?.toString() || "0")
            }))}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completion" name="نسبة الانجاز" fill="#6366f1" />
            <Bar dataKey="timeElapsed" name="الوقت المنقضي (أيام)" fill="#facc15" />
            <Bar dataKey="performance" name="مؤشر الأداء" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default StatsTab;
