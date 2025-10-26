import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPost, apiPut, apiDel } from '../api/client.js'
import ConfirmModal from '../components/ConfirmModal.jsx'
import Toast from '../components/Toast.jsx'

export default function AdminUsers(){
  const [users,setUsers]=useState([])
  const [loading,setLoading]=useState(true)
  const [creating,setCreating]=useState(false)
  const [form,setForm]=useState({name:'',email:'',isAdmin:false})
  const navigate = useNavigate()
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(()=>{
    async function init(){
      try{
        // verifica se é admin; /admin/me lançará erro se não houver header/usuario
        const me = await apiGet('/admin/me')
        if (!me || !me.isAdmin) return navigate('/',{replace:true})
        const list = await apiGet('/admin/users')
        setUsers(list)
      }catch(e){
        setToast('Acesso negado ou erro: '+(e.message||e))
        return navigate('/',{replace:true})
      }finally{ setLoading(false) }
    }
    init()
  },[])

  async function handleCreate(e){
    e.preventDefault()
    setCreating(true)
    try{
      const u = await apiPost('/admin/users', form)
      setUsers(s=>[...s,u])
      setForm({name:'',email:'',isAdmin:false})
      setToast('Usuário criado')
    }catch(e){ setToast('Erro: '+(e.message||e)) }
    finally{ setCreating(false) }
  }

  async function handleDelete(id){
    const target = users.find(u=>u.id===id)
    if(!target) return setToast('Usuário não encontrado')
    if(target.isAdmin) return setToast('Não é permitido apagar outro administrador.')
    if(target.mealsCount && target.mealsCount>0) return setToast('O usuário possui refeições. Apague as refeições antes de remover o usuário.')
    setModal({
      title: 'Confirmar remoção',
      message: `Confirma remoção do usuário "${target.name}"?`,
      onConfirm: async ()=>{
        try{
          await apiDel('/admin/users/'+id)
          setUsers(s=>s.filter(u=>u.id!==id))
          setToast('Usuário removido')
        }catch(e){ setToast('Erro: '+(e.message||e)) }
        setModal(null)
      },
      onCancel: ()=> setModal(null)
    })
  }

  function handleViewMeals(id){
    navigate(`/admin/users/${id}/meals`)
  }

  async function handleDeleteAllMeals(id){
    const target = users.find(u=>u.id===id)
    if(!target) return setToast('Usuário não encontrado')
    setModal({
      title: 'Confirmar remoção de refeições',
      message: `Confirma apagar todas as refeições do usuário "${target.name}"?`,
      onConfirm: async ()=>{
        try{
          const res = await apiDel(`/admin/users/${id}/meals`)
          setToast(`Removidas ${res.removedMeals || 0} refeições.`)
          const list = await apiGet('/admin/users')
          setUsers(list)
        }catch(e){ setToast('Erro: '+(e.message||e)) }
        setModal(null)
      },
      onCancel: ()=> setModal(null)
    })
  }

  async function handleEdit(u){
    const name = prompt('Nome', u.name)
    if (name===null) return
    const email = prompt('Email', u.email)
    if (email===null) return
    const isAdmin = confirm('Tornar admin? OK = sim')
    try{
      const upd = await apiPut('/admin/users/'+u.id, { name, email, isAdmin })
      setUsers(s=>s.map(x=> x.id===u.id?upd:x))
      setToast('Usuário atualizado')
    }catch(e){ setToast('Erro: '+(e.message||e)) }
  }

  if(loading) return <p>Carregando...</p>

  return (
    <section>
      <ConfirmModal
        open={!!modal}
        title={modal?.title}
        message={modal?.message}
        onConfirm={modal?.onConfirm}
        onCancel={modal?.onCancel}
        confirmLabel={modal?.confirmLabel}
        cancelLabel={modal?.cancelLabel}
      />
      <Toast message={toast} onClose={()=>setToast('')} />
      <h2>Admin — Usuários</h2>
      <form className="card form" onSubmit={handleCreate} style={{marginBottom:16}}>
        <label>Nome<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>
        <label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
        <label style={{display:'flex',alignItems:'center'}}><input type="checkbox" checked={form.isAdmin} onChange={e=>setForm({...form,isAdmin:e.target.checked})} /> <span style={{marginLeft:8}}>Administrador</span></label>
        <button className="btn primary" disabled={creating}>{creating?'Criando...':'Criar usuário'}</button>
      </form>

      <div className="card">
        <table style={{width:'100%'}}>
          <thead><tr><th>Nome</th><th>Email</th><th>Admin</th><th>Refeições</th><th>Ações</th></tr></thead>
          <tbody>
            {users.map(u=> (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.isAdmin? 'Sim':'Não'}</td>
                <td>{u.mealsCount||0}</td>
                <td>
                  <button className="btn" onClick={()=>handleEdit(u)}>Editar</button>{' '}
                  {u.mealsCount>0 ? (
                    <>
                      <button className="btn" onClick={()=>handleViewMeals(u.id)}>Ver refeições</button>{' '}
                      <button className="btn" onClick={()=>handleDeleteAllMeals(u.id)}>Apagar todas</button>{' '}
                      <button className="btn" disabled title="Apague as refeições primeiro">Apagar usuário</button>
                    </>
                  ) : (
                    <>
                      <button className="btn danger" onClick={()=>handleDelete(u.id)} disabled={u.isAdmin}>Apagar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
