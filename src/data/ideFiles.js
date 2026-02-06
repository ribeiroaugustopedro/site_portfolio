export const files = {
  'pipeline.py': {
    name: 'pipeline.py',
    language: 'python',
    content: `from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, StringType, DoubleType

# Scalable ETL for Sales Commissions
schema = StructType([
    StructField("seller_id", StringType(), True),
    StructField("revenue", DoubleType(), True),
    StructField("tier", StringType(), True)
])

def process_commissions(df):
    return df.withColumn(
        "commission_value",
        F.when(F.col("tier") == "Gold", F.col("revenue") * 0.15)
         .when(F.col("tier") == "Silver", F.col("revenue") * 0.10)
         .otherwise(F.col("revenue") * 0.05)
    ).groupBy("seller_id").agg(F.sum("commission_value").alias("total_payout"))

# Databricks-ready production logic
print("Pipeline: Initializing Distributed Context...")`
  },
  'dw_modeling.sql': {
    name: 'dw_modeling.sql',
    language: 'sql',
    content: `-- Modern Data Warehouse: Gold Layer Modeling
CREATE OR REPLACE TABLE gold.corporate_kpi AS
WITH monthly_metrics AS (
    SELECT 
        date_trunc('month', sale_date) as ref_month,
        sum(net_value) as total_revenue,
        count(distinct customer_id) as mau
    FROM silver.sales_events
    GROUP BY 1
)
SELECT 
    *,
    total_revenue / mau as arpu,
    LAG(total_revenue) OVER (ORDER BY ref_month) as prev_month_rev
FROM monthly_metrics;`
  },
  'dashboard_app.py': {
    name: 'dashboard_app.py',
    language: 'python',
    content: `import streamlit as st
import folium
from streamlit_folium import st_folium

st.title("🏥 Hospital Expansion Planner")

# Geospatial radius analysis
m = folium.Map(location=[-22.9068, -43.1729], zoom_start=12)
folium.Circle(
    radius=5000,
    location=[-22.9068, -43.1729],
    color="crimson",
    fill=True,
).add_to(m)

st_folium(m, width=700)`
  },
  'index.html': {
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Pedro Augusto Ribeiro | Portfolio</title>
</head>
<body>
    <div id="app"></div>
    <!-- AI-Powered Data Assistant Link -->
    <script src="main.js"></script>
</body>
</html>`
  },
  'styles.css': {
    name: 'styles.css',
    language: 'css',
    content: `:root {
  --primary: #007acc;
  --bg: #0d1117; /* GitHub Dark */
}

.data-science-card {
  border: 1px solid var(--primary);
  border-radius: 8px;
  padding: 20px;
}`
  }
};
