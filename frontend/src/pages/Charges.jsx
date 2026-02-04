import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, Search, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Charges = () => {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    loadCharges();
  }, [filter, pagination.page]);

  const loadCharges = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await api.get('/charges', { params });
      setCharges(response.data.data);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error('Failed to load charges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-purple-100 text-purple-800'
    };

    const labels = {
      approved: 'Aprovado',
      pending: 'Pendente',
      rejected: 'Rejeitado',
      cancelled: 'Cancelado',
      refunded: 'Estornado'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cobranças</h1>
          <p className="text-gray-600 mt-1">Gerencie suas cobranças PIX</p>
        </div>
        <Link to="/charges/new" className="btn-primary inline-flex items-center justify-center space-x-2">
          <Plus size={20} />
          <span>Nova Cobrança</span>
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar cobranças..."
              className="input pl-10"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input sm:w-48"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
            <option value="cancelled">Cancelado</option>
            <option value="refunded">Estornado</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : charges.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Referência</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Pagador</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Valor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Líquido</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.map((charge) => (
                    <tr key={charge.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                        {charge.external_reference || charge.id.substring(0, 8)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {charge.payer_name || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                        R$ {charge.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-green-600 font-medium">
                        R$ {charge.net_amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(charge.status)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {format(new Date(charge.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={`${window.location.origin}/checkout/${charge.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tomato-600 hover:text-tomato-700"
                          title="Ver checkout"
                        >
                          <ExternalLink size={18} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.pages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhuma cobrança encontrada</p>
            <Link to="/charges/new" className="btn-primary inline-flex items-center space-x-2">
              <Plus size={20} />
              <span>Criar primeira cobrança</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Charges;
