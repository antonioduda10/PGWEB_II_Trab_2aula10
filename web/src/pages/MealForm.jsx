import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiGet, apiPost, apiPut } from '../api/client.js'
export default function MealForm(){
  const {id}=useParams(); const isEdit=Boolean(id)
  const [form,setForm]=useState({name:'',description:'',dateTime:'',inDiet:true}); const [loading,setLoading]=useState(false)
  const navigate=useNavigate()
  useEffect(()=>{(async()=>{ if(!isEdit) return; const d=await apiGet(`/meals/${id}`); setForm({name:d.name, description:d.description||'', dateTime:d.dateTime.slice(0,16), inDiet:d.inDiet}) })()},[id,isEdit])
  function update(k,v){ setForm(p=>({...p,[k]:v})) }
  async function submit(e){ e.preventDefault(); setLoading(true); try{ const payload={...form, dateTime:new Date(form.dateTime).toISOString()}; if(isEdit) await apiPut(`/meals/${id}`,payload); else await apiPost('/meals',payload); navigate('/',{replace:true}) } catch(err){ alert('Erro: '+(err.message||err)) } finally{ setLoading(false) } }
  return (
    <section>
      <h2>{isEdit?'Editar refeição':'Nova refeição'}</h2>
      <form className="card form" onSubmit={submit}>
        <label>Nome<input required value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Ex.: Almoço" /></label>
        <label>Descrição<textarea value={form.description} onChange={e=>update('description',e.target.value)} placeholder="Ex.: Arroz, frango e salada" rows={3} /></label>
        <div className="grid-2">
          <label>Data e hora<input type="datetime-local" required value={form.dateTime} onChange={e=>update('dateTime',e.target.value)} /></label>
          <label>Está dentro da dieta?<select value={String(form.inDiet)} onChange={e=>update('inDiet', e.target.value==='true')}><option value="true">Sim</option><option value="false">Não</option></select></label>
        </div>
        <div className="actions"><button className="btn primary" disabled={loading}>{loading?'Salvando...':'Salvar'}</button><button className="btn outline" type="button" onClick={()=>navigate(-1)}>Cancelar</button></div>
      </form>
    </section>
  )
}
