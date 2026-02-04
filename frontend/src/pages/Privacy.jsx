import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center space-x-2 text-tomato-600 hover:text-tomato-700 mb-6">
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </Link>

        <div className="card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-tomato-100 rounded-full mb-4">
              <Shield className="text-tomato-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
            <p className="text-gray-600 mt-2">Última atualização: Janeiro de 2026</p>
            <p className="text-sm text-gray-600 mt-1">Em conformidade com a LGPD (Lei 13.709/2018)</p>
          </div>

          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introdução</h2>
              <p className="text-gray-700 leading-relaxed">
                O TomatePay está comprometido com a proteção da privacidade e dos dados pessoais de seus 
                usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e 
                protegemos suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados 
                (LGPD - Lei 13.709/2018).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Dados Coletados</h2>
              <p className="text-gray-700 leading-relaxed mb-3">Coletamos os seguintes tipos de dados:</p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1. Dados de Cadastro do Lojista</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Nome completo</li>
                <li>Email</li>
                <li>CPF</li>
                <li>Senha (armazenada de forma criptografada)</li>
                <li>Token de acesso do Mercado Pago (opcional)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2. Dados de Transações</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Informações de cobranças criadas</li>
                <li>Valores das transações</li>
                <li>Status de pagamentos</li>
                <li>Dados dos pagadores (CPF, nome, email)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3. Dados de Uso</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Endereço IP</li>
                <li>User-agent do navegador</li>
                <li>Logs de acesso à API</li>
                <li>Histórico de ações na plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Finalidade do Tratamento de Dados</h2>
              <p className="text-gray-700 leading-relaxed mb-3">Utilizamos seus dados para:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Criar e gerenciar sua conta de lojista</li>
                <li>Processar cobranças PIX via Mercado Pago</li>
                <li>Enviar notificações sobre transações</li>
                <li>Gerar relatórios e análises</li>
                <li>Prevenir fraudes e garantir a segurança da plataforma</li>
                <li>Cumprir obrigações legais e regulatórias</li>
                <li>Melhorar nossos serviços</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Base Legal para Tratamento</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                O tratamento de dados pessoais é realizado com base nas seguintes hipóteses legais da LGPD:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Execução de contrato:</strong> Para fornecer os serviços contratados</li>
                <li><strong>Consentimento:</strong> Quando você aceita nossos termos e política</li>
                <li><strong>Obrigação legal:</strong> Para cumprimento de obrigações fiscais e regulatórias</li>
                <li><strong>Legítimo interesse:</strong> Para prevenção de fraudes e segurança</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Compartilhamento de Dados</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Seus dados podem ser compartilhados com:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Mercado Pago:</strong> Para processamento de pagamentos PIX</li>
                <li><strong>Autoridades:</strong> Quando exigido por lei ou ordem judicial</li>
                <li><strong>Prestadores de serviço:</strong> Que auxiliam na operação da plataforma (hospedagem, etc.)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                <strong>Importante:</strong> Não vendemos, alugamos ou compartilhamos seus dados pessoais 
                para fins de marketing sem seu consentimento explícito.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Armazenamento e Segurança</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Implementamos medidas técnicas e organizacionais para proteger seus dados:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Criptografia de senhas usando bcrypt</li>
                <li>Comunicação via HTTPS</li>
                <li>Controle de acesso baseado em autenticação JWT</li>
                <li>Logs de auditoria de todas as ações</li>
                <li>Backups regulares do banco de dados</li>
                <li>Limitação de taxa de requisições (rate limiting)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Os dados são armazenados em servidores seguros e mantidos pelo tempo necessário para 
                cumprir as finalidades descritas ou conforme exigido por lei.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Seus Direitos (LGPD)</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                De acordo com a LGPD, você tem direito a:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Confirmação:</strong> Saber se tratamos seus dados pessoais</li>
                <li><strong>Acesso:</strong> Obter cópia dos seus dados</li>
                <li><strong>Correção:</strong> Solicitar correção de dados incompletos ou incorretos</li>
                <li><strong>Anonimização:</strong> Solicitar anonimização de dados desnecessários</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Eliminação:</strong> Solicitar exclusão de dados tratados com seu consentimento</li>
                <li><strong>Revogação:</strong> Revogar consentimento a qualquer momento</li>
                <li><strong>Oposição:</strong> Se opor ao tratamento em certas situações</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Retenção de Dados</h2>
              <p className="text-gray-700 leading-relaxed">
                Mantemos seus dados pessoais pelo tempo necessário para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Fornecer os serviços contratados</li>
                <li>Cumprir obrigações legais (mínimo de 5 anos para dados fiscais)</li>
                <li>Resolver disputas e fazer cumprir nossos acordos</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Após o período de retenção, os dados serão eliminados ou anonimizados de forma segura.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cookies e Tecnologias Similares</h2>
              <p className="text-gray-700 leading-relaxed">
                Utilizamos cookies essenciais para o funcionamento da plataforma, como tokens de 
                autenticação. Não utilizamos cookies de rastreamento ou publicidade de terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Transferência Internacional</h2>
              <p className="text-gray-700 leading-relaxed">
                Seus dados são armazenados em servidores localizados no Brasil. Caso seja necessária 
                transferência internacional, garantiremos que o país de destino oferece nível adequado 
                de proteção de dados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Menores de Idade</h2>
              <p className="text-gray-700 leading-relaxed">
                Nossos serviços não são destinados a menores de 18 anos. Não coletamos intencionalmente 
                dados de menores. Se tomarmos conhecimento de coleta inadvertida, excluiremos os dados 
                imediatamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Alterações nesta Política</h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre 
                alterações significativas através do email cadastrado ou aviso na plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Encarregado de Dados (DPO)</h2>
              <p className="text-gray-700 leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados, entre em 
                contato com nosso Encarregado de Proteção de Dados:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <p className="text-gray-700">
                  <strong>Email:</strong> <a href="mailto:dpo@tomatepay.com" className="text-tomato-600 hover:text-tomato-700">dpo@tomatepay.com</a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Autoridade Nacional</h2>
              <p className="text-gray-700 leading-relaxed">
                Você também pode apresentar reclamações à Autoridade Nacional de Proteção de Dados (ANPD):
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <p className="text-gray-700">
                  <strong>Site:</strong> <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-tomato-600 hover:text-tomato-700">www.gov.br/anpd</a>
                </p>
              </div>
            </section>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
              <p className="text-sm text-green-800 text-center">
                <strong>Compromisso com a Privacidade:</strong> O TomatePay está comprometido com a 
                proteção dos seus dados pessoais e o cumprimento integral da LGPD.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
