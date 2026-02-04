import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AlertCircle, CheckCircle, Copy } from 'lucide-react';

const CreateCharge = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    payer_cpf: '',
    payer_name: '',
    payer_email: '',
    external_reference: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({ ...prev, payer_cpf: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/charges', {
        ...formData,
        amount: parseFloat(formData.amount)
      });

      setSuccess(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar cobrança');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Cobrança Criada!</h2>
            <p className="text-gray-600 mt-2">A cobrança PIX foi criada com sucesso</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Valor</span>
                <span className="text-lg font-bold text-gray-900">R$ {success.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Taxa</span>
                <span className="text-sm text-gray-900">R$ {success.fee_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-600">Você receberá</span>
                <span className="text-lg font-bold text-green-600">R$ {success.net_amount.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="label">Link de Pagamento</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={success.checkout_url}
                  readOnly
                  className="input flex-1"
                />
                <button
                  onClick={() => copyToClipboard(success.checkout_url)}
                  className="btn-secondary"
                  title="Copiar link"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>

            {success.qr_code && (
              <div>
                <label className="label">Código PIX</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={success.qr_code}
                    readOnly
                    className="input flex-1 font-mono text-xs"
                  />
                  <button
                    onClick={() => copyToClipboard(success.qr_code)}
                    className="btn-secondary"
                    title="Copiar código"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => navigate('/charges')}
              className="flex-1 btn-secondary"
            >
              Ver Cobranças
            </button>
            <button
              onClick={() => window.open(success.checkout_url, '_blank')}
              className="flex-1 btn-primary"
            >
              Abrir Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nova Cobrança</h1>
        <p className="text-gray-600 mt-1">Crie uma nova cobrança PIX</p>
      </div>

      <div className="card">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Valor (R$) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div>
              <label className="label">Referência Externa</label>
              <input
                type="text"
                name="external_reference"
                value={formData.external_reference}
                onChange={handleChange}
                className="input"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div>
            <label className="label">Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows="3"
              placeholder="Descrição do pagamento"
            />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-4">Dados do Pagador</h3>

            <div className="space-y-4">
              <div>
                <label className="label">Nome Completo *</label>
                <input
                  type="text"
                  name="payer_name"
                  value={formData.payer_name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">CPF *</label>
                  <input
                    type="text"
                    name="payer_cpf"
                    value={formData.payer_cpf}
                    onChange={handleCPFChange}
                    className="input"
                    placeholder="000.000.000-00"
                    maxLength="14"
                    required
                  />
                </div>

                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    name="payer_email"
                    value={formData.payer_email}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/charges')}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando...' : 'Criar Cobrança'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCharge;
