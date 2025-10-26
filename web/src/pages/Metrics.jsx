import { useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'
export default function Metrics(){
  const [m,setM]=useState(null)
  useEffect(()=>{ apiGet('/metrics').then(setM).catch(err=>alert('Erro: '+(err.message||err))) },[])
  if(!m) return <p>Carregando...</p>
  return (
    <section>
      <h2>Métricas</h2>
      <div className="grid-4">
        <div className="stat"><span className="stat__num">{m.total}</span>{' - '}<span className="stat__label">Refeições</span></div>
        <div className="stat"><span className="stat__num">{m.inDiet}</span>{' - '}<span className="stat__label">Dentro da dieta</span></div>
        <div className="stat"><span className="stat__num">{m.outDiet}</span>{' - '}<span className="stat__label">Fora da dieta</span></div>
        <div className="stat"><span className="stat__num">{m.bestInDietStreak}</span>{' - '}<span className="stat__label">Melhor sequência</span></div>
      </div>
    </section>
  )
}
