"use client"

import { useState } from "react"
import { Copy, Check, Menu, X, ChevronRight, Terminal, Zap, Settings, Book, Code, Rocket } from "lucide-react"

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("comecar")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (err) {
      console.error("Falha ao copiar texto: ", err)
    }
  }

  const sidebarSections = [
    {
      title: "Início Rápido",
      id: "comecar",
      icon: Rocket,
      items: [
        { title: "Instalação", id: "instalacao" },
        { title: "Primeiro Uso", id: "primeiro-uso" },
        { title: "Configuração", id: "configuracao" },
      ],
    },
    {
      title: "Comandos",
      id: "comandos",
      icon: Terminal,
      items: [
        { title: "commitforge init", id: "cmd-init" },
        { title: "commitforge commit", id: "cmd-commit" },
        { title: "commitforge push", id: "cmd-push" },
        { title: "commitforge status", id: "cmd-status" },
      ],
    },
    {
      title: "Modos de Data",
      id: "modos-data",
      icon: Zap,
      items: [
        { title: "Por Ano", id: "modo-ano" },
        { title: "Por Intervalo", id: "modo-intervalo" },
        { title: "Por Quantidade", id: "modo-quantidade" },
      ],
    },
    {
      title: "Autenticação",
      id: "autenticacao",
      icon: Settings,
      items: [
        { title: "Token do GitHub", id: "token-github" },
        { title: "GitLab e Bitbucket", id: "outros-tokens" },
        { title: "Variáveis de Ambiente", id: "env-vars" },
      ],
    },
    {
      title: "API e Integração",
      id: "api",
      icon: Code,
      items: [
        { title: "API REST", id: "api-rest" },
        { title: "Interface Web", id: "interface-web" },
        { title: "Docker", id: "docker" },
      ],
    },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "comecar":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-white">Início Rápido com CommitForge</h1>
              <p className="text-xl text-gray-400 mb-8">
                CommitForge é uma CLI para criar commits retroativos no Git. Commite projetos em anos do passado
                diretamente do seu terminal.
              </p>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6">
              <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 border border-gray-600 flex items-center justify-center">
                  <span className="text-sm font-mono text-white">01</span>
                </div>
                Instalação
              </h2>
              <p className="text-gray-400 mb-4">Instale o CommitForge globalmente via pip:</p>
              <div
                className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                onClick={() => copyToClipboard("pip install commitforge", "install-cmd")}
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <span className="text-white">pip install commitforge</span>
                </div>
                {copiedStates["install-cmd"] ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                )}
              </div>
              <p className="text-gray-400 mt-4 mb-3">Ou clone e instale manualmente:</p>
              <div className="space-y-2">
                <div
                  className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                  onClick={() => copyToClipboard("git clone https://github.com/seu-usuario/commitforge", "clone-cmd")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <span className="text-white">git clone https://github.com/seu-usuario/commitforge</span>
                  </div>
                  {copiedStates["clone-cmd"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  )}
                </div>
                <div
                  className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                  onClick={() => copyToClipboard("cd commitforge/cli-commit && pip install -r requirements.txt", "req-cmd")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <span className="text-white">cd commitforge/cli-commit && pip install -r requirements.txt</span>
                  </div>
                  {copiedStates["req-cmd"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6">
              <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 border border-gray-600 flex items-center justify-center">
                  <span className="text-sm font-mono text-white">02</span>
                </div>
                Primeiro Uso
              </h2>
              <p className="text-gray-400 mb-4">Crie seus primeiros commits retroativos em 3 comandos:</p>
              <div className="space-y-3">
                <div
                  className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                  onClick={() => copyToClipboard("commitforge init --repo https://github.com/seu-usuario/meu-repo.git --token SEU_TOKEN", "init-cmd")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <span className="text-white">commitforge init --repo https://github.com/user/repo.git --token SEU_TOKEN</span>
                  </div>
                  {copiedStates["init-cmd"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  )}
                </div>
                <div
                  className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                  onClick={() => copyToClipboard("commitforge commit --year 2020 --dias 365 --aleatorio", "commit-first-cmd")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <span className="text-white">commitforge commit --year 2020 --dias 365 --aleatorio</span>
                  </div>
                  {copiedStates["commit-first-cmd"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  )}
                </div>
                <div
                  className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                  onClick={() => copyToClipboard("commitforge push --force", "push-first-cmd")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <span className="text-white">commitforge push --force</span>
                  </div>
                  {copiedStates["push-first-cmd"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6">
              <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 border border-gray-600 flex items-center justify-center">
                  <span className="text-sm font-mono text-white">03</span>
                </div>
                O Que Fazer Agora?
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div
                  className="border border-gray-700 p-4 hover:border-gray-500 transition-colors cursor-pointer"
                  onClick={() => setActiveSection("modo-ano")}
                >
                  <h3 className="text-white font-bold mb-2">Commitar por Ano</h3>
                  <p className="text-gray-400 text-sm">Preencha um ano inteiro de contribuições no GitHub</p>
                </div>
                <div
                  className="border border-gray-700 p-4 hover:border-gray-500 transition-colors cursor-pointer"
                  onClick={() => setActiveSection("token-github")}
                >
                  <h3 className="text-white font-bold mb-2">Configurar Token</h3>
                  <p className="text-gray-400 text-sm">Autentique com o GitHub para push nos repositórios</p>
                </div>
              </div>
            </div>
          </div>
        )

      case "instalacao":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-white">Instalação</h1>
              <p className="text-xl text-gray-400 mb-8">Múltiplas formas de instalar o CommitForge no seu sistema.</p>
            </div>

            <div className="grid gap-6">
              <div className="bg-gray-950 border border-gray-800 p-6">
                <h3 className="text-xl font-bold mb-3 text-white">Pip (Recomendado)</h3>
                <p className="text-gray-400 mb-4">Instale globalmente para acesso em qualquer diretório:</p>
                <div
                  className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                  onClick={() => copyToClipboard("pip install commitforge", "pip-install")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <span className="text-white">pip install commitforge</span>
                  </div>
                  {copiedStates["pip-install"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  )}
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 p-6">
                <h3 className="text-xl font-bold mb-3 text-white">Servidor Web (Interface Gráfica)</h3>
                <p className="text-gray-400 mb-4">Inicie a interface web para usar via navegador:</p>
                <div className="space-y-2">
                  <div
                    className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                    onClick={() => copyToClipboard("cd cli-commit && python app.py", "server-cmd")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <span className="text-white">cd cli-commit && python app.py</span>
                    </div>
                    {copiedStates["server-cmd"] ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                  <p className="text-gray-500 text-xs font-mono">→ Acesse: http://localhost:5000</p>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 p-6">
                <h3 className="text-xl font-bold mb-3 text-white">Docker</h3>
                <p className="text-gray-400 mb-4">Execute em contêiner isolado:</p>
                <div className="space-y-3">
                  <div
                    className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                    onClick={() => copyToClipboard("docker build -t commitforge .", "docker-build")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <span className="text-white">docker build -t commitforge .</span>
                    </div>
                    {copiedStates["docker-build"] ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                  <div
                    className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                    onClick={() => copyToClipboard("docker run -p 5000:5000 commitforge", "docker-run")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <span className="text-white">docker run -p 5000:5000 commitforge</span>
                    </div>
                    {copiedStates["docker-run"] ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 p-6">
                <h3 className="text-xl font-bold mb-3 text-white">Verificar Instalação</h3>
                <p className="text-gray-400 mb-4">Confirme que a instalação foi bem-sucedida:</p>
                <div
                  className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                  onClick={() => copyToClipboard("commitforge --version", "version-check")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <span className="text-white">commitforge --version</span>
                  </div>
                  {copiedStates["version-check"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case "configuracao":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-white">Configuração</h1>
              <p className="text-xl text-gray-400 mb-8">Configure o CommitForge para o seu fluxo de trabalho.</p>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">Arquivo .env</h2>
              <p className="text-gray-400 mb-4">
                Crie um arquivo <code className="text-white bg-black px-2 py-1">.env</code> na raiz do projeto:
              </p>
              <div className="bg-black border border-gray-700 p-4 font-mono text-sm">
                <pre className="text-gray-300">{`# Token do GitHub (obrigatório para push)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxx

# Configurações do servidor
SECRET_KEY=sua_chave_secreta
UPLOAD_FOLDER=repos
MAX_COMMITS=5000

# Porta do servidor (padrão: 5000)
PORT=5000`}</pre>
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">Configurações Globais via CLI</h2>
              <div className="space-y-3">
                <div
                  className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                  onClick={() => copyToClipboard("commitforge config --token ghp_xxxx", "config-token")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <span className="text-white">commitforge config --token ghp_xxxx</span>
                  </div>
                  {copiedStates["config-token"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  )}
                </div>
                <div
                  className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                  onClick={() => copyToClipboard("commitforge config --usuario \"Seu Nome\" --email seu@email.com", "config-user")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <span className="text-white">commitforge config --usuario "Seu Nome" --email seu@email.com</span>
                  </div>
                  {copiedStates["config-user"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">Variáveis de Ambiente</h2>
              <div className="space-y-4">
                <div className="border-l-2 border-gray-700 pl-4">
                  <code className="text-white">GITHUB_TOKEN</code>
                  <p className="text-gray-400 mt-1">Token de acesso pessoal do GitHub para autenticação</p>
                </div>
                <div className="border-l-2 border-gray-700 pl-4">
                  <code className="text-white">COMMITFORGE_SERVER</code>
                  <p className="text-gray-400 mt-1">URL do servidor CommitForge (padrão: http://localhost:5000)</p>
                </div>
                <div className="border-l-2 border-gray-700 pl-4">
                  <code className="text-white">MAX_COMMITS</code>
                  <p className="text-gray-400 mt-1">Número máximo de commits permitidos por processo (padrão: 5000)</p>
                </div>
              </div>
            </div>
          </div>
        )

      case "cmd-commit":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-white">commitforge commit</h1>
              <p className="text-xl text-gray-400 mb-8">
                Cria commits com datas retroativas em um repositório Git.
              </p>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-3 text-white">Uso Básico</h3>
              <div
                className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between mb-4"
                onClick={() => copyToClipboard("commitforge commit --repo <URL> --year <ANO>", "basic-commit")}
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <span className="text-white">commitforge commit --repo &lt;URL&gt; --year &lt;ANO&gt;</span>
                </div>
                {copiedStates["basic-commit"] ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                )}
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-3 text-white">Opções</h3>
              <div className="space-y-4">
                <div className="border-l-2 border-gray-700 pl-4">
                  <code className="text-white">--repo, -r</code>
                  <p className="text-gray-400 mt-1">URL do repositório Git (HTTPS ou SSH) — obrigatório</p>
                </div>
                <div className="border-l-2 border-gray-700 pl-4">
                  <code className="text-white">--year, -y</code>
                  <p className="text-gray-400 mt-1">Ano para criar commits (ex: 2020) — cria para o ano inteiro</p>
                </div>
                <div className="border-l-2 border-gray-700 pl-4">
                  <code className="text-white">--start-date / --end-date</code>
                  <p className="text-gray-400 mt-1">Intervalo de datas no formato YYYY-MM-DD</p>
                </div>
                <div className="border-l-2 border-gray-700 pl-4">
                  <code className="text-white">--dias, -d</code>
                  <p className="text-gray-400 mt-1">Número de dias retroativos a partir de hoje</p>
                </div>
                <div className="border-l-2 border-gray-700 pl-4">
                  <code className="text-white">--commits-por-dia</code>
                  <p className="text-gray-400 mt-1">Número de commits por dia (padrão: 1, máximo: 10)</p>
                </div>
                <div className="border-l-2 border-gray-700 pl-4">
                  <code className="text-white">--aleatorio</code>
                  <p className="text-gray-400 mt-1">Usa horários aleatórios para cada commit (mais natural)</p>
                </div>
                <div className="border-l-2 border-gray-700 pl-4">
                  <code className="text-white">--pular-fins-de-semana</code>
                  <p className="text-gray-400 mt-1">Cria commits apenas em dias úteis (seg-sex)</p>
                </div>
                <div className="border-l-2 border-gray-700 pl-4">
                  <code className="text-white">--token, -t</code>
                  <p className="text-gray-400 mt-1">Token de acesso pessoal do GitHub</p>
                </div>
                <div className="border-l-2 border-gray-700 pl-4">
                  <code className="text-white">--sem-push</code>
                  <p className="text-gray-400 mt-1">Cria commits localmente sem enviar ao remoto</p>
                </div>
                <div className="border-l-2 border-gray-700 pl-4">
                  <code className="text-white">--mensagem, -m</code>
                  <p className="text-gray-400 mt-1">Template da mensagem de commit (use {"{date}"} como placeholder)</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-3 text-white">Exemplos</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 mb-2">Preencher o ano 2020 inteiro:</p>
                  <div
                    className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                    onClick={() => copyToClipboard("commitforge commit --repo https://github.com/user/repo.git --year 2020 --aleatorio", "ex-year")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <span className="text-white">
                        commitforge commit --repo https://github.com/user/repo.git --year 2020 --aleatorio
                      </span>
                    </div>
                    {copiedStates["ex-year"] ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 mb-2">Intervalo de datas específico:</p>
                  <div
                    className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                    onClick={() => copyToClipboard("commitforge commit --repo URL --start-date 2018-06-01 --end-date 2022-12-31 --commits-por-dia 2", "ex-range")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <span className="text-white">
                        commitforge commit --repo URL --start-date 2018-06-01 --end-date 2022-12-31 --commits-por-dia 2
                      </span>
                    </div>
                    {copiedStates["ex-range"] ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 mb-2">Somente dias úteis, sem push automático:</p>
                  <div
                    className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                    onClick={() => copyToClipboard("commitforge commit --repo URL --year 2021 --pular-fins-de-semana --sem-push", "ex-weekday")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <span className="text-white">
                        commitforge commit --repo URL --year 2021 --pular-fins-de-semana --sem-push
                      </span>
                    </div>
                    {copiedStates["ex-weekday"] ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "modo-ano":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-white">Modo: Por Ano</h1>
              <p className="text-xl text-gray-400 mb-8">
                Preencha um ano inteiro de contribuições no GitHub com o flag <code className="text-white">--year</code>.
              </p>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-3 text-white">Como Funciona</h3>
              <p className="text-gray-400 mb-4">
                O flag <code className="text-white bg-black px-2 py-1">--year</code> cria automaticamente commits do
                dia 1 de janeiro até 31 de dezembro do ano especificado. O CommitForge distribui os commits uniformemente
                ao longo do ano.
              </p>
              <div className="space-y-3">
                <div
                  className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                  onClick={() => copyToClipboard("commitforge commit --repo URL --year 2020", "year-basic")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <span className="text-white">commitforge commit --repo URL --year 2020</span>
                  </div>
                  {copiedStates["year-basic"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-3 text-white">Anos Disponíveis</h3>
              <div className="space-y-4">
                <div className="border border-gray-700 p-4 hover:border-gray-500 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold">Qualquer ano passado</h4>
                    <span className="text-green-400 text-sm">● Suportado</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">
                    Funciona para qualquer ano anterior ao atual (ex: 2010, 2015, 2020)
                  </p>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-gray-800 text-gray-300 px-2 py-1">2010</span>
                    <span className="bg-gray-800 text-gray-300 px-2 py-1">2015</span>
                    <span className="bg-gray-800 text-gray-300 px-2 py-1">2018</span>
                    <span className="bg-gray-800 text-gray-300 px-2 py-1">2020</span>
                    <span className="bg-gray-800 text-gray-300 px-2 py-1">2023</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-3 text-white">Combinações com --year</h3>
              <div className="space-y-3">
                <div
                  className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                  onClick={() => copyToClipboard("commitforge commit --repo URL --year 2020 --aleatorio --commits-por-dia 3", "year-multi")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <span className="text-white">commitforge commit --repo URL --year 2020 --aleatorio --commits-por-dia 3</span>
                  </div>
                  {copiedStates["year-multi"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  )}
                </div>
                <div
                  className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                  onClick={() => copyToClipboard("commitforge commit --repo URL --year 2019 --pular-fins-de-semana", "year-weekday")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <span className="text-white">commitforge commit --repo URL --year 2019 --pular-fins-de-semana</span>
                  </div>
                  {copiedStates["year-weekday"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case "token-github":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-white">Token do GitHub</h1>
              <p className="text-xl text-gray-400 mb-8">Configure sua autenticação para fazer push dos commits retroativos.</p>
            </div>

            <div className="grid gap-6">
              <div className="bg-gray-950 border border-gray-800 p-6">
                <h3 className="text-xl font-bold mb-3 text-white">Como Gerar um Token</h3>
                <p className="text-gray-400 mb-4">Acesse as configurações do GitHub para criar um token de acesso pessoal:</p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>1. Vá para <code className="text-white bg-black px-2 py-1">github.com → Settings → Developer settings</code></p>
                  <p>2. Clique em <code className="text-white bg-black px-2 py-1">Personal access tokens → Tokens (classic)</code></p>
                  <p>3. Clique em <code className="text-white bg-black px-2 py-1">Generate new token</code></p>
                  <p>4. Marque as permissões: <code className="text-white bg-black px-2 py-1">repo</code> (acesso completo)</p>
                  <p>5. Copie o token gerado (começa com <code className="text-white bg-black px-2 py-1">ghp_</code>)</p>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 p-6">
                <h3 className="text-xl font-bold mb-3 text-white">Usar o Token</h3>
                <p className="text-gray-400 mb-4">Passe o token diretamente no comando ou via variável de ambiente:</p>
                <div className="space-y-3">
                  <div
                    className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                    onClick={() => copyToClipboard("commitforge commit --repo URL --year 2020 --token ghp_xxxx", "token-inline")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <span className="text-white">commitforge commit --repo URL --year 2020 --token ghp_xxxx</span>
                    </div>
                    {copiedStates["token-inline"] ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                  <div
                    className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                    onClick={() => copyToClipboard("export GITHUB_TOKEN=ghp_xxxx && commitforge commit --repo URL --year 2020", "token-env")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <span className="text-white">export GITHUB_TOKEN=ghp_xxxx && commitforge commit --repo URL --year 2020</span>
                    </div>
                    {copiedStates["token-env"] ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 p-6">
                <h3 className="text-xl font-bold mb-3 text-white">Validar Token</h3>
                <p className="text-gray-400 mb-4">Verifique se o token está correto antes de criar commits:</p>
                <div
                  className="bg-black border border-gray-700 p-4 font-mono text-sm cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                  onClick={() => copyToClipboard("commitforge validar-token --token ghp_xxxx", "validate-token")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <span className="text-white">commitforge validar-token --token ghp_xxxx</span>
                  </div>
                  {copiedStates["validate-token"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case "api-rest":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-white">API REST</h1>
              <p className="text-xl text-gray-400 mb-8">
                CommitForge expõe uma API REST completa quando executado como servidor.
              </p>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-3 text-white">Endpoints Disponíveis</h3>
              <div className="space-y-4">
                <div className="border border-gray-700 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-green-900 text-green-300 px-2 py-0.5 text-xs font-mono">POST</span>
                    <code className="text-white">/api/start-job</code>
                  </div>
                  <p className="text-gray-400 text-sm">Inicia um novo processo de criação de commits</p>
                </div>
                <div className="border border-gray-700 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-900 text-blue-300 px-2 py-0.5 text-xs font-mono">GET</span>
                    <code className="text-white">/api/job-status/&lt;job_id&gt;</code>
                  </div>
                  <p className="text-gray-400 text-sm">Retorna o status e progresso de um processo</p>
                </div>
                <div className="border border-gray-700 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-green-900 text-green-300 px-2 py-0.5 text-xs font-mono">POST</span>
                    <code className="text-white">/api/cancel-job/&lt;job_id&gt;</code>
                  </div>
                  <p className="text-gray-400 text-sm">Cancela um processo em andamento</p>
                </div>
                <div className="border border-gray-700 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-900 text-blue-300 px-2 py-0.5 text-xs font-mono">GET</span>
                    <code className="text-white">/api/jobs</code>
                  </div>
                  <p className="text-gray-400 text-sm">Lista todos os processos executados</p>
                </div>
                <div className="border border-gray-700 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-green-900 text-green-300 px-2 py-0.5 text-xs font-mono">POST</span>
                    <code className="text-white">/api/validate-token</code>
                  </div>
                  <p className="text-gray-400 text-sm">Valida um token do GitHub</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-3 text-white">Exemplo de Uso</h3>
              <div className="bg-black border border-gray-700 p-4 font-mono text-sm">
                <pre className="text-gray-300">{`curl -X POST http://localhost:5000/api/start-job \\
  -H "Content-Type: application/json" \\
  -d '{
    "repo_url": "https://github.com/user/repo.git",
    "year": 2020,
    "github_token": "ghp_xxxx",
    "commits_per_day": 2,
    "random_times": true,
    "skip_weekends": false
  }'`}</pre>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-white">Documentação CommitForge</h1>
              <p className="text-xl text-gray-400 mb-8">Selecione uma seção no menu lateral para começar.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div
                className="bg-gray-950 border border-gray-800 p-6 hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => setActiveSection("comecar")}
              >
                <Rocket className="w-8 h-8 text-white mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Início Rápido</h3>
                <p className="text-gray-400">Guia de instalação e primeiro uso</p>
              </div>
              <div
                className="bg-gray-950 border border-gray-800 p-6 hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => setActiveSection("cmd-commit")}
              >
                <Terminal className="w-8 h-8 text-white mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Comandos</h3>
                <p className="text-gray-400">Referência completa de todos os comandos CLI</p>
              </div>
              <div
                className="bg-gray-950 border border-gray-800 p-6 hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => setActiveSection("modo-ano")}
              >
                <Zap className="w-8 h-8 text-white mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Modos de Data</h3>
                <p className="text-gray-400">Por ano, intervalo ou quantidade de dias</p>
              </div>
              <div
                className="bg-gray-950 border border-gray-800 p-6 hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => setActiveSection("token-github")}
              >
                <Settings className="w-8 h-8 text-white mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Autenticação</h3>
                <p className="text-gray-400">Configure tokens do GitHub para push</p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <nav className="border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm p-4 relative z-50 sticky top-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500"></div>
                <div className="w-3 h-3 bg-yellow-500"></div>
                <div className="w-3 h-3 bg-green-500"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">Commit</span>
                <span className="text-gray-400 text-sm">Forge</span>
              </div>
            </a>
            <div className="text-gray-500 text-sm">/ Documentação</div>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <div className="flex">
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-80 bg-gray-950 border-r border-gray-800 transition-transform duration-300 ease-in-out overflow-y-auto`}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <Book className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Documentação</h2>
            </div>

            <nav className="space-y-6">
              {sidebarSections.map((section) => (
                <div key={section.id}>
                  <div
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-700 hover:bg-gray-900 ${
                      activeSection === section.id ? "bg-gray-900 border-gray-600" : ""
                    }`}
                    onClick={() => {
                      setActiveSection(section.id)
                      setSidebarOpen(false)
                    }}
                  >
                    <section.icon className="w-5 h-5 text-gray-400" />
                    <span className="text-white font-medium">{section.title}</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
                  </div>

                  <div className="ml-8 mt-2 space-y-1">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2 cursor-pointer text-sm transition-all duration-200 border border-transparent hover:border-gray-700 hover:bg-gray-900 ${
                          activeSection === item.id ? "bg-gray-900 border-gray-600 text-white" : "text-gray-400"
                        }`}
                        onClick={() => {
                          setActiveSection(item.id)
                          setSidebarOpen(false)
                        }}
                      >
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 lg:ml-0">
          <div className="max-w-4xl mx-auto p-6 lg:p-12">{renderContent()}</div>
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
