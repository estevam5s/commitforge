# Estrutura do Projeto CommitForge

```
commitforge/
│
├── app.py                    # Aplicação Flask principal
├── requirements.txt          # Dependências do projeto
├── Dockerfile                # Configuração para containerização
├── .gitignore                # Arquivos ignorados pelo Git
│
├── static/                   # Arquivos estáticos
│   ├── css/
│   │   └── styles.css        # Estilos CSS
│   │
│   ├── js/
│   │   └── main.js           # JavaScript principal
│   │
│   └── img/                  # Imagens e ícones
│       └── favicon.ico       # Ícone da aplicação
│
├── templates/                # Templates HTML
│   └── index.html            # Página principal
│
└── repos/                    # Diretório para armazenar repositórios clonados (criado automaticamente)
```

## Como Executar o Projeto

### Método 1: Usando Python diretamente

1. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

2. Execute a aplicação:
   ```bash
   python app.py
   ```

3. Acesse a aplicação no navegador:
   ```
   http://localhost:5000
   ```

### Método 2: Usando Docker

1. Construa a imagem Docker:
   ```bash
   docker build -t commitforge .
   ```

2. Execute o contêiner:
   ```bash
   docker run -p 5000:5000 commitforge
   ```

3. Acesse a aplicação no navegador:
   ```
   http://localhost:5000
   ```

## Configurações Adicionais

### Aumentar o Limite de Commits

O limite padrão de commits é 5000. Para aumentar este limite, você pode modificar a seguinte linha no arquivo `app.py`:

```python
app.config['MAX_COMMITS'] = 5000  # Altere para o valor desejado
```

### Armazenamento de Repositórios

Por padrão, os repositórios clonados são armazenados no diretório `repos/`. Para alterar este diretório, modifique a seguinte linha no arquivo `app.py`:

```python
app.config['UPLOAD_FOLDER'] = 'repos'  # Altere para o caminho desejado
```

### Logs

Os logs da aplicação são armazenados no arquivo `commitforge.log`. Para alterar o nível de log ou o formato, modifique a configuração de logging no arquivo `app.py`.
