# Segurança e Privacidade

## Dados coletados

O CommitForge coleta dados mínimos e anônimos para medir o número de instalações:

| Dado          | Armazenado como         | Finalidade                    |
|---------------|-------------------------|-------------------------------|
| IP            | SHA-256 hash (irreversível) | Deduplicação de instalações |
| User-Agent    | String literal          | Detectar SO/método            |
| Método        | Enum (curl, docker, etc.) | Estatísticas de instalação  |
| Plataforma    | Enum (linux, macos, etc.) | Estatísticas de plataforma  |
| Versão        | String                  | Rastrear adoção de versões   |
| Timestamp     | UTC                     | Gráfico temporal              |

**Não coletamos:** nome de usuário, e-mail, token, conteúdo de repositórios, IPs em texto claro.

### Opt-out da telemetria

Para instalar sem enviar dados de telemetria, baixe e execute o script diretamente:

```bash
curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install.sh -o install.sh
# Edite install.sh e remova o bloco "Telemetry: track install"
bash install.sh
```

---

## Tokens do GitHub

- Os tokens são usados **apenas** para autenticar as chamadas à API do GitHub
- Tokens nunca são logados, armazenados em arquivos locais (exceto se você criar `.env` manualmente), ou enviados a servidores externos
- Recomendamos usar tokens com o menor escopo necessário: apenas `repo`
- Tokens expiram — use tokens com data de expiração curta para operações pontuais

---

## Repositórios e código-fonte

- O CommitForge clona o repositório em `/tmp/forge_XXXXX/` (diretório temporário)
- O diretório é removido após a execução (com ou sem sucesso)
- O código-fonte do repositório nunca é enviado para servidores externos
- As operações são todas locais; a única comunicação externa é com a API do GitHub

---

## Dashboard e banco de dados (Supabase)

- O dashboard requer autenticação (e-mail/senha via Supabase Auth)
- As políticas RLS (Row Level Security) garantem isolamento de dados
- A chave `anon` (pública) só permite INSERT em `installs` e `feedbacks`
- Dados de commits log e feedbacks completos são acessíveis apenas após login
- A `service_role` key nunca é exposta no frontend

---

## Reportar vulnerabilidades

Encontrou uma vulnerabilidade de segurança? Abra uma issue privada ou entre em contato:

```
https://github.com/estevam5s/commitforge/security/advisories/new
```

Não publique vulnerabilidades de segurança em issues públicas.
