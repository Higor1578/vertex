import type { StudyNote } from './types';

export type StudyPack = {
  quickSummary: string;
  fullSummary: string;
  keywords: string[];
  reviewPlan: string[];
  estimatedMinutes: number;
  questions: { question: string; answer: string; type: 'multipla escolha' | 'discursiva' }[];
  flashcards: { front: string; back: string }[];
  mindMap: string[];
};

export async function prepareExam(notes: StudyNote[]): Promise<StudyPack> {
  const endpoint = import.meta.env.VITE_AI_API_ENDPOINT;
  if (endpoint && endpoint !== '/api/ai') {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'prepare-exam', notes })
    });
    if (response.ok) return response.json();
  }

  const content = notes.map((note) => `${note.subject} ${note.title} ${note.content}`).join(' ');
  const words = content
    .toLowerCase()
    .replace(/[^\wÀ-ÿ\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 4);
  const counts = words.reduce<Record<string, number>>((acc, word) => {
    acc[word] = (acc[word] ?? 0) + 1;
    return acc;
  }, {});
  const keywords = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
  const subjects = [...new Set(notes.map((note) => note.subject || 'Geral'))];

  return {
    quickSummary: notes.length
      ? `Resumo rápido com ${notes.length} anotação(ões), focando em ${subjects.slice(0, 3).join(', ')}.`
      : 'Crie anotações para gerar um plano de revisão.',
    fullSummary:
      'Revise os conceitos centrais, transforme dúvidas em perguntas e finalize com uma rodada de flashcards difíceis.',
    keywords,
    reviewPlan: [
      '20 min: leitura ativa dos resumos',
      '25 min: responder questões sem consultar',
      '15 min: revisar erros e criar novas anotações',
      '10 min: flashcards de alta dificuldade'
    ],
    estimatedMinutes: Math.max(45, notes.length * 18),
    questions: keywords.slice(0, 5).map((keyword, index) => ({
      question: `Explique a importância de "${keyword}" dentro do conteúdo estudado.`,
      answer: `Use suas anotações para conectar "${keyword}" aos conceitos principais.`,
      type: index % 2 === 0 ? 'discursiva' : 'multipla escolha'
    })),
    flashcards: keywords.slice(0, 6).map((keyword) => ({
      front: `O que significa ${keyword}?`,
      back: `Revise o trecho das anotações onde ${keyword} aparece e escreva a explicação com suas palavras.`
    })),
    mindMap: subjects.map((subject) => `${subject} -> conceitos -> exercícios -> revisão espaçada`)
  };
}
