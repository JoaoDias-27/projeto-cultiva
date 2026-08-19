# TODO — Módulos no Professor (Aulas, Vídeos, Exercícios, Quiz)

## Status
- [x] Atualizar `index.html` para layout “módulos (esquerda) + atividades (direita)” em Aulas/Vídeos/Exercícios/Quiz
- [x] Ajustar CSS removendo erro de bloco em `.section-header`
- [x] Atualizar modelagem de `bancoDadosMockado` em `app.js` para módulos→atividades
- [ ] Implementar renderização completa no `app.js` via `renderAllModulesAndActivities()`
- [ ] Implementar handlers do professor (criar/editar/excluir) de:
  - [ ] Módulo (título/descrição quando existir)
  - [ ] Atividade dentro do módulo
- [ ] Quiz: implementar módulos de quiz + selecionar módulo + responder apenas questões daquele módulo
- [ ] Remover/neutralizar código legado que renderiza `renderAulas/renderVideos/renderExercicios/renderQuizCard`
- [ ] Testar no navegador (modo aluno x professor) e persistência (reload)

