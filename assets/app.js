const STORAGE_KEYS = {
  database: "cultiva_platform_db_v2",
  teacherAuth: "cultiva_teacher_auth_v2",
  currentStudent: "cultiva_current_student_v2"
};

const TEACHER_LOGIN = {
  email: "cultiva@gmail.com",
  password: "cultiva"
};

const PAGE_LINKS = [
  { id: "inicio", label: "Inicio", href: "../inicio/" },
  { id: "aulas", label: "Aulas", href: "../aulas/" },
  { id: "videos", label: "Videos", href: "../videos/" },
  { id: "exercicios", label: "Exercicios", href: "../exercicios/" },
  { id: "quiz", label: "Quiz", href: "../quiz/" },
  { id: "feedback", label: "Feedback", href: "../feedback/" },
  { id: "professor", label: "Area do Professor", href: "../professor/" }
];

const PAGE_COPY = {
  inicio: {
    eyebrow: "Plataforma educacional online",
    title: "Aprendizagem do campo, com linguagem simples e contexto real.",
    description:
      "O Cultiva+ conecta aulas, exercicios e desafios curtos com situacoes do dia a dia de agricultores e estudantes do campo."
  },
  aulas: {
    eyebrow: "Trilha de estudos",
    title: "Aulas organizadas por modulo.",
    description:
      "Leia os conteudos teoricos por tema, acompanhe seu progresso e marque o que ja estudou."
  },
  videos: {
    eyebrow: "Aprendizado visual",
    title: "Videoaulas para revisar com calma.",
    description:
      "Os videos complementam as aulas e ajudam a revisar os assuntos com exemplos praticos."
  },
  exercicios: {
    eyebrow: "Pratica guiada",
    title: "Exercicios para fixar o conteudo.",
    description:
      "Resolva as atividades por modulo e marque as questoes concluidas para registrar o andamento."
  },
  quiz: {
    eyebrow: "Revisao rapida",
    title: "Quiz interativo com pontuacao imediata.",
    description:
      "Escolha um modulo, responda as perguntas e registre automaticamente o desempenho para o professor."
  },
  feedback: {
    eyebrow: "Escuta ativa",
    title: "Espaco para duvidas e sugestoes.",
    description:
      "Envie mensagens para o professor, relate dificuldades e deixe ideias para melhorar a plataforma."
  },
  professor: {
    eyebrow: "Area administrativa",
    title: "Painel do professor com visao da turma.",
    description:
      "Acompanhe progresso, leia feedbacks e publique modulos e atividades para os alunos."
  }
};

const CATEGORY_META = {
  aulas: {
    title: "Aulas",
    activityTitle: "Aula",
    emptyTitle: "Nenhuma aula neste modulo.",
    icon: "Leitura"
  },
  videos: {
    title: "Videos",
    activityTitle: "Video",
    emptyTitle: "Nenhum video neste modulo.",
    icon: "Video"
  },
  exercicios: {
    title: "Exercicios",
    activityTitle: "Exercicio",
    emptyTitle: "Nenhum exercicio neste modulo.",
    icon: "Pratica"
  },
  quiz: {
    title: "Quiz",
    activityTitle: "Pergunta",
    emptyTitle: "Nenhuma pergunta neste modulo.",
    icon: "Quiz"
  }
};

const DEFAULT_IMAGES = {
  aulas: "../assets/profile-card.svg",
  videos: "../assets/hero-field.svg",
  exercicios: "../assets/profile-card.svg"
};

const state = {
  currentPage: "inicio",
  teacherAuthed: false,
  currentStudentId: null,
  selectedModules: {
    aulas: null,
    videos: null,
    exercicios: null,
    quiz: null
  },
  professorCategory: "aulas",
  quiz: {
    moduleId: null,
    questionIndex: 0,
    score: 0,
    answered: false,
    selectedOption: null,
    answerCorrect: null,
    attemptSaved: false
  },
  db: createSeedDatabase()
};

let toastTimer = null;

export function bootStudentPage(pageId) {
  initialize(pageId);
  renderStudentShell();
  ensureCurrentStudent();
  renderStudentPage();
}

export function bootProfessorPage() {
  initialize("professor");
  renderProfessorShell();
  renderProfessorPage();
}

function initialize(pageId) {
  state.currentPage = pageId;
  state.teacherAuthed = readStorage(STORAGE_KEYS.teacherAuth) === "1";
  state.db = loadDatabase();
  migrateDatabase();
  seedDatabaseIfNeeded();
  normalizeSelections();
  bindGlobalEvents();
}

function bindGlobalEvents() {
  document.removeEventListener("click", handleGlobalClicks);
  document.removeEventListener("keydown", handleGlobalKeydown);
  document.addEventListener("click", handleGlobalClicks);
  document.addEventListener("keydown", handleGlobalKeydown);
}

function handleGlobalClicks(event) {
  const target = event.target;

  if (target.closest("[data-close-modal]")) {
    closeModal();
  }

  const menuButton = target.closest("[data-menu-toggle]");
  if (menuButton) {
    const nav = document.getElementById("site-nav");
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    nav?.classList.toggle("open", !expanded);
    menuButton.setAttribute("aria-expanded", String(!expanded));
  }

  const shellLink = target.closest("[data-nav-link]");
  if (shellLink) {
    closeMenu();
  }
}

function handleGlobalKeydown(event) {
  if (event.key === "Escape") {
    closeModal();
    closeMenu();
  }
}

function closeMenu() {
  document.getElementById("site-nav")?.classList.remove("open");
  document.querySelector("[data-menu-toggle]")?.setAttribute("aria-expanded", "false");
}

function renderStudentShell() {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  if (!header || !footer) return;

  header.innerHTML = `
    <header class="site-header">
      <div class="shell-inner">
        <a class="brand-link" href="../inicio/">
          <img class="brand-logo" src="../img/cultiva-img.png" alt="Cultiva+" />
          <div>
            <span class="brand-mark">Cultiva+</span>
            <span class="brand-submark">Educacao para agricultores</span>
          </div>
        </a>

        <nav class="site-nav" id="site-nav" aria-label="Navegacao principal">
          ${PAGE_LINKS.filter((item) => item.id !== "professor")
            .map(
              (item) => `
                <a class="nav-link ${item.id === state.currentPage ? "active" : ""}" href="${item.href}" data-nav-link>
                  ${item.label}
                </a>
              `
            )
            .join("")}
          <a class="nav-link nav-link-professor" href="../professor/" data-nav-link>
            Area do Professor
          </a>
        </nav>

        <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" data-menu-toggle>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  `;

  footer.innerHTML = `
    <footer class="site-footer">
      <div class="shell-inner footer-grid">
        <div>
          <strong>Cultiva+</strong>
          <p>Plataforma online com aulas, exercicios, quiz e acompanhamento de progresso para a comunidade escolar.</p>
        </div>
        <div class="footer-links">
          <a href="../inicio/">Inicio</a>
          <a href="../feedback/">Feedback</a>
          <a href="../professor/">Professor</a>
        </div>
      </div>
    </footer>
  `;
}

function renderProfessorShell() {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  if (!header || !footer) return;

  header.innerHTML = `
    <header class="site-header professor-header">
      <div class="shell-inner">
        <a class="brand-link" href="../professor/">
          <img class="brand-logo" src="../img/cultiva-img.png" alt="Cultiva+" />
          <div>
            <span class="brand-mark">Cultiva+ Professor</span>
            <span class="brand-submark">Gestao da plataforma</span>
          </div>
        </a>

        <nav class="site-nav" id="site-nav" aria-label="Navegacao do professor">
          <a class="nav-link" href="../inicio/" data-nav-link>Voltar ao aluno</a>
          <button class="nav-link button-link ${state.teacherAuthed ? "" : "hidden"}" type="button" id="teacher-logout-header">
            Sair
          </button>
        </nav>

        <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" data-menu-toggle>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  `;

  footer.innerHTML = `
    <footer class="site-footer">
      <div class="shell-inner footer-grid">
        <div>
          <strong>Cultiva+ Professor</strong>
          <p>Area administrativa para acompanhar alunos, receber feedbacks e publicar novos materiais.</p>
        </div>
        <div class="footer-links">
          <a href="../inicio/">Aluno</a>
          <a href="../feedback/">Feedback</a>
        </div>
      </div>
    </footer>
  `;

  const logoutButton = document.getElementById("teacher-logout-header");
  logoutButton?.addEventListener("click", () => {
    state.teacherAuthed = false;
    writeStorage(STORAGE_KEYS.teacherAuth, "0");
    renderProfessorShell();
    renderProfessorPage();
    showToast("Sessao do professor encerrada.", "info");
  });
}

function renderStudentPage() {
  const root = document.getElementById("page-root");
  if (!root) return;

  switch (state.currentPage) {
    case "inicio":
      renderHomePage(root);
      break;
    case "aulas":
      renderLearningPage(root, "aulas");
      break;
    case "videos":
      renderLearningPage(root, "videos");
      break;
    case "exercicios":
      renderLearningPage(root, "exercicios");
      break;
    case "quiz":
      renderQuizPage(root);
      break;
    case "feedback":
      renderFeedbackPage(root);
      break;
    default:
      renderHomePage(root);
      break;
  }
}

function renderProfessorPage() {
  const root = document.getElementById("page-root");
  if (!root) return;

  if (!state.teacherAuthed) {
    root.innerHTML = `
      ${renderPageBanner("professor", "../assets/teacher-dashboard.svg")}
      <section class="login-panel">
        <div class="login-card">
          <div class="eyebrow">Acesso protegido</div>
          <h2>Entrar na area do professor</h2>
          <p>O aluno navega sem login. Somente a area administrativa exige email e senha.</p>
          <form id="teacher-login-form" class="stack-form">
            <div class="form-group">
              <label for="teacher-email">Email</label>
              <input id="teacher-email" name="teacher-email" type="email" placeholder="Digite o email do professor" required />
            </div>
            <div class="form-group">
              <label for="teacher-password">Senha</label>
              <input id="teacher-password" name="teacher-password" type="password" placeholder="Digite a senha do professor" required />
            </div>
            <button class="primary-button" type="submit">Entrar no painel</button>
          </form>
          <p class="login-note">Acesso de demonstracao: <strong>cultiva@gmail.com</strong> / <strong>cultiva</strong>.</p>
        </div>
      </section>
    `;

    document.getElementById("teacher-login-form")?.addEventListener("submit", handleTeacherLogin);
    return;
  }

  const metrics = getProfessorMetrics();
  const managerCategory = state.professorCategory;
  const activeModule = getActiveModule(managerCategory);
  const modules = state.db[managerCategory];

  root.innerHTML = `
    ${renderPageBanner("professor", "../assets/teacher-dashboard.svg")}

    <section class="dashboard-grid">
      ${renderMetricCard("Alunos acompanhados", String(metrics.studentsCount), "Perfis com progresso salvo no navegador.")}
      ${renderMetricCard("Conteudos publicados", String(metrics.publishedActivities), "Soma de aulas, videos, exercicios e perguntas cadastradas.")}
      ${renderMetricCard("Feedbacks recebidos", String(metrics.feedbackCount), "Mensagens enviadas pelos alunos na pagina de feedback.")}
      ${renderMetricCard("Media geral", `${metrics.averageProgress}%`, "Media do progresso estimado com base nas interacoes registradas.")}
    </section>

    <section class="dashboard-columns">
      <article class="dashboard-panel">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Andamento dos alunos</span>
            <h2>Visao da turma</h2>
          </div>
        </div>
        <div class="student-cards">
          ${state.db.students.map((student) => renderStudentCard(student)).join("")}
        </div>
      </article>

      <article class="dashboard-panel">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Feedbacks</span>
            <h2>Mensagens recentes</h2>
          </div>
        </div>
        <div class="feedback-stack">
          ${renderFeedbackItems(state.db.feedbacks, true)}
        </div>
      </article>
    </section>

    <section class="dashboard-panel">
      <div class="panel-header">
        <div>
          <span class="eyebrow">Gestao de conteudo</span>
          <h2>Modulos e atividades</h2>
        </div>
      </div>

      <div class="tab-row" id="manager-tabs">
        ${Object.keys(CATEGORY_META)
          .map(
            (category) => `
              <button type="button" class="tab-chip ${managerCategory === category ? "active" : ""}" data-manager-tab="${category}">
                ${CATEGORY_META[category].title}
              </button>
            `
          )
          .join("")}
      </div>

      <div class="manager-layout">
        <aside class="manager-sidebar">
          <div class="sidebar-card">
            <div class="sidebar-header">
              <h3>Modulos cadastrados</h3>
              <p>${modules.length} modulo(s)</p>
            </div>
            <div class="module-list">
              ${renderManagerModules(managerCategory)}
            </div>
          </div>
        </aside>

        <div class="manager-content">
          <div class="dashboard-panel compact-panel">
            <div class="panel-header">
              <div>
                <span class="eyebrow">Novo modulo</span>
                <h3>Criar modulo de ${CATEGORY_META[managerCategory].title.toLowerCase()}</h3>
              </div>
            </div>
            ${renderModuleForm(managerCategory)}
          </div>

          <div class="dashboard-panel compact-panel">
            <div class="panel-header">
              <div>
                <span class="eyebrow">Nova atividade</span>
                <h3>${activeModule ? `Publicar em ${escapeHtml(activeModule.titulo)}` : "Crie um modulo primeiro"}</h3>
              </div>
            </div>
            ${renderActivityForm(managerCategory, activeModule)}
          </div>

          <div class="dashboard-panel compact-panel">
            <div class="panel-header">
              <div>
                <span class="eyebrow">Conteudo atual</span>
                <h3>${activeModule ? escapeHtml(activeModule.titulo) : "Sem modulo selecionado"}</h3>
              </div>
            </div>
            <div class="manager-activity-list">
              ${renderManagerActivities(managerCategory, activeModule)}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  bindProfessorEvents();
}

function renderHomePage(root) {
  const student = getCurrentStudent();
  const metrics = getStudentMetrics(student);
  const latestAula = state.db.aulas[0]?.atividades?.[0];
  const latestExercise = state.db.exercicios[0]?.atividades?.[0];

  root.innerHTML = `
    ${renderPageBanner("inicio", "../assets/hero-field.svg")}

    <section class="profile-grid">
      <article class="profile-card">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Perfil livre do aluno</span>
            <h2>${escapeHtml(student.nome)}</h2>
          </div>
        </div>
        <p class="panel-copy">Sem login obrigatorio. Preencha apenas se quiser registrar seu progresso e aparecer no painel do professor.</p>

        <form id="student-profile-form" class="stack-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="student-name">Nome</label>
              <input id="student-name" name="student-name" type="text" value="${escapeAttr(student.nome)}" placeholder="Ex: Maria do Campo" />
            </div>
            <div class="form-group">
              <label for="student-community">Turma ou comunidade</label>
              <input id="student-community" name="student-community" type="text" value="${escapeAttr(student.comunidade)}" placeholder="Ex: 3 ano DS - EEEP" />
            </div>
          </div>
          <button class="secondary-button" type="submit">Salvar identificacao</button>
        </form>
      </article>

      <article class="profile-card profile-card-visual">
        <img src="../assets/profile-card.svg" alt="Painel ilustrado do aluno" />
      </article>
    </section>

    <section class="dashboard-grid student-metrics">
      ${renderMetricCard("Aulas estudadas", String(metrics.readLessons), "Aulas abertas e marcadas como estudadas.")}
      ${renderMetricCard("Videos vistos", String(metrics.watchedVideos), "Videos acessados na plataforma.")}
      ${renderMetricCard("Exercicios resolvidos", String(metrics.solvedExercises), "Questoes marcadas como concluidas pelo aluno.")}
      ${renderMetricCard("Progresso geral", `${metrics.progress}%`, "Estimativa do andamento com base nas acoes registradas.")}
    </section>

    <section class="home-actions">
      ${renderHomeActionCard("../aulas/", "Trilha de aulas", "Estude por modulo e abra cada aula em tela limpa.")}
      ${renderHomeActionCard("../exercicios/", "Pratica guiada", "Resolva atividades e marque o que foi concluido.")}
      ${renderHomeActionCard("../quiz/", "Quiz rapido", "Teste o entendimento e gere pontuacao automatica.")}
      ${renderHomeActionCard("../feedback/", "Falar com o professor", "Envie duvidas, dificuldades e sugestoes.")}
    </section>

    <section class="feature-grid">
      <article class="feature-card">
        <span class="eyebrow">Destaque da semana</span>
        <h3>${escapeHtml(latestAula?.titulo || "Nenhuma aula publicada")}</h3>
        <p>${escapeHtml(latestAula?.conteudo_resumo || "Assim que uma nova aula for publicada ela aparecera aqui.")}</p>
        <a class="text-link" href="../aulas/">Ir para aulas</a>
      </article>
      <article class="feature-card">
        <span class="eyebrow">Exercicio em foco</span>
        <h3>${escapeHtml(latestExercise?.enunciado || "Nenhum exercicio publicado")}</h3>
        <p>Use a pagina de exercicios para marcar o que ja concluiu e atualizar seu andamento.</p>
        <a class="text-link" href="../exercicios/">Praticar agora</a>
      </article>
    </section>
  `;

  document.getElementById("student-profile-form")?.addEventListener("submit", handleStudentProfileSubmit);
}

function renderLearningPage(root, category) {
  const student = getCurrentStudent();
  const activeModule = getActiveModule(category, { respectUnlock: true, student });
  const items = getOrderedActivities(activeModule);
  const metrics = getStudentMetrics(student);
  const completedSet = getCompletedSet(category, student);

  root.innerHTML = `
    ${renderPageBanner(category, category === "videos" ? "../assets/profile-card.svg" : "../assets/hero-field.svg")}

    <section class="content-split">
      <aside class="sidebar-card">
        <div class="sidebar-header">
          <div>
            <span class="eyebrow">Modulos</span>
            <h2>${CATEGORY_META[category].title}</h2>
          </div>
          <p>${state.db[category].length} modulo(s)</p>
        </div>
        <div class="module-list">
          ${renderModuleSelector(category)}
        </div>
      </aside>

      <section class="content-stage">
        <div class="stage-header">
          <div>
            <span class="eyebrow">Modulo selecionado</span>
            <h2>${escapeHtml(activeModule?.titulo || "Nenhum modulo disponivel")}</h2>
          </div>
          <div class="stage-badge">${metrics.progress}% de progresso</div>
        </div>
        <p class="stage-copy">${renderModuleDescription(category, activeModule, student)}</p>

        <div class="content-grid">
          ${items.length === 0 ? renderEmptyCard(CATEGORY_META[category].emptyTitle, "O professor ainda nao publicou conteudo neste modulo.") : ""}
          ${items
            .map((item, index) =>
              renderActivityCard(category, item, {
                completed: completedSet.has(item.id),
                unlocked: isActivityUnlocked(category, activeModule, item.id, student),
                order: index + 1
              })
            )
            .join("")}
        </div>
      </section>
    </section>
  `;

  bindLearningEvents(category);
}

function renderQuizPage(root) {
  const student = getCurrentStudent();
  const activeModule = getActiveModule("quiz", { respectUnlock: true, student });
  const items = getOrderedActivities(activeModule);
  const moduleUnlocked = activeModule ? isModuleUnlocked("quiz", activeModule.id, student) : false;

  if (!state.quiz.moduleId && activeModule) {
    state.quiz.moduleId = activeModule.id;
  }

  if (activeModule && state.quiz.moduleId !== activeModule.id) {
    resetQuizState(activeModule.id);
  }

  root.innerHTML = `
    ${renderPageBanner("quiz", "../assets/profile-card.svg")}

    <section class="content-split">
      <aside class="sidebar-card">
        <div class="sidebar-header">
          <div>
            <span class="eyebrow">Modulos</span>
            <h2>Quiz por modulo</h2>
          </div>
          <p>${state.db.quiz.length} modulo(s)</p>
        </div>
        <div class="module-list">
          ${renderModuleSelector("quiz")}
        </div>
      </aside>

      <section class="content-stage">
        <div class="stage-header">
          <div>
            <span class="eyebrow">Modulo do quiz</span>
            <h2>${escapeHtml(activeModule?.titulo || "Nenhum modulo disponivel")}</h2>
          </div>
          <div class="stage-badge">${moduleUnlocked ? `${items.length} etapa(s)` : "Bloqueado"}</div>
        </div>
        <p class="stage-copy">
          ${moduleUnlocked
            ? "Cada modulo do quiz abre em sequencia. Ao concluir este bloco, o proximo modulo fica liberado para o aluno."
            : "Conclua o modulo de quiz anterior para liberar esta etapa do curso."}
        </p>

        <div class="quiz-layout">
          <article class="quiz-summary-card">
            <h3>Etapas deste modulo</h3>
            <div class="quiz-summary-list">
              ${items.length === 0
                ? `<p class="empty-inline">O professor ainda nao cadastrou perguntas neste modulo.</p>`
                : items
                    .map(
                      (item, index) => `
                        <div class="quiz-summary-item">
                          <span class="quiz-counter">${index + 1}</span>
                          <div>
                            <strong>${escapeHtml(item.titulo || `Atividade ${index + 1}`)}</strong>
                            <p>${escapeHtml(item.pergunta)}</p>
                          </div>
                        </div>
                      `
                    )
                    .join("")}
            </div>
          </article>

          <article class="quiz-card-shell" id="quiz-card-shell">
            ${renderQuizRunner(activeModule, moduleUnlocked)}
          </article>
        </div>
      </section>
    </section>
  `;

  bindQuizEvents();
}

function renderFeedbackPage(root) {
  const student = getCurrentStudent();

  root.innerHTML = `
    ${renderPageBanner("feedback", "../assets/teacher-dashboard.svg")}

    <section class="feedback-grid">
      <article class="profile-card">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Mensagem ao professor</span>
            <h2>Enviar feedback</h2>
          </div>
        </div>
        <p class="panel-copy">Seu nome pode ser alterado na pagina inicial. Aqui voce so envia a mensagem.</p>

        <form id="feedback-form" class="stack-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="feedback-name">Nome</label>
              <input id="feedback-name" name="feedback-name" type="text" value="${escapeAttr(student.nome)}" required />
            </div>
            <div class="form-group">
              <label for="feedback-email">Email para retorno</label>
              <input id="feedback-email" name="feedback-email" type="email" placeholder="nome@exemplo.com" required />
            </div>
          </div>
          <div class="form-group">
            <label for="feedback-message">Mensagem</label>
            <textarea id="feedback-message" name="feedback-message" rows="6" placeholder="Escreva sua duvida, dificuldade ou sugestao..." required></textarea>
          </div>
          <button class="primary-button" type="submit">Enviar mensagem</button>
        </form>
      </article>

      <article class="dashboard-panel">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Recado da comunidade</span>
            <h2>Mensagens recentes</h2>
          </div>
        </div>
        <div class="feedback-stack">
          ${renderFeedbackItems(state.db.feedbacks, false)}
        </div>
      </article>
    </section>
  `;

  document.getElementById("feedback-form")?.addEventListener("submit", handleFeedbackSubmit);
}

function renderPageBanner(pageId, assetPath) {
  const copy = PAGE_COPY[pageId];

  return `
    <section class="page-banner page-banner-${pageId}">
      <div class="page-banner-copy">
        <span class="eyebrow">${copy.eyebrow}</span>
        <h1>${copy.title}</h1>
        <p>${copy.description}</p>
      </div>
      <div class="page-banner-art">
        <img src="${assetPath}" alt="" />
      </div>
    </section>
  `;
}

function renderMetricCard(label, value, helper) {
  return `
    <article class="metric-card">
      <span class="metric-label">${label}</span>
      <strong class="metric-value">${value}</strong>
      <p class="metric-helper">${helper}</p>
    </article>
  `;
}

function renderHomeActionCard(href, title, text) {
  return `
    <a class="action-card" href="${href}">
      <div>
        <span class="eyebrow">Acesso rapido</span>
        <h3>${title}</h3>
        <p>${text}</p>
      </div>
      <span class="action-arrow">Abrir</span>
    </a>
  `;
}

function renderModuleSelector(category) {
  const student = getCurrentStudent();
  return state.db[category]
    .map((module) => {
      const isActive = state.selectedModules[category] === module.id;
      const count = getOrderedActivities(module).length;
      const unlocked = isModuleUnlocked(category, module.id, student);
      const completed = isModuleCompleted(category, module, student);
      const statusLabel = completed ? "Concluido" : unlocked ? "Liberado" : "Bloqueado";
      return `
        <button type="button" class="module-pill ${isActive ? "active" : ""} ${unlocked ? "" : "locked"}" data-module-select="${category}" data-module-id="${module.id}" ${unlocked ? "" : "disabled"}>
          <span class="module-pill-top">${escapeHtml(module.titulo)}</span>
          <span class="module-pill-bottom">${count} atividade(s)</span>
          <span class="module-pill-bottom">${statusLabel}${unlocked ? "" : " - conclua o modulo anterior"}</span>
        </button>
      `;
    })
    .join("");
}

function renderModuleDescription(category, module, student) {
  if (!module) {
    return "O professor ainda nao publicou modulos nesta area.";
  }

  if (!isModuleUnlocked(category, module.id, student)) {
    return "Este modulo ainda esta bloqueado. Conclua o modulo anterior para continuar a trilha do curso.";
  }

  if (category === "exercicios") {
    const level = module.dificuldade ? `Nivel ${module.dificuldade}.` : "";
    return `${level} Resolva as atividades em ordem. Cada exercicio concluido libera o proximo.`;
  }

  if (category === "videos") {
    return "Assista aos videos na sequencia da trilha. Cada video visto libera a proxima etapa.";
  }

  return "Abra a atividade atual para registrar seu estudo. As proximas etapas vao sendo liberadas em sequencia.";
}

function renderActivityCard(category, item, options = {}) {
  const { completed = false, unlocked = true, order = 1 } = options;

  if (category === "aulas") {
    return `
      <article class="content-card ${unlocked ? "" : "locked"}">
        <img class="content-image" src="${escapeAttr(item.capa_url || DEFAULT_IMAGES.aulas)}" alt="${escapeAttr(item.titulo)}" />
        <div class="content-card-body">
          <span class="pill-tag">Atividade ${order}</span>
          <h3>${escapeHtml(item.titulo)}</h3>
          <p>${escapeHtml(item.conteudo_resumo)}</p>
          <div class="card-actions">
            <button class="secondary-button" type="button" data-open-lesson="${item.id}" ${unlocked ? "" : "disabled"}>
              ${unlocked ? "Ler aula" : "Bloqueada por enquanto"}
            </button>
            <span class="status-chip ${completed ? "done" : unlocked ? "" : "locked"}">${completed ? "Estudada" : unlocked ? "Disponivel" : "Bloqueada"}</span>
          </div>
        </div>
      </article>
    `;
  }

  if (category === "videos") {
    return `
      <article class="content-card ${unlocked ? "" : "locked"}">
        <img class="content-image" src="${escapeAttr(item.capa_url || DEFAULT_IMAGES.videos)}" alt="${escapeAttr(item.titulo)}" />
        <div class="content-card-body">
          <span class="pill-tag">Atividade ${order}</span>
          <h3>${escapeHtml(item.titulo)}</h3>
          <p>${unlocked ? "Assista a explicacao e retorne para continuar seu progresso." : "Conclua a atividade anterior para liberar este video."}</p>
          <div class="card-actions">
            <button class="secondary-button" type="button" data-open-video="${item.id}" ${unlocked ? "" : "disabled"}>
              ${unlocked ? "Assistir video" : "Video bloqueado"}
            </button>
            <span class="status-chip ${completed ? "done" : unlocked ? "" : "locked"}">${completed ? "Assistido" : unlocked ? "Disponivel" : "Bloqueado"}</span>
          </div>
        </div>
      </article>
    `;
  }

  return `
    <article class="exercise-card ${unlocked ? "" : "locked"}">
      <div class="exercise-number">${order}</div>
      <div class="exercise-content">
        <span class="eyebrow">Atividade ${order}</span>
        <h3>${escapeHtml(item.titulo || `Questao ${order}`)}</h3>
        <p>${escapeHtml(item.enunciado)}</p>
        ${unlocked && item.resolucao ? `<details class="exercise-resolution"><summary>Ver explicacao e resolucao</summary><p>${escapeHtml(item.resolucao)}</p></details>` : ""}
        ${unlocked ? "" : `<p class="locked-copy">Conclua a atividade anterior para liberar esta etapa.</p>`}
      </div>
      <button class="mark-button ${completed ? "done" : ""}" type="button" data-toggle-exercise="${item.id}" ${unlocked ? "" : "disabled"}>
        ${completed ? "Concluido" : unlocked ? "Marcar como resolvido" : "Aguardando liberacao"}
      </button>
    </article>
  `;
}

function renderQuizRunner(module, moduleUnlocked) {
  const items = getOrderedActivities(module);

  if (!module || items.length === 0) {
    return renderEmptyCard("Nenhuma atividade publicada", "Assim que o professor cadastrar novas etapas, o quiz aparecera aqui.");
  }

  if (!moduleUnlocked) {
    return `
      <div class="quiz-card">
        <span class="eyebrow">Modulo bloqueado</span>
        <h3>Conclua o quiz anterior</h3>
        <p>Quando o aluno finalizar o modulo anterior, esta nova etapa sera liberada automaticamente.</p>
      </div>
    `;
  }

  const currentQuestion = items[state.quiz.questionIndex];
  if (!currentQuestion) {
    const percentage = Math.round((state.quiz.score / items.length) * 100);
    return `
      <div class="quiz-card">
        <span class="eyebrow">Resultado final</span>
        <h3>Quiz concluido</h3>
        <p class="quiz-score">${state.quiz.score} / ${items.length}</p>
        <p>Voce acertou ${percentage}% deste modulo.</p>
        <p>Ao finalizar este bloco, a proxima etapa do quiz fica liberada para o aluno.</p>
        <button class="primary-button" type="button" data-restart-quiz>Refazer quiz</button>
      </div>
    `;
  }

  const progress = Math.round((state.quiz.questionIndex / items.length) * 100);

  return `
    <div class="quiz-card">
      <div class="quiz-progress">
        <div class="quiz-progress-fill" style="width:${progress}%"></div>
      </div>
      <div class="quiz-head">
        <span class="eyebrow">Atividade ${state.quiz.questionIndex + 1} de ${items.length}</span>
        <strong>${escapeHtml(currentQuestion.titulo || currentQuestion.subcategoria || "Quiz")}</strong>
      </div>
      <h3>${escapeHtml(currentQuestion.pergunta)}</h3>
      <div class="quiz-options">
        ${currentQuestion.opcoes
          .map(
            (option, index) => `
              <button class="quiz-option ${getQuizOptionClass(option, currentQuestion)}" type="button" data-answer-index="${index}" ${state.quiz.answered ? "disabled" : ""}>
                <span>${String.fromCharCode(65 + index)}</span>
                <strong>${escapeHtml(option)}</strong>
              </button>
            `
          )
          .join("")}
      </div>
      ${state.quiz.answered ? renderQuizFeedback(currentQuestion) : ""}
      <div class="quiz-footer ${state.quiz.answered ? "visible" : ""}">
        <button class="secondary-button" type="button" data-next-question>Avancar</button>
      </div>
    </div>
  `;
}

function getQuizOptionClass(option, question) {
  if (!state.quiz.answered) return "";
  if (option === state.quiz.selectedOption && state.quiz.answerCorrect) return "is-correct";
  if (option === state.quiz.selectedOption && !state.quiz.answerCorrect) return "is-wrong";
  if (!state.quiz.answerCorrect && option === question.resposta_correta) return "is-answer";
  return "";
}

function renderQuizFeedback(question) {
  const isCorrect = Boolean(state.quiz.answerCorrect);
  return `
    <div class="quiz-feedback ${isCorrect ? "success" : "error"}">
      <strong>${isCorrect ? "Resposta correta." : "Resposta incorreta."}</strong>
      ${isCorrect ? "<p>Boa. Veja a explicacao para reforcar o raciocinio desta atividade.</p>" : `<p>Resposta correta: <strong>${escapeHtml(question.resposta_correta)}</strong></p>`}
      ${question.explicacao ? `<p>${escapeHtml(question.explicacao)}</p>` : ""}
    </div>
  `;
}

function renderFeedbackItems(items, professorView) {
  if (!items.length) {
    return renderEmptyCard("Nenhum feedback enviado", "Quando os alunos mandarem mensagens, elas aparecerao aqui.");
  }

  return items
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, professorView ? 6 : 5)
    .map(
      (item) => `
        <article class="feedback-item">
          <div class="feedback-item-head">
            <strong>${escapeHtml(item.nome)}</strong>
            <span>${formatDate(item.createdAt)}</span>
          </div>
          <p>${escapeHtml(item.mensagem)}</p>
          <small>${escapeHtml(item.email)}</small>
        </article>
      `
    )
    .join("");
}

function renderStudentCard(student) {
  const metrics = getStudentMetrics(student);
  return `
    <article class="student-card">
      <div class="student-card-head">
        <div>
          <strong>${escapeHtml(student.nome)}</strong>
          <span>${escapeHtml(student.comunidade || "Sem comunidade informada")}</span>
        </div>
        <span class="status-chip done">${metrics.progress}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width:${metrics.progress}%"></div>
      </div>
      <div class="student-stats">
        <span>Aulas: ${metrics.readLessons}</span>
        <span>Videos: ${metrics.watchedVideos}</span>
        <span>Exercicios: ${metrics.solvedExercises}</span>
        <span>Quizzes: ${metrics.quizAttempts}</span>
      </div>
      <small>Ultimo acesso: ${formatDate(student.ultimoAcesso)}</small>
    </article>
  `;
}

function renderManagerModules(category) {
  const modules = state.db[category];

  if (!modules.length) {
    return renderEmptyCard("Nenhum modulo cadastrado", "Use o formulario ao lado para criar o primeiro modulo.");
  }

  return modules
    .map((module) => {
      const isActive = state.selectedModules[category] === module.id;
      return `
        <div class="manager-module ${isActive ? "active" : ""}">
          <button type="button" class="manager-module-main" data-module-select="${category}" data-module-id="${module.id}">
            <strong>${escapeHtml(module.titulo)}</strong>
            <span>${module.atividades.length} item(ns)</span>
          </button>
          <div class="icon-actions">
            <button type="button" class="icon-button" data-edit-module="${category}:${module.id}" aria-label="Editar modulo">Editar</button>
            <button type="button" class="icon-button danger" data-delete-module="${category}:${module.id}" aria-label="Excluir modulo">Excluir</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderModuleForm(category) {
  return `
    <form class="stack-form" data-create-module="${category}">
      <div class="form-group">
        <label for="module-title-${category}">Titulo do modulo</label>
        <input id="module-title-${category}" name="title" type="text" placeholder="Ex: Modulo 3 - Medicoes no campo" required />
      </div>
      ${
        category === "exercicios"
          ? `
            <div class="form-group">
              <label for="module-difficulty-${category}">Nivel de dificuldade</label>
              <select id="module-difficulty-${category}" name="difficulty">
                <option value="facil">Facil</option>
                <option value="medio">Medio</option>
                <option value="dificil">Dificil</option>
              </select>
            </div>
          `
          : ""
      }
      <button class="primary-button" type="submit">Criar modulo</button>
    </form>
  `;
}

function renderActivityForm(category, activeModule) {
  if (!activeModule) {
    return renderEmptyCard("Sem modulo selecionado", "Crie um modulo para liberar o cadastro de atividades.");
  }

  if (category === "aulas") {
    return `
      <form class="stack-form" data-create-activity="aulas">
        <div class="form-group">
          <label for="lesson-topic">Subcategoria</label>
          <input id="lesson-topic" name="subcategoria" type="text" placeholder="Ex: Geometria rural" required />
        </div>
        <div class="form-group">
          <label for="lesson-title">Titulo da aula</label>
          <input id="lesson-title" name="titulo" type="text" placeholder="Ex: Area de terrenos" required />
        </div>
        <div class="form-group">
          <label for="lesson-image">Imagem de capa</label>
          <input id="lesson-image" name="capa_url" type="url" placeholder="https://..." />
        </div>
        <div class="form-group">
          <label for="lesson-summary">Resumo</label>
          <textarea id="lesson-summary" name="conteudo_resumo" rows="3" required></textarea>
        </div>
        <div class="form-group">
          <label for="lesson-body">Conteudo completo</label>
          <textarea id="lesson-body" name="conteudo_completo" rows="6" required></textarea>
        </div>
        <button class="primary-button" type="submit">Publicar aula</button>
      </form>
    `;
  }

  if (category === "videos") {
    return `
      <form class="stack-form" data-create-activity="videos">
        <div class="form-group">
          <label for="video-topic">Subcategoria</label>
          <input id="video-topic" name="subcategoria" type="text" required />
        </div>
        <div class="form-group">
          <label for="video-title">Titulo do video</label>
          <input id="video-title" name="titulo" type="text" required />
        </div>
        <div class="form-group">
          <label for="video-url">Link do video</label>
          <input id="video-url" name="video_url" type="url" placeholder="https://youtube.com/watch?v=..." required />
        </div>
        <div class="form-group">
          <label for="video-image">Thumbnail</label>
          <input id="video-image" name="capa_url" type="url" placeholder="https://..." />
        </div>
        <button class="primary-button" type="submit">Cadastrar video</button>
      </form>
    `;
  }

  if (category === "exercicios") {
    return `
      <form class="stack-form" data-create-activity="exercicios">
        <p class="panel-copy">Monte varias atividades deste modulo antes de publicar. Cada bloco abaixo vira uma etapa da trilha.</p>
        <div class="draft-list" data-draft-list="exercicios" data-next-draft="1">
          ${renderExerciseDraftCard(1)}
        </div>
        <div class="form-actions-row">
          <button class="secondary-button" type="button" data-add-activity-draft="exercicios">Adicionar outra atividade</button>
          <button class="primary-button" type="submit">Publicar atividades do modulo</button>
        </div>
      </form>
    `;
  }

  return `
    <form class="stack-form" data-create-activity="quiz">
      <p class="panel-copy">Cada atividade do quiz pode ter um nome proprio e uma pergunta principal. Use o botao abaixo para empilhar varias antes de salvar.</p>
      <div class="draft-list" data-draft-list="quiz" data-next-draft="1">
        ${renderQuizDraftCard(1)}
      </div>
      <div class="form-actions-row">
        <button class="secondary-button" type="button" data-add-activity-draft="quiz">Adicionar outra atividade</button>
        <button class="primary-button" type="submit">Publicar atividades do quiz</button>
      </div>
    </form>
  `;
}

function renderExerciseDraftCard(index) {
  return `
    <article class="draft-card" data-draft-card="exercicios">
      <div class="draft-card-head">
        <div>
          <span class="eyebrow">Etapa do modulo</span>
          <h4 data-draft-card-title>Atividade ${index}</h4>
        </div>
        ${index > 1 ? `<button class="icon-button danger" type="button" data-remove-activity-draft>Remover</button>` : ""}
      </div>
      <div class="form-group">
        <label for="exercise-title-${index}">Titulo da atividade</label>
        <input id="exercise-title-${index}" name="titulo[]" type="text" placeholder="Ex: Questao sobre area" required />
      </div>
      <div class="form-group">
        <label for="exercise-body-${index}">Enunciado</label>
        <textarea id="exercise-body-${index}" name="enunciado[]" rows="5" required></textarea>
      </div>
      <div class="form-group">
        <label for="exercise-resolution-${index}">Explicacao / resolucao</label>
        <textarea id="exercise-resolution-${index}" name="resolucao[]" rows="4" placeholder="Ex: Area = comprimento x largura. Portanto 12 x 5 = 60 m2."></textarea>
      </div>
    </article>
  `;
}

function renderQuizDraftCard(index) {
  return `
    <article class="draft-card" data-draft-card="quiz">
      <div class="draft-card-head">
        <div>
          <span class="eyebrow">Etapa do quiz</span>
          <h4 data-draft-card-title>Atividade ${index}</h4>
        </div>
        ${index > 1 ? `<button class="icon-button danger" type="button" data-remove-activity-draft>Remover</button>` : ""}
      </div>
      <div class="form-group">
        <label for="quiz-title-${index}">Nome da atividade</label>
        <input id="quiz-title-${index}" name="titulo[]" type="text" placeholder="Ex: Atividade sobre irrigacao" required />
      </div>
      <div class="form-group">
        <label for="quiz-topic-${index}">Topico</label>
        <input id="quiz-topic-${index}" name="subcategoria[]" type="text" required />
      </div>
      <div class="form-group">
        <label for="quiz-question-${index}">Pergunta principal</label>
        <textarea id="quiz-question-${index}" name="pergunta[]" rows="3" required></textarea>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label for="quiz-option-a-${index}">Alternativa A</label>
          <input id="quiz-option-a-${index}" name="opcaoA[]" type="text" required />
        </div>
        <div class="form-group">
          <label for="quiz-option-b-${index}">Alternativa B</label>
          <input id="quiz-option-b-${index}" name="opcaoB[]" type="text" required />
        </div>
        <div class="form-group">
          <label for="quiz-option-c-${index}">Alternativa C</label>
          <input id="quiz-option-c-${index}" name="opcaoC[]" type="text" required />
        </div>
        <div class="form-group">
          <label for="quiz-option-d-${index}">Alternativa D</label>
          <input id="quiz-option-d-${index}" name="opcaoD[]" type="text" required />
        </div>
      </div>
      <div class="form-group">
        <label for="quiz-correct-${index}">Resposta correta</label>
        <select id="quiz-correct-${index}" name="correta[]">
          <option value="A">Alternativa A</option>
          <option value="B">Alternativa B</option>
          <option value="C">Alternativa C</option>
          <option value="D">Alternativa D</option>
        </select>
      </div>
      <div class="form-group">
        <label for="quiz-explanation-${index}">Explicacao da resposta</label>
        <textarea id="quiz-explanation-${index}" name="explicacao[]" rows="4" placeholder="Ex: 85% de 180 = 153, porque 0,85 x 180 = 153."></textarea>
      </div>
    </article>
  `;
}

function renderManagerActivities(category, activeModule) {
  if (!activeModule) {
    return renderEmptyCard("Nenhum modulo ativo", "Selecione ou crie um modulo para acompanhar as atividades.");
  }

  if (!activeModule.atividades.length) {
    return renderEmptyCard("Modulo vazio", "Cadastre a primeira atividade usando o formulario acima.");
  }

  return getOrderedActivities(activeModule)
    .map((activity, index) => {
      const title = activity.titulo || activity.pergunta || activity.enunciado || "Atividade";
      const body = activity.conteudo_resumo || activity.enunciado || activity.video_url || activity.pergunta;
      return `
        <article class="manager-activity-card">
          <div>
            <span class="eyebrow">${category === "quiz" ? "Pergunta" : "Atividade"} ${index + 1}</span>
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(body)}</p>
          </div>
          <div class="icon-actions">
            <button type="button" class="icon-button" data-edit-activity="${category}:${activeModule.id}:${activity.id}">Editar</button>
            <button type="button" class="icon-button danger" data-delete-activity="${category}:${activeModule.id}:${activity.id}">Excluir</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderEmptyCard(title, text) {
  return `
    <article class="empty-card">
      <h3>${title}</h3>
      <p>${text}</p>
    </article>
  `;
}

function bindLearningEvents(category) {
  qsa(`[data-module-select="${category}"]`).forEach((button) => {
    button.addEventListener("click", () => {
      const moduleId = button.dataset.moduleId;
      const student = getCurrentStudent();
      if (!isModuleUnlocked(category, moduleId, student)) {
        showToast("Conclua o modulo anterior para liberar esta etapa.", "info");
        return;
      }
      state.selectedModules[category] = moduleId;
      if (category === "quiz") {
        resetQuizState(moduleId);
      }
      if (category === "quiz") {
        renderQuizPage(document.getElementById("page-root"));
      } else {
        renderLearningPage(document.getElementById("page-root"), category);
      }
    });
  });

  if (category === "aulas") {
    qsa("[data-open-lesson]").forEach((button) => {
      button.addEventListener("click", () => openLesson(button.dataset.openLesson));
    });
  }

  if (category === "videos") {
    qsa("[data-open-video]").forEach((button) => {
      button.addEventListener("click", () => openVideo(button.dataset.openVideo));
    });
  }

  if (category === "exercicios") {
    qsa("[data-toggle-exercise]").forEach((button) => {
      button.addEventListener("click", () => {
        toggleExercise(button.dataset.toggleExercise);
        renderLearningPage(document.getElementById("page-root"), "exercicios");
      });
    });
  }
}

function bindQuizEvents() {
  bindLearningEvents("quiz");

  qsa("[data-answer-index]").forEach((button) => {
    button.addEventListener("click", () => handleQuizAnswer(Number(button.dataset.answerIndex)));
  });

  document.querySelector("[data-next-question]")?.addEventListener("click", () => {
    state.quiz.questionIndex += 1;
    state.quiz.answered = false;
    state.quiz.selectedOption = null;
    state.quiz.answerCorrect = null;
    renderQuizPage(document.getElementById("page-root"));
  });

  document.querySelector("[data-restart-quiz]")?.addEventListener("click", () => {
    resetQuizState(state.selectedModules.quiz);
    renderQuizPage(document.getElementById("page-root"));
  });
}

function bindProfessorEvents() {
  qsa("[data-manager-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.professorCategory = button.dataset.managerTab;
      normalizeSelections();
      renderProfessorPage();
    });
  });

  qsa(`[data-module-select="${state.professorCategory}"]`).forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedModules[state.professorCategory] = button.dataset.moduleId;
      if (state.professorCategory === "quiz") {
        resetQuizState(button.dataset.moduleId);
      }
      renderProfessorPage();
    });
  });

  document.querySelector(`[data-create-module="${state.professorCategory}"]`)?.addEventListener("submit", handleCreateModule);
  document.querySelector(`[data-create-activity="${state.professorCategory}"]`)?.addEventListener("submit", handleCreateActivity);

  qsa("[data-add-activity-draft]").forEach((button) => {
    button.addEventListener("click", () => addActivityDraft(button.dataset.addActivityDraft));
  });

  qsa("[data-draft-list]").forEach((list) => {
    list.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-activity-draft]");
      if (!removeButton) return;
      removeActivityDraft(list, removeButton.closest("[data-draft-card]"));
    });
  });

  qsa("[data-edit-module]").forEach((button) => {
    button.addEventListener("click", () => openModuleEditor(button.dataset.editModule));
  });

  qsa("[data-delete-module]").forEach((button) => {
    button.addEventListener("click", () => deleteModule(button.dataset.deleteModule));
  });

  qsa("[data-edit-activity]").forEach((button) => {
    button.addEventListener("click", () => openActivityEditor(button.dataset.editActivity));
  });

  qsa("[data-delete-activity]").forEach((button) => {
    button.addEventListener("click", () => deleteActivity(button.dataset.deleteActivity));
  });
}

function addActivityDraft(category) {
  const list = document.querySelector(`[data-draft-list="${category}"]`);
  if (!list) return;

  const nextIndex = Number(list.dataset.nextDraft || "1") + 1;
  list.dataset.nextDraft = String(nextIndex);

  const html = category === "quiz" ? renderQuizDraftCard(nextIndex) : renderExerciseDraftCard(nextIndex);
  list.insertAdjacentHTML("beforeend", html);
  syncDraftCardTitles(list);

  list.querySelector("[data-draft-card]:last-child input, [data-draft-card]:last-child textarea")?.focus();
}

function removeActivityDraft(list, card) {
  if (!list || !card) return;

  if (list.querySelectorAll("[data-draft-card]").length === 1) {
    showToast("Deixe pelo menos uma atividade pronta para publicar.", "info");
    return;
  }

  card.remove();
  syncDraftCardTitles(list);
}

function syncDraftCardTitles(list) {
  const category = list.dataset.draftList;
  qsa("[data-draft-card]", list).forEach((card, index) => {
    const title = category === "quiz" ? `Atividade ${index + 1} do quiz` : `Atividade ${index + 1}`;
    card.querySelector("[data-draft-card-title]")?.replaceChildren(title);
  });
}

function handleTeacherLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const email = String(formData.get("teacher-email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("teacher-password") || "").trim();

  if (email !== TEACHER_LOGIN.email || password !== TEACHER_LOGIN.password) {
    showToast("Email ou senha do professor incorretos.", "error");
    return;
  }

  state.teacherAuthed = true;
  writeStorage(STORAGE_KEYS.teacherAuth, "1");
  renderProfessorShell();
  renderProfessorPage();
  showToast("Area do professor liberada.", "success");
}

function handleStudentProfileSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = sanitizeText(formData.get("student-name")) || "Visitante do Campo";
  const community = sanitizeText(formData.get("student-community")) || "Comunidade nao informada";

  const student = getCurrentStudent();
  student.nome = name;
  student.comunidade = community;
  student.ultimoAcesso = new Date().toISOString();

  saveDatabase();
  writeStorage(STORAGE_KEYS.currentStudent, student.id);
  renderHomePage(document.getElementById("page-root"));
  showToast("Identificacao do aluno salva.", "success");
}

function handleFeedbackSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const student = getCurrentStudent();

  student.nome = sanitizeText(formData.get("feedback-name")) || student.nome;
  const email = sanitizeText(formData.get("feedback-email"));
  const mensagem = sanitizeText(formData.get("feedback-message"));

  if (!email || !mensagem) {
    showToast("Preencha email e mensagem antes de enviar.", "error");
    return;
  }

  state.db.feedbacks.unshift({
    id: createId("feedback"),
    nome: student.nome,
    email,
    mensagem,
    createdAt: new Date().toISOString(),
    studentId: student.id
  });

  student.feedbacks += 1;
  student.ultimoAcesso = new Date().toISOString();

  saveDatabase();
  renderFeedbackPage(document.getElementById("page-root"));
  showToast("Feedback enviado com sucesso.", "success");
}

function handleCreateModule(event) {
  event.preventDefault();

  const category = event.currentTarget.dataset.createModule;
  const formData = new FormData(event.currentTarget);
  const title = sanitizeText(formData.get("title"));

  if (!title) {
    showToast("Informe um titulo para o modulo.", "error");
    return;
  }

  const module = {
    id: createId(`module_${category}`),
    titulo: title,
    atividades: []
  };

  if (category === "exercicios") {
    module.dificuldade = sanitizeText(formData.get("difficulty")) || "facil";
  }

  state.db[category].push(module);
  state.selectedModules[category] = module.id;
  if (category === "quiz") {
    resetQuizState(module.id);
  }

  saveDatabase();
  renderProfessorPage();
  showToast("Modulo criado com sucesso.", "success");
}

function handleCreateActivity(event) {
  event.preventDefault();

  const category = event.currentTarget.dataset.createActivity;
  const activeModule = getActiveModule(category);

  if (!activeModule) {
    showToast("Crie um modulo antes de cadastrar uma atividade.", "error");
    return;
  }

  const formData = new FormData(event.currentTarget);
  const createdAt = new Date().toISOString();
  const nextOrder = getOrderedActivities(activeModule).length + 1;
  let createdCount = 0;

  if (category === "aulas") {
    activeModule.atividades.push({
      id: createId("lesson"),
      ordem: nextOrder,
      subcategoria: sanitizeText(formData.get("subcategoria")),
      titulo: sanitizeText(formData.get("titulo")),
      capa_url: sanitizeText(formData.get("capa_url")) || DEFAULT_IMAGES.aulas,
      conteudo_resumo: sanitizeText(formData.get("conteudo_resumo")),
      conteudo_completo: sanitizeText(formData.get("conteudo_completo")),
      data_criacao: createdAt
    });
    createdCount = 1;
  }

  if (category === "videos") {
    activeModule.atividades.push({
      id: createId("video"),
      ordem: nextOrder,
      subcategoria: sanitizeText(formData.get("subcategoria")),
      titulo: sanitizeText(formData.get("titulo")),
      capa_url: sanitizeText(formData.get("capa_url")) || DEFAULT_IMAGES.videos,
      video_url: sanitizeText(formData.get("video_url")),
      data_criacao: createdAt
    });
    createdCount = 1;
  }

  if (category === "exercicios") {
    const titles = formData.getAll("titulo[]").map((value) => sanitizeText(value));
    const statements = formData.getAll("enunciado[]").map((value) => sanitizeText(value));
    const resolutions = formData.getAll("resolucao[]").map((value) => sanitizeText(value));

    titles.forEach((title, index) => {
      const enunciado = statements[index] || "";
      if (!title || !enunciado) return;

      const order = nextOrder + createdCount;
      activeModule.atividades.push({
        id: createId("exercise"),
        ordem: order,
        titulo: title,
        num: order,
        enunciado,
        resolucao: resolutions[index] || ""
      });
      createdCount += 1;
    });
  }

  if (category === "quiz") {
    const titles = formData.getAll("titulo[]").map((value) => sanitizeText(value));
    const topics = formData.getAll("subcategoria[]").map((value) => sanitizeText(value));
    const questions = formData.getAll("pergunta[]").map((value) => sanitizeText(value));
    const optionAs = formData.getAll("opcaoA[]").map((value) => sanitizeText(value));
    const optionBs = formData.getAll("opcaoB[]").map((value) => sanitizeText(value));
    const optionCs = formData.getAll("opcaoC[]").map((value) => sanitizeText(value));
    const optionDs = formData.getAll("opcaoD[]").map((value) => sanitizeText(value));
    const correctLetters = formData.getAll("correta[]").map((value) => sanitizeText(value) || "A");
    const explanations = formData.getAll("explicacao[]").map((value) => sanitizeText(value));

    topics.forEach((topic, index) => {
      const title = titles[index] || "";
      const question = questions[index] || "";
      const options = [optionAs[index] || "", optionBs[index] || "", optionCs[index] || "", optionDs[index] || ""];
      if (!title || !topic || !question || options.some((option) => !option)) return;

      const correctIndex = ["A", "B", "C", "D"].indexOf(correctLetters[index]);
      activeModule.atividades.push({
        id: createId("quiz"),
        ordem: nextOrder + createdCount,
        titulo: title,
        subcategoria: topic,
        pergunta: question,
        opcoes: options,
        explicacao: explanations[index] || "",
        resposta_correta: options[correctIndex >= 0 ? correctIndex : 0]
      });
      createdCount += 1;
    });
  }

  if (!createdCount) {
    showToast("Preencha pelo menos uma atividade completa antes de publicar.", "error");
    return;
  }

  reindexModuleActivities(category, activeModule);
  saveDatabase();
  renderProfessorPage();
  showToast(
    createdCount > 1 ? `${createdCount} atividades publicadas na sequencia do modulo.` : "Atividade publicada na sequencia do modulo.",
    "success"
  );
}

function openLesson(activityId) {
  const context = findActivityContext("aulas", activityId);
  if (!context) return;
  if (!isActivityUnlocked("aulas", context.module, activityId, getCurrentStudent())) {
    showToast("Conclua a atividade anterior para liberar esta aula.", "info");
    return;
  }
  const { activity } = context;

  markLessonAsRead(activityId);

  openModal(`
    <div class="modal-content">
      <img class="modal-image" src="${escapeAttr(activity.capa_url || DEFAULT_IMAGES.aulas)}" alt="${escapeAttr(activity.titulo)}" />
      <div class="modal-body">
        <span class="pill-tag">${escapeHtml(activity.subcategoria || "Aula")}</span>
        <h2>${escapeHtml(activity.titulo)}</h2>
        <p class="modal-lead">${escapeHtml(activity.conteudo_resumo)}</p>
        <p>${escapeHtml(activity.conteudo_completo)}</p>
        <button class="primary-button" type="button" data-close-modal>Fechar leitura</button>
      </div>
    </div>
  `);

  renderStudentPage();
}

function openVideo(activityId) {
  const context = findActivityContext("videos", activityId);
  if (!context) return;
  if (!isActivityUnlocked("videos", context.module, activityId, getCurrentStudent())) {
    showToast("Conclua a atividade anterior para liberar este video.", "info");
    return;
  }
  const { activity } = context;

  markVideoAsWatched(activityId);
  saveDatabase();
  renderStudentPage();
  window.open(activity.video_url, "_blank", "noopener");
}

function toggleExercise(activityId) {
  const context = findActivityContext("exercicios", activityId);
  if (!context) return;
  if (!isActivityUnlocked("exercicios", context.module, activityId, getCurrentStudent())) {
    showToast("Conclua a atividade anterior para liberar este exercicio.", "info");
    return;
  }
  const student = getCurrentStudent();
  student.completedExercises = toggleInArray(student.completedExercises, activityId);
  student.ultimoAcesso = new Date().toISOString();
  saveDatabase();
}

function handleQuizAnswer(index) {
  if (state.quiz.answered) return;

  const activeModule = getActiveModule("quiz");
  const items = getOrderedActivities(activeModule);
  const question = items[state.quiz.questionIndex];
  if (!question) return;

  const selectedOption = question.opcoes[index];
  const isCorrect = selectedOption === question.resposta_correta;
  state.quiz.selectedOption = selectedOption;
  state.quiz.answerCorrect = isCorrect;
  state.quiz.answered = true;

  if (isCorrect) {
    state.quiz.score += 1;
    showToast("Resposta correta.", "success");
  } else {
    showToast("Resposta incorreta. Revise e avance.", "error");
  }

  if (state.quiz.questionIndex === items.length - 1 && !state.quiz.attemptSaved) {
    saveQuizAttempt(activeModule.id, state.quiz.score, items.length);
    state.quiz.attemptSaved = true;
  }

  renderQuizPage(document.getElementById("page-root"));
}

function saveQuizAttempt(moduleId, score, total) {
  const student = getCurrentStudent();
  const normalizedScore = Math.min(score, total);

  student.quizAttempts.unshift({
    id: createId("attempt"),
    moduleId,
    score: normalizedScore,
    total,
    createdAt: new Date().toISOString()
  });
  student.ultimoAcesso = new Date().toISOString();
  saveDatabase();
}

function openModuleEditor(payload) {
  const [category, moduleId] = payload.split(":");
  const module = state.db[category].find((item) => item.id === moduleId);
  if (!module) return;

  openModal(`
    <div class="modal-body">
      <h2>Editar modulo</h2>
      <form id="edit-module-form" class="stack-form">
        <div class="form-group">
          <label for="edit-module-title">Titulo</label>
          <input id="edit-module-title" name="title" type="text" value="${escapeAttr(module.titulo)}" required />
        </div>
        ${
          category === "exercicios"
            ? `
              <div class="form-group">
                <label for="edit-module-difficulty">Dificuldade</label>
                <select id="edit-module-difficulty" name="difficulty">
                  <option value="facil" ${module.dificuldade === "facil" ? "selected" : ""}>Facil</option>
                  <option value="medio" ${module.dificuldade === "medio" ? "selected" : ""}>Medio</option>
                  <option value="dificil" ${module.dificuldade === "dificil" ? "selected" : ""}>Dificil</option>
                </select>
              </div>
            `
            : ""
        }
        <button class="primary-button" type="submit">Salvar modulo</button>
      </form>
    </div>
  `);

  document.getElementById("edit-module-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    module.titulo = sanitizeText(formData.get("title"));
    if (category === "exercicios") {
      module.dificuldade = sanitizeText(formData.get("difficulty")) || module.dificuldade;
    }
    saveDatabase();
    closeModal();
    renderProfessorPage();
    showToast("Modulo atualizado.", "success");
  });
}

function deleteModule(payload) {
  const [category, moduleId] = payload.split(":");
  if (!window.confirm("Deseja excluir este modulo e todas as atividades dele?")) {
    return;
  }

  state.db[category] = state.db[category].filter((item) => item.id !== moduleId);
  if (state.selectedModules[category] === moduleId) {
    state.selectedModules[category] = state.db[category][0]?.id || null;
  }
  if (category === "quiz") {
    resetQuizState(state.selectedModules.quiz);
  }
  saveDatabase();
  renderProfessorPage();
  showToast("Modulo removido.", "info");
}

function openActivityEditor(payload) {
  const [category, moduleId, activityId] = payload.split(":");
  const module = state.db[category].find((item) => item.id === moduleId);
  const activity = module?.atividades.find((item) => item.id === activityId);
  if (!module || !activity) return;

  openModal(`
    <div class="modal-body">
      <h2>Editar ${CATEGORY_META[category].activityTitle.toLowerCase()}</h2>
      ${renderActivityEditorForm(category, activity)}
    </div>
  `);

  document.getElementById("edit-activity-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (category === "aulas") {
      activity.subcategoria = sanitizeText(formData.get("subcategoria"));
      activity.titulo = sanitizeText(formData.get("titulo"));
      activity.capa_url = sanitizeText(formData.get("capa_url")) || DEFAULT_IMAGES.aulas;
      activity.conteudo_resumo = sanitizeText(formData.get("conteudo_resumo"));
      activity.conteudo_completo = sanitizeText(formData.get("conteudo_completo"));
    }

    if (category === "videos") {
      activity.subcategoria = sanitizeText(formData.get("subcategoria"));
      activity.titulo = sanitizeText(formData.get("titulo"));
      activity.capa_url = sanitizeText(formData.get("capa_url")) || DEFAULT_IMAGES.videos;
      activity.video_url = sanitizeText(formData.get("video_url"));
    }

    if (category === "exercicios") {
      activity.titulo = sanitizeText(formData.get("titulo"));
      activity.enunciado = sanitizeText(formData.get("enunciado"));
      activity.resolucao = sanitizeText(formData.get("resolucao"));
    }

    if (category === "quiz") {
      const options = [
        sanitizeText(formData.get("opcaoA")),
        sanitizeText(formData.get("opcaoB")),
        sanitizeText(formData.get("opcaoC")),
        sanitizeText(formData.get("opcaoD"))
      ];
      const correctLetter = sanitizeText(formData.get("correta")) || "A";
      const correctIndex = ["A", "B", "C", "D"].indexOf(correctLetter);

      activity.titulo = sanitizeText(formData.get("titulo"));
      activity.subcategoria = sanitizeText(formData.get("subcategoria"));
      activity.pergunta = sanitizeText(formData.get("pergunta"));
      activity.opcoes = options;
      activity.explicacao = sanitizeText(formData.get("explicacao"));
      activity.resposta_correta = options[correctIndex >= 0 ? correctIndex : 0];
    }

    saveDatabase();
    closeModal();
    renderProfessorPage();
    showToast("Atividade atualizada.", "success");
  });
}

function renderActivityEditorForm(category, activity) {
  if (category === "aulas") {
    return `
      <form id="edit-activity-form" class="stack-form">
        <div class="form-group">
          <label>Subcategoria</label>
          <input name="subcategoria" type="text" value="${escapeAttr(activity.subcategoria || "")}" required />
        </div>
        <div class="form-group">
          <label>Titulo</label>
          <input name="titulo" type="text" value="${escapeAttr(activity.titulo || "")}" required />
        </div>
        <div class="form-group">
          <label>Imagem</label>
          <input name="capa_url" type="url" value="${escapeAttr(activity.capa_url || "")}" />
        </div>
        <div class="form-group">
          <label>Resumo</label>
          <textarea name="conteudo_resumo" rows="3" required>${escapeHtml(activity.conteudo_resumo || "")}</textarea>
        </div>
        <div class="form-group">
          <label>Conteudo completo</label>
          <textarea name="conteudo_completo" rows="6" required>${escapeHtml(activity.conteudo_completo || "")}</textarea>
        </div>
        <button class="primary-button" type="submit">Salvar alteracoes</button>
      </form>
    `;
  }

  if (category === "videos") {
    return `
      <form id="edit-activity-form" class="stack-form">
        <div class="form-group">
          <label>Subcategoria</label>
          <input name="subcategoria" type="text" value="${escapeAttr(activity.subcategoria || "")}" required />
        </div>
        <div class="form-group">
          <label>Titulo</label>
          <input name="titulo" type="text" value="${escapeAttr(activity.titulo || "")}" required />
        </div>
        <div class="form-group">
          <label>Thumbnail</label>
          <input name="capa_url" type="url" value="${escapeAttr(activity.capa_url || "")}" />
        </div>
        <div class="form-group">
          <label>Link do video</label>
          <input name="video_url" type="url" value="${escapeAttr(activity.video_url || "")}" required />
        </div>
        <button class="primary-button" type="submit">Salvar alteracoes</button>
      </form>
    `;
  }

  if (category === "exercicios") {
    return `
      <form id="edit-activity-form" class="stack-form">
        <div class="form-group">
          <label>Titulo</label>
          <input name="titulo" type="text" value="${escapeAttr(activity.titulo || "")}" required />
        </div>
        <div class="form-group">
          <label>Enunciado</label>
          <textarea name="enunciado" rows="5" required>${escapeHtml(activity.enunciado || "")}</textarea>
        </div>
        <div class="form-group">
          <label>Explicacao / resolucao</label>
          <textarea name="resolucao" rows="4">${escapeHtml(activity.resolucao || "")}</textarea>
        </div>
        <button class="primary-button" type="submit">Salvar alteracoes</button>
      </form>
    `;
  }

  return `
    <form id="edit-activity-form" class="stack-form">
      <div class="form-group">
        <label>Nome da atividade</label>
        <input name="titulo" type="text" value="${escapeAttr(activity.titulo || "")}" required />
      </div>
      <div class="form-group">
        <label>Topico</label>
        <input name="subcategoria" type="text" value="${escapeAttr(activity.subcategoria || "")}" required />
      </div>
      <div class="form-group">
        <label>Pergunta principal</label>
        <textarea name="pergunta" rows="3" required>${escapeHtml(activity.pergunta || "")}</textarea>
      </div>
      <div class="form-grid">
        <div class="form-group"><label>Alternativa A</label><input name="opcaoA" type="text" value="${escapeAttr(activity.opcoes?.[0] || "")}" required /></div>
        <div class="form-group"><label>Alternativa B</label><input name="opcaoB" type="text" value="${escapeAttr(activity.opcoes?.[1] || "")}" required /></div>
        <div class="form-group"><label>Alternativa C</label><input name="opcaoC" type="text" value="${escapeAttr(activity.opcoes?.[2] || "")}" required /></div>
        <div class="form-group"><label>Alternativa D</label><input name="opcaoD" type="text" value="${escapeAttr(activity.opcoes?.[3] || "")}" required /></div>
      </div>
      <div class="form-group">
        <label>Resposta correta</label>
        <select name="correta">
          ${["A", "B", "C", "D"]
            .map((letter, index) => {
              const selected = activity.resposta_correta === activity.opcoes?.[index] ? "selected" : "";
              return `<option value="${letter}" ${selected}>Alternativa ${letter}</option>`;
            })
            .join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Explicacao da resposta</label>
        <textarea name="explicacao" rows="4">${escapeHtml(activity.explicacao || "")}</textarea>
      </div>
      <button class="primary-button" type="submit">Salvar alteracoes</button>
    </form>
  `;
}

function deleteActivity(payload) {
  const [category, moduleId, activityId] = payload.split(":");
  if (!window.confirm("Deseja excluir esta atividade?")) {
    return;
  }

  const module = state.db[category].find((item) => item.id === moduleId);
  if (!module) return;

  module.atividades = module.atividades.filter((item) => item.id !== activityId);
  reindexModuleActivities(category, module);
  saveDatabase();
  renderProfessorPage();
  showToast("Atividade removida.", "info");
}

function openModal(content) {
  const root = document.getElementById("modal-root");
  if (!root) return;

  root.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-card">
        <button class="modal-close" type="button" data-close-modal aria-label="Fechar">x</button>
        ${content}
      </div>
    </div>
  `;
}

function closeModal() {
  const root = document.getElementById("modal-root");
  if (root) {
    root.innerHTML = "";
  }
}

function ensureCurrentStudent() {
  const storedId = readStorage(STORAGE_KEYS.currentStudent);
  let student = state.db.students.find((item) => item.id === storedId);

  if (!student) {
    student = {
      id: createId("student"),
      nome: "Visitante do Campo",
      comunidade: "Comunidade nao informada",
      readLessons: [],
      watchedVideos: [],
      completedExercises: [],
      quizAttempts: [],
      feedbacks: 0,
      ultimoAcesso: new Date().toISOString()
    };
    state.db.students.unshift(student);
    saveDatabase();
    writeStorage(STORAGE_KEYS.currentStudent, student.id);
  }

  state.currentStudentId = student.id;
  student.ultimoAcesso = new Date().toISOString();
  normalizeSelections();
  saveDatabase();
}

function getCurrentStudent() {
  return state.db.students.find((item) => item.id === state.currentStudentId) || state.db.students[0];
}

function getStudentMetrics(student) {
  const totalLessons = countActivities("aulas");
  const totalVideos = countActivities("videos");
  const totalExercises = countActivities("exercicios");
  const totalQuizModules = state.db.quiz.length;

  const readLessons = student.readLessons.length;
  const watchedVideos = student.watchedVideos.length;
  const solvedExercises = student.completedExercises.length;
  const quizAttempts = student.quizAttempts.length;

  const completedBlocks =
    readLessons + watchedVideos + solvedExercises + unique(student.quizAttempts.map((item) => item.moduleId)).length;
  const totalBlocks = Math.max(totalLessons + totalVideos + totalExercises + totalQuizModules, 1);
  const progress = Math.min(100, Math.round((completedBlocks / totalBlocks) * 100));

  return {
    readLessons,
    watchedVideos,
    solvedExercises,
    quizAttempts,
    progress
  };
}

function getProfessorMetrics() {
  const studentsCount = state.db.students.length;
  const publishedActivities =
    countActivities("aulas") + countActivities("videos") + countActivities("exercicios") + countActivities("quiz");
  const feedbackCount = state.db.feedbacks.length;
  const averageProgress =
    studentsCount > 0
      ? Math.round(state.db.students.reduce((sum, student) => sum + getStudentMetrics(student).progress, 0) / studentsCount)
      : 0;

  return {
    studentsCount,
    publishedActivities,
    feedbackCount,
    averageProgress
  };
}

function countActivities(category) {
  return state.db[category].reduce((total, module) => total + module.atividades.length, 0);
}

function getOrderedActivities(module) {
  if (!module?.atividades?.length) return [];

  return module.atividades
    .slice()
    .sort((a, b) => getActivityOrder(a) - getActivityOrder(b));
}

function getActivityOrder(activity) {
  const order = Number(activity?.ordem || activity?.num || 0);
  return Number.isFinite(order) && order > 0 ? order : 9999;
}

function reindexModuleActivities(category, module) {
  if (!module?.atividades) return;

  module.atividades = getOrderedActivities(module).map((activity, index) => ({
    ...activity,
    ordem: index + 1,
    ...(category === "exercicios" ? { num: index + 1 } : {})
  }));
}

function isModuleCompleted(category, module, student) {
  const items = getOrderedActivities(module);
  if (!items.length) return true;

  if (category === "quiz") {
    return student.quizAttempts.some((attempt) => attempt.moduleId === module.id);
  }

  const completedSet = getCompletedSet(category, student);
  return items.every((item) => completedSet.has(item.id));
}

function isModuleUnlocked(category, moduleId, student) {
  const moduleIndex = state.db[category].findIndex((item) => item.id === moduleId);
  if (moduleIndex <= 0) return true;

  const previousModule = state.db[category][moduleIndex - 1];
  return isModuleCompleted(category, previousModule, student);
}

function isActivityUnlocked(category, module, activityId, student) {
  if (!module || !isModuleUnlocked(category, module.id, student)) {
    return false;
  }

  const items = getOrderedActivities(module);
  const currentIndex = items.findIndex((item) => item.id === activityId);
  if (currentIndex < 0) return false;
  if (currentIndex === 0) return true;

  const completedSet = getCompletedSet(category, student);
  return completedSet.has(items[currentIndex - 1].id);
}

function getCompletedSet(category, student) {
  if (category === "aulas") return new Set(student.readLessons);
  if (category === "videos") return new Set(student.watchedVideos);
  return new Set(student.completedExercises);
}

function markLessonAsRead(activityId) {
  const student = getCurrentStudent();
  if (!student.readLessons.includes(activityId)) {
    student.readLessons.push(activityId);
  }
  student.ultimoAcesso = new Date().toISOString();
  saveDatabase();
}

function markVideoAsWatched(activityId) {
  const student = getCurrentStudent();
  if (!student.watchedVideos.includes(activityId)) {
    student.watchedVideos.push(activityId);
  }
  student.ultimoAcesso = new Date().toISOString();
}

function getActiveModule(category, options = {}) {
  const modules = state.db[category];
  if (!modules.length) return null;

  const student = options.student || null;
  const selectedId = state.selectedModules[category];
  const active = modules.find((item) => item.id === selectedId);
  if (active && (!options.respectUnlock || !student || isModuleUnlocked(category, active.id, student))) return active;

  const fallback =
    options.respectUnlock && student
      ? modules.find((item) => isModuleUnlocked(category, item.id, student)) || modules[0]
      : modules[0];

  state.selectedModules[category] = fallback.id;
  return fallback;
}

function normalizeSelections() {
  const student = state.currentStudentId ? getCurrentStudent() : null;
  Object.keys(CATEGORY_META).forEach((category) => {
    const modules = state.db[category];
    if (!modules.length) {
      state.selectedModules[category] = null;
      return;
    }

    const selected = modules.find((item) => item.id === state.selectedModules[category]);
    const selectedIsAllowed = !student || (selected && isModuleUnlocked(category, selected.id, student));

    if (!selected || !selectedIsAllowed) {
      const fallback =
        student ? modules.find((item) => isModuleUnlocked(category, item.id, student)) || modules[0] : modules[0];
      state.selectedModules[category] = fallback.id;
    }
  });
}

function resetQuizState(moduleId) {
  state.quiz.moduleId = moduleId || state.db.quiz[0]?.id || null;
  state.quiz.questionIndex = 0;
  state.quiz.score = 0;
  state.quiz.answered = false;
  state.quiz.selectedOption = null;
  state.quiz.answerCorrect = null;
  state.quiz.attemptSaved = false;
}

function findActivity(category, activityId) {
  return findActivityContext(category, activityId)?.activity || null;
}

function findActivityContext(category, activityId) {
  for (const module of state.db[category]) {
    const activity = module.atividades.find((item) => item.id === activityId);
    if (activity) return { module, activity };
  }
  return null;
}

function createSeedDatabase() {
  return {
    aulas: [
      {
        id: "mod-aulas-1",
        titulo: "Modulo 1 - Etnomatematica na pratica",
        atividades: [
          {
            id: "aula-1",
            subcategoria: "Etnomatematica",
            titulo: "Medicoes do campo e saberes da comunidade",
            capa_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80",
            conteudo_resumo: "Como as medicoes de terras, canteiros e distancias aparecem no dia a dia da agricultura.",
            conteudo_completo:
              "A matematica do campo aparece quando o agricultor mede um terreno, separa fileiras de plantio e organiza o uso da agua. Nesta aula, a proposta e relacionar essas acoes com conceitos formais de area, perimetro e proporcao, sempre partindo da linguagem da comunidade.",
            data_criacao: "2026-08-01T09:00:00.000Z"
          },
          {
            id: "aula-2",
            subcategoria: "Razao e proporcao",
            titulo: "Misturas, doses e proporcoes",
            capa_url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&auto=format&fit=crop&q=80",
            conteudo_resumo: "Aplicando razao e proporcao em caldas, adubacao e organizacao de producao.",
            conteudo_completo:
              "Quando uma mistura precisa manter a mesma qualidade, as proporcoes sao fundamentais. O aluno aprende a comparar quantidades, montar regras simples e interpretar a proporcao em exemplos como adubo organico, sementes e organizacao de caixas de colheita.",
            data_criacao: "2026-08-02T09:00:00.000Z"
          }
        ]
      },
      {
        id: "mod-aulas-2",
        titulo: "Modulo 2 - Geometria dos terrenos",
        atividades: [
          {
            id: "aula-3",
            subcategoria: "Geometria",
            titulo: "Calculando area de terrenos irregulares",
            capa_url: "https://images.unsplash.com/photo-1592982537447-6f2a6a0f55f3?w=1200&auto=format&fit=crop&q=80",
            conteudo_resumo: "Divisao de terrenos em partes menores para facilitar o calculo.",
            conteudo_completo:
              "Nem todo terreno tem formato regular. Nesta aula, o aluno aprende a dividir uma area maior em triangulos e retangulos para chegar a estimativas mais claras de espaco cultivavel e organizacao das fileiras de plantio.",
            data_criacao: "2026-08-03T09:00:00.000Z"
          }
        ]
      }
    ],
    videos: [
      {
        id: "mod-videos-1",
        titulo: "Modulo de revisao visual",
        atividades: [
          {
            id: "video-1",
            subcategoria: "Area e perimetro",
            titulo: "Como medir um lote usando passos e referencia",
            capa_url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80",
            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            data_criacao: "2026-08-02T10:00:00.000Z"
          },
          {
            id: "video-2",
            subcategoria: "Estatistica",
            titulo: "Leitura simples de grafico de chuva",
            capa_url: "https://images.unsplash.com/photo-1492496913980-501348b61469?w=1200&auto=format&fit=crop&q=80",
            video_url: "https://www.youtube.com/watch?v=oHg5SJYRHA0",
            data_criacao: "2026-08-04T10:00:00.000Z"
          }
        ]
      }
    ],
    exercicios: [
      {
        id: "mod-ex-1",
        titulo: "Modulo 1 - Problemas de medicao",
        dificuldade: "facil",
        atividades: [
          {
            id: "ex-1",
            titulo: "Questao 1",
            num: 1,
            enunciado: "Um canteiro retangular mede 12 metros de comprimento e 5 metros de largura. Qual e a area total?",
            resolucao: "A area do retangulo e calculada multiplicando comprimento por largura. Portanto 12 x 5 = 60. A resposta correta e 60 m2."
          },
          {
            id: "ex-2",
            titulo: "Questao 2",
            num: 2,
            enunciado: "Se o agricultor usa 3 litros de calda para cada 7 litros de agua, quantos litros de agua sao necessarios para preparar 30 litros da mistura?",
            resolucao: "A mistura tem 10 partes no total: 3 de calda e 7 de agua. Se o total e 30 litros, cada parte vale 3 litros. Assim, a quantidade de agua e 7 x 3 = 21 litros."
          }
        ]
      },
      {
        id: "mod-ex-2",
        titulo: "Modulo 2 - Geometria aplicada",
        dificuldade: "medio",
        atividades: [
          {
            id: "ex-3",
            titulo: "Questao 1",
            num: 1,
            enunciado: "Uma cerca em formato trapezio tem bases de 20m e 12m, com laterais de 8m cada. Qual o perimetro?",
            resolucao: "O perimetro e a soma de todos os lados. Portanto 20 + 12 + 8 + 8 = 48. A resposta correta e 48 metros."
          }
        ]
      }
    ],
    quiz: [
      {
        id: "mod-quiz-1",
        titulo: "Modulo quiz - Razoes e colheita",
        atividades: [
          {
            id: "quiz-1",
            titulo: "Atividade sobre percentual de vendas",
            subcategoria: "Razao",
            pergunta: "Uma familia colheu 180 caixas de tomate e vendeu 85% delas. Quantas caixas foram vendidas?",
            opcoes: ["120 caixas", "135 caixas", "153 caixas", "170 caixas"],
            explicacao: "Para descobrir 85% de 180, basta multiplicar 180 por 0,85. O resultado e 153, entao foram vendidas 153 caixas.",
            resposta_correta: "153 caixas"
          },
          {
            id: "quiz-2",
            titulo: "Atividade sobre area de terreno",
            subcategoria: "Area",
            pergunta: "Um terreno retangular mede 15m por 8m. Qual a area total?",
            opcoes: ["60 m2", "90 m2", "120 m2", "150 m2"],
            explicacao: "A area do retangulo e comprimento x largura. Logo 15 x 8 = 120, entao a area correta e 120 m2.",
            resposta_correta: "120 m2"
          }
        ]
      },
      {
        id: "mod-quiz-2",
        titulo: "Modulo quiz - Agua e irrigacao",
        atividades: [
          {
            id: "quiz-3",
            titulo: "Atividade sobre volume de tanque",
            subcategoria: "Volume",
            pergunta: "Um tanque cilindrico com raio 2m e altura 3m, usando pi = 3, comporta aproximadamente:",
            opcoes: ["12 m3", "18 m3", "24 m3", "36 m3"],
            explicacao: "O volume do cilindro e pi x raio x raio x altura. Usando pi = 3: 3 x 2 x 2 x 3 = 36. Portanto a alternativa correta e 36 m3.",
            resposta_correta: "36 m3"
          }
        ]
      }
    ],
    feedbacks: [
      {
        id: "feedback-seed-1",
        nome: "Maria do Sitio",
        email: "maria@sitio.com",
        mensagem: "Gostei das aulas curtas. Seria bom ter mais exemplos com irrigacao.",
        createdAt: "2026-08-04T14:00:00.000Z",
        studentId: "seed-student-1"
      }
    ],
    students: [
      {
        id: "seed-student-1",
        nome: "Maria do Sitio",
        comunidade: "3 ano DS - EEEP",
        readLessons: ["aula-1", "aula-2"],
        watchedVideos: ["video-1"],
        completedExercises: ["ex-1"],
        quizAttempts: [
          {
            id: "attempt-seed-1",
            moduleId: "mod-quiz-1",
            score: 2,
            total: 2,
            createdAt: "2026-08-05T10:00:00.000Z"
          }
        ],
        feedbacks: 1,
        ultimoAcesso: "2026-08-05T10:00:00.000Z"
      },
      {
        id: "seed-student-2",
        nome: "Joao da Serra",
        comunidade: "Turma B",
        readLessons: ["aula-1"],
        watchedVideos: ["video-1", "video-2"],
        completedExercises: ["ex-1", "ex-2"],
        quizAttempts: [],
        feedbacks: 0,
        ultimoAcesso: "2026-08-06T09:30:00.000Z"
      },
      {
        id: "seed-student-3",
        nome: "Ana do Assentamento",
        comunidade: "Turma A",
        readLessons: ["aula-3"],
        watchedVideos: [],
        completedExercises: [],
        quizAttempts: [
          {
            id: "attempt-seed-2",
            moduleId: "mod-quiz-2",
            score: 1,
            total: 1,
            createdAt: "2026-08-06T15:00:00.000Z"
          }
        ],
        feedbacks: 0,
        ultimoAcesso: "2026-08-06T15:00:00.000Z"
      }
    ]
  };
}

function loadDatabase() {
  const raw = readStorage(STORAGE_KEYS.database);
  if (!raw) {
    return createSeedDatabase();
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return createSeedDatabase();
  }
}

function migrateDatabase() {
  const safeDb = state.db || createSeedDatabase();
  safeDb.aulas ||= [];
  safeDb.videos ||= [];
  safeDb.exercicios ||= [];
  safeDb.quiz ||= [];
  safeDb.feedbacks ||= [];
  safeDb.students ||= [];

  safeDb.students = safeDb.students.map((student) => ({
    feedbacks: 0,
    readLessons: [],
    watchedVideos: [],
    completedExercises: [],
    quizAttempts: [],
    comunidade: "Comunidade nao informada",
    ultimoAcesso: new Date().toISOString(),
    ...student
  }));

  ["aulas", "videos", "exercicios", "quiz"].forEach((category) => {
    safeDb[category].forEach((module) => {
      module.atividades ||= [];
      reindexModuleActivities(category, module);
    });
  });

  state.db = safeDb;
}

function seedDatabaseIfNeeded() {
  if (!state.db.aulas.length && !state.db.videos.length && !state.db.exercicios.length && !state.db.quiz.length) {
    state.db = createSeedDatabase();
    saveDatabase();
  }
}

function saveDatabase() {
  writeStorage(STORAGE_KEYS.database, JSON.stringify(state.db));
}

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    if (value === null || value === "0") {
      if (value === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    window.localStorage.setItem(key, value);
  } catch {
    // ignore localStorage issues for static mode
  }
}

function sanitizeText(value) {
  return String(value || "").trim();
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function unique(values) {
  return [...new Set(values)];
}

function toggleInArray(items, value) {
  const next = new Set(items);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return [...next];
}

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString("pt-BR");
  } catch {
    return dateString;
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.className = `toast show ${type}`;
  toast.textContent = message;

  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}
