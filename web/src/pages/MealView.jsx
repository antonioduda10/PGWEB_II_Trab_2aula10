import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiGet } from '../api/client.js'
export default function MealView(){
  const {id}=useParams(); const [meal,setMeal]=useState(null)
  useEffect(()=>{ apiGet(`/meals/${id}`).then(setMeal).catch(err=>alert('Erro: '+(err.message||err))) },[id])
  if(!meal) return <p>Carregando...</p>
  return (
    <section className="card">
      <header className="section__head"><h2>{meal.name}</h2><Link className="btn" to={`/meals/${meal.id}/edit`}>Editar</Link></header>
      <p className="muted">{meal.description||'Sem descrição'}</p>
      <p><strong>Data/Hora:</strong> {new Date(meal.dateTime).toLocaleString()}</p>
      <p><strong>Status:</strong> <span className={meal.inDiet?'pill success':'pill danger'}>{meal.inDiet?'Dentro da dieta':'Fora da dieta'}</span></p>
    </section>
  )
}
