"use client"

import { useEffect, useState } from "react"
import { Copy, Check } from "lucide-react"

export default function CommitForgeLanding() {
  const [currentCommand, setCurrentCommand] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [matrixChars, setMatrixChars] = useState<string[]>([])
  const [animatedBoxes, setAnimatedBoxes] = useState<boolean[]>([])
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [currentTyping, setCurrentTyping] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionStep, setExecutionStep] = useState(0)
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

  const commands = [
    "commitforge init --repo https://github.com/user/meu-projeto",
    "commitforge commit --year 2020 --dias 365 --aleatorio",
    "commitforge push --token ghp_xxxx --force",
    "commitforge status --historico",
  ]

  const terminalSequences = [
    {
      command: "commitforge init --repo https://github.com/user/meu-projeto",
      outputs: [
        "Iniciando CommitForge...",
        "Validando token do GitHub...",
        "Repositório clonado com sucesso!",
        "✅ Configuração concluída. Pronto para criar commits!",
      ],
    },
    {
      command: "commitforge commit --year 2020 --dias 365 --aleatorio",
      outputs: [
        "Preparando 365 commits retroativos para 2020...",
        "Criando commits: 2020-01-01 → 2020-12-31...",
        "Progresso: 100% (365/365 commits)",
        "✅ 365 commits criados com datas de 2020!",
      ],
    },
    {
      command: "commitforge push --token ghp_xxxx --force",
      outputs: [
        "Autenticando no GitHub...",
        "Enviando commits retroativos para o remoto...",
        "Push realizado com sucesso!",
        "✅ Gráfico de contribuições atualizado!",
      ],
    },
    {
      command: "commitforge status --historico",
      outputs: [
        "Carregando histórico de processos...",
        "Processo #1: 365 commits — ano 2020 ✓",
        "Processo #2: 180 commits — 2019-06 a 2019-12 ✓",
        "✅ 2 processos concluídos. Total: 545 commits.",
      ],
    },
  ]

  const heroAsciiText = `██████╗  █████╗ ███████╗███████╗ █████╗ ██████╗  ██████╗
██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗██╔══██╗██╔═══██╗
██████╔╝███████║███████╗███████╗███████║██║  ██║██║   ██║
██╔═══╝ ██╔══██║╚════██║╚════██║██╔══██║██║  ██║██║   ██║
██║     ██║  ██║███████║███████║██║  ██║██████╔╝╚██████╔╝
╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═════╝  ╚═════╝`

  useEffect(() => {
    const chars = "COMMITFORGE01010101ABCDEF█▓▒░▄▀■□▪▫".split("")
    const newMatrixChars = Array.from({ length: 100 }, () => chars[Math.floor(Math.random() * chars.length)])
    setMatrixChars(newMatrixChars)

    const interval = setInterval(() => {
      setMatrixChars((prev) => prev.map(() => chars[Math.floor(Math.random() * chars.length)]))
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const boxes = Array.from({ length: 6 }, () => Math.random() > 0.5)
    setAnimatedBoxes(boxes)

    const interval = setInterval(() => {
      setAnimatedBoxes((prev) => prev.map(() => Math.random() > 0.3))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const sequence = terminalSequences[currentCommand]
    const timeouts: NodeJS.Timeout[] = []

    const runSequence = async () => {
      setTerminalLines([])
      setCurrentTyping("")
      setIsExecuting(false)
      setExecutionStep(0)

      const command = sequence.command
      for (let i = 0; i <= command.length; i++) {
        timeouts.push(
          setTimeout(() => {
            setCurrentTyping(command.slice(0, i))
          }, i * 50),
        )
      }

      timeouts.push(
        setTimeout(
          () => {
            setIsExecuting(true)
            setCurrentTyping("")
            setTerminalLines((prev) => [...prev, `usuario@dev:~/projeto$ ${command}`])
          },
          command.length * 50 + 500,
        ),
      )

      sequence.outputs.forEach((output, index) => {
        timeouts.push(
          setTimeout(
            () => {
              setExecutionStep(index + 1)
              setTerminalLines((prev) => [...prev, output])
            },
            command.length * 50 + 1000 + index * 800,
          ),
        )
      })

      timeouts.push(
        setTimeout(
          () => {
            setCurrentCommand((prev) => (prev + 1) % commands.length)
          },
          command.length * 50 + 1000 + sequence.outputs.length * 800 + 2000,
        ),
      )
    }

    runSequence()

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [currentCommand])

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm p-4 relative z-10 sticky top-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
                <div className="w-3 h-3 bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                <div className="w-3 h-3 bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">Commit</span>
                <span className="text-gray-400 text-sm">Forge</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8 ml-8">
              <a
                href="#plataformas"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer relative group"
              >
                <span>Plataformas</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </a>
              <a
                href="#modos"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer relative group"
              >
                <span>Modos</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </a>
              <a
                href="#comecar"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer relative group"
              >
                <span>Início Rápido</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </a>
              <a
                href="/docs"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer relative group"
              >
                <span>Docs</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-gray-500 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>v2.0.0</span>
            </div>

            <div
              className="group relative cursor-pointer"
              onClick={() => copyToClipboard("pip install commitforge", "nav-install")}
            >
              <div className="absolute inset-0 border border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20"></div>
              <div className="relative border border-gray-400 bg-transparent text-white font-medium px-6 py-2 text-sm transition-all duration-300 group-hover:border-white group-hover:bg-gray-900/30 transform translate-x-0.5 translate-y-0.5 group-hover:translate-x-0 group-hover:translate-y-0">
                <div className="flex items-center gap-2">
                  {copiedStates["nav-install"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-gray-400">$</span>
                  <span>Instalar</span>
                </div>
              </div>
            </div>

            <button className="md:hidden text-gray-400 hover:text-white transition-colors">
              <div className="w-6 h-6 flex flex-col justify-center gap-1">
                <div className="w-full h-0.5 bg-current transition-all duration-300"></div>
                <div className="w-full h-0.5 bg-current transition-all duration-300"></div>
                <div className="w-full h-0.5 bg-current transition-all duration-300"></div>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Fundo Matrix */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-25 gap-1 h-full">
          {matrixChars.map((char, i) => (
            <div key={i} className="text-gray-500 text-xs animate-pulse">
              {char}
            </div>
          ))}
        </div>
      </div>

      {/* Seção Hero */}
      <section className="relative px-6 py-20 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="mb-8">
              <pre className="text-white text-lg lg:text-xl font-bold leading-none inline-block">{heroAsciiText}</pre>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Commite no <span className="text-gray-400 animate-pulse">passado</span>,
              <br />
              direto do seu{" "}
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">terminal</span>.
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
              Crie commits com datas retroativas no GitHub, GitLab ou Bitbucket. Especifique um ano, intervalo de datas
              ou quantidade de dias. Controle total do histórico git a partir da linha de comando.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div
                className="group relative cursor-pointer w-full sm:w-auto"
                onClick={() => copyToClipboard("pip install commitforge", "hero-install")}
              >
                <div className="absolute inset-0 border border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20"></div>
                <div className="relative border border-white bg-white text-black font-bold px-6 sm:px-10 py-4 text-base sm:text-lg transition-all duration-300 group-hover:bg-gray-100 group-hover:text-black transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 text-center">
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {copiedStates["hero-install"] ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    )}
                    <span className="text-gray-600 text-sm sm:text-base">$</span>
                    <span className="text-sm sm:text-base">pip install commitforge</span>
                  </div>
                </div>
              </div>

              <a href="/docs" className="group relative cursor-pointer w-full sm:w-auto">
                <div className="absolute inset-0 border-2 border-dashed border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20"></div>
                <div className="relative border-2 border-dashed border-gray-400 bg-transparent text-white font-bold px-10 py-4 text-lg transition-all duration-300 group-hover:border-white group-hover:bg-gray-900/30 transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">→</span>
                    <span>Ver Documentação</span>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Terminal Demo */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-950 border border-gray-700 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
                  </div>
                  <span className="text-gray-400 text-sm">commitforge-terminal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-500 text-xs">AO VIVO</span>
                </div>
              </div>

              <div className="p-6 min-h-[300px] bg-black">
                <div className="space-y-2 text-sm">
                  {terminalLines.map((line, index) => (
                    <div
                      key={index}
                      className={`${line.startsWith("usuario@dev") ? "text-white" : "text-gray-300"} ${line.includes("✅") ? "text-green-400" : ""}`}
                    >
                      {line}
                    </div>
                  ))}

                  {!isExecuting && (
                    <div className="text-white">
                      <span className="text-green-400">usuario@dev</span>
                      <span className="text-gray-500">:</span>
                      <span className="text-blue-400">~/projeto</span>
                      <span className="text-white">$ </span>
                      <span className="text-white">{currentTyping}</span>
                      <span className={`text-white ${showCursor ? "opacity-100" : "opacity-0"} transition-opacity`}>
                        █
                      </span>
                    </div>
                  )}

                  {isExecuting && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs">Processando...</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">Comandos executados:</span>
                    <span className="text-white">{currentCommand + 1}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">Commits retroativos:</span>
                    <span className="text-gray-500">Ativos</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">Status:</span>
                    <span className="text-gray-500">{isExecuting ? "Executando" : "Pronto"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Plataformas Suportadas */}
      <section className="px-6 py-16 lg:px-12 border-t border-gray-800" id="plataformas">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Plataformas Git Suportadas</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              CommitForge funciona em qualquer plataforma Git. Uma instalação, múltiplas possibilidades.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-950 border border-gray-800 shadow-xl">
              <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500"></div>
                    <div className="w-3 h-3 bg-yellow-500"></div>
                    <div className="w-3 h-3 bg-green-500"></div>
                  </div>
                  <span className="text-gray-400 text-sm">commitforge plataformas --listar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-500 text-xs">TODAS SUPORTADAS</span>
                </div>
              </div>

              <div className="p-6 bg-black">
                <div className="text-sm text-gray-400 mb-4">$ commitforge plataformas --verificar</div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-sm mb-6">
                  {[
                    { name: "github.com", status: "✓", desc: "GitHub — principal" },
                    { name: "gitlab.com", status: "✓", desc: "GitLab — suportado" },
                    { name: "bitbucket.org", status: "✓", desc: "Bitbucket — suportado" },
                    { name: "gitea", status: "✓", desc: "Gitea — self-hosted" },
                    { name: "azure-devops", status: "✓", desc: "Azure DevOps" },
                    { name: "git local", status: "✓", desc: "Repositório local" },
                  ].map((plataforma) => (
                    <div
                      key={plataforma.name}
                      className="flex items-center justify-between py-2 px-3 hover:bg-gray-900 cursor-pointer group transition-all duration-200 border border-transparent hover:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 group-hover:text-white transition-colors w-4">
                          {plataforma.status}
                        </span>
                        <span className="text-white group-hover:text-gray-200 transition-colors">{plataforma.name}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 text-xs">
                        {plataforma.desc}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="text-sm text-gray-400">
                      <div className="font-mono text-xs text-gray-500 space-y-1">
                        <div>$ commitforge init --repo https://github.com/user/repo.git</div>
                        <div>$ commitforge init --repo git@gitlab.com:user/repo.git</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>6 Ativas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>HTTPS e SSH</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
                <span className="text-green-400">●</span>
                <span>Compatibilidade universal • Autenticação por token • HTTPS e SSH</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Modos de Criação */}
      <section className="px-6 py-20 lg:px-12 border-t border-gray-800" id="modos">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Modos de Criação de Commits</h2>
            <p className="text-xl text-gray-400">Escolha o modo ideal para o seu caso de uso</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-950 border border-gray-800 shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500"></div>
                    <div className="w-3 h-3 bg-yellow-500"></div>
                    <div className="w-3 h-3 bg-green-500"></div>
                  </div>
                  <span className="text-gray-400 text-sm">commitforge modos --listar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-500 text-xs">6 DISPONÍVEIS</span>
                </div>
              </div>

              <div className="p-6 bg-black">
                <div className="text-sm text-gray-400 mb-4">$ commitforge commit --ajuda</div>

                <div className="space-y-2 font-mono text-sm">
                  {[
                    { id: "1", flag: "--year 2020", desc: "ano completo", color: "text-green-400" },
                    { id: "2", flag: "--start 2019-01-01 --end 2019-12-31", desc: "intervalo de datas", color: "text-green-400" },
                    { id: "3", flag: "--dias 365", desc: "últimos N dias", color: "text-green-400" },
                    { id: "4", flag: "--commits-por-dia 3", desc: "múltiplos por dia", color: "text-green-400" },
                    { id: "5", flag: "--pular-fins-de-semana", desc: "somente dias úteis", color: "text-green-400" },
                    { id: "6", flag: "--aleatorio", desc: "horários aleatórios", color: "text-green-400" },
                  ].map((modo) => (
                    <div
                      key={modo.id}
                      className="flex items-center justify-between py-2 px-4 hover:bg-gray-900 cursor-pointer group transition-all duration-200 border border-transparent hover:border-gray-700"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500 w-6">[{modo.id}]</span>
                        <span className={`${modo.color} group-hover:text-white transition-colors`}>●</span>
                        <span className="text-white group-hover:text-gray-200 transition-colors">{modo.flag}</span>
                        <span className="text-gray-500 text-xs">({modo.desc})</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 text-xs">
                        Pressione {modo.id} para selecionar
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="text-sm text-gray-400">
                      <div className="mb-2">Exemplos:</div>
                      <div className="font-mono text-xs text-gray-500 space-y-1">
                        <div>$ commitforge commit --repo URL --year 2020 --aleatorio</div>
                        <div>$ commitforge commit --repo URL --start 2018-01-01 --end 2022-12-31</div>
                        <div>$ commitforge commit --repo URL --dias 180 --commits-por-dia 2</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Até 5000 commits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Push automático</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                        <span>Progresso em tempo real</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
                <span className="text-green-400">●</span>
                <span>Combináveis • Zero configuração extra • Cancele a qualquer momento</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Início Rápido */}
      <section className="px-6 py-20 lg:px-12 border-t border-gray-800 bg-gray-950/30" id="comecar">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Pronto para começar?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Três passos simples para criar commits retroativos no seu repositório GitHub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
              <div className="relative bg-black border border-gray-700 p-6 h-full flex flex-col justify-between hover:border-white transition-all duration-300 group-hover:shadow-xl group-hover:shadow-white/10">
                <div className="text-center flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-900 border border-gray-600 flex items-center justify-center group-hover:border-white transition-colors group-hover:bg-gray-800">
                      <span className="text-lg font-mono text-white group-hover:text-gray-100">01</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-white group-hover:text-gray-100">Instalar</h3>
                    <p className="text-gray-400 mb-4 group-hover:text-gray-300 text-sm leading-relaxed">
                      Instale o CommitForge via pip e inicie o servidor local
                    </p>
                  </div>
                  <div
                    className="bg-gray-900 border border-gray-700 p-2.5 font-mono text-xs text-left group-hover:border-gray-500 transition-colors group-hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                    onClick={() => copyToClipboard("pip install commitforge", "install-cmd")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$ </span>
                      <span className="text-white group-hover:text-gray-100">pip install commitforge</span>
                    </div>
                    {copiedStates["install-cmd"] ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
              <div className="relative bg-black border border-gray-700 p-6 h-full flex flex-col justify-between hover:border-white transition-all duration-300 group-hover:shadow-xl group-hover:shadow-white/10">
                <div className="text-center flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-900 border border-gray-600 flex items-center justify-center group-hover:border-white transition-colors group-hover:bg-gray-800">
                      <span className="text-lg font-mono text-white group-hover:text-gray-100">02</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-white group-hover:text-gray-100">Criar Commits</h3>
                    <p className="text-gray-400 mb-4 group-hover:text-gray-300 text-sm leading-relaxed">
                      Especifique o repositório, o ano e a quantidade de commits
                    </p>
                  </div>
                  <div
                    className="bg-gray-900 border border-gray-700 p-2.5 font-mono text-xs text-left group-hover:border-gray-500 transition-colors group-hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                    onClick={() => copyToClipboard("commitforge commit --repo URL --year 2020", "commit-cmd")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$ </span>
                      <span className="text-white group-hover:text-gray-100">commitforge commit --year 2020</span>
                    </div>
                    {copiedStates["commit-cmd"] ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative h-full md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
              <div className="relative bg-black border border-gray-700 p-6 h-full flex flex-col justify-between hover:border-white transition-all duration-300 group-hover:shadow-xl group-hover:shadow-white/10">
                <div className="text-center flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-900 border border-gray-600 flex items-center justify-center group-hover:border-white transition-colors group-hover:bg-gray-800">
                      <span className="text-lg font-mono text-white group-hover:text-gray-100">03</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-white group-hover:text-gray-100">Enviar ao GitHub</h3>
                    <p className="text-gray-400 mb-4 group-hover:text-gray-300 text-sm leading-relaxed">
                      Envie os commits retroativos para o repositório remoto
                    </p>
                  </div>
                  <div
                    className="bg-gray-900 border border-gray-700 p-2.5 font-mono text-xs text-left group-hover:border-gray-500 transition-colors group-hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                    onClick={() => copyToClipboard("commitforge push --force", "push-cmd")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$ </span>
                      <span className="text-white group-hover:text-gray-100">commitforge push --force</span>
                    </div>
                    {copiedStates["push-cmd"] ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="group relative cursor-pointer inline-block w-full sm:w-auto">
              <div className="absolute inset-0 border-2 border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20"></div>
              <a href="/docs">
                <div className="relative border-2 border-white bg-white text-black font-bold px-8 sm:px-16 py-4 sm:py-5 text-lg sm:text-xl transition-all duration-300 group-hover:bg-gray-100 group-hover:text-black transform translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 text-center">
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <span className="text-gray-600 text-base sm:text-lg">▶</span>
                    <span className="text-base sm:text-lg">Começar Agora</span>
                  </div>
                </div>
              </a>
            </div>

            <div
              className="text-gray-400 text-base sm:text-lg font-mono hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2 sm:gap-3 px-4 py-2 hover:bg-gray-900/30 rounded-none border border-transparent hover:border-gray-700"
              onClick={() => copyToClipboard("pip install commitforge", "bottom-install")}
            >
              {copiedStates["bottom-install"] ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
              ) : (
                <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white transition-colors flex-shrink-0" />
              )}
              <span className="break-all sm:break-normal">$ pip install commitforge</span>
            </div>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t border-gray-800 px-6 py-12 lg:px-12 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-gray-600 text-lg mb-4">Construído para devs, por devs.</div>
            <div className="text-gray-700 text-sm">© 2026 CommitForge. Commite no passado. Controle seu histórico.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
