
import { ChecklistItem, ContentArticle } from './types';

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  // Trabalho e Renda
  { id: '1', title: 'Contrato de Trabalho/Prestação', category: 'Trabalho', description: 'Contrato com empresa fora da Espanha (mínimo 3 meses de antiguidade).', isCompleted: false, needsTranslation: true, isTranslated: false, needsApostille: false, isApostilled: false },
  { id: '2', title: 'Prova de Renda (Min. 2640€)', category: 'Financeiro', description: 'Extratos ou holerites provando 200% do SMI espanhol.', isCompleted: false, needsTranslation: true, isTranslated: false, needsApostille: false, isApostilled: false },
  { id: '3', title: 'Experiência Profissional (3 anos)', category: 'Trabalho', description: 'Ou diploma universitário na área de atuação.', isCompleted: false, needsTranslation: true, isTranslated: false, needsApostille: true, isApostilled: false },
  { id: '4', title: 'Certificado de Cobertura SS', category: 'Trabalho', description: 'Documento da Previdência Social ou prova de seguro equivalente.', isCompleted: false, needsTranslation: true, isTranslated: false, needsApostille: true, isApostilled: false },
  
  // Identificação e Antecedentes
  { id: '6', title: 'Passaporte Completo', category: 'Pessoal', description: 'Cópia de TODAS as páginas (inclusive em branco).', isCompleted: false, needsTranslation: false, isTranslated: false, needsApostille: false, isApostilled: false },
  { id: '9', title: 'Antecedentes Criminais (Brasil)', category: 'Pessoal', description: 'Certidão da PF emitida nos últimos 90 dias.', isCompleted: false, needsTranslation: true, isTranslated: false, needsApostille: true, isApostilled: false },
  { id: '10', title: 'Declaração de Inexistência', category: 'Pessoal', description: 'Declaração de não possuir antecedentes nos últimos 5 anos.', isCompleted: false, needsTranslation: true, isTranslated: false, needsApostille: false, isApostilled: false },
  
  // Formulários e Taxas Espanha
  { id: '13', title: 'Formulário MI-T', category: 'Formulários', description: 'Solicitação de autorização de residência para teletrabalho.', isCompleted: false, needsTranslation: false, isTranslated: false, needsApostille: false, isApostilled: false },
  { id: '14', title: 'Taxa Modelo 790-038', category: 'Formulários', description: 'Comprovante de pagamento da taxa UGE-CE.', isCompleted: false, needsTranslation: false, isTranslated: false, needsApostille: false, isApostilled: false },
  { id: '15', title: 'Seguro Saúde Sem Copagamento', category: 'Formulários', description: 'Apólice espanhola com cobertura total e sem carências.', isCompleted: false, needsTranslation: false, isTranslated: false, needsApostille: false, isApostilled: false },
  { id: '16', title: 'Taxa de Residência (TIE)', category: 'Formulários', description: 'Paga após a aprovação para emissão do cartão físico.', isCompleted: false, needsTranslation: false, isTranslated: false, needsApostille: false, isApostilled: false },
];

export const MOCK_ARTICLES: ContentArticle[] = [
  {
    id: 'a1',
    title: 'Guia Definitivo: Visto de Nômade Digital',
    category: 'Visto',
    excerpt: 'Tudo o que você precisa saber para aplicar com sucesso na UGE-CE.',
    content: 'O visto de nômade digital (Digital Nomad Visa) da Espanha permite que profissionais estrangeiros trabalhem remotamente do país por até 3 anos (renováveis por mais 2). Para brasileiros, o tempo de residência conta para a cidadania após apenas 2 anos.',
    isPremium: true,
    readTime: '20 min',
    thumbnail: 'https://images.unsplash.com/photo-1543783232-f72f0c05359b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'a2',
    title: 'Guia para o NIE: O que é e como tirar',
    category: 'NIE',
    excerpt: 'Sua identidade estrangeira: aprenda a conseguir a Cita Previa.',
    content: 'O NIE (Número de Identidad de Extranjero) é essencial para qualquer transação na Espanha: abrir conta no banco, contratar internet ou alugar um apartamento. O processo começa com a Cita Previa no site oficial da Extranjería.',
    isPremium: true,
    readTime: '12 min',
    thumbnail: 'https://images.unsplash.com/photo-1558444479-c8a027920927?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'a3',
    title: 'Lei Beckham: Como pagar menos imposto',
    category: 'Finanças',
    excerpt: 'O regime fiscal especial que permite nômades pagarem taxa fixa de 24%.',
    content: 'A Lei Beckham é um incentivo fiscal na Espanha que permite que novos residentes paguem uma alíquota fixa de 24% sobre os rendimentos do trabalho, em vez de taxas progressivas que podem chegar a 47%.',
    isPremium: true,
    readTime: '10 min',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800'
  }
];

export const MOCK_NEWS: ContentArticle[] = [
  {
    id: 'n1',
    title: 'Mudança no SMI 2024: O que muda para o Visto?',
    category: 'Urgente',
    excerpt: 'Governo espanhol atualiza Salário Mínimo e impacta requisitos de renda.',
    content: 'O governo da Espanha aprovou o novo SMI (Salário Mínimo Interprofesional) para 2024. Como o Visto de Nômade Digital exige 200% do SMI para o titular, o valor mínimo de comprovação mensal subiu para aproximadamente €2.640. Esta mudança vale para novos processos enviados à UGE-CE a partir de agora.',
    isPremium: false,
    readTime: '5 min',
    thumbnail: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'n2',
    title: 'UGE-CE agiliza prazos de análise em Madrid',
    category: 'Processo',
    excerpt: 'Unidade de Grandes Empresas reduz tempo de espera para 15 dias úteis.',
    content: 'Fontes ligadas ao Ministério confirmam que a força-tarefa em Madrid conseguiu estabilizar o fluxo de análise. Processos bem documentados estão recebendo resposta em tempo recorde. Lembre-se que o silêncio administrativo de 20 dias continua valendo como aprovação.',
    isPremium: false,
    readTime: '3 min',
    thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'n3',
    title: 'Novas regras para o Seguro Saúde FNMT',
    category: 'Requisito',
    excerpt: 'Entenda por que apólices com copagamento estão sendo rejeitadas.',
    content: 'Houve um aumento significativo de notificações (requerimientos) pedindo a troca de apólices de saúde. A regra é clara: o seguro deve ser "Sin Copagos" e sem carências para as coberturas principais. Certifique-se que sua apólice espanhola especifica "Cobertura Integral".',
    isPremium: false,
    readTime: '7 min',
    thumbnail: 'https://images.unsplash.com/photo-1505751172107-573967a4f22a?auto=format&fit=crop&q=80&w=800'
  }
];
