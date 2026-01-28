
import React, { useState, useEffect, useCallback } from 'react';
import { 
  AppView, 
  UserRole, 
  Cliente, 
  Estoque, 
  Pedido,
  Movimento 
} from './types';
import { 
  MOCK_CLIENTES, 
  MOCK_ESTOQUE, 
  MOCK_PEDIDOS, 
  COLORS 
} from './constants';
import { Layout } from './components/Layout';
import { MetricCard, StatusBadge } from './components/DashboardWidgets';
import { analyzeConsumption } from './services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('LOGIN');
  const [userRole, setUserRole] = useState<UserRole>('CLIENT');
  const [currentUser, setCurrentUser] = useState<Cliente | null>(null);
  const [allClientes, setAllClientes] = useState<Cliente[]>(MOCK_CLIENTES);
  const [estoques, setEstoques] = useState<Record<string, Estoque>>(MOCK_ESTOQUE);
  const [pedidos, setPedidos] = useState<Pedido[]>(MOCK_PEDIDOS);
  
  // AI States
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);

  // Authentication Logic (Simulation)
  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    if (role === 'CLIENT') {
      setCurrentUser(allClientes[0]);
    } else {
      setCurrentUser({
        id: 'admin',
        nome: 'Admin Plastcustom',
        whatsapp: '11900000000',
        plano: 'Ouro',
        regiao: 'Brasil',
        dataCadastro: '2022-01-01',
        avatar: ''
      });
    }
    setView(role === 'CLIENT' ? 'CLIENT_DASHBOARD' : 'ADMIN_DASHBOARD');
  };

  // Business Logic: Remove a Bale
  const handleRemoveBale = (clienteId: string) => {
    const currentEstoque = estoques[clienteId];
    if (currentEstoque && currentEstoque.estoqueAtual > 0) {
      const newMov: Movimento = {
        id: Date.now().toString(),
        data: new Date().toISOString(),
        quantidade: -1,
        tipo: 'saida'
      };

      const updatedEstoque = {
        ...currentEstoque,
        estoqueAtual: currentEstoque.estoqueAtual - 1,
        historicoMovimento: [newMov, ...currentEstoque.historicoMovimento]
      };

      setEstoques(prev => ({ ...prev, [clienteId]: updatedEstoque }));
      
      // Auto trigger AI if low stock
      if (updatedEstoque.estoqueAtual <= updatedEstoque.nivelAlerta) {
        // Notification logic would go here
      }
    }
  };

  // AI Action
  const runAiPrediction = async (clienteId: string) => {
    setIsAnalyzing(true);
    setSelectedClienteId(clienteId);
    const cliente = allClientes.find(c => c.id === clienteId);
    const estoque = estoques[clienteId];
    
    if (cliente && estoque) {
      const result = await analyzeConsumption(cliente, estoque);
      setAiAnalysis(result);
    }
    setIsAnalyzing(false);
  };

  const handleCreateOrder = (clienteId: string) => {
    const newPedido: Pedido = {
      id: `p-${Date.now()}`,
      clienteId,
      data: new Date().toISOString().split('T')[0],
      status: 'Pendente',
      itens: ['Reposicão via IA - Sugerida'],
      valorEstimado: 1200
    };
    setPedidos([newPedido, ...pedidos]);
    alert("Pedido gerado com sucesso via Plastcustom Smart Repurchase!");
    setAiAnalysis(null);
  };

  // Components for Views
  const LoginView = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#0047AB] p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 bg-[#0047AB] rounded-xl flex items-center justify-center mb-4 shadow-lg">
             <span className="text-white text-3xl font-bold">P</span>
           </div>
           <h2 className="text-2xl font-bold text-slate-800">PLASTCUSTOM</h2>
           <p className="text-slate-500 text-sm">Gestão Inteligente de Embalagens</p>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => handleLogin('CLIENT')}
            className="w-full py-4 bg-white border-2 border-slate-200 hover:border-[#0047AB] hover:bg-blue-50 transition-all rounded-xl flex items-center justify-center gap-3 font-semibold text-slate-700"
          >
            <svg className="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.099-.47-.15-.669.15-.199.3-.77.971-.944 1.171-.173.199-.347.225-.648.075-.301-.15-1.27-.467-2.42-1.496-.893-.797-1.495-1.782-1.67-2.081-.174-.3-.018-.462.132-.61.135-.133.301-.351.452-.526.15-.175.2-.3.301-.5.101-.2.051-.376-.026-.526-.076-.15-.669-1.611-.916-2.208-.24-.579-.48-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.767-.721 2.016-1.418.247-.697.247-1.292.174-1.418-.073-.125-.27-.199-.57-.35zM12.004 20.122l.001.001c-1.43 0-2.836-.385-4.062-1.112l-.291-.173-3.022.792.805-2.946-.19-.303A7.953 7.953 0 014.12 12c0-4.416 3.589-8.005 8.004-8.005 4.415 0 8.004 3.589 8.004 8.005s-3.589 8.005-8.004 8.005zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.178L2 22l4.958-1.298A9.946 9.946 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
            Acesso Cliente (WhatsApp)
          </button>
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-widest font-bold">ou</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
          <button 
            onClick={() => handleLogin('ADMIN')}
            className="w-full py-4 bg-slate-800 hover:bg-slate-900 transition-all text-white rounded-xl font-semibold shadow-lg"
          >
            Acesso Corporativo Admin
          </button>
        </div>
        
        <p className="text-center text-slate-400 text-xs mt-8">
          © 2024 Plastcustom Embalagens Personalizadas.
        </p>
      </div>
    </div>
  );

  const ClientDashboard = () => {
    if (!currentUser) return null;
    const myEstoque = estoques[currentUser.id];
    const isLow = myEstoque.estoqueAtual <= myEstoque.nivelAlerta;

    // Format data for chart
    const chartData = myEstoque.historicoMovimento.slice(0, 7).reverse().map(m => ({
      name: new Date(m.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      consumo: Math.abs(m.quantidade)
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            label="Estoque Atual" 
            value={`${myEstoque.estoqueAtual} fardos`} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>}
            trend={{ value: '12% este mês', positive: false }}
          />
          <MetricCard 
            label="Tipo de Embalagem" 
            value={myEstoque.tipoSacola} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>}
          />
          <MetricCard 
            label="Plano Fidelidade" 
            value={currentUser.plano} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Center */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
            <div className={`mb-6 p-4 rounded-full ${isLow ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Controle de Saída</h2>
            <p className="text-slate-500 mb-8 max-w-sm">Use o botão abaixo toda vez que retirar um fardo do seu estoque físico para manter o controle preciso.</p>
            
            <button 
              onClick={() => handleRemoveBale(currentUser.id)}
              disabled={myEstoque.estoqueAtual <= 0}
              className={`w-full max-w-xs py-6 rounded-2xl text-xl font-bold transition-all transform active:scale-95 shadow-lg flex flex-col items-center justify-center gap-1 ${
                isLow ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-[#0047AB] hover:bg-blue-800 text-white'
              }`}
            >
              RETIREI UM FARDO
              <span className="text-xs font-normal opacity-80">-1 unidade no sistema</span>
            </button>

            {isLow && (
              <div className="mt-6 flex items-center gap-2 text-rose-600 font-bold animate-pulse">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                ESTOQUE BAIXO! A Plastcustom já foi notificada.
              </div>
            )}
          </div>

          {/* Charts & History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
            <h3 className="text-lg font-bold text-slate-800">Consumo Semanal</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="consumo" stroke="#0047AB" strokeWidth={3} dot={{r: 4, fill: '#0047AB'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Histórico Recente</h3>
              <div className="space-y-3">
                {myEstoque.historicoMovimento.slice(0, 5).map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-700">Retirada de Fardo</p>
                         <p className="text-xs text-slate-400">{new Date(m.data).toLocaleString()}</p>
                       </div>
                    </div>
                    <span className="text-sm font-bold text-rose-600">-1</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AdminDashboard = () => {
    return (
      <div className="space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard label="Clientes Ativos" value={allClientes.length} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>} />
          <MetricCard label="Alertas de Estoque" value={Object.values(estoques).filter(e => e.estoqueAtual <= e.nivelAlerta).length} icon={<svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>} />
          <MetricCard label="Pedidos Hoje" value={2} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>} />
          <MetricCard label="Faturamento Previsto" value="R$ 42k" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} />
        </div>

        {/* Customer List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Monitor de Clientes</h2>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Filtrar Região</button>
               <button className="px-4 py-2 bg-[#0047AB] text-white rounded-lg text-sm font-medium">Novo Cliente</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allClientes.map(cliente => {
              const estoque = estoques[cliente.id];
              const isLow = estoque.estoqueAtual <= estoque.nivelAlerta;
              return (
                <div key={cliente.id} className={`bg-white rounded-2xl border-2 transition-all hover:shadow-md ${isLow ? 'border-rose-200' : 'border-slate-100'}`}>
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                           <img src={cliente.avatar} className="w-12 h-12 rounded-xl object-cover" alt={cliente.nome} />
                           <div>
                              <h4 className="font-bold text-slate-800">{cliente.nome}</h4>
                              <p className="text-xs text-slate-400">{cliente.regiao}</p>
                           </div>
                         </div>
                         <StatusBadge status={cliente.plano} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 my-4">
                         <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Estoque Atual</p>
                            <p className={`text-xl font-bold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                              {estoque.estoqueAtual} fardos
                            </p>
                         </div>
                         <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Consumo Médio</p>
                            <p className="text-xl font-bold text-slate-800">~1.2/dia</p>
                         </div>
                      </div>

                      <div className="flex flex-col gap-2">
                         <button 
                            onClick={() => runAiPrediction(cliente.id)}
                            className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                         >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                            IA: Analisar Recompra
                         </button>
                      </div>
                   </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Analysis Modal / Overlay */}
        {selectedClienteId && aiAnalysis && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-[#0047AB] p-6 text-white flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                         <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Plastcustom AI Intelligence</h3>
                        <p className="text-xs text-blue-100">Análise de consumo e previsão de demanda</p>
                      </div>
                   </div>
                   <button onClick={() => setAiAnalysis(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                   </button>
                </div>
                
                <div className="p-8 overflow-y-auto space-y-6">
                   <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-2xl">
                         <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Duração Estimada</p>
                         <p className="text-2xl font-bold text-blue-900">{aiAnalysis.diasRestantes} dias</p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl">
                         <p className="text-[10px] text-emerald-500 font-bold uppercase mb-1">Data Sugerida</p>
                         <p className="text-sm font-bold text-emerald-900">{aiAnalysis.dataPrevisaoRecompra}</p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-2xl">
                         <p className="text-[10px] text-amber-500 font-bold uppercase mb-1">Reposição Ideal</p>
                         <p className="text-2xl font-bold text-amber-900">{aiAnalysis.quantidadeSugerida} fardos</p>
                      </div>
                   </div>

                   <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-2">Análise do Comportamento</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{aiAnalysis.analiseConsumo}</p>
                   </div>

                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
                        Mensagem Sugerida (WhatsApp)
                      </h4>
                      <div className="bg-white p-3 rounded-xl text-sm italic text-slate-500 border border-slate-100">
                        "{aiAnalysis.mensagemWhatsApp}"
                      </div>
                   </div>

                   <div className="flex gap-3 pt-4">
                      <button className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100">
                         Enviar Mensagem
                      </button>
                      <button 
                        onClick={() => handleCreateOrder(selectedClienteId)}
                        className="flex-1 py-4 bg-[#0047AB] hover:bg-blue-800 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-100"
                      >
                         Gerar Pedido Agora
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
             <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-slate-700">Gemini analisando padrões...</p>
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {view === 'LOGIN' ? (
        <LoginView />
      ) : (
        <Layout 
          userRole={userRole} 
          userName={currentUser?.nome || 'Usuário'} 
          onLogout={() => setView('LOGIN')}
        >
          {view === 'CLIENT_DASHBOARD' ? <ClientDashboard /> : <AdminDashboard />}
        </Layout>
      )}
    </div>
  );
};

export default App;
