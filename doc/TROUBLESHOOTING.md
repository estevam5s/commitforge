# Solução de Problemas

## Instalação

### `command not found: commitforge`

O `~/.local/bin` não está no PATH da sessão atual.

```bash
# Solução imediata (sessão atual):
export PATH="$HOME/.local/bin:$PATH"

# Solução permanente:
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc  # ou ~/.bashrc
source ~/.zshrc
```

### `curl: (56) The requested URL returned error: 404`

O repositório ou arquivo não foi encontrado. Verifique a URL:

```bash
# URL correta:
curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install.sh | bash
```

### `externally-managed-environment` (Python no macOS)

```bash
# Usar venv explicitamente:
python3 -m venv ~/.commitforge/venv
source ~/.commitforge/venv/bin/activate
pip install click gitpython rich requests python-dotenv
```

### Python não encontrado após instalação

```bash
# macOS — instalar via Homebrew:
brew install python@3.12
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

## Commits e Git

### `Token inválido ou expirado`

1. Acesse `github.com/settings/tokens`
2. Crie um novo token com escopo `repo` e `workflow`
3. Use: `commitforge commit --token ghp_novo_token`

### `Push falhou: remote rejected`

O token não tem permissão de escrita. Verifique que o escopo `repo` está marcado.

### `Nenhum arquivo encontrado no repositório`

O repositório está vazio. Faça um commit inicial antes:

```bash
git init
echo "# Meu Projeto" > README.md
git add README.md
git commit -m "initial commit"
git remote add origin https://github.com/user/repo.git
git push -u origin main
# Agora use commitforge
```

### `fatal: repository not found`

Verifique se a URL está correta e se o repositório existe:

```bash
# Testar acesso ao repositório:
git ls-remote https://github.com/user/repo.git
```

---

## Gráfico de contribuições

### Commits criados mas não aparecem no gráfico

1. **Verificar e-mail**: o e-mail do commit deve estar cadastrado na sua conta GitHub
   ```bash
   commitforge configure --email seu@email.com
   ```

2. **Branch não mergeado**: faça merge para o `main`
   ```bash
   git checkout main
   git merge historico-2020
   git push origin main
   ```

3. **Aguardar o cache**: o GitHub pode demorar até 24h para atualizar o gráfico

4. **Repositório privado**: ative "Private contributions" em `github.com/settings`

---

## Performance

### Processo muito lento

- Use `--sem-push` para criar commits localmente e fazer push depois
- Para muitos repositórios, use `commitforge lote` com `--continuar-em-erro`
- Repositórios grandes (>10k arquivos) levam mais tempo na análise semântica

### Rate limit da API do GitHub

```bash
# Verificar limite atual:
curl -H "Authorization: token ghp_xxx" https://api.github.com/rate_limit

# Solução: usar token pessoal (aumenta de 60 para 5000 req/hora)
commitforge commit --repo URL --year 2020 --token ghp_seu_token
```
