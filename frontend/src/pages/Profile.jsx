import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { AlertCircle, CheckCircle, Key } from 'lucide-react';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mercadopago_access_token: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updateData = {};
      if (formData.name !== user?.name) {
        updateData.name = formData.name;
      }
      if (formData.mercadopago_access_token) {
        updateData.mercadopago_access_token = formData.mercadopago_access_token;
      }

      if (Object.keys(updateData).length === 0) {
        setError('Nenhuma alteração foi feita');
        setLoading(false);
        return;
      }

      await api.put('/auth/profile', updateData);
      setSuccess('Perfil atualizado com sucesso!');
      await refreshUser();
      setFormData(prev => ({ ...prev, mercadopago_access_token: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
        <p className="text-gray-600 mt-1">Gerencie suas informações e configurações</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Informações da Conta</h2>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-sm text-green-800">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={user?.email}
              className="input bg-gray-50"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
          </div>

          <div>
            <label className="label">CPF</label>
            <input
              type="text"
              value={user?.cpf}
              className="input bg-gray-50"
              disabled
            />
          </div>

          <div>
            <label className="label">Taxa de Processamento</label>
            <input
              type="text"
              value={`${user?.fee_percentage}%`}
              className="input bg-gray-50"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
              Taxa cobrada por transação aprovada
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Key size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Integração Mercado Pago</h3>
            </div>

            <div>
              <label className="label">Access Token do Mercado Pago</label>
              <input
                type="password"
                name="mercadopago_access_token"
                value={formData.mercadopago_access_token}
                onChange={handleChange}
                className="input"
                placeholder="APP_USR-..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Configure seu próprio token do Mercado Pago para receber os pagamentos diretamente.
                Deixe em branco para usar o token padrão da plataforma.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Informação Importante</h3>
        <p className="text-sm text-blue-800">
          Todos os pagamentos são processados via <span className="font-bold">Mercado Pago</span>.
          O TomatePay atua como intermediador, facilitando a criação e gestão de cobranças PIX.
        </p>
      </div>
    </div>
  );
};

export default Profile;
