import { useEffect, useState } from "react"
import api from "../services/api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface AnalyticsData {
  topSelling: { name: string; count: number }[]
  ruptures: Record<string, number>
}

export default function DashboardAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get("/analytics")
        setData(res.data)
      } catch (err) {
        console.error("Erro ao buscar análises:", err)
      }
    }
    fetchData()
  }, [])

  if (!data) return <p style={{ color: "white" }}>Carregando análises...</p>

  // transforma ruptures em array para o gráfico
  const ruptureData = Object.entries(data.ruptures).map(([name, count]) => ({
    name,
    count,
  }))

  return (
    <div style={{ color: "white", padding: "40px" }}>
      <h2>📊 Painel de Análises</h2>

      <div style={{ marginTop: "30px" }}>
        <h3>🛒 Produtos Mais Vendidos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.topSelling}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" name="Vendas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h3>🚫 Produtos com Ruptura</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ruptureData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#ff6961" name="Rupturas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
