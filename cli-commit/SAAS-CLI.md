# CommitForge CLI — Conta na nuvem (SaaS)

A CLI agora integra com sua conta CommitForge: você faz login no terminal,
a CLI respeita o seu plano e os jobs aparecem no dashboard web.

## Configurar

```bash
# variável opcional (padrão já aponta para produção)
export COMMITFORGE_SAAS_URL=https://commitforge.vercel.app
```

## Login

Com e-mail e senha (a senha é solicitada de forma oculta):

```bash
commitforge login --email seu@email.com
```

Ou direto com um token de CLI gerado no dashboard (`/dashboard/cli`):

```bash
commitforge login --token cf_xxxxxxxxxxxxxxxxxxxxxxxx
```

O token fica salvo em `~/.commitforge/config.json` (permissão 600).

## Ver conta e plano

```bash
commitforge conta
```

## Commitar no passado (com o Git conectado)

```bash
# intervalo de datas (modo projeto — a partir do plano Starter)
commitforge commit \
  --repo https://github.com/usuario/projeto.git \
  --start-date 2021-01-01 --end-date 2021-12-31 \
  --branch main --modo projeto

# ano inteiro
commitforge commit --repo https://github.com/usuario/projeto.git --year 2020
```

Ao terminar, o job é **sincronizado automaticamente** com o dashboard
(`/dashboard/commits`). A CLI valida os limites do seu plano:

- Sem acesso (trial expirado) → recursos reduzidos ao nível Inicial.
- Modo projeto exige plano Starter ou superior.
- Limites de commits/mês e repositórios são aplicados no servidor.

## Sair

```bash
commitforge logout
```
