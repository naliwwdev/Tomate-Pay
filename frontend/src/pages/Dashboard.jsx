import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Receita Total',
      value: `R$ ${data?.summary.total_revenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Receita Líquida',
      value: `R$ ${data?.summary.net_revenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Cobranças Aprovadas',
      value: data?.summary.approved_charges || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Cobranças Pendentes',
      value: data?.summary.pending_charges || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral das suas transações</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hoje</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cobranças</span>
              <span className="font-semibold">{data?.summary.today_charges || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Valor Total</span>
              <span className="font-semibold">R$ {data?.summary.today_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Receita Mensal</h2>
          {data?.monthly_revenue.length > 0 ? (
            <div className="space-y-2">
              {data.monthly_revenue.slice(0, 3).map((month) => (
                <div key={month.month} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">{month.month}</span>
                  <span className="font-semibold">R$ {month.net_amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nenhuma receita ainda</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Cobranças Recentes</h2>
        {data?.recent_charges.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Valor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_charges.map((charge) => (
                  <tr key={charge.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                      {charge.external_reference || charge.id.substring(0, 8)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      R$ {charge.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        charge.status === 'approved' ? 'bg-green-100 text-green-800' :
                        charge.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        charge.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {charge.status === 'approved' ? 'Aprovado' :
                         charge.status === 'pending' ? 'Pendente' :
                         charge.status === 'rejected' ? 'Rejeitado' :
                         charge.status === 'cancelled' ? 'Cancelado' : 'Estornado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {format(new Date(charge.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Nenhuma cobrança ainda</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
