import streamlit as st
import pandas as pd
from pathlib import Path
import datetime

from modules.data import get_data
from modules.utils import (
    gerar_filtros, detectar_colunas_filtro, encontrar_ponto_otimo, 
    salvar_mapa_como_imagem
)
from modules.map_builder import (
    criar_mapa_base, 
    adicionar_marcadores_prestadores, 
    adicionar_heatmap, 
    renderizar_mapa,
    adicionar_marcador_ping,
    adicionar_marcador_simulacao
)
from modules.dashboard import (
    renderizar_dashboard_clientes,
    renderizar_dashboard_atendimentos,
    renderizar_dashboard_carteira, 
    renderizar_dashboard_prestadores,
    calcular_contagem_beneficiarios_raio, 
    calcular_metricas_ponto_completas,
    identificar_regiao_proxima
)
from modules.agent_ai import generate_data_summary, ask_agent


st.set_page_config(layout="wide", page_title="Mapa de Prestadores")

css_path = Path(".streamlit/style.css")
if css_path.exists():
    with open(css_path) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

if "ping_location" not in st.session_state:
    st.session_state["ping_location"] = None
if "trigger_printscreen" not in st.session_state:
    st.session_state["trigger_printscreen"] = False
if "ultimo_print_info" not in st.session_state:
    st.session_state["ultimo_print_info"] = None

try:
    df_atendimentos, df_prestadores, df_carteira, df_geo, df_exames_imagem = get_data()
except ValueError:
    result = get_data()
    if len(result) == 5:
        df_atendimentos, df_prestadores, df_carteira, df_geo, df_exames_imagem = result
    elif len(result) == 4:
        df_atendimentos, df_prestadores, df_carteira, df_geo = result
        df_exames_imagem = pd.DataFrame()
    else:
        df_atendimentos, df_prestadores, df_carteira = result
        df_geo = pd.DataFrame()
        df_exames_imagem = pd.DataFrame()

if df_atendimentos.empty or df_prestadores.empty:
    st.warning("Dados não carregados. Verifique os arquivos na pasta 'dataset'.")
    st.stop()


tab_filtros, tab_ai = st.sidebar.tabs(["Filtros", "Assistente IA"])


with tab_filtros:
    st.markdown("### Filtros gerais")
    
    tipo_mapa = st.selectbox(
        "Mapa",
        ["OpenStreetMap", "CartoDB positron", "CartoDB dark_matter"],
        key="tipo_mapa"
    )
    
    ativo_pin_clique = st.checkbox(
        "Ativar marcador manual",
        value=False,
        key="ativo_pin_clique",
        help="Clicar no mapa posiciona um marcador manual. Se desmarcado, o clique não altera o pino."
    )

    if st.session_state["ping_location"]:
        if st.button("Remover marcador", use_container_width=True, help="Remove o marcador manual do mapa."):
            st.session_state["ping_location"] = None
            st.rerun()
    
    
    st.markdown("---")
    
    modo_travado = st.checkbox(
        "Modo printscreen",
        value=False,
        key="modo_travado",
        help="Trava o zoom e o movimento do mapa para facilitar prints estáticos."
    )

    if st.button("Tirar printscreen", use_container_width=True, help="Salva uma imagem do mapa atual e permite o download."):
        st.session_state["trigger_printscreen"] = True
        st.session_state["ultimo_print_info"] = None # Limpa o anterior
    
    modo_mapa = st.multiselect(
        "Opções de visualização",
        ["Heatmap (Pacientes Atendimentos)", "Heatmap (Volume Atendimentos)", "Heatmap (Carteira)", "Heatmap (Pacientes Exames Imagem)", "Heatmap (Volume Exames Imagem)", "Raio (Abrangência)"],
        key="modo_mapa",
        help="Adicione camadas de calor (Heatmaps) ou visualize o raio de abrangência."
    )
    
    if "competencia" in df_atendimentos.columns:
        if not pd.api.types.is_datetime64_any_dtype(df_atendimentos["competencia"]):
            df_atendimentos["competencia"] = pd.to_datetime(df_atendimentos["competencia"], errors='coerce')
        
        df_atendimentos = df_atendimentos.dropna(subset=["competencia"])
        datas_unicas = sorted(df_atendimentos["competencia"].dt.date.unique())
        
        if len(datas_unicas) > 0:
            start_date, end_date = st.select_slider(
                "Competência",
                options=datas_unicas,
                value=(datas_unicas[0], datas_unicas[-1]),
                format_func=lambda x: x.strftime("%m/%Y"),
                key="period_slider"
            )
            mask_date = (df_atendimentos["competencia"].dt.date >= start_date) & (df_atendimentos["competencia"].dt.date <= end_date)
            df_atendimentos_filtrado = df_atendimentos[mask_date].copy()
        else:
            df_atendimentos_filtrado = df_atendimentos.copy()
    else:
        df_atendimentos_filtrado = df_atendimentos.copy()
    
    raio_km = st.slider("Raio (km)", 0, 20, 0, key="raio_km", help="Defina o raio de abrangência (km) para análise de cobertura ao redor dos prestadores.")
    
    metrica_sim = st.selectbox(
        "Métrica",
        ["Pacientes distintos", "Atendimentos", "Carteira"],
        index=0,
        key="metrica_sim",
        help="Escolha qual a métrica da simulação de ponto otimizado."
    )
    if st.button("Atingir meta", use_container_width=True, help="Simula a melhor localização para um novo prestador baseado na métrica escolher."):
        st.session_state["trigger_simulacao"] = True
    
    if st.button("Remover meta", use_container_width=True, help="Limpa o resultado da simulação e remove o pino sugerido."):
        st.session_state["resultado_simulacao"] = None
        st.session_state["benchmark_simulacao"] = None
        st.session_state["trigger_simulacao"] = False
        st.rerun()



    st.markdown("---")

    st.markdown("### Filtros de prestadores")

    mostrar_marcadores = st.checkbox(
        "Mostrar pinos dos prestadores",
        value=True,
        key="mostrar_marcadores_prestadores",
        help="Exibe ou oculta os ícones dos prestadores no mapa."
    )

    mostrar_todos_prest = st.checkbox(
        "Mostrar todos os prestadores",
        value=True,
        key="mostrar_todos_prest",
        help="Incluir prestadores que nunca atenderam ou não credenciados"
    )


    if 'force_action_prestadores' not in st.session_state:
        st.session_state['force_action_prestadores'] = None

    def on_change_select_all():
        if st.session_state["sel_all_filters"]:
            st.session_state['force_action_prestadores'] = 'select_all'
        else:
            st.session_state['force_action_prestadores'] = 'deselect_all'

    sel_all = st.checkbox(
        "Selecionar todos os filtros",
        value=False,
        key="sel_all_filters",
        on_change=on_change_select_all,
        help="Marca ou desmarca todas as opções nos filtros abaixo para facilitar a remoção gradual."
    )


    display_force_action = st.session_state.get('force_action_prestadores', None)
    
    # 1. Handle Name Search (Additive) - UI at Top
    busca_multi = []
    if "nome_prestador" in df_prestadores.columns:
        opcoes_busca = sorted(df_prestadores["nome_prestador"].dropna().astype(str).unique())
        
        if display_force_action == 'select_all':
            st.session_state["busca_prestador"] = opcoes_busca
        elif display_force_action == 'deselect_all':
            st.session_state["busca_prestador"] = []
            
        busca_multi = st.multiselect(
            "Prestador", 
            options=opcoes_busca, 
            placeholder="Adicione prestadores específicos...",
            key="busca_prestador"
        )

    # 2. Category filtering
    df_prestadores_cat_filtrado = df_prestadores.copy()

    custom_order = [
        ("ie_prestador", "Status"),
        ("tipo_prestador", "Tipo"),
        ("regiao_agrupada", "Região agrupada"),
        ("regiao", "Região"),
        ("municipio", "Município"),
        ("bairro", "Bairro"),
        ("classificacao_produto", "Classificação produto")
    ]

    force_action = st.session_state.get('force_action_prestadores', None)

    for col, label in custom_order:
        if col in df_prestadores_cat_filtrado.columns:
            is_multivalue = False
            curr_separator = "|"

            sample = df_prestadores_cat_filtrado[col].dropna().astype(str)
            if not sample.empty:
                if sample.head(50).str.contains(curr_separator, regex=False).any():
                    is_multivalue = True

            df_prestadores_cat_filtrado = gerar_filtros(
                df_prestadores_cat_filtrado,
                st,
                [{"col": col, "label": label, "multivalue": is_multivalue, "separator": curr_separator}],
                key_prefix="sidebar_tab",
                force_action=force_action
            )

    IGNORE_PRESTADORES = [
        "id_prestador", "latitude", "longitude", "cep", "cnpj",
        "nome_prestador",
        "raio_5km", "raio_10km", "raio_15km", "raio_20km"
    ] + [c[0] for c in custom_order]

    config_sidebar = detectar_colunas_filtro(df_prestadores, colunas_ignoradas=IGNORE_PRESTADORES)

    df_prestadores_cat_filtrado = gerar_filtros(
        df_prestadores_cat_filtrado,
        st,
        config_sidebar,
        key_prefix="sidebar_tab",
        force_action=force_action
    )

    # 3. Final Concatenation (Additive logic)
    if busca_multi:
        df_prestadores_nome_filtrado = df_prestadores[
            df_prestadores["nome_prestador"].isin(busca_multi)
        ]
        
        # Check if any categorical filter is active
        # We consider a filter active if it has values in session_state and they are not empty
        active_cat_filters = False
        cat_cols = [c[0] for c in custom_order] + [c['col'] for c in config_sidebar]
        for col in cat_cols:
            key = f"sidebar_tab_{col}"
            if key in st.session_state and st.session_state[key]:
                active_cat_filters = True
                break
        
        if active_cat_filters:
            # If categories are selected, add search results to them (Additive)
            df_prestadores_filtrado = pd.concat([df_prestadores_cat_filtrado, df_prestadores_nome_filtrado]).drop_duplicates(subset=["id_prestador"])
        else:
            # If no categories are selected, show ONLY search results (Narrowing)
            df_prestadores_filtrado = df_prestadores_nome_filtrado
    else:
        df_prestadores_filtrado = df_prestadores_cat_filtrado

    if force_action:
        st.session_state['force_action_prestadores'] = None



mostrar_todos_prest = st.session_state.get("mostrar_todos_prest", True)



mostrar_heatmap_pacientes = "Heatmap (Pacientes Atendimentos)" in modo_mapa
mostrar_heatmap_atendimentos = "Heatmap (Volume Atendimentos)" in modo_mapa
mostrar_heatmap_carteira = "Heatmap (Carteira)" in modo_mapa
mostrar_heatmap_exames_pacientes = "Heatmap (Pacientes Exames Imagem)" in modo_mapa
mostrar_heatmap_exames_volume = "Heatmap (Volume Exames Imagem)" in modo_mapa
mostrar_raio = "Raio (Abrangência)" in modo_mapa

with st.expander("Filtros de Exames de Imagem", expanded=False):
    df_exames_imagem_filtrado = df_exames_imagem.copy()
    if not df_exames_imagem.empty:
        IGNORE_EXAMES = ["id_usuario", "id_prestador", "latitude", "longitude", "cep", "cep_usuario", "qtd"]
        config_exames = detectar_colunas_filtro(df_exames_imagem, colunas_ignoradas=IGNORE_EXAMES)
        config_exames.sort(key=lambda x: x["label"])

        cols_exames = st.columns(4)
        for i, config in enumerate(config_exames):
            col_container = cols_exames[i % 4]
            df_exames_imagem_filtrado = gerar_filtros(
                df_exames_imagem_filtrado,
                col_container,
                [config],
                key_prefix="expander_exames_auto"
            )
    else:
        st.info("Base de exames de imagem não disponível.")

with st.expander("Filtros de Pacientes (Atendimentos)", expanded=False):
    if "nome_prestador" in df_atendimentos_filtrado.columns:
        opcoes_prest = sorted(df_atendimentos_filtrado["nome_prestador"].dropna().unique())
        sel_prest = st.multiselect("Prestador", opcoes_prest, key="expander_benef_prestador")
        if sel_prest:
            df_atendimentos_filtrado = df_atendimentos_filtrado[df_atendimentos_filtrado["nome_prestador"].isin(sel_prest)]

    IGNORE_ATENDIMENTOS_FINAL = [
        "id_usuario", "id_prestador", "latitude", "longitude", "cep", "cep_usuario",
        "valor_liquido", "competencia", "nome_prestador", 'regiao_prestador', 'regiao_prestador_agrupada'
    ]
    config_benef = detectar_colunas_filtro(df_atendimentos, colunas_ignoradas=IGNORE_ATENDIMENTOS_FINAL)
    config_benef.sort(key=lambda x: x["label"])

    cols_filter = st.columns(4)

    for i, config in enumerate(config_benef):
        col_container = cols_filter[i % 4]
        df_atendimentos_filtrado = gerar_filtros(
            df_atendimentos_filtrado,
            col_container,
            [config],
            key_prefix="expander_benef_auto"
        )

with st.expander("Filtros de Pacientes (Carteira)", expanded=False):
    IGNORE_CARTEIRA = ["id_usuario", "cep", "latitude", "longitude"]
    config_carteira = detectar_colunas_filtro(df_carteira, colunas_ignoradas=IGNORE_CARTEIRA)
    config_carteira.sort(key=lambda x: x["label"])

    cols_cart = st.columns(4)
    df_carteira_filtrado = df_carteira.copy()

    for i, config in enumerate(config_carteira):
        col_container = cols_cart[i % 4]
        df_carteira_filtrado = gerar_filtros(
            df_carteira_filtrado,
            col_container,
            [config],
            key_prefix="expander_carteira_auto"
        )



total_prestadores = df_prestadores_filtrado["id_prestador"].nunique() if "id_prestador" in df_prestadores_filtrado.columns else len(df_prestadores_filtrado)
total_beneficiarios = df_atendimentos_filtrado["id_usuario"].nunique() if "id_usuario" in df_atendimentos_filtrado.columns else len(df_atendimentos_filtrado)
total_atendimentos = len(df_atendimentos_filtrado)
total_carteira = df_carteira_filtrado["id_usuario"].nunique() if "id_usuario" in df_carteira_filtrado.columns else len(df_carteira_filtrado)

if raio_km > 0 and not df_prestadores_filtrado.empty:
    with st.spinner("Atualizando estatísticas de cobertura..."):
        contagens_raio = calcular_contagem_beneficiarios_raio(df_prestadores_filtrado, df_atendimentos_filtrado, df_carteira_filtrado, raio_km)
else:
    contagens_raio = {}


if "last_map_center" not in st.session_state:
    st.session_state["last_map_center"] = None
if "last_map_zoom" not in st.session_state:
    st.session_state["last_map_zoom"] = None

if modo_travado and st.session_state["last_map_center"] and st.session_state["last_map_zoom"]:
    lat_centro = st.session_state["last_map_center"]["lat"]
    lon_centro = st.session_state["last_map_center"]["lng"]
    zoom_level = st.session_state["last_map_zoom"]
elif not df_prestadores_filtrado.empty and "latitude" in df_prestadores_filtrado.columns:
    lat_centro = df_prestadores_filtrado["latitude"].mean()
    lon_centro = df_prestadores_filtrado["longitude"].mean()

    lat_min = df_prestadores_filtrado["latitude"].min()
    lat_max = df_prestadores_filtrado["latitude"].max()
    lon_min = df_prestadores_filtrado["longitude"].min()
    lon_max = df_prestadores_filtrado["longitude"].max()

    lat_diff = lat_max - lat_min
    lon_diff = lon_max - lon_min
    max_diff = max(lat_diff, lon_diff)

    if max_diff > 5:
        zoom_level = 8
    elif max_diff > 2:
        zoom_level = 9
    elif max_diff > 1:
        zoom_level = 10
    elif max_diff > 0.5:
        zoom_level = 11
    elif max_diff > 0.2:
        zoom_level = 12
    else:
        zoom_level = 13
else:
    lat_centro, lon_centro = -22.8825, -43.4248
    zoom_level = 10.5


if "resultado_simulacao" not in st.session_state:
    st.session_state["resultado_simulacao"] = None
if "benchmark_simulacao" not in st.session_state:
    st.session_state["benchmark_simulacao"] = None

if metrica_sim == "Carteira":
    df_alvo = df_carteira_filtrado
    count_unique = True
    label_metric = "Carteira"
elif metrica_sim == "Pacientes distintos":
    df_alvo = df_atendimentos_filtrado
    count_unique = True
    label_metric = "Pacientes distintos"
else: 
    df_alvo = df_atendimentos_filtrado
    count_unique = False
    label_metric = "Atendimentos"

if st.session_state.get("trigger_simulacao") and not df_alvo.empty:
    with st.spinner(f"Calculando ponto sugerido ({label_metric})..."):
        ponto_otimo_novo, ponto_otimo_e = encontrar_ponto_otimo(
            df_alvo,
            raio_km,
            df_prestadores=df_prestadores_filtrado,
            count_unique=count_unique
        )
        st.session_state["resultado_simulacao"] = ponto_otimo_novo
        st.session_state["benchmark_simulacao"] = ponto_otimo_e
        st.session_state["label_metric_sim"] = label_metric
        st.session_state["trigger_simulacao"] = False

ponto_otimo_novo = st.session_state["resultado_simulacao"]
ponto_otimo_e = st.session_state["benchmark_simulacao"]
label_metric = st.session_state.get("label_metric_sim", "")

mapa = criar_mapa_base(lat_centro, lon_centro, tipo_mapa, zoom_start=zoom_level, travado=modo_travado)

if mostrar_heatmap_pacientes:
    adicionar_heatmap(mapa, df_atendimentos_filtrado, count_unique=True)
if mostrar_heatmap_atendimentos:
    adicionar_heatmap(mapa, df_atendimentos_filtrado, count_unique=False)
if mostrar_heatmap_carteira:
    adicionar_heatmap(mapa, df_carteira_filtrado, count_unique=True)
if mostrar_heatmap_exames_pacientes:
    adicionar_heatmap(mapa, df_exames_imagem_filtrado, count_unique=True)
if mostrar_heatmap_exames_volume:
    adicionar_heatmap(mapa, df_exames_imagem_filtrado, count_unique=False)

df_prestadores_para_mapa = df_prestadores_filtrado.copy()
if contagens_raio and "id_prestador" in df_prestadores_para_mapa.columns:
    df_prestadores_para_mapa["beneficiarios_no_raio_dinamico"] = (
        df_prestadores_para_mapa["id_prestador"].map(contagens_raio)
    )

if not mostrar_todos_prest:
    if "id_prestador" in df_atendimentos_filtrado.columns and "id_prestador" in df_prestadores_para_mapa.columns:
        prestadores_com_atendimento = df_atendimentos_filtrado["id_prestador"].unique()
        df_prestadores_para_mapa = df_prestadores_para_mapa[
            df_prestadores_para_mapa["id_prestador"].isin(prestadores_com_atendimento)
        ]

if mostrar_marcadores:
    adicionar_marcadores_prestadores(
        mapa,
        df_prestadores_para_mapa,
        raio_km=raio_km,
        total_benef=total_beneficiarios,
        total_atend=total_atendimentos,
        total_cart=total_carteira,
        mostrar_raio=mostrar_raio
    )




if st.session_state["ping_location"]:
    lat_ping = st.session_state["ping_location"]["lat"]
    lon_ping = st.session_state["ping_location"]["lng"]

    metrics_ping = calcular_metricas_ponto_completas(lat_ping, lon_ping, df_atendimentos_filtrado, df_carteira_filtrado, raio_km)

    info_ping = f"<b>Coordenadas:</b> {lat_ping:.4f}, {lon_ping:.4f}<br>"

    df_ref_address = pd.concat([df_atendimentos_filtrado, df_carteira_filtrado], ignore_index=True)
    address_info_ping = identificar_regiao_proxima(lat_ping, lon_ping, df_ref_address, df_geo=df_geo)

    adicionar_marcador_ping(
        mapa,
        lat_ping,
        lon_ping,
        info=info_ping,
        raio_km=raio_km if mostrar_raio else None,
        metrics=metrics_ping,
        address_info=address_info_ping
    )

if ponto_otimo_novo:
    lat_opt, lon_opt, count_opt = ponto_otimo_novo
    metrics_opt = calcular_metricas_ponto_completas(lat_opt, lon_opt, df_atendimentos_filtrado, df_carteira_filtrado, raio_km)

    df_ref_address = pd.concat([df_atendimentos_filtrado, df_carteira_filtrado], ignore_index=True)
    address_info = identificar_regiao_proxima(lat_opt, lon_opt, df_ref_address, df_geo=df_geo)

    adicionar_marcador_simulacao(
        mapa,
        lat_opt,
        lon_opt,
        count_opt,
        raio_km,
        melhor_e=ponto_otimo_e,
        metric_name=label_metric,
        metrics=metrics_opt,
        address_info=address_info
    )

map_data = renderizar_mapa(mapa)

if map_data:
    if map_data.get("last_clicked"):
        clicked_loc = map_data["last_clicked"]
        if st.session_state.get("ativo_pin_clique", False):
            if st.session_state["ping_location"] != clicked_loc:
                st.session_state["ping_location"] = clicked_loc
                st.rerun()
    
    if map_data.get("zoom"):
        st.session_state["last_map_zoom"] = map_data["zoom"]
    if map_data.get("center"):
        st.session_state["last_map_center"] = map_data["center"]

if st.session_state.get("trigger_printscreen"):
    # Get current state from session_state as map_data might be from previous render
    center = st.session_state.get("last_map_center", {"lat": lat_centro, "lng": lon_centro})
    zoom = st.session_state.get("last_map_zoom", zoom_level)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"mapa_{timestamp}.png"
    filepath = f"printscreens/{filename}"
    
    with st.spinner("🚀 Renderizando imagem do mapa... (isso pode levar alguns segundos)"):
        # Re-create the map with current state
        m_print = criar_mapa_base(center["lat"], center["lng"], tipo_mapa, zoom_start=zoom, travado=True)
        
        if mostrar_heatmap_pacientes: adicionar_heatmap(m_print, df_atendimentos_filtrado, count_unique=True)
        if mostrar_heatmap_atendimentos: adicionar_heatmap(m_print, df_atendimentos_filtrado, count_unique=False)
        if mostrar_heatmap_carteira: adicionar_heatmap(m_print, df_carteira_filtrado, count_unique=True)
        if mostrar_heatmap_exames_pacientes: adicionar_heatmap(m_print, df_exames_imagem_filtrado, count_unique=True)
        if mostrar_heatmap_exames_volume: adicionar_heatmap(m_print, df_exames_imagem_filtrado, count_unique=False)
        
        if mostrar_marcadores:
            adicionar_marcadores_prestadores(
                m_print, df_prestadores_para_mapa, 
                raio_km=raio_km, total_benef=total_beneficiarios, 
                total_atend=total_atendimentos, total_cart=total_carteira, 
                mostrar_raio=mostrar_raio
            )
        
        if st.session_state["ping_location"]:
            adicionar_marcador_ping(m_print, lat_ping, lon_ping, info=info_ping, raio_km=raio_km if mostrar_raio else None, metrics=metrics_ping, address_info=address_info_ping)
            
        if ponto_otimo_novo:
            adicionar_marcador_simulacao(m_print, lat_opt, lon_opt, count_opt, raio_km, melhor_e=ponto_otimo_e, metric_name=label_metric, metrics=metrics_opt, address_info=address_info)

        resultado = salvar_mapa_como_imagem(m_print, filepath)
        
    if resultado:
        st.session_state["ultimo_print_info"] = {
            "path": filepath,
            "filename": f"Mapa_Rede_LeveSaude_{timestamp}.png",
            "local_name": filename
        }
    else:
        st.error("❌ Erro técnico ao gerar printscreen.")
        st.warning("Esta função requer que o motor de renderização esteja instalado no servidor.")
        st.info("Para resolver, abra o terminal e execute:\n\n`pip install playwright && playwright install chromium`")
    
    st.session_state["trigger_printscreen"] = False
    st.rerun()

if st.session_state.get("ultimo_print_info"):
    print_info = st.session_state["ultimo_print_info"]
    with st.container():
        st.success("✅ Visão do mapa capturada!")
        col_dl, col_cl = st.columns([3, 1])
        with col_dl:
            with open(print_info["path"], "rb") as f:
                st.download_button(
                    label=f"📥 Baixar {print_info['filename']}",
                    data=f,
                    file_name=print_info["filename"],
                    mime="image/png",
                    use_container_width=True,
                    key="dl_btn_final"
                )
        with col_cl:
            if st.button("Limpar", use_container_width=True):
                st.session_state["ultimo_print_info"] = None
                st.rerun()

st.markdown("---")
renderizar_dashboard_clientes(df_prestadores_filtrado, df_atendimentos_filtrado, df_carteira_filtrado, raio_km)
st.markdown("---")
renderizar_dashboard_atendimentos(df_prestadores_filtrado, df_atendimentos_filtrado, df_carteira_filtrado, raio_km)
st.markdown("---")
renderizar_dashboard_carteira(df_carteira_filtrado)
st.markdown("---")
renderizar_dashboard_prestadores(df_prestadores_filtrado)


with tab_ai:

    st.markdown('<div class="ai-header"><h3>Consultoria Estratégica</h3></div>', unsafe_allow_html=True)
    st.markdown('<div class="ai-subtitle">Análise avançada de rede e insights estratégicos.</div>', unsafe_allow_html=True)

    chat_container = st.container()

    if "messages" not in st.session_state:
        st.session_state.messages = []

    with chat_container:
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])


    if prompt := st.chat_input("Como posso ajudar na estratégia da rede hoje?"):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with chat_container:
            with st.chat_message("user"):
                st.markdown(prompt)

        with st.spinner("Analisando dados..."):
            contexto_dados = generate_data_summary(
                df_prestadores_filtrado, 
                df_atendimentos_filtrado, 
                df_carteira_filtrado,
                simulation_results=st.session_state.get("resultado_simulacao"),
                benchmark_sim=st.session_state.get("benchmark_simulacao"),
                raio_km=raio_km,
                map_modes=modo_mapa
            )
            
            response = ask_agent(
                prompt,
                contexto_dados, 
                history=st.session_state.messages
            )
        
        st.session_state.messages.append({"role": "assistant", "content": response})
        with chat_container:
            with st.chat_message("assistant"):
                st.markdown(response)

    st.markdown("---")
    if st.button("Limpar Histórico", use_container_width=True):
        st.session_state.messages = []
        st.rerun()
