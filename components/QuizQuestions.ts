
export type Answer = {
    id: string;
    value: string;
    points: number;
};

export type QuestionOption = {
    text: string;
    value: string;
    points: number;
};

export type Question = {
    id: string;
    question: string | ((answers: Answer[]) => string);
    condition?: (answers: Answer[]) => boolean;
    options: QuestionOption[];
};

// Dados de cálculo de renda (SMI 2026)
export const BASE_SMI = 1424;
export const BASE_HOLDER = 2848; // 200% SMI
export const ADD_SPOUSE = 1068;  // 75% SMI
export const ADD_CHILD = 356;    // 25% SMI
export const EUR_BRL_RATE = 6.2; // Taxa de conversão estimada

export const calculateRequiredIncome = (answers: Answer[]) => {
    const familyConfig = answers.find(a => a.id === 'family_config')?.value;
    const kidsCount = parseInt(answers.find(a => a.id === 'kids_count')?.value || '0', 10);

    let required = BASE_HOLDER;

    if (familyConfig === 'spouse' || familyConfig === 'spouse_kids') {
        required += ADD_SPOUSE;
    }

    if (kidsCount > 0) {
        required += (kidsCount * ADD_CHILD);
    }

    return required;
};

export const QUESTIONS: Question[] = [
    {
        id: 'remote_work',
        question: "Como você trabalha atualmente?",
        options: [
            { text: "Trabalho remotamente para uma empresa", value: "employee", points: 10 },
            { text: "Sou freelancer / prestador de serviços", value: "freelancer", points: 10 },
            { text: "Tenho um negócio online", value: "business", points: 10 },
            { text: "Não trabalho de forma remota", value: "none", points: 0 },
        ]
    },
    {
        id: 'income_source',
        question: "De onde vem sua renda principal?",
        options: [
            { text: "100% de fora da Espanha", value: "outside", points: 10 },
            { text: "Parte de fora, parte da Espanha", value: "mixed", points: 5 },
            { text: "Da Espanha", value: "inside", points: 0 },
        ]
    },
    {
        id: 'job_tenure',
        question: "Há quanto tempo você presta serviço nesta modalidade?",
        options: [
            { text: "Há 1 ano ou mais", value: "more_1y", points: 10 },
            { text: "Entre 3 e 6 meses", value: "3_6", points: 5 },
            { text: "Menos de 3 meses", value: "less_3", points: 0 },
        ]
    },
    {
        id: 'company_age',
        question: "A empresa para a qual você trabalha (ou sua própria empresa) existe há quanto tempo?",
        options: [
            { text: "Mais de 1 ano", value: "old_company", points: 10 },
            { text: "Menos de 1 ano", value: "new_company", points: 0 },
        ]
    },
    {
        id: 'family_config',
        question: "Você pretende aplicar para o visto sozinho ou com familiares?",
        options: [
            { text: "Sozinho", value: "alone", points: 0 },
            { text: "Com cônjuge/parceiro(a)", value: "spouse", points: 0 },
            { text: "Com cônjuge + filhos", value: "spouse_kids", points: 0 },
            { text: "Apenas com filhos (sem cônjuge)", value: "kids_only", points: 0 },
        ]
    },
    {
        id: 'kids_count',
        question: "Quantos filhos menores de idade ou dependentes virão com você?",
        condition: (answers) => {
            const config = answers.find(a => a.id === 'family_config')?.value;
            return config === 'spouse_kids' || config === 'kids_only';
        },
        options: [
            { text: "1", value: "1", points: 0 },
            { text: "2", value: "2", points: 0 },
            { text: "3", value: "3", points: 0 },
            { text: "4 ou mais", value: "4", points: 0 },
        ]
    },
    {
        id: 'salary',
        question: (answers) => {
            const required = calculateRequiredIncome(answers);
            const requiredBrl = required * EUR_BRL_RATE;
            return `Baseado na sua configuração familiar, a Espanha exige uma renda mensal de aproximadamente € ${required.toLocaleString('pt-BR')} (~R$ ${requiredBrl.toLocaleString('pt-BR')}). Hoje, sua renda média mensal bruta é:`;
        },

        options: [
            { text: "Acima desse valor", value: "high", points: 15 },
            { text: "Exatamente ou muito próximo desse valor", value: "borderline", points: 10 },
            { text: "Abaixo desse valor", value: "low", points: 0 },
        ]
    },
    {
        id: 'income_proof',
        question: "Você consegue comprovar essa renda?",
        options: [
            { text: "Sim (Extratos, Contratos, Declarações)", value: "yes", points: 10 },
            { text: "Parcialmente (Preciso organizar)", value: "partial", points: 5 },
            { text: "Não consigo comprovar", value: "no", points: 0 },
        ]
    },
    {
        id: 'qualification',
        question: "Como você comprova sua qualificação profissional?",
        options: [
            { text: "Diploma universitário / Pós-graduação", value: "degree", points: 10 },
            { text: "Tenho mais de 3 anos de experiência comprovada na área", value: "exp_3y", points: 10 },
            { text: "Não tenho diploma nem 3 anos de experiência", value: "none", points: 0 },
        ]
    },
    {
        id: 'criminal_record',
        question: "Você teve antecedentes criminais nos últimos 5 anos?",
        options: [
            { text: "Não", value: "no", points: 10 },
            { text: "Sim", value: "yes", points: -50 },
        ]
    },
    {
        id: 'time_spain',
        question: "Por quanto tempo você pretende morar na Espanha?",
        options: [
            { text: "Por 3 anos ou mais", value: "3y_more", points: 10 },
            { text: "Pelo menos 1 ano", value: "1y_more", points: 10 },
            { text: "Ainda não sei", value: "unknown", points: 5 },
        ]
    }
];
