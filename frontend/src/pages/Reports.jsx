import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: ''
  });
  const [summary, setSummary] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.status) params.status = filters.status;

      const response = await api.get('/reports/transactions', { params });
      setTransactions(response.data.data.transactions);
      setSummary(response.data.data.summary);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Referência', 'Pagador', 'Valor', 'Taxa', 'Líquido', 'Status'];
    const rows = transactions.map(t => [
      format(new Date(t.created_at), 'dd/MM/yyyy HH:mm'),
      t.external_reference || t.id,
      t.payer_name || '-',
      t.amount.toFixed(2),
      t.fee_amount.toFixed(2),
      t.net_amount.toFixed(2),
      t.status
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600 mt-1">Análise detalhada das transações</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Data Inicial</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="input"
            />
          </div>
          <div>
            <label className="label">Data Final</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="input"
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
              <option value="cancelled">Cancelado</option>
              <option value="refunded">Estornado</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadReport}
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <p className="text-sm text-gray-600">Valor Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              R$ {summary.total_amount.toFixed(2)}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Total em Taxas</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              R$ {summary.total_fees.toFixed(2)}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Valor Líquido</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              R$ {summary.net_amount.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Transações</h2>
            <button
              onClick={exportToCSV}
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <Download size={20} />
              <span>Exportar CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Referência</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Pagador</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Valor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Taxa</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Líquido</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                      {transaction.external_reference || transaction.id.substring(0, 8)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {transaction.payer_name || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      R$ {transaction.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-red-600">
                      R$ {transaction.fee_amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-green-600 font-medium">
                      R$ {transaction.net_amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        transaction.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status === 'approved' ? 'Aprovado' :
                         transaction.status === 'pending' ? 'Pendente' :
                         transaction.status === 'rejected' ? 'Rejeitado' :
                         transaction.status === 'cancelled' ? 'Cancelado' : 'Estornado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
