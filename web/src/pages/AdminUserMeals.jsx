import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiGet, apiDel } from '../api/client.js'
import ConfirmModal from '../components/ConfirmModal.jsx'
import Toast from '../components/Toast.jsx'

export default function AdminUserMeals(){
  const { id } = useParams()
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const navigate = useNavigate()
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        // carregar usuário para mostrar nome (via /admin/users/:id)
        const user = await apiGet('/admin/users/'+id)
        if(!mounted) return
        setUserName(user.name)
        const m = await apiGet('/admin/users/'+id+'/meals')
        if(!mounted) return
        setMeals(m)
      }catch(e){
        setToast('Erro ao carregar refeições: '+(e.message||e))
        navigate('/admin',{replace:true})
      }finally{ mounted && setLoading(false) }
    }
    load()
    return ()=>{ mounted = false }
  },[id])

  async function handleDeleteMeal(mealId){
    setModal({
      title: 'Confirmar exclusão',
      message: 'Confirma exclusão desta refeição?',
      onConfirm: async ()=>{
        try{
          await apiDel('/admin/meals/'+mealId)
          setMeals(s=>s.filter(x=>x.id!==mealId))
          setToast('Refeição removida')
        }catch(e){ setToast('Erro ao apagar refeição: '+(e.message||e)) }
        setModal(null)
      },
      onCancel: ()=> setModal(null)
    })
  }

  async function handleDeleteAll(){
    setModal({
      title: 'Confirmar exclusão em massa',
      message: 'Confirma apagar TODAS as refeições deste usuário? Esta ação é irreversível.',
      onConfirm: async ()=>{
        try{
          const res = await apiDel(`/admin/users/${id}/meals`)
          setToast(`Removidas ${res.removedMeals || 0} refeições.`)
          setMeals([])
        }catch(e){ setToast('Erro ao apagar refeições: '+(e.message||e)) }
        setModal(null)
      },
      onCancel: ()=> setModal(null)
    })
  }

  if(loading) return <p>Carregando refeições...</p>

  return (
    <section>
      <ConfirmModal
        open={!!modal}
        title={modal?.title}
        message={modal?.message}
        onConfirm={modal?.onConfirm}
        onCancel={modal?.onCancel}
      />
      <Toast message={toast} onClose={()=>setToast('')} />
      <h2>Refeições de {userName||id}</h2>
      <div style={{marginBottom:12}}>
        <button className="btn" onClick={()=>navigate('/admin')}>Voltar</button>{' '}
        <button className="btn danger" onClick={handleDeleteAll} disabled={meals.length===0}>Apagar todas</button>
      </div>

      <div className="card">
        {meals.length===0 ? (
          <p>Nenhuma refeição encontrada.</p>
        ) : (
          <table style={{width:'100%'}}>
            <thead><tr><th>Nome</th><th>Descrição</th><th>Data/Hora</th><th>InDiet</th><th>Ações</th></tr></thead>
            <tbody>
              {meals.map(m=> (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.description}</td>
                  <td>{new Date(m.dateTime).toLocaleString()}</td>
                  <td>{m.inDiet? 'Sim':'Não'}</td>
                  <td>
                    <button className="btn danger" onClick={()=>handleDeleteMeal(m.id)}>Apagar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
