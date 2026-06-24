export type InvestmentIdea = {
  symbol: string;
  name: string;
  category: 'acao' | 'fii' | 'tesouro' | 'renda fixa' | 'indicador';
  price?: number;
  changePercent?: number;
  highlight: string;
  caution: string;
};

export type InvestmentRadar = {
  updatedAt: string;
  source: string;
  ideas: InvestmentIdea[];
};

const demoRadar: InvestmentRadar = {
  updatedAt: new Date().toISOString(),
  source: 'Modo demo local',
  ideas: [
    {
      symbol: 'TESOURO SELIC',
      name: 'Reserva de emergencia',
      category: 'tesouro',
      highlight: 'Opção conservadora para dinheiro que pode precisar de liquidez.',
      caution: 'Confira taxas, impostos e prazo antes de investir.'
    },
    {
      symbol: 'ITUB4',
      name: 'Itau Unibanco PN',
      category: 'acao',
      price: 33.42,
      changePercent: 0.84,
      highlight: 'Acao popular para acompanhar bancos grandes e dividendos.',
      caution: 'Acoes variam muito e podem cair no curto prazo.'
    },
    {
      symbol: 'MXRF11',
      name: 'FII Maxi Renda',
      category: 'fii',
      price: 10.12,
      changePercent: -0.29,
      highlight: 'FII conhecido para estudar renda mensal e fundos imobiliarios.',
      caution: 'Rendimentos não são garantidos e cotas oscilam.'
    }
  ]
};

export async function getInvestmentRadar(): Promise<InvestmentRadar> {
  const endpoint = import.meta.env.VITE_INVESTMENT_RADAR_ENDPOINT;
  if (endpoint && endpoint !== '/api/investment-radar') {
    const response = await fetch(endpoint);
    if (response.ok) return response.json();
  }

  return demoRadar;
}
