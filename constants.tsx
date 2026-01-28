
import React from 'react';
import { Cliente, Estoque, Pedido } from './types';

export const COLORS = {
  primary: '#0047AB', // Corporate Blue
  secondary: '#64748b', // Slate Gray
  background: '#f8fafc',
  white: '#ffffff',
  accent: '#1e40af',
  warning: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981'
};

export const MOCK_CLIENTES: Cliente[] = [
  {
    id: 'c1',
    nome: 'Supermercado Central',
    whatsapp: '11999999999',
    plano: 'Ouro',
    regiao: 'São Paulo - SP',
    dataCadastro: '2023-01-15',
    avatar: 'https://picsum.photos/seed/shop1/200'
  },
  {
    id: 'c2',
    nome: 'Boutique Elegance',
    whatsapp: '21888888888',
    plano: 'Prata',
    regiao: 'Rio de Janeiro - RJ',
    dataCadastro: '2023-05-20',
    avatar: 'https://picsum.photos/seed/shop2/200'
  },
  {
    id: 'c3',
    nome: 'Padaria Pão Quente',
    whatsapp: '31777777777',
    plano: 'Bronze',
    regiao: 'Belo Horizonte - MG',
    dataCadastro: '2023-08-10',
    avatar: 'https://picsum.photos/seed/shop3/200'
  }
];

export const MOCK_ESTOQUE: Record<string, Estoque> = {
  'c1': {
    clienteId: 'c1',
    tipoSacola: 'Alça Camiseta Reforçada',
    tamanho: '40x50',
    estoqueAtual: 12,
    nivelAlerta: 5,
    historicoMovimento: [
      { id: '1', data: '2023-10-25T10:00:00', quantidade: -1, tipo: 'saida' },
      { id: '2', data: '2023-10-26T14:30:00', quantidade: -1, tipo: 'saida' },
      { id: '3', data: '2023-10-27T09:15:00', quantidade: -1, tipo: 'saida' },
      { id: '4', data: '2023-10-28T16:00:00', quantidade: -1, tipo: 'saida' },
    ]
  },
  'c2': {
    clienteId: 'c2',
    tipoSacola: 'Alça Fita Luxo',
    tamanho: '30x40',
    estoqueAtual: 4,
    nivelAlerta: 6,
    historicoMovimento: [
      { id: '1', data: '2023-10-20T10:00:00', quantidade: -1, tipo: 'saida' },
      { id: '2', data: '2023-10-22T14:30:00', quantidade: -1, tipo: 'saida' },
      { id: '3', data: '2023-10-24T09:15:00', quantidade: -1, tipo: 'saida' },
    ]
  },
  'c3': {
    clienteId: 'c3',
    tipoSacola: 'Saco de Papel Kraft',
    tamanho: 'Padrão',
    estoqueAtual: 8,
    nivelAlerta: 3,
    historicoMovimento: [
      { id: '1', data: '2023-10-25T10:00:00', quantidade: -1, tipo: 'saida' },
    ]
  }
};

export const MOCK_PEDIDOS: Pedido[] = [
  {
    id: 'p1',
    clienteId: 'c1',
    data: '2023-09-10',
    status: 'Entregue',
    itens: ['50 fardos Alça Camiseta 40x50'],
    valorEstimado: 2500
  }
];
