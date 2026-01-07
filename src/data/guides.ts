
import { GraduationCap, Fingerprint, MapPin, BadgeCheck, Sticker, Link as LinkIcon } from 'lucide-react';

export interface GuideTopic {
    id: string;
    themeId: string;
    category: string;
    title: string;
    description: string;
    content: {
        context: string;
        requirements: string[];
        steps: string[];
        important?: string;
    };
}

export interface GuideTheme {
    id: string;
    title: string;
    description: string;
    icon: any;
}

// --- 1. CONTEÚDO ISOLADO: GUIA DO VISTO ---
export const VISA_GUIDES: GuideTopic[] = [
    {
        id: 'p3-conceito',
        themeId: 'visa-guide',
        category: 'Estratégia',
        title: 'O Visto de Nômade Digital',
        description: 'A quem se destina e benefícios principais do programa.',
        content: {
            context: 'Autorização para trabalhadores e empreendedores digitais que prestam serviços para empresas fora da Espanha.',
            requirements: ['Regime Fiscal "Ley Beckham"', 'Residência conta para Nacionalidade', 'Autorização de até 3 anos'],
            steps: ['Confirmar trabalho remoto independente', 'Validar empresa contratante estrangeira', 'Definir local de aplicação (Espanha ou Brasil)']
        }
    },
    {
        id: 'p4-apostila',
        themeId: 'visa-guide',
        category: 'Burocracia',
        title: 'Apostilamento e Tradução',
        description: 'Legalização de documentos para uso oficial na Espanha.',
        content: {
            context: 'Documentos emitidos fora da Espanha devem ser apostilados e traduzidos por profissionais credenciados.',
            requirements: ['Apostila de Haia em cartório', 'Tradução Juramentada oficial', 'Validade de carimbos e assinaturas'],
            steps: ['Reconhecer firma dos documentos', 'Realizar o Apostilamento de Haia', 'Contratar Tradutor Juramentado credenciado']
        }
    },
    {
        id: 'p7-passaporte',
        themeId: 'visa-guide',
        category: 'Documentos Titular',
        title: 'Passaporte do Titular',
        description: 'Requisitos técnicos, validade e cópias necessárias.',
        content: {
            context: 'O passaporte é crucial para provar nacionalidade e o status de entrada no país.',
            requirements: ['Validade mínima de 1 ano', 'Pelo menos 2 páginas em branco', 'Máximo 10 anos de expedição'],
            steps: ['Verificar validade atual', 'Carimbar o passaporte na Imigração', 'Cópia integral de TODAS as páginas']
        }
    },
    {
        id: 'p9-meios-economicos',
        themeId: 'visa-guide',
        category: 'Documentos Titular',
        title: 'Meios Econômicos (SMI)',
        description: 'Prova de renda financeira mínima exigida pela UGE-CE.',
        content: {
            context: 'Comprovação baseada no Salário Mínimo Interprofesional (SMI) em 14 pagamentos.',
            requirements: ['Titular: 200% do SMI (€2.640/mês)', 'Extratos dos últimos 3 meses', 'Assinatura e carimbo bancário'],
            steps: ['Solicitar extratos na agência ou app', 'Consultar valor do SMI do ano vigente', 'Preparar prova de rendimento recorrente'],
            important: 'O cálculo é feito sobre o valor base do SMI multiplicado por 2 para o titular.'
        }
    },
    {
        id: 'p11-p12-form-mit',
        themeId: 'visa-guide',
        category: 'Formulários',
        title: 'Formulário de Solicitação MI-T',
        description: 'Manual de preenchimento do formulário oficial de residência.',
        content: {
            context: 'O MI-T é o documento de solicitação oficial para teletrabalhadores de caráter internacional.',
            requirements: ['Preenchimento em Castelhano', 'AssSignature digital ou física', 'Número NRC da taxa pago'],
            steps: ['Baixar formulário MI-T oficial', 'Marcar "Teletrabajador de Carácter Internacional"', 'Indicar endereço de residência na Espanha']
        }
    },
    {
        id: 'p14-contrato',
        themeId: 'visa-guide',
        category: 'Documentos Titular',
        title: 'Contrato de Prestação',
        description: 'Comprovação de vínculo profissional com empresa estrangeira.',
        content: {
            context: 'Documento essencial para comprovar a relação de trabalho e a antiguidade mínima.',
            requirements: ['Mínimo 3 meses de vigência', 'Assinado antes da aplicação', 'Tradução juramentada necessária'],
            steps: ['Preparar contrato em Castelhano (opcional)', 'Apostilar o contrato original', 'Garantir cláusula de teletrabalho']
        }
    },
    {
        id: 'p16-p17-antecedentes',
        themeId: 'visa-guide',
        category: 'Documentos Titular',
        title: 'Antecedentes Criminais (PF)',
        description: 'Certidão brasileira e requisitos de validade para imigração.',
        content: {
            context: 'Certidão que atesta a conduta nos países onde residiu nos últimos 5 anos.',
            requirements: ['Validade máxima de 90 dias', 'Apostila de Haia obrigatória', 'Tradução Juramentada'],
            steps: ['Emitir via site da Polícia Federal', 'Não abreviar nomes no preenchimento', 'Apostilar e traduzir o documento']
        }
    },
    {
        id: 'p19-p20-acreditacao',
        themeId: 'visa-guide',
        category: 'Empresarial',
        title: 'Acreditação de Atividade',
        description: 'Prova de existência legal e atividade da empresa contratante.',
        content: {
            context: 'Prova que a empresa contratante está ativa há pelo menos 1 ano e que você mantém o vínculo.',
            requirements: ['Certificado de Registro Ativo', 'Antiguidade mínima de 1 ano', 'Apostila e Tradução Juramentada'],
            steps: ['Solicitar prova de existência da empresa', 'Emitir certificado de registro mercantil', 'Traduzir para o espanhol']
        }
    },
    {
        id: 'p22-auto-teletrabalho',
        themeId: 'visa-guide',
        category: 'Empresarial',
        title: 'Autorização de Teletrabalho',
        description: 'Carta de autorização oficial assinada pela empresa.',
        content: {
            context: 'A empresa deve autorizar expressamente a realização do trabalho a partir da Espanha.',
            requirements: ['Carta assinada pelo RH ou CEO', 'Especificação de funções e salário', 'Garantia de trabalho remoto'],
            steps: ['Baixar modelo oficial em Castelhano', 'Adequar salário e funções', 'Colher assinatura da empresa']
        }
    },
    {
        id: 'p24-p26-qualificacao',
        themeId: 'visa-guide',
        category: 'Qualificação',
        title: 'Diploma ou Experiência',
        description: 'Comprovação de elegibilidade técnica e acadêmica profissional.',
        content: {
            context: 'Prova de que o solicitante é um profissional qualificado na área de atuação.',
            requirements: ['Diploma universitário original', 'OU 3 anos de experiência comprovada', 'Apostila de Haia no diploma'],
            steps: ['Apostilar o Diploma original', 'OU organizar Cartas de Recomendação', 'Traduzir toda a comprovação técnica']
        }
    },
    {
        id: 'p28-cv',
        themeId: 'visa-guide',
        category: 'Qualificação',
        title: 'Curriculum Vitae',
        description: 'Histórico profissional adaptado para as exigências espanholas.',
        content: {
            context: 'Currículo demonstrando a trajetória relacionada à função que exercerá na Espanha.',
            requirements: ['Tradução Simples permitida', 'Preferencialmente em Castelhano', 'Foco na área de teletrabalho'],
            steps: ['Atualizar histórico profissional', 'Realizar tradução para o espanhol', 'Anexar ao dossiê de solicitação']
        }
    },
    {
        id: 'p30-reta',
        themeId: 'visa-guide',
        category: 'Seguridade',
        title: 'Compromisso RETA',
        description: 'Compromisso formal de registro como trabalhador autônomo.',
        content: {
            context: 'Declaração de intenção de registrar-se na Seguridade Social como autônomo (cuenta propia).',
            requirements: ['Substitui plano de saúde para o titular', 'Assinado pelo solicitante', 'Redigido em Castelhano'],
            steps: ['Preencher o formulário de compromisso', 'Indicar dados do passaporte/NIE', 'Assinar para entrega na UGE-CE']
        }
    },
    {
        id: 'p34-decl-resp',
        themeId: 'visa-guide',
        category: 'Documentos Titular',
        title: 'Declaração de Responsabilidade',
        description: 'Declaração de inexistência de antecedentes internacionais.',
        content: {
            context: 'Documento onde o titular declara não possuir crimes nos países de residência anterior.',
            requirements: ['Dispensa Apostila e Tradução', 'Preenchimento em Castelhano', 'Assinatura original'],
            steps: ['Baixar modelo de declaração', 'Preencher com dados dos últimos 5 anos', 'Assinar e datar o documento']
        }
    },
    {
        id: 'p36-vinculo',
        themeId: 'visa-guide',
        category: 'Família',
        title: 'Declaração de Vínculo Familiar',
        description: 'Documento que prova a responsabilidade econômica sobre dependentes.',
        content: {
            context: 'Declaração jurada de que o dependente está sob a responsabilidade econômica do titular.',
            requirements: ['Apresentado apenas pelo titular', 'Dispensa Tradução Juramentada', 'Obrigatório para familiares'],
            steps: ['Baixar modelo de vinculação', 'Listar todos os familiares acompanhantes', 'Assinar como titular do visto']
        }
    },
    {
        id: 'p39-p40-taxa',
        themeId: 'visa-guide',
        category: 'Formulários',
        title: 'Taxa 790 Código 038',
        description: 'Procedimento técnico para pagamento da taxa governamental.',
        content: {
            context: 'Taxa administrativa para processamento da autorização de residência pela UGE-CE.',
            requirements: ['Certificado Digital necessário', 'Cópia do número NRC', 'Comprovante de pagamento bancário'],
            steps: ['Acessar sede eletrônica para gerar taxa', 'Efetuar pagamento via banco espanhol', 'Guardar comprovante com código NRC']
        }
    },
    {
        id: 'p43-passaporte-dep',
        themeId: 'visa-guide',
        category: 'Documentos Dependentes',
        title: 'Passaporte do Dependente',
        description: 'Requisitos específicos de identificação para familiares.',
        content: {
            context: 'Cada dependente deve possuir seu documento individual com as mesmas regras do titular.',
            requirements: ['Validade mínima de 1 ano', 'Cópia integral das páginas', 'Carimbo de entrada na Espanha'],
            steps: ['Verificar validade dos familiares', 'Obter carimbo de entrada no grupo', 'Digitalizar páginas em PDF único']
        }
    },
    {
        id: 'p45-form-mif',
        themeId: 'visa-guide',
        category: 'Documentos Dependentes',
        title: 'Formulário MI-F',
        description: 'Solicitação oficial de residência para familiar acompanhante.',
        content: {
            context: 'Versão do formulário específico para familiares do titular do visto nômade.',
            requirements: ['Vínculo com o processo do titular', 'Preenchimento em Castelhano', 'Dados de parentesco corretos'],
            steps: ['Baixar formulário MI-F', 'Indicar o processo principal do titular', 'Preencher individualmente por pessoa']
        }
    },
    {
        id: 'p48-p49-estado-civil',
        themeId: 'visa-guide',
        category: 'Família',
        title: 'Certidão Matrimônio/União',
        description: 'Prova legal de vínculo para cônjuges e parceiros.',
        content: {
            context: 'Documento legal que comprova a união estável ou casamento para fins de imigração.',
            requirements: ['Certidão de Inteiro Teor', 'Apostila de Haia original', 'Tradução Juramentada'],
            steps: ['Emitir certidão atualizada (máx 1 ano)', 'Realizar o apostilamento no original', 'Traduzir via profissional oficial']
        }
    },
    {
        id: 'p50-nascimento',
        themeId: 'visa-guide',
        category: 'Família',
        title: 'Certidão de Nascimento',
        description: 'Prova de vínculo legal para filhos menores de idade.',
        content: {
            context: 'Comprova a filiação e a idade dos filhos que acompanharão os pais.',
            requirements: ['Certidão emitida há menos de 3 meses', 'Apostilada e Traduzida', 'Inteiro Teor obrigatória'],
            steps: ['Solicitar segunda via no cartório', 'Garantir a apostila de Haia', 'Realizar tradução juramentada']
        }
    },
    {
        id: 'p52-antecedentes-dep',
        themeId: 'visa-guide',
        category: 'Documentos Dependentes',
        title: 'Antecedentes Dependentes',
        description: 'Certidões de antecedentes para familiares maiores de idade.',
        content: {
            context: 'Exigido para todos os dependentes maiores de 18 anos.',
            requirements: ['Mesmas regras do titular', 'Emissão via Polícia Federal', 'Apostila e Tradução'],
            steps: ['Gerar certidão individualmente', 'Apostilar em cartório físico ou digital', 'Traduzir para o espanhol']
        }
    },
    {
        id: 'p55-decl-resp-dep',
        themeId: 'visa-guide',
        category: 'Documentos Dependentes',
        title: 'Declaração Responsabilidade',
        description: 'Responsabilidade internacional do familiar acompanhante.',
        content: {
            context: 'Declaração jurada do dependente sobre inexistência de crimes internacionais.',
            requirements: ['Redigido em Castelhano', 'Dispensa Tradução Juramentada', 'Assinatura do familiar'],
            steps: ['Baixar modelo para acompanhante', 'Preencher dados pessoais', 'Datar e assinar o documento']
        }
    },
    {
        id: 'p57-taxa-dep',
        themeId: 'visa-guide',
        category: 'Documentos Dependentes',
        title: 'Taxa 790 Familiar',
        description: 'Pagamento da taxa governamental para cada dependente.',
        content: {
            context: 'Cada membro da família deve pagar sua própria taxa de processamento administrativo.',
            requirements: ['Número NRC individual', 'Gerado via Certificado Digital', 'Comprovante de pagamento individual'],
            steps: ['Gerar taxas para cada familiar', 'Efetuar pagamentos separados', 'Guardar todos os comprovantes NRC']
        }
    },
    {
        id: 'p60-p61-processo-uge',
        themeId: 'visa-guide',
        category: 'Logística',
        title: 'Fluxo Online UGE-CE',
        description: 'Do envio eletrônico do dossiê à resolução final.',
        content: {
            context: 'O trâmite é totalmente eletrônico via Sede Eletrônica da UGE-CE em Madrid.',
            requirements: ['Certificado Digital (Titular)', 'Dossiê em PDF único por categoria', 'Assinatura digital Autofirma'],
            steps: [
                'Acessar "Alta de solicitud" no portal',
                'Anexar dossiê completo (Passos 1-4 do PDF)',
                'Aguardar notificação (Prazo: 20 dias úteis)'
            ],
            important: 'O silêncio administrativo após 20 dias úteis é considerado aprovação (positivo).'
        }
    }
];

// --- 2. CONTEÚDO ISOLADO: GUIA DO NIE BLANCO ---
export const NIE_GUIDES: GuideTopic[] = [
    {
        id: 'nie-conceito-master',
        themeId: 'nie-guide',
        category: 'Estratégia',
        title: 'O que é o NIE Blanco?',
        description: 'Identificação inicial administrativa obrigatória.',
        content: {
            context: 'O NIE (Número de Identidad de Extranjero) Blanco é a versão inicial de identificação, emitida em papel branco sem foto, essencial para o Visto Nômade.',
            requirements: [
                'Obrigatório para contratos e vistos',
                'Necessário para assinar formulários oficiais',
                'Uso exclusivamente administrativo e fiscal',
                'Não autoriza residência ou trabalho imediato'
            ],
            steps: [
                'Entender que é uma folha física de identificação',
                'Saber que o número será mantido para o futuro cartão TIE',
                'Identificar a necessidade imediata para o processo imigratório'
            ]
        }
    },
    {
        id: 'nie-onde-solicitar',
        themeId: 'nie-guide',
        category: 'Logística',
        title: 'Onde solicitar o NIE Blanco?',
        description: 'Locais de atendimento na Espanha e no exterior.',
        content: {
            context: 'A solicitação pode ser feita tanto em solo espanhol quanto no seu país de origem através do consulado.',
            requirements: [
                'Comisaría de Polícia (Na Espanha)',
                'Consulado da Espanha (No Exterior)',
                'Cita Previa (Agendamento) obrigatória na Espanha'
            ],
            steps: [
                'Decidir o local de aplicação (Brasil ou Espanha)',
                'Recomenda-se solicitar na Espanha para quem aplicará o visto diretamente no país',
                'Verificar horários e disponibilidades de agendamento'
            ]
        }
    },
    {
        id: 'nie-documentacao-detalhada',
        themeId: 'nie-guide',
        category: 'Documentação',
        title: 'Documentos Necessários',
        description: 'Checklist de formulários e taxas exigidas.',
        content: {
            context: 'A documentação deve provar sua identidade e que você realmente reside no endereço informado.',
            requirements: [
                'Formulário EX-15 preenchido e assinado',
                'Passaporte original + cópia completa de todas as páginas',
                'Taxa Modelo 790 Código 012 paga (€9-12)',
                'Justificativa (Ex: Aplicação para Visto de Nômade Digital)'
            ],
            steps: [
                'Baixar e preencher o formulário EX-15 oficial',
                'Pagar a taxa em um banco espanhol antes do atendimento',
                'Organizar cópias integrais do passaporte',
                'Preparar carta ou pré-contrato que justifique o pedido'
            ]
        }
    },
    {
        id: 'nie-atencao-proximos',
        themeId: 'nie-guide',
        category: 'Fluxo',
        title: 'Atenção e Próximos Passos',
        description: 'O que fazer após obter sua folha branca.',
        content: {
            context: 'O NIE Blanco é o primeiro degrau burocrático para sua vida legal na Espanha.',
            requirements: [
                'Identificação fiscal e administrativa ativa',
                'Poderá assinar contratos e pagar impostos',
                'Chave para o processo de residência'
            ],
            steps: [
                'Guardar o original e digitalizar imediatamente',
                'Utilizar o número no preenchimento do Visto Nômade',
                'Dar entrada no processo de residência oficial',
                'Solicitar o TIE (cartão físico) somente após o visto aprovado'
            ],
            important: 'Solicitar o NIE com a justificativa de "Visto de Nômade Digital" aumenta as chances de aprovação sem exigências extras.'
        }
    }
];

// --- 3. CONTEÚDO ISOLADO: GUIA DO EMPADRONAMIENTO ---
export const EMPADRON_GUIDES: GuideTopic[] = [
    {
        id: 'empadron-conceito',
        themeId: 'empadron-guide',
        category: 'Estratégia',
        title: 'O que é o Empadronamiento?',
        description: 'Registro oficial de residência e quem pode solicitar.',
        content: {
            context: 'O empadronamiento é o cadastro no Padrón Municipal de Habitantes, obrigatório para diversos trâmites como NIE, visto e saúde pública.',
            requirements: [
                'Estrangeiros com ou sem NIE',
                'Pessoas com visto ou em processo',
                'Moradores de aluguel, quarto ou casa de familiar',
                'Não é necessário estar regularizado'
            ],
            steps: [
                'Entender que o registro é feito no Ayuntamiento da cidade de residência',
                'Verificar se o endereço permite o registro (contrato ou autorização)',
                'Confirmar se há dependentes (crianças também se registram)'
            ],
            important: 'O empadronamiento não regulariza sua situação migratória, mas é essencial para que você consiga fazer isso legalmente.'
        }
    },
    {
        id: 'empadron-documentos',
        themeId: 'empadron-guide',
        category: 'Documentação',
        title: 'Documentos Necessários',
        description: 'Checklist completo para apresentação na prefeitura.',
        content: {
            context: 'Os documentos provam sua identidade e que você realmente reside no endereço informado.',
            requirements: [
                'Passaporte válido (Obrigatório)',
                'NIE (se já possuir)',
                'Contrato de aluguel ou Escritura',
                'OU Autorização do titular + Cópia do documento dele',
                'Formulário de empadronamiento (site do Ayuntamiento)'
            ],
            steps: [
                'Emitir cópias simples de todos os originais',
                'Garantir que o contrato de aluguel esteja assinado por todos',
                'Se morar de favor, colher a assinatura na folha de autorização do titular'
            ]
        }
    },
    {
        id: 'empadron-passo-passo',
        themeId: 'empadron-guide',
        category: 'Logística',
        title: 'Como Fazer (Passo a Passo)',
        description: 'O fluxo do agendamento até a recepção do certificado.',
        content: {
            context: 'O processo costuma ser presencial e requer agendamento prévio na maioria das grandes cidades.',
            requirements: ['Cita Previa confirmada', 'Presença física no horário marcado'],
            steps: [
                'Acesse o site do Ayuntamiento e procure por "Empadronamiento" ou "Padrón Municipal"',
                'Agende a "Cita Previa" no portal de agendamentos',
                'Compareça ao local com os documentos (Atendimento leva 10-20 min)',
                'Confirme seus dados e endereço com o funcionário',
                'Receba o Certificado ou Volante de Empadronamiento na hora'
            ],
            important: 'Estrangeiros sem residência permanente devem renovar o padrón a cada 2 anos. Mudou de endereço? Atualize o registro.'
        }
    }
];

// --- 4. CONTEÚDO ISOLADO: GUIA DO CERTIFICADO DIGITAL ---
export const CERTIFICADO_GUIDES: GuideTopic[] = [
    {
        id: 'cert-conceito',
        themeId: 'cert-guide',
        category: 'Estratégia',
        title: 'O que é o Certificado Digital?',
        description: 'Sua assinatura oficial online na Espanha.',
        content: {
            context: 'O Certificado Digital da FNMT permite que você realize serviços online com total segurança jurídica perante a Administração Pública.',
            requirements: [
                'Válido por 3 anos',
                'Pessoa Física (FNMT-RCM)',
                'Acesso à Sede Eletrônica da Agência Tributária e SS',
                'Segurança total em declarações e trâmites'
            ],
            steps: [
                'Escolher o certificado de Pessoa Física',
                'Entender que o FNMT é o mais aceito',
                'Preparar computador com navegador compatível (Firefox/Chrome)'
            ],
            important: 'O certificado é pessoal e intransferível. Proteja sua senha de instalação.'
        }
    },
    {
        id: 'cert-documentos',
        themeId: 'cert-guide',
        category: 'Documentação',
        title: 'Requisitos e Documentos',
        description: 'O que você precisa para solicitar.',
        content: {
            context: 'A solicitação exige documentos originais para a validação presencial da sua identidade.',
            requirements: [
                'Passaporte válido original',
                'NIE original (Folha Branca ou TIE)',
                'E-mail pessoal ativo',
                'Computador para download'
            ],
            steps: [
                'Organizar documentos de identidade física',
                'Garantir acesso ao e-mail para receber o código',
                'Utilizar o mesmo computador para todo o processo'
            ],
            important: 'Não formate o computador ou altere o navegador entre a solicitação inicial e o download final.'
        }
    },
    {
        id: 'cert-passo-passo',
        themeId: 'cert-guide',
        category: 'Logística',
        title: 'Fluxo de Solicitação (Passo a Passo)',
        description: 'Do pedido online à instalação final.',
        content: {
            context: 'O processo é dividido em três fases: pedido online, validação presencial e download.',
            requirements: [
                'Código de solicitação via e-mail',
                'Cita Previa em ponto de registro',
                'Senha de segurança escolhida no início'
            ],
            steps: [
                'Fase 1: Solicitar no site da FNMT e receber código por e-mail',
                'Fase 2: Ir pessoalmente a um ponto de registro (Correios ou SS) com o código e documentos',
                'Fase 3: Voltar ao site no MESMO computador e baixar o certificado',
                'Fase 4: Instalar no navegador e testar em portais oficiais'
            ]
        }
    }
];

// --- 5. CONTEÚDO ISOLADO: GUIA DO TIE ---
export const TIE_GUIDES: GuideTopic[] = [
    {
        id: 'tie-conceito-legal',
        themeId: 'tie-guide',
        category: 'Estratégia',
        title: 'O que é o TIE?',
        description: 'Cartão de identificação física obrigatório.',
        content: {
            context: 'O TIE (Tarjeta de Identidad de Extranjero) é o documento físico que prova sua residência legal na Espanha. Ele contém seus dados, foto e o número NIE definitivo.',
            requirements: [
                'Obrigatório para estadias > 6 meses',
                'Deve ser solicitado após aprovação do visto',
                'Prazo: até 30 dias após entrada na Espanha'
            ],
            steps: [
                'Confirmar a aprovação da residência/visto',
                'Validar a data de entrada no país (carimbo ou declaração)',
                'Organizar a documentação base para a coleta de digitais'
            ]
        }
    },
    {
        id: 'tie-documentos-checklist',
        themeId: 'tie-guide',
        category: 'Documentação',
        title: 'Documentos Necessários',
        description: 'Tudo o que você precisa levar na Polícia.',
        content: {
            context: 'A lista de documentos é específica para a "Toma de Huellas" (coleta de digitais) em comissarias autorizadas.',
            requirements: [
                'Formulário EX-17 preenchido e assinado',
                'Passaporte original + Cópia (ID e Visto)',
                'Empadronamiento atualizado (máx 3 meses)',
                'Taxa 790-012 paga (€16-22 aprox)',
                '1 Foto tipo passaporte recente'
            ],
            steps: [
                'Baixar e preencher o formulário oficial EX-17',
                'Gerar e pagar a taxa 790 código 012 no banco ou online',
                'Obter o volante de empadronamiento recente no Ayuntamiento',
                'Tirar a foto nos padrões oficiais (fundo branco)'
            ]
        }
    },
    {
        id: 'tie-processo-presencial',
        themeId: 'tie-guide',
        category: 'Logística',
        title: 'Passo a Passo (A Cita)',
        description: 'Do agendamento à coleta de digitais.',
        content: {
            context: 'O trâmite é presencial e exige agendamento prévio (Cita Previa) no portal de estrangeira.',
            requirements: [
                'Cita: Toma de Huellas (Ley 14/2013)',
                'Presença física obrigatória',
                'Impressões digitais colhidas no local'
            ],
            steps: [
                'Agendar "Toma de Huellas" no site da Sede Eletrônica',
                'Comparecer no horário com o dossiê completo',
                'Realizar a coleta das digitais com o funcionário policial',
                'Receber o "Resguardo de Solicitud" (seu documento provisório)'
            ],
            important: 'O agendamento para nômades digitais deve ser feito preferencialmente no trâmite da Lei 14/2013 se disponível na sua cidade.'
        }
    },
    {
        id: 'tie-entrega-validade',
        themeId: 'tie-guide',
        category: 'Fluxo Final',
        title: 'Retirada e Validade',
        description: 'Prazos de entrega e manutenção do cartão.',
        content: {
            context: 'O cartão físico leva algumas semanas para ser fabricado após a coleta bem-sucedida das digitais.',
            requirements: [
                'Prazo de entrega: 2 a 4 semanas',
                'Retirada presencial com o resguardo original',
                'Validade vinculada à sua autorização de nômade'
            ],
            steps: [
                'Verificar se o cartão está pronto (consulta de número de lote)',
                'Agendar "Recogida de Tarjeta" se exigido na sua província',
                'Apresentar passaporte e resguardo original para troca',
                'Conferir todos os dados impressos ao receber o plástico'
            ],
            important: 'O TIE é sua "carteira de identidade" na Espanha. Mantenha-o sempre seguro e faça o reporte imediato em caso de perda.'
        }
    }
];

// --- 6. CONTEÚDO ISOLADO: LINKS ÚTEIS & DOCUMENTOS ---
export const USEFUL_LINKS_GUIDES: GuideTopic[] = [
    {
        id: 'links-oficiais-gov',
        themeId: 'useful-links',
        category: 'Oficiais & Gov',
        title: 'Portais Oficiais & Consultas',
        description: 'Links diretos para órgãos governamentais e cartórios.',
        content: {
            context: 'Repositório de links para validação de documentos, antecedentes e consultas de valores oficiais.',
            requirements: [
                'Acesso à internet estável',
                'Certificado Digital (para alguns links)',
                'Dados do passaporte à mão'
            ],
            steps: [
                'Apostilamento de Haia (Cartórios): www.cnj.jus.br/poder-judiciario/relacoes-internacionais/apostila-da-haia/cartorios-autorizados/',
                'Tradutores Jurados na Espanha: www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Buscador-STIJ.aspx',
                'Consultar SMI Atual: www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/10721/10957/9932/730#47860',
                'Antecedentes Criminais (Titular): www.gov.br/pt-br/servicos/emitir-certidao-de-antecedentes-criminais',
                'Acreditação Empresa (CNPJ): https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp',
                'Acreditação Nômade (CCMEI): https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/emissao-de-comprovante-ccmei',
                'União Estável (Brasil): www.gov.br/receitafederal/pt-br/centrais-de-conteudo/formularios/declaracoes/uniao-estavel/view',
                'Antecedentes (Dependente): www.gov.br/pt-br/servicos/emitir-certidao-de-antecedentes-criminais'
            ]
        }
    },
    {
        id: 'links-modelos-templates',
        themeId: 'useful-links',
        category: 'Templates',
        title: 'Modelos & Documentos Editáveis',
        description: 'Templates e documentos de apoio para sua aplicação.',
        content: {
            context: 'Documentos editáveis para adequar ao seu perfil profissional e familiar.',
            requirements: [
                'Conta no Google Drive para cópia',
                'Informações contratuais atualizadas',
                'Dossiê organizado'
            ],
            steps: [
                'Contrato de Prestação de Serviço: https://docs.google.com/document/d/1YlcIqEc59RpHiIF0ZC2Xj8U_jeiA0Xed/edit?usp=drive_link&ouid=104377765552928228059&rtpof=true&sd=true',
                'Autorização de Teletrabalho: https://docs.google.com/document/d/1TSh-JzRGSMAMnCDF82dpQ66fyMwCxLmb/edit?usp=sharing&ouid=104377765552928228059&rtpof=true&sd=true',
                'Comprovação de Experiência: https://docs.google.com/document/d/1kBimVqYnEMtbR_mBCapFreO85WYTTYnW/edit?usp=sharing&ouid=104377765552928228059&rtpof=true&sd=true',
                'Curriculum Editável: https://docs.google.com/document/d/1jcGb6xTqnoLsP5sT0nNmUkoUVoz81btB/edit?usp=sharing&ouid=104377765552928228059&rtpof=true&sd=true',
                'Compromisso RETA: https://docs.google.com/document/d/11u-b1Nm80vTeTKvqRh15EtrvDrhZMemO/edit?usp=sharing&ouid=104377765552928228059&rtpof=true&sd=true',
                'Declaração de Responsabilidade: https://docs.google.com/document/d/19MoZk9S1WGZvMZjGHfWCbLjXeiSzDrEf/edit?usp=drive_link&ouid=104377765552928228059&rtpof=true&sd=true',
                'Declaração Vínculo Familiar: https://drive.google.com/file/d/1kh0MVmvlQwwFdXyNRxty5ocx71qisjGf/view?usp=sharing',
                'Declaração Resp. (Dependente): https://docs.google.com/document/d/19MoZk9S1WGZvMZjGHfWCbLjXeiSzDrEf/edit?usp=sharing&ouid=104377765552928228059&rtpof=true&sd=true'
            ]
        }
    },
    {
        id: 'links-taxas-formularios',
        themeId: 'useful-links',
        category: 'Procedimentos',
        title: 'Taxas & Formulários Oficiais',
        description: 'Arquivos e links para pagamento e identificação.',
        content: {
            context: 'Formulários técnicos MI-T, MI-F e portais de pagamento de taxas governamentais.',
            requirements: [
                'Acesso ao Certificado Digital',
                'Leitor de PDF instalado',
                'Passaporte à mão'
            ],
            steps: [
                'Formulário MI-T (Titular): https://www.inclusion.gob.es/documents/d/migraciones/modelo-de-solicitud-de-autorizacion-de-residencia-titulares',
                'Taxa 038 (Titular): https://expinterweb.inclusion.gob.es/Tasa038/login.htm',
                'Formulário MI-F (Dependente): https://www.inclusion.gob.es/documents/d/migraciones/modelo-de-solicitud-de-autorizacion-de-residencia-titulares',
                'Taxa 038 (Dependente): https://expinterweb.inclusion.gob.es/Tasa038/login.htm',
                'Solicitação NIE Blanco: https://icp.administracionelectronica.gob.es/icpplus/index.html',
                'Certificado Digital FNMT: www.sede.fnmt.gob.es/certificados/persona-fisica'
            ],
            important: 'Sempre utilize os links oficiais para garantir que está baixando a versão mais recente dos formulários da UGE-CE.'
        }
    }
];

// JUNÇÃO DOS ARRAYS (Isolamento garantido)
export const ALL_GUIDES: GuideTopic[] = [
    ...VISA_GUIDES,
    ...NIE_GUIDES,
    ...EMPADRON_GUIDES,
    ...CERTIFICADO_GUIDES,
    ...TIE_GUIDES,
    ...USEFUL_LINKS_GUIDES
];

// Temas de navegação
export const GUIDE_THEMES: GuideTheme[] = [
    {
        id: 'visa-guide',
        title: 'Dossiê Visto Nômade',
        description: 'Dossiê estratégico completo para a UGE-CE.',
        icon: GraduationCap
    },
    {
        id: 'nie-guide',
        title: 'NIE Blanco',
        description: 'O guia para sua identidade administrativa inicial.',
        icon: Fingerprint
    },
    {
        id: 'empadron-guide',
        title: 'Empadronamiento',
        description: 'Como se registrar oficialmente na sua prefeitura.',
        icon: MapPin
    },
    {
        id: 'cert-guide',
        title: 'Certificado Digital',
        description: 'Guia passo a passo para sua assinatura digital FNMT.',
        icon: BadgeCheck
    },
    {
        id: 'tie-guide',
        title: 'Guia do TIE',
        description: 'Passo a passo para seu cartão de residência físico.',
        icon: Sticker
    },
    {
        id: 'useful-links',
        title: 'Links Úteis',
        description: 'Repositório de links oficiais e modelos de documentos.',
        icon: LinkIcon
    }
];
