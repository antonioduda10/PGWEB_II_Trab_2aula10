import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiDel } from '../api/client.js'
export default function MealsList(){
  const [meals,setMeals]=useState([]); const [loading,setLoading]=useState(true)
  async function load(){ setLoading(true); try{ setMeals(await apiGet('/meals')) } finally{ setLoading(false) } }
  useEffect(()=>{ load() },[])
  async function remove(id){ if(!confirm('Apagar esta refeição?')) return; await apiDel(`/meals/${id}`); setMeals(meals.filter(m=>m.id!==id)) }
  return (
    <section>
      <header className="section__head"><h2>Minhas Refeições</h2><div className="actions"><Link className="btn" to="/meals/new">Nova refeição</Link><Link className="btn" to="/metrics">Ver métricas</Link></div></header>
      {loading? <p>Carregando...</p> : meals.length===0? <p>Nenhuma refeição cadastrada.</p> : (
        <ul className="list">
          {meals.map(m=>(
            <li key={m.id} className="list__item">
              <div className="list__main"><Link to={`/meals/${m.id}`} className="list__title">{m.name}</Link><span className={m.inDiet?'pill success':'pill danger'}>{m.inDiet?'Dentro da dieta':'Fora da dieta'}</span></div>
              <div className="list__meta"><time dateTime={m.dateTime}>{new Date(m.dateTime).toLocaleString()}</time></div>
              <div className="list__actions"><Link className="btn small" to={`/meals/${m.id}/edit`}>Editar</Link><button className="btn small outline" onClick={()=>remove(m.id)}>Apagar</button></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
