import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../api/client.js'
export default function Login(){
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [loading,setLoading]=useState(false)
  const navigate=useNavigate()
  async function submit(e){ e.preventDefault(); setLoading(true); try{ const u=await apiPost('/users',{name,email}); localStorage.setItem('dd:userId',u.id); localStorage.setItem('dd:userName',u.name); navigate('/',{replace:true}) } catch(err){ alert('Erro: '+(err.message||err)) } finally{ setLoading(false) } }
  return (
    <section className="auth">
      <h1 className="title">Daily Diet</h1>
      <form className="card form" onSubmit={submit}>
        <label>Nome<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" autoComplete="name" /></label>
        <label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" /></label>
        <button className="btn primary" disabled={loading}>{loading?'Entrando...':'Entrar'}</button>
      </form>
    </section>
  )
}
