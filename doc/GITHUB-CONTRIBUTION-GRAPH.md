# Como os commits aparecem no gráfico de contribuições do GitHub

## O que é o gráfico de contribuições?

O gráfico de contribuições (contribution graph) do GitHub mostra a atividade
de um usuário ao longo do tempo. Cada quadrado verde representa um dia com
pelo menos um commit.

```
Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
 ░░░  ▓▓▓  ▓▓▓  ░░░  ▓▓▓  ▓▓▓  ░░░  ░░░  ▓▓▓  ▓▓▓  ░░░  ▓▓▓
```

## Requisitos para aparecer no gráfico

Para que os commits criados pelo CommitForge apareçam no gráfico, **três condições** precisam ser atendidas:

### 1. E-mail correto

O e-mail usado no commit (`git config user.email`) deve ser o **mesmo cadastrado** na sua conta GitHub:

```
github.com/settings/emails → Verified emails
```

CommitForge detecta isso automaticamente via token:

```bash
# Auto-detecta o e-mail primário verificado
commitforge commit --repo URL --year 2020 --token ghp_xxx
# ✓ E-mail detectado: seu@email.com
```

Ou configure manualmente:

```bash
commitforge configure --email seu@email.com
```

### 2. Repositório público ou privado vinculado à conta

- **Repositório público**: todos os commits aparecem
- **Repositório privado**: aparecem apenas se a opção "Private contributions" estiver ativada nas configurações do GitHub

Ativar: `github.com/settings` → Contributions → "Include private contributions on my profile"

### 3. Branch mergeado ou padrão

Os commits precisam estar em:
- O branch padrão (`main` ou `master`), **ou**
- Um branch já mergeado ao branch padrão, **ou**
- Qualquer branch (se a configuração "All activity" estiver ativa)

O CommitForge cria commits em `historico-{year}`. Para aparecer com certeza:

```bash
# Opção A: criar direto no main
commitforge commit --repo URL --year 2020 --branch main

# Opção B: fazer merge manualmente
git checkout main
git merge historico-2020
git push origin main
```

## Verificar se os commits aparecem

Após o push, acesse:

```
https://github.com/seu-usuario?tab=overview&from=2020-01-01&to=2020-12-31
```

Substitua `2020` pelo ano dos commits. O gráfico deve mostrar atividade nos dias correspondentes.

## Por que os commits não aparecem?

| Causa | Solução |
|-------|---------|
| E-mail diferente | Use `--email` ou configure token para auto-detecção |
| Branch não mergeado | Faça merge para `main` |
| Repo privado sem configuração | Ative "Private contributions" no GitHub |
| GitHub cache | Aguarde até 24h para o gráfico atualizar |
| Commits muito antigos | GitHub exibe apenas os últimos anos no gráfico padrão |
