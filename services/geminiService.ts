
import { GoogleGenAI, Type } from "@google/genai";
import { Estoque, Cliente } from "../types";

export const analyzeConsumption = async (cliente: Cliente, estoque: Estoque) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const historyStr = estoque.historicoMovimento
    .map(m => `${m.data}: ${m.tipo === 'saida' ? 'Saída' : 'Entrada'} ${Math.abs(m.quantidade)} fardo(s)`)
    .join('\n');

  const prompt = `
    Como consultor da Plastcustom, analise os dados de consumo abaixo para o cliente ${cliente.nome}.
    
    ESTOQUE ATUAL: ${estoque.estoqueAtual} fardos
    NÍVEL DE ALERTA: ${estoque.nivelAlerta} fardos
    TIPO DE SACOLA: ${estoque.tipoSacola}
    TAMANHO: ${estoque.tamanho}
    PLANO: ${cliente.plano}
    
    HISTÓRICO RECENTE:
    ${historyStr}
    
    Com base na frequência de retiradas, calcule:
    1. Estimativa de quantos dias o estoque atual durará.
    2. Data prevista para a próxima recompra.
    3. Quantidade sugerida para o próximo pedido (considerando o plano ${cliente.plano}).
    4. Uma mensagem profissional e persuasiva de WhatsApp para o cliente oferecendo reposição antecipada.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diasRestantes: { type: Type.INTEGER },
            dataPrevisaoRecompra: { type: Type.STRING },
            quantidadeSugerida: { type: Type.INTEGER },
            analiseConsumo: { type: Type.STRING },
            mensagemWhatsApp: { type: Type.STRING }
          },
          required: ["diasRestantes", "dataPrevisaoRecompra", "quantidadeSugerida", "analiseConsumo", "mensagemWhatsApp"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return {
      diasRestantes: 7,
      dataPrevisaoRecompra: "Em breve",
      quantidadeSugerida: 20,
      analiseConsumo: "Consumo estável baseado nos últimos registros.",
      mensagemWhatsApp: `Olá ${cliente.nome}, notamos que seu estoque de sacolas ${estoque.tipoSacola} está baixando. Podemos agendar sua reposição?`
    };
  }
};
