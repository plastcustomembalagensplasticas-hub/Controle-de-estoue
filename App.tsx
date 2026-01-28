
import React, { useState, useEffect } from 'react';
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
  MOCK_PEDIDOS 
} from './constants';
import { Layout } from './components/Layout';
import { MetricCard, StatusBadge } from './components/DashboardWidgets';
import { analyzeConsumption } from './services/geminiService';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Declaração de tipos para integração com o ambiente de chaves de API
// Fix: Use a single non-readonly declaration for window.aistudio to avoid modifier conflicts
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('LOGIN');
  const [userRole, setUserRole] = useState<UserRole>('CLIENT');
  const [currentUser, setCurrentUser] = useState<Cliente | null>(null);
  const [allClientes] = useState<Cliente[]>(MOCK_CLIENTES);
  const [estoques, setEstoques] = useState<Record<string, Estoque>>(MOCK_ESTOQUE);
  const [pedidos, setPedidos] = useState<Pedido[]>(MOCK_PEDIDOS);
  
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);

  const checkApiKeyAndRun = async (action: () => Promise<void>) => {
    try {
      if (typeof window.aistudio !== 'undefined') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }
      await action();
    } catch (error) {
      console.error("Erro ao gerenciar chave de API:", error);
      alert("Por favor, selecione uma chave de API válida para usar a IA.");
    }
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    if (role === 'CLIENT') {
      setCurrentUser(allClientes[0]);
    } else {
      setCurrentUser({
        id: 'admin',
        nome: 'Admin Corporativo',
        whatsapp: '11900000000',
        plano: 'Ouro',
        regiao: 'Brasil',
        dataCadastro: '2023-01-01',
        avatar: ''
      });
    }
    setView(role === 'CLIENT' ? 'CLIENT_DASHBOARD' : 'ADMIN_DASHBOARD');
  };

  const handleRemoveBale = (clienteId: string) => {
    const current = estoques[clienteId];
    if (current && current.estoqueAtual > 0) {
      const newMov: Movimento = {
        id: Math.random().toString(36),
        data: new Date().toISOString(),
        quantidade: -1,
        tipo: 'saida'
      };
      setEstoques(prev => ({
        ...prev,
        [clienteId]: {
          ...current,
          estoqueAtual: current.estoqueAtual - 1,
          historicoMovimento: [newMov, ...current.historicoMovimento]
        }
      }));
    }
  };

  const runAiPrediction = (clienteId: string) => {
    checkApiKeyAndRun(async () => {
      setIsAnalyzing(true);
      setSelectedClienteId(clienteId);
      const cliente = allClientes.find(c => c.id === clienteId);
      const estoque = estoques[clienteId];
      if (cliente && estoque) {
        try {
          const result = await analyzeConsumption(cliente, estoque);
          setAiAnalysis(result);
        } catch (error: any) {
          if (error.message?.includes("Requested entity was not found.")) {
             if (typeof window.aistudio !== 'undefined') {
               await window.aistudio.openSelectKey();
             }
          }
          console.error("Erro na análise IA:", error);
        }
      }
      setIsAnalyzing(false);
    });
  };

  const LoginView = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#0047AB] p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md z-10">
        <div className="text-center mb-10">
           <div className="w-20 h-20 bg-[#0047AB] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
             <span className="text-white text-4xl font-black">P</span>
           </div>
           <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">PLASTCUSTOM</h2>
           <p className="text-slate-500 text-sm mt-2 font-medium">Gestão de Estoque & Automação</p>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => handleLogin('CLIENT')}
            className="w-full py-4 px-6 bg-white border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all rounded-2xl flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.099-.47-.15-.669.15-.199.3-.77.971-.944 1.171-.173.199-.347.225-.648.075-.301-.15-1.27-.467-2.42-1.496-.893-.797-1.495-1.782-1.67-2.081-.174-.3-.018-.462.132-.61.135-.133.301-.351.452-.526.15-.175.2-.3.301-.5.101-.2.051-.376-.026-.526-.076-.15-.669-1.611-.916-2.208-.24-.579-.48-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.767-.721 2.016-1.418.247-.697.247-1.292.174-1.418-.073-.125-.27-.199-.57-.35z"/></svg>
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800">Sou Cliente</p>
                <p className="text-xs text-slate-400">Acesso via WhatsApp</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => handleLogin('ADMIN')}
            className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-900 transition-all text-white rounded-2xl flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </div>
              <div className="text-left">
                <p className="font-bold">Dashboard Admin</p>
                <p className="text-xs text-slate-400">Portal Corporativo</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const ClientDashboard = () => {
    if (!currentUser) return null;
    const est = estoques[currentUser.id];
    const isLow = est.estoqueAtual <= est.nivelAlerta;

    const chartData = est.historicoMovimento.slice(0, 10).reverse().map(m => ({
      name: new Date(m.data).toLocaleDateString('pt-BR', { day: '2-digit' }),
      consumo: Math.abs(m.quantidade)
    }));

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
              <h2 className="text-3xl font-black text-slate-800">Seu Estoque</h2>
              <p className="text-slate-500">Gestão de fardos para {est.tipoSacola}</p>
           </div>
           <StatusBadge status={isLow ? 'Estoque Baixo' : 'Normal'} />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            label="Fardos em Mãos" 
            value={est.estoqueAtual} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>}
          />
          <MetricCard 
            label="Nível de Alerta" 
            value={est.nivelAlerta} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>}
          />
          <MetricCard 
            label="Consumo Mensal" 
            value="~32 fardos" 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
           <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col items-center justify-center text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 ${isLow ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Movimentação Física</h3>
              <p className="text-sm text-slate-500 mb-8">Retirou um fardo do estoque? Registre agora.</p>
              
              <button 
                onClick={() => handleRemoveBale(currentUser.id)}
                className={`w-full py-6 rounded-2xl text-xl font-black shadow-2xl transition-all active:scale-95 ${isLow ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200' : 'bg-[#0047AB] hover:bg-blue-800 text-white shadow-blue-200'}`}
              >
                RETIREI UM FARDO
              </button>
           </div>

           <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-800">Tendência de Uso</h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                    <YAxis hide domain={[0, 'auto']} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                    <Line type="step" dataKey="consumo" stroke="#0047AB" strokeWidth={4} dot={{r: 6, fill: '#0047AB', strokeWidth: 2, stroke: '#fff'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const AdminDashboard = () => (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-800">Monitor Plastcustom</h2>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allClientes.map(c => {
            const est = estoques[c.id];
            const isLow = est.estoqueAtual <= est.nivelAlerta;
            return (
              <div key={c.id} className={`bg-white rounded-3xl border-2 transition-all p-6 ${isLow ? 'border-orange-200 shadow-orange-50' : 'border-transparent shadow-sm hover:shadow-md'}`}>
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                       <img src={c.avatar} className="w-12 h-12 rounded-xl object-cover" alt={c.nome} />
                       <div>
                          <h4 className="font-bold text-slate-800">{c.nome}</h4>
                       </div>
                    </div>
                    <StatusBadge status={c.plano} />
                 </div>
                 
                 <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center mb-6">
                    <div>
                       <p className="text-[10px] text-slate-400 font-black uppercase">Estoque</p>
                       <p className={`text-2xl font-black ${isLow ? 'text-orange-600' : 'text-slate-800'}`}>{est.estoqueAtual} fardos</p>
                    </div>
                 </div>

                 <button 
                   onClick={() => runAiPrediction(c.id)}
                   className="w-full py-3.5 bg-blue-50 hover:bg-blue-100 text-[#0047AB] rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                 >
                   Análise Predict IA
                 </button>
              </div>
            )
          })}
       </div>

       {aiAnalysis && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
               <div className="bg-[#0047AB] p-8 text-white">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-black">Inteligência Predict</h3>
                     <button onClick={() => setAiAnalysis(null)} className="p-2 hover:bg-white/10 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </div>
               </div>
               
               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-3 gap-6">
                     <div className="text-center p-4 bg-slate-50 rounded-2xl">
                        <p className="text-xl font-black text-slate-800">{aiAnalysis.diasRestantes} dias</p>
                     </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">{aiAnalysis.analiseConsumo}</p>
                  <button className="w-full py-4 bg-[#0047AB] text-white rounded-2xl font-black shadow-xl">Confirmar Ações</button>
               </div>
            </div>
         </div>
       )}

       {isAnalyzing && (
         <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md">
            <div className="w-16 h-16 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-black tracking-widest uppercase text-xs">Analisando Logística...</p>
         </div>
       )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
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
