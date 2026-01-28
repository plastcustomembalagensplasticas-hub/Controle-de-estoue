
import React from 'react';
import { COLORS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  userRole: 'CLIENT' | 'ADMIN';
  userName: string;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, userRole, userName, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-[#002B66] text-white flex-col">
        <div className="p-6 border-b border-blue-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-blue-900 font-bold text-xl">P</span>
          </div>
          <span className="font-bold text-lg tracking-tight">PLASTCUSTOM</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full text-left px-4 py-2 rounded bg-blue-700 font-medium">Dashboard</button>
          {userRole === 'ADMIN' && (
            <>
              <button className="w-full text-left px-4 py-2 rounded hover:bg-blue-800 transition-colors">Clientes</button>
              <button className="w-full text-left px-4 py-2 rounded hover:bg-blue-800 transition-colors">Pedidos</button>
            </>
          )}
          <button className="w-full text-left px-4 py-2 rounded hover:bg-blue-800 transition-colors">Relatórios</button>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-400 border-2 border-white overflow-hidden">
               <img src={`https://ui-avatars.com/api/?name=${userName}&background=random`} alt="Avatar" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{userName}</p>
              <p className="text-xs text-blue-300">{userRole === 'ADMIN' ? 'Administrador' : 'Cliente'}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-sm rounded transition-colors font-medium"
          >
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Mobile & Desktop */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
          <div className="md:hidden flex items-center gap-2">
             <div className="w-6 h-6 bg-blue-900 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="font-bold text-blue-900">PLASTCUSTOM</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-slate-500 font-medium">Bem-vindo de volta, <span className="text-slate-800">{userName}</span></h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
             </div>
             <div className="md:hidden">
                <button onClick={onLogout} className="text-sm text-red-600 font-medium">Sair</button>
             </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
