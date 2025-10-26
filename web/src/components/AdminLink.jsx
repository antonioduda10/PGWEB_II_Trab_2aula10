import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../api/client.js'

export default function AdminLink(){
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(()=>{
    async function check(){
      try{
        const me = await apiGet('/admin/me')
        if (me && me.isAdmin) setIsAdmin(true)
      }catch(e){ /* ignore */ }
    }
    check()
  },[])
  if(!isAdmin) return null
  return <Link to="/admin" className="nav__link">Admin</Link>
}
