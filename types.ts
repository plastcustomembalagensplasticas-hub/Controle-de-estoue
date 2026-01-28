
export interface Cliente {
  id: string;
  nome: string;
  whatsapp: string;
  plano: 'Bronze' | 'Prata' | 'Ouro';
  regiao: string;
  dataCadastro: string;
  avatar: string;
}

export interface Movimento {
  id: string;
  data: string;
  quantidade: number; // usually -1 for a bale removal
  tipo: 'saida' | 'entrada';
}

export interface Estoque {
  clienteId: string;
  tipoSacola: string;
  tamanho: string;
  estoqueAtual: number;
  nivelAlerta: number;
  historicoMovimento: Movimento[];
}

export interface Pedido {
  id: string;
  clienteId: string;
  data: string;
  status: 'Pendente' | 'Produção' | 'Enviado' | 'Entregue';
  itens: string[];
  valorEstimado: number;
}

export type AppView = 'LOGIN' | 'CLIENT_DASHBOARD' | 'ADMIN_DASHBOARD';
export type UserRole = 'CLIENT' | 'ADMIN';
