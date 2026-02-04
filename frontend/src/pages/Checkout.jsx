import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Checkout = () => {
  const { id } = useParams();
  const [charge, setCharge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadCharge();
    const interval = setInterval(loadCharge, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const loadCharge = async () => {
    try {
      const response = await api.get(`/public/charges/${id}`);
      setCharge(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Cobrança não encontrada');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tomato-50 to-orange-50">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tomato-50 to-orange-50 px-4">
        <div className="max-w-md w-full card text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <XCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/" className="btn-primary inline-block">
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const getStatusDisplay = () => {
    switch (charge.status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          title: 'Pagamento Aprovado!',
          message: 'Seu pagamento foi confirmado com sucesso.'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          title: 'Aguardando Pagamento',
          message: 'Escaneie o QR Code ou copie o código PIX para pagar.'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          title: 'Pagamento Rejeitado',
          message: 'O pagamento foi rejeitado. Entre em contato com o vendedor.'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          title: 'Pagamento Cancelado',
          message: 'Esta cobrança foi cancelada.'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          title: 'Status Desconhecido',
          message: 'Entre em contato com o vendedor.'
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-tomato-50 to-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-tomato-600 rounded-full mb-4">
            <span className="text-4xl">🍅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">TomatePay</h1>
          <p className="text-gray-600 mt-1">Checkout Seguro</p>
        </div>

        <div className="card mb-6">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${statusDisplay.bg} rounded-full mb-4`}>
              <StatusIcon className={statusDisplay.color} size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{statusDisplay.title}</h2>
            <p className="text-gray-600 mt-2">{statusDisplay.message}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Valor a Pagar</span>
              <span className="text-3xl font-bold text-gray-900">
                R$ {charge.amount.toFixed(2)}
              </span>
            </div>
            {charge.description && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Descrição</span>
                <span className="text-gray-900">{charge.description}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Lojista</span>
              <span className="text-gray-900">{charge.merchant_name}</span>
            </div>
          </div>

          {charge.status === 'pending' && charge.qr_code && (
            <>
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                  <QRCodeSVG value={charge.qr_code} size={256} level="H" />
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Escaneie o QR Code com o app do seu banco
                </p>
              </div>

              <div className="mb-6">
                <label className="label">Ou copie o código PIX</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={charge.qr_code}
                    readOnly
                    className="input flex-1 font-mono text-xs"
                  />
                  <button
                    onClick={() => copyToClipboard(charge.qr_code)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {charge.expires_at && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Atenção:</strong> Este código PIX expira em{' '}
                    {format(new Date(charge.expires_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              )}
            </>
          )}

          {charge.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 text-center">
                Pagamento confirmado! Você receberá um comprovante por email.
              </p>
            </div>
          )}
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">MP</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Pagamento Seguro</h3>
              <p className="text-sm text-blue-800">
                Pagamentos processados via <span className="font-bold">Mercado Pago</span>.
                Seus dados estão protegidos e a transação é 100% segura.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-gray-500 space-x-4">
          <Link to="/terms" className="hover:text-gray-700">Termos de Uso</Link>
          <Link to="/privacy" className="hover:text-gray-700">Política de Privacidade</Link>
        </div>

        <div className="text-center mt-4 text-xs text-gray-400">
          <p>Powered by TomatePay • Mercado Pago</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
