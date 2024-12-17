import pandas as pd
import plotext as plt

# Carregar dados do CSV
def carregar_dados():
    try:
        # Solicita o caminho do arquivo CSV
        arquivo_csv = input("Digite o caminho completo do arquivo CSV: ").strip()
        
        # Lê o arquivo
        dados = pd.read_csv(arquivo_csv, header=None, names=["data", "hora", "produto", "quantidade"])
        
        # Extrair apenas a hora do formato HH:MM:SS
        dados['hora'] = pd.to_datetime(dados['hora'], format="%H:%M:%S", errors='coerce').dt.hour
        
        # Converter coluna 'quantidade' para numérico
        dados['quantidade'] = pd.to_numeric(dados['quantidade'], errors='coerce')

        # Remover registros inválidos
        dados = dados.dropna(subset=['hora', 'quantidade'])
        
        return dados
    except Exception as e:
        print(f"Erro ao carregar o arquivo CSV: {e}")
        return None

# Classificar o horário em períodos do dia
def categorizar_periodo(hora):
    if 6 <= hora < 12:
        return "Manhã"
    elif 12 <= hora < 18:
        return "Tarde"
    elif 18 <= hora <= 24:
        return "Noite"
    else:
        return "Madrugada"

# Gerar gráficos de tendência para cada produto
def gerar_graficos_tendencia(dados):
    print("\n=== Gráficos de Tendência: Quantidade de Produtos pelo Tempo ===")
    produtos = dados['produto'].unique()
    
    for produto in produtos:
        print(f"\nProduto: {produto}")
        # Filtrar os dados para o produto específico
        dados_produto = dados[dados['produto'] == produto]
        resumo = dados_produto.groupby('hora')['quantidade'].sum()  # Soma da quantidade por hora
        
        # Preparar os dados para o gráfico
        x = resumo.index
        y = resumo.values

        # Gerar o gráfico
        plt.clear_data()
        plt.title(f"Tendência de {produto} - Quantidade por Hora")
        plt.xlabel("Hora do Dia")
        plt.ylabel("Quantidade Total")
        plt.plot(x, y, marker="dot", label=f"{produto}")
        plt.show()

# Calcular a probabilidade de compra para cada produto em cada período
def calcular_probabilidade_produto(dados):
    print("\n=== Probabilidade de Compra por Produto e Período ===")
    
    # Adicionar uma nova coluna 'periodo'
    dados['periodo'] = dados['hora'].apply(categorizar_periodo)

    # Somar a quantidade total de compras por período
    total_por_periodo = dados.groupby('periodo')['quantidade'].sum()

    # Somar a quantidade de cada produto por período
    compras_por_produto_periodo = dados.groupby(['periodo', 'produto'])['quantidade'].sum().reset_index()

    # Calcular probabilidade de compra para cada produto
    compras_por_produto_periodo['probabilidade'] = compras_por_produto_periodo.apply(
        lambda row: row['quantidade'] / total_por_periodo[row['periodo']],
        axis=1
    )

    # Exibir as probabilidades
    for periodo in compras_por_produto_periodo['periodo'].unique():
        print(f"\nPeríodo: {periodo}")
        periodo_dados = compras_por_produto_periodo[compras_por_produto_periodo['periodo'] == periodo]
        for _, row in periodo_dados.iterrows():
            print(f"  - Produto: {row['produto']}, Probabilidade: {row['probabilidade']:.2%}")

# Programa principal
if __name__ == "__main__":
    dados = carregar_dados()
    if dados is not None:
        gerar_graficos_tendencia(dados)       # Gráficos de tendência
        calcular_probabilidade_produto(dados) # Probabilidade de compra por produto e período
