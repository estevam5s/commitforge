# Git Commit Generator

Este script Python automatiza a criação de múltiplos commits no histórico do Git, permitindo preencher o gráfico de contribuições do GitHub com commits retroativos.

## Funcionalidade

O script cria commits com datas retroativas usando a funcionalidade `--date` do Git. Para cada commit:

1. Cria uma entrada em um arquivo `data.txt`
2. Adiciona o arquivo ao staging
3. Realiza o commit com uma data específica no passado
4. No final, envia todos os commits para o repositório remoto

## Como funciona

O código utiliza uma função recursiva `makeCommits()` e um loop while para criar 3500 commits com datas retroativas variadas.

```python
import os
def makeCommits (days):
    if days < 1:
        os.system('git push')
    else:
        dates = f"{days} days ago"
        with open('data.txt', 'a') as file:
            file.write(f'{dates} <- this was the commit for the day!!\n')
        
        # staging 
        os.system('git add data.txt')
        # commit 
        os.system('git commit --date="'+ dates +'" -m "First commit for the day!"')
        
cont = 0
maxNumero = 3500
while True:
    makeCommits(3500 - maxNumero)
    cont += 1
    maxNumero -= 1
    if cont == 3500:
        break
```

## Detalhes da implementação

- **Função makeCommits(days)**: Cria commits com datas retroativas baseadas no parâmetro `days`
  - Se `days < 1`, executa um push para o repositório remoto
  - Caso contrário, cria um novo commit datado de `days` dias atrás

- **Loop principal**: 
  - Executa a função `makeCommits()` 3500 vezes
  - Cada execução cria um commit com uma data diferente
  - O primeiro commit será de `0` dias atrás e o último de `3499` dias atrás

## Como usar

1. Clone seu repositório Git: `git clone <url-do-repositorio>`
2. Navegue até a pasta: `cd <nome-do-repositorio>`
3. Copie o script para um arquivo Python (por exemplo, `commit_generator.py`)
4. Execute o script: `python commit_generator.py`

## Observações

- Este script modificará seu histórico de contribuições no GitHub
- Use com responsabilidade, pois criar um grande número de commits artificiais pode ser considerado uma prática questionável
- O arquivo `data.txt` será criado automaticamente pelo script
- Certifique-se de ter configurado corretamente suas credenciais Git antes de executar o script

## Requisitos

- Python 3.x
- Git instalado e configurado
- Permissões de escrita no repositório

## Limitações

- O script não verifica se os commits já existem
- Não há tratamento de erros para problemas de conectividade ou permissão
- A execução pode levar bastante tempo devido ao grande número de commits
