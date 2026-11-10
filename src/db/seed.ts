import "dotenv/config";
import crypto from "node:crypto";
import { count } from "drizzle-orm";
import { db, schema } from "./index";
import { hashPassword } from "../lib/auth";

export async function seedDatabase(force = false): Promise<{ skipped: boolean }> {
  const [{ value: existingUsers }] = await db
    .select({ value: count() })
    .from(schema.users);

  if (existingUsers > 0 && !force) {
    return { skipped: true };
  }

  const now = new Date();

  const adminId = crypto.randomUUID();
  const teacher1Id = crypto.randomUUID();
  const teacher2Id = crypto.randomUUID();
  const studentId = crypto.randomUUID();

  // 1. Usuarios iniciais (Admin Principal, Professores de Musica, Aluno)
  await db
    .insert(schema.users)
    .values([
      {
        id: adminId,
        name: "Pr. Administrador Geral",
        email: "admin@herdeirosdedeus.org",
        passwordHash: await hashPassword("Admin@2026"),
        role: "ADMIN",
        bio: "Administração geral, comunicação e coordenação ministerial da Igreja Bíblica Herdeiros de Deus.",
        phone: "(11) 99999-0001",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: teacher1Id,
        name: "Prof. Lucas Andrade",
        email: "lucas.musica@herdeirosdedeus.org",
        passwordHash: await hashPassword("Professor@2026"),
        role: "TEACHER",
        bio: "Ministro de louvor, violonista e arranjador. Dedicado à formação de músicos cristãos para o altar.",
        phone: "(11) 99999-0002",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: teacher2Id,
        name: "Profa. Rebeca Oliveira",
        email: "rebeca.musica@herdeirosdedeus.org",
        passwordHash: await hashPassword("Professor@2026"),
        role: "TEACHER",
        bio: "Regente do coral, preparadora vocal e tecladista da Igreja Bíblica Herdeiros de Deus.",
        phone: "(11) 99999-0003",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: studentId,
        name: "Mateus Ferreira (Aluno Demo)",
        email: "aluno@herdeirosdedeus.org",
        passwordHash: await hashPassword("Aluno@2026"),
        role: "STUDENT",
        bio: "Membro da igreja e estudante da Escola de Música Herdeiros.",
        phone: "(11) 99999-0004",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();

  // 2. Programacao Semanal de Cultos
  await db.insert(schema.worshipSchedules).values([
    {
      id: crypto.randomUUID(),
      title: "Escola Bíblica Dominical (EBD)",
      dayOfWeek: "Domingo",
      startTime: "09:00",
      endTime: "10:30",
      targetAudience: "Crianças, Jovens, Casais e Adultos (salas por faixa etária)",
      location: "Salas Anexas e Templo Sede",
      description:
        "Um tempo precioso de estudo sistemático das Escrituras Sagradas, perguntas e respostas, comunhão e fortalecimento doutrinário para toda a igreja.",
      leaderName: "Equipe de Ensino Bíblico",
      highlightTag: "Material Didático Incluso",
      sortOrder: 1,
      isActive: true,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "Culto da Família e Adoração",
      dayOfWeek: "Domingo",
      startTime: "18:30",
      endTime: "20:30",
      targetAudience: "Toda a família e visitantes",
      location: "Templo Principal",
      description:
        "Nosso grande encontro dominical de celebração a Deus com louvor congregacional, ministração da Palavra e oração pelas famílias. No 1º domingo de cada mês celebramos a Santa Ceia do Senhor.",
      leaderName: "Pastor Titular & Ministério de Louvor",
      highlightTag: "Transmissão Ao Vivo + Espaço Kids",
      sortOrder: 2,
      isActive: true,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "Culto de Ensino e Palavra",
      dayOfWeek: "Quarta-feira",
      startTime: "19:30",
      endTime: "21:00",
      targetAudience: "Membros, novos convertidos e visitantes",
      location: "Templo Principal",
      description:
        "Reunião voltada ao aprofundamento bíblico expositivo, discipulado cristão e aplicação prática da fé no dia a dia, no trabalho e no lar.",
      leaderName: "Corpo Pastoral",
      highlightTag: "Estudo Bíblico Expositivo",
      sortOrder: 3,
      isActive: true,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "Clamor, Oração e Intercessão",
      dayOfWeek: "Sexta-feira",
      startTime: "19:30",
      endTime: "21:00",
      targetAudience: "Toda a igreja",
      location: "Santuário Principal",
      description:
        "Noite dedicada à oração fervorosa, intercessão pelas famílias, enfermos, autoridades e missões, buscando renovo espiritual e direção do Espírito Santo.",
      leaderName: "Ministério de Intercessão",
      highlightTag: "Recebemos Pedidos de Oração",
      sortOrder: 4,
      isActive: true,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "Ensaio Geral e Escola de Música",
      dayOfWeek: "Sábado",
      startTime: "15:00",
      endTime: "17:30",
      targetAudience: "Alunos da Escola de Música e Levitas",
      location: "Sala de Música & Templo",
      description:
        "Prática presencial dos cursos de música (violão, teclado, canto e bateria) integrada ao ensaio de repertório do ministério de louvor.",
      leaderName: "Prof. Lucas Andrade & Profa. Rebeca",
      highlightTag: "Integrado aos Cursos Online",
      sortOrder: 5,
      isActive: true,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "Culto Jovem — Geração Herdeiros",
      dayOfWeek: "Sábado",
      startTime: "19:00",
      endTime: "21:15",
      targetAudience: "Jovens e Adolescentes",
      location: "Templo Principal",
      description:
        "Encontro vibrante de louvor, Palavra relevante para a juventude, comunhão e propósito cristão para jovens e adolescentes caminharem firmes em Cristo.",
      leaderName: "Liderança de Jovens",
      highlightTag: "Comunhão Pós-Culto",
      sortOrder: 6,
      isActive: true,
      createdAt: now,
    },
  ]);

  // 3. Publicacoes do Feed (Eventos, Avisos, Acao Social, Musica)
  await db.insert(schema.feedPosts).values([
    {
      id: crypto.randomUUID(),
      title: "Conferência Anual Herdeiros de Deus 2026: Firmados na Rocha",
      slug: "conferencia-anual-herdeiros-de-deus-2026",
      subtitle:
        "Três noites especiais de adoração, ministração bíblica e renovo espiritual para toda a família.",
      content:
        "Com grande alegria anunciamos a nossa Conferência Anual 2026 da Igreja Bíblica Herdeiros de Deus! Serão três dias de intensa comunhão, louvor e exposição das Escrituras com foco no tema 'Firmados na Rocha' (Mateus 7:24).\n\nTeremos participação especial do nosso Coral e Ministério de Louvor, além de programação infantil paralela para crianças de 3 a 10 anos.\n\nConvide seus familiares e amigos para vivermos juntos dias inesquecíveis na presença do Senhor. Entrada totalmente gratuita!",
      category: "EVENTO",
      coverImage: "/images/hero-culto.jpg",
      mediaGallery: JSON.stringify([
        "/images/hero-culto.jpg",
        "/images/hero-comunidade.jpg",
        "/images/sobre-igreja.jpg",
      ]),
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      eventDate: "20 a 22 de Novembro de 2026 • 19h30",
      eventLocation: "Templo Sede — Rua A, nº 90, Conj. Jaciara, Barra do Ceará",
      isFeatured: true,
      isPublished: true,
      authorId: adminId,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 6),
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "Abertas as Inscrições para a Escola de Música Herdeiros Online",
      slug: "inscricoes-abertas-escola-de-musica-online",
      subtitle:
        "Aprenda violão, teclado, técnica vocal e ministério de louvor gratuitamente na nossa plataforma de cursos.",
      content:
        "A Escola de Música da Igreja Bíblica Herdeiros de Deus agora conta com um acervo digital completo de videoaulas organizadas por módulos, com acompanhamento de progresso aula a aula!\n\nMembros e alunos cadastrados gratuitamente no site já podem acessar os cursos de Violão para Louvor, Teclado Litúrgico e Técnica Vocal.\n\nFaça seu cadastro gratuito na Área de Cursos e comece hoje mesmo a desenvolver seus dons para o serviço no Reino!",
      category: "MUSICA",
      coverImage: "/images/hero-musica.jpg",
      mediaGallery: JSON.stringify(["/images/hero-musica.jpg"]),
      videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
      eventDate: "Matrículas abertas permanentemente",
      eventLocation: "Plataforma Online + Encontros aos Sábados",
      isFeatured: true,
      isPublished: true,
      authorId: adminId,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24),
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "Mutirão Solidário: Cestas Básicas e Atendimento Comunitário",
      slug: "mutirao-solidario-cestas-basicas-atendimento",
      subtitle:
        "Nossa equipe de Ação Social mobilizou voluntários para abençoar mais de 120 famílias do bairro.",
      content:
        "No último sábado realizamos mais uma edição do Projeto Mãos que Abençoam. Graças à generosidade dos irmãos e parceiros da igreja, distribuímos cestas básicas, kits de higiene e oferecemos momentos de oração e aconselhamento pastoral.\n\nVocê também pode participar doando alimentos não perecíveis na recepção dos cultos ou se voluntariando na próxima edição!",
      category: "ACAO_SOCIAL",
      coverImage: "/images/hero-comunidade.jpg",
      mediaGallery: JSON.stringify([
        "/images/hero-comunidade.jpg",
        "/images/sobre-igreja.jpg",
      ]),
      videoUrl: null,
      eventDate: "Todo 2º Sábado do Mês • 09h00",
      eventLocation: "Pátio Social da Igreja",
      isFeatured: true,
      isPublished: true,
      authorId: adminId,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48),
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "Batismo nas Águas e Recepção de Novos Membros",
      slug: "batismo-nas-aguas-recepcao-novos-membros",
      subtitle:
        "Domingo especial celebrando a nova vida em Cristo dos novos discípulos.",
      content:
        "Neste próximo domingo pela manhã teremos nossa Classe Preparatória para o Batismo e, no culto da noite, celebraremos com alegria o Batismo nas Águas.\n\nSe você já entregou sua vida a Jesus e deseja dar esse passo público de fé, procure a secretaria da igreja ou envie uma mensagem pela página de Contato.",
      category: "CULTO",
      coverImage: "/images/sobre-igreja.jpg",
      mediaGallery: JSON.stringify(["/images/sobre-igreja.jpg"]),
      videoUrl: null,
      eventDate: "Domingo, 29 de Novembro • 18h30",
      eventLocation: "Templo Principal",
      isFeatured: false,
      isPublished: true,
      authorId: adminId,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 72),
      updatedAt: now,
    },
  ]);

  // 4. Cursos de Musica estilo Kiwify (criados pelos Professores)
  const course1Id = crypto.randomUUID();
  const course2Id = crypto.randomUUID();
  const course3Id = crypto.randomUUID();

  await db.insert(schema.courses).values([
    {
      id: course1Id,
      title: "Violão para Ministério de Louvor — Do Zero ao Culto",
      slug: "violao-para-ministerio-de-louvor",
      subtitle:
        "Domine acordes, batidas de adoração, campo harmônico e transposição para tocar nos cultos da igreja.",
      description:
        "Curso prático preparado especialmente para quem deseja servir a Deus no ministério de louvor tocando violão. Começamos desde a postura correta e afinação até a condução completa de louvores congregacionais com dinâmica, capotraste e dedilhados.",
      instrument: "Violão",
      level: "INICIANTE",
      coverImage: "/images/hero-musica.jpg",
      promoVideoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
      isPublished: true,
      isFeatured: true,
      teacherId: teacher1Id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: course2Id,
      title: "Teclado Litúrgico & Harmonia de Adoração",
      slug: "teclado-liturgico-harmonia-de-adoracao",
      subtitle:
        "Aprenda inversões suaves, pads atmosféricos, fundo de oração e condução harmônica para cultos.",
      description:
        "Desenvolva sensibilidade musical e técnica pianística voltada ao ambiente de culto. Neste curso abordamos voicings modernos, camadas (pads + piano), transição entre músicas e acompanhamento de momentos de oração e pregação.",
      instrument: "Teclado & Piano",
      level: "INTERMEDIARIO",
      coverImage: "/images/hero-culto.jpg",
      promoVideoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
      isPublished: true,
      isFeatured: true,
      teacherId: teacher2Id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: course3Id,
      title: "Técnica Vocal & Regência de Coral Cristão",
      slug: "tecnica-vocal-e-regencia-de-coral",
      subtitle:
        "Respiração diafragmática, afinação, divisão de vozes (soprano, contralto, tenor) e saúde vocal.",
      description:
        "Curso completo para cantores de equipe de louvor e coralistas da igreja. Aprenda exercícios de aquecimento vocal seguros, projeção sem esforço, harmonia em terças e quintas e postura de adoração no altar.",
      instrument: "Canto & Técnica Vocal",
      level: "TODOS",
      coverImage: "/images/hero-comunidade.jpg",
      promoVideoUrl: null,
      isPublished: true,
      isFeatured: false,
      teacherId: teacher2Id,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // Modulos e Aulas do Curso 1 (Violao)
  const c1Mod1Id = crypto.randomUUID();
  const c1Mod2Id = crypto.randomUUID();
  const c1L1Id = crypto.randomUUID();
  const c1L2Id = crypto.randomUUID();
  const c1L3Id = crypto.randomUUID();
  const c1L4Id = crypto.randomUUID();

  await db.insert(schema.courseModules).values([
    {
      id: c1Mod1Id,
      courseId: course1Id,
      title: "Módulo 1 — Fundamentos e Primeiros Acordes",
      description: "Anatomia do violão, afinação padrão e os 6 acordes essenciais.",
      sortOrder: 1,
      createdAt: now,
    },
    {
      id: c1Mod2Id,
      courseId: course1Id,
      title: "Módulo 2 — Ritmos de Louvor e Campo Harmônico",
      description: "Batidas de adoração, dedilhado e uso do capotraste no culto.",
      sortOrder: 2,
      createdAt: now,
    },
  ]);

  await db.insert(schema.courseLessons).values([
    {
      id: c1L1Id,
      courseId: course1Id,
      moduleId: c1Mod1Id,
      title: "Aula 1: Boas-vindas, Propósito do Músico Cristão e Afinação",
      description:
        "Entenda o coração da adoração antes da técnica e aprenda a afinar seu violão com precisão antes de cada culto.",
      videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
      videoProvider: "YOUTUBE",
      durationMinutes: 12,
      resourceUrl: "https://drive.google.com/",
      resourceLabel: "Apostila Inicial — Anatomia e Afinação",
      isFreePreview: true,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: c1L2Id,
      courseId: course1Id,
      moduleId: c1Mod1Id,
      title: "Aula 2: Acordes Naturais Maiores e Menores (C, G, D, Em, Am)",
      description:
        "Trocas limpas entre acordes sem trastejar, com exercício cronometrado de 10 minutos por dia.",
      videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      videoProvider: "YOUTUBE",
      durationMinutes: 18,
      resourceUrl: null,
      resourceLabel: null,
      isFreePreview: false,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: c1L3Id,
      courseId: course1Id,
      moduleId: c1Mod2Id,
      title: "Aula 3: A Batida Universal de Adoração (4/4 e 6/8)",
      description:
        "Como conduzir músicas lentas e celebrações mantendo o groove junto com a bateria e o baixo.",
      videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
      videoProvider: "YOUTUBE",
      durationMinutes: 22,
      resourceUrl: null,
      resourceLabel: null,
      isFreePreview: false,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: c1L4Id,
      courseId: course1Id,
      moduleId: c1Mod2Id,
      title: "Aula 4: Campo Harmônico de Sol (G) e Uso do Capotraste",
      description:
        "Toque mais de 30 louvores da igreja usando apenas 4 acordes com o capotraste para adaptar ao tom dos cantores.",
      videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      videoProvider: "YOUTUBE",
      durationMinutes: 25,
      resourceUrl: null,
      resourceLabel: null,
      isFreePreview: false,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // Modulos e Aulas do Curso 2 (Teclado)
  const c2Mod1Id = crypto.randomUUID();
  const c2L1Id = crypto.randomUUID();
  const c2L2Id = crypto.randomUUID();

  await db.insert(schema.courseModules).values([
    {
      id: c2Mod1Id,
      courseId: course2Id,
      title: "Módulo 1 — Inversões e Atmosfera de Adoração",
      description: "Conectando acordes sem saltos bruscos no teclado.",
      sortOrder: 1,
      createdAt: now,
    },
  ]);

  await db.insert(schema.courseLessons).values([
    {
      id: c2L1Id,
      courseId: course2Id,
      moduleId: c2Mod1Id,
      title: "Aula 1: Tríades Invertidas e Acordes com Nona (Add9)",
      description:
        "O segredo da sonoridade moderna e preenchida no piano de louvor.",
      videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
      videoProvider: "YOUTUBE",
      durationMinutes: 20,
      resourceUrl: null,
      resourceLabel: null,
      isFreePreview: true,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: c2L2Id,
      courseId: course2Id,
      moduleId: c2Mod1Id,
      title: "Aula 2: Fundo Musical para Oração e Pregação",
      description:
        "Progressões I - V - vi - IV e uso de Pad contínuo para sustentar momentos de ministro.",
      videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      videoProvider: "YOUTUBE",
      durationMinutes: 16,
      resourceUrl: null,
      resourceLabel: null,
      isFreePreview: false,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // Modulos e Aulas do Curso 3 (Canto)
  const c3Mod1Id = crypto.randomUUID();
  const c3L1Id = crypto.randomUUID();
  const c3L2Id = crypto.randomUUID();

  await db.insert(schema.courseModules).values([
    {
      id: c3Mod1Id,
      courseId: course3Id,
      title: "Módulo 1 — Respiração, Aquecimento e Afinação",
      description: "Base saudável para cantar durante todo o culto sem fadiga.",
      sortOrder: 1,
      createdAt: now,
    },
  ]);

  await db.insert(schema.courseLessons).values([
    {
      id: c3L1Id,
      courseId: course3Id,
      moduleId: c3Mod1Id,
      title: "Aula 1: Respiração Costodiafragmática e Apoio Vocal",
      description: "Exercícios práticos antes dos ensaios de sábado e cultos de domingo.",
      videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
      videoProvider: "YOUTUBE",
      durationMinutes: 14,
      resourceUrl: null,
      resourceLabel: null,
      isFreePreview: true,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: c3L2Id,
      courseId: course3Id,
      moduleId: c3Mod1Id,
      title: "Aula 2: Divisão de Vozes (Soprano, Contralto e Tenor)",
      description: "Como abrir vozes em duetos e coros congregacionais com equilíbrio.",
      videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      videoProvider: "YOUTUBE",
      durationMinutes: 19,
      resourceUrl: null,
      resourceLabel: null,
      isFreePreview: false,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // Matricula e Progresso inicial do Aluno Demo no Curso de Violao
  await db.insert(schema.courseEnrollments).values({
    id: crypto.randomUUID(),
    courseId: course1Id,
    studentId,
    lastLessonId: c1L2Id,
    enrolledAt: now,
    lastAccessedAt: now,
  });

  await db.insert(schema.lessonProgress).values({
    id: crypto.randomUUID(),
    studentId,
    courseId: course1Id,
    lessonId: c1L1Id,
    completed: true,
    notes: "Afinação padrão memorizada: E A D G B E.",
    completedAt: now,
    updatedAt: now,
  });

  // 5. Mensagem de Contato inicial de exemplo
  await db.insert(schema.contactMessages).values({
    id: crypto.randomUUID(),
    name: "Ana Paula Costa",
    email: "ana.paula@exemplo.com",
    phone: "(11) 98888-1234",
    subject: "Pedido de Oração e Informações da Escola de Música",
    message:
      "A paz do Senhor! Gostaria de pedir oração pela saúde da minha mãe e também saber se posso iniciar o curso de violão online mesmo sendo iniciante total.",
    status: "NOVA",
    createdAt: now,
  });

  return { skipped: false };
}

// Permite rodar via `npm run db:seed`
const isDirectExecution =
  typeof process !== "undefined" &&
  process.argv[1] &&
  process.argv[1].includes("seed");

if (isDirectExecution) {
  seedDatabase()
    .then((res) => {
      console.log(
        res.skipped
          ? "Seed ignorado: o banco já possui usuários cadastrados."
          : "Seed concluído com sucesso! Usuários, cultos, feed e cursos criados."
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error("Erro ao executar seed:", err);
      process.exit(1);
    });
}
