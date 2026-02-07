# LeveMapas - Inteligência Geográfica de Rede

Aplicação analítica para visualização e planejamento de rede de saúde, integrando dados de beneficiários, prestadores e simulações estratégicas.

## 🚀 Como Executar

Para rodar o projeto localmente:

1.  Certifique-se de ter o **Python** instalado.
2.  Instale as dependências necessárias:
    ```bash
    pip install streamlit pandas folium streamlit-folium altair numpy tenacity google-genai
    ```
3.  Execute o arquivo:
    **`run_app.bat`** (Basta dar dois cliques no Windows).

## 🛠️ Funcionalidades Principais

-   **Mapa Interativo**: Visualização de prestadores com ícones personalizados e raios de abrangência dinâmicos.
-   **Busca Aditiva**: Pesquise prestadores específicos por nome e adicione-os ao mapa sem perder os filtros de categoria ativos.
-   **Heatmaps (Mapas de Calor)**: Identifique densidade de pacientes, atendimentos ou carteira de clientes.
-   **Atingir Meta (Simulação)**: Algoritmo matemático que sugere a melhor localização para um novo prestador com base na demanda reprimida.
-   **Consultoria IA**: Assistente estratégico integrado (Gemini 2.0 Flash) para análise de cenários e insights de rede.

## 📂 Estrutura do Projeto

-   `app.py`: Orquestrador principal da interface.
-   `run_app.bat`: Atalho para execução simplificada.
-   `modules/`:
    -   `data.py`: Processamento e limpeza de dados.
    -   `map_builder.py`: Lógica de construção do mapa Folium.
    -   `utils.py`: Motor matemático e algoritmos de simulação.
    -   `agent_ai.py/dashboard.py`: IA e Dashboards.
-   `dataset/`: Base de dados local (Parquet).

---
> [!NOTE]
> Esta aplicação foi desenvolvida para ser leve, modular e focada em tomada de decisão estratégica para gestão de redes de saúde.
