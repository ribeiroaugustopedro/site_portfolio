import pandas as pd
import streamlit as st
from pathlib import Path

@st.cache_data(ttl=3600, show_spinner=False)
def carregar_dados_processados():
    try:
        df_atendimentos = pd.read_parquet("dataset/df_atendimentos.parquet")
        df_prestadores = pd.read_parquet("dataset/df_prestadores.parquet")
        df_carteira = pd.read_parquet("dataset/df_carteira.parquet")
        
        df_exames_imagem = pd.DataFrame()
        path_exames = Path("dataset/df_exames_imagem.parquet")
        if path_exames.exists():
            df_exames_imagem = pd.read_parquet(path_exames)

        path_geo = Path("dataset/df_geolocalizacao.parquet")
        if path_geo.exists():
            df_geo = pd.read_parquet(path_geo)
        else:
            df_geo = pd.DataFrame()
        
        df_atendimentos = limpar_coordenadas(df_atendimentos)
        df_prestadores = limpar_coordenadas(df_prestadores)
        df_exames_imagem = limpar_coordenadas(df_exames_imagem)
        
        if not df_exames_imagem.empty and "qtd" in df_exames_imagem.columns:
            df_exames_imagem["qtd"] = pd.to_numeric(df_exames_imagem["qtd"], errors="coerce").fillna(1)
        
        if not df_atendimentos.empty and not df_carteira.empty:
            mapa_coords = (
                df_atendimentos.dropna(subset=['latitude', 'longitude', 'cep_usuario'])
                .drop_duplicates(subset=['cep_usuario'])[['cep_usuario', 'latitude', 'longitude']]
                .rename(columns={'cep_usuario': 'cep', 'latitude': 'lat_map', 'longitude': 'lon_map'})
            )
            df_carteira['cep'] = pd.to_numeric(df_carteira['cep'], errors='coerce')
            mapa_coords['cep'] = pd.to_numeric(mapa_coords['cep'], errors='coerce')
            df_carteira = df_carteira.merge(mapa_coords, on='cep', how='left')
            df_carteira = df_carteira.rename(columns={'lat_map': 'latitude', 'lon_map': 'longitude'})
            
        if not df_geo.empty:
            df_geo = limpar_coordenadas(df_geo)
            
        return df_atendimentos, df_prestadores, df_carteira, df_geo, df_exames_imagem
    except Exception as e:
        st.error(f"Erro ao carregar arquivos de dados: {e}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

def limpar_coordenadas(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    df = df.copy()
    for coord in ['latitude', 'longitude']:
        if coord in df.columns:
            if df[coord].dtype == object:
                 df[coord] = pd.to_numeric(
                    df[coord].str.replace(',', '.', regex=False), 
                    errors='coerce'
                )
            else:
                 df[coord] = pd.to_numeric(df[coord], errors='coerce')
    if 'latitude' in df.columns and 'longitude' in df.columns:
        df = df.dropna(subset=['latitude', 'longitude'])
    return df

def get_data():
    return carregar_dados_processados()
