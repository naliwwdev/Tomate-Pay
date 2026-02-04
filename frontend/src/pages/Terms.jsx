import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center space-x-2 text-tomato-600 hover:text-tomato-700 mb-6">
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </Link>

        <div className="card">
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 inline-block">🍅</span>
            <h1 className="text-3xl font-bold text-gray-900">Termos de Uso</h1>
            <p className="text-gray-600 mt-2">Última atualização: Janeiro de 2026</p>
          </div>

          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Sobre o TomatePay</h2>
              <p className="text-gray-700 leading-relaxed">
                O TomatePay é uma plataforma intermediadora de pagamentos que facilita a criação e gestão 
                de cobranças PIX. <strong>Importante:</strong> O TomatePay não processa pagamentos diretamente. 
                Todos os pagamentos são processados via <strong>Mercado Pago</strong>, que é responsável 
                pela segurança e processamento das transações financeiras.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Aceitação dos Termos</h2>
              <p className="text-gray-700 leading-relaxed">
                Ao utilizar o TomatePay, você concorda com estes Termos de Uso e com os termos do 
                Mercado Pago. Se você não concorda com qualquer parte destes termos, não deve utilizar 
                nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Serviços Oferecidos</h2>
              <p className="text-gray-700 leading-relaxed mb-3">O TomatePay oferece:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Criação de cobranças PIX via API do Mercado Pago</li>
                <li>Painel de gestão para lojistas</li>
                <li>Checkout customizado com branding TomatePay</li>
                <li>Relatórios e análises de transações</li>
                <li>Webhooks para notificação de pagamentos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Processamento de Pagamentos</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>Todos os pagamentos são processados exclusivamente pelo Mercado Pago.</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>O TomatePay não armazena dados de cartão de crédito ou informações bancárias</li>
                <li>O TomatePay não tem acesso aos fundos das transações</li>
                <li>Todas as transações seguem as políticas e termos do Mercado Pago</li>
                <li>Disputas e estornos devem ser tratados diretamente com o Mercado Pago</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Taxas e Tarifas</h2>
              <p className="text-gray-700 leading-relaxed">
                O TomatePay cobra uma taxa de intermediação sobre cada transação aprovada. A taxa padrão 
                é de 2,5%, mas pode ser configurada individualmente para cada lojista. Esta taxa é adicional 
                às taxas cobradas pelo Mercado Pago.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Responsabilidades do Lojista</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Fornecer informações precisas e atualizadas</li>
                <li>Manter a segurança de suas credenciais de acesso</li>
                <li>Cumprir todas as leis aplicáveis ao seu negócio</li>
                <li>Não utilizar o serviço para atividades ilegais ou fraudulentas</li>
                <li>Informar corretamente os dados dos pagadores</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitação de Responsabilidade</h2>
              <p className="text-gray-700 leading-relaxed">
                O TomatePay não se responsabiliza por:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Falhas no processamento de pagamentos pelo Mercado Pago</li>
                <li>Disputas entre lojistas e compradores</li>
                <li>Perdas financeiras decorrentes de uso indevido da plataforma</li>
                <li>Interrupções temporárias do serviço para manutenção</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacidade e Proteção de Dados</h2>
              <p className="text-gray-700 leading-relaxed">
                O TomatePay está comprometido com a proteção de dados pessoais em conformidade com a 
                Lei Geral de Proteção de Dados (LGPD). Para mais informações, consulte nossa 
                <Link to="/privacy" className="text-tomato-600 hover:text-tomato-700 font-medium"> Política de Privacidade</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modificações dos Termos</h2>
              <p className="text-gray-700 leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações 
                entrarão em vigor imediatamente após a publicação. O uso continuado dos serviços após 
                as alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Encerramento de Conta</h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos suspender ou encerrar sua conta se houver violação destes termos, atividade 
                suspeita ou fraudulenta, ou por qualquer outro motivo que consideremos apropriado.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Lei Aplicável</h2>
              <p className="text-gray-700 leading-relaxed">
                Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa 
                será resolvida nos tribunais brasileiros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contato</h2>
              <p className="text-gray-700 leading-relaxed">
                Para dúvidas sobre estes termos, entre em contato através do email: 
                <a href="mailto:contato@tomatepay.com" className="text-tomato-600 hover:text-tomato-700 font-medium"> contato@tomatepay.com</a>
              </p>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <p className="text-sm text-blue-800 text-center">
                <strong>Lembre-se:</strong> Todos os pagamentos são processados via 
                <span className="font-bold"> Mercado Pago</span>. O TomatePay atua exclusivamente 
                como intermediador de pagamentos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
