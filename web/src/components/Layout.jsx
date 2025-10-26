import { Link, useNavigate } from 'react-router-dom'
import AdminLink from './AdminLink.jsx'
export default function Layout({ children }){
  const navigate = useNavigate()
  const userId = localStorage.getItem('dd:userId')
  const userName = localStorage.getItem('dd:userName')
  function logout(){ localStorage.removeItem('dd:userId'); localStorage.removeItem('dd:userName'); navigate('/login',{replace:true}) }
  return (
    <div className="page">
      <header className="topbar">
        <Link to="/" className="brand">Daily Diet</Link>
        <nav className="nav">
          {userId && <>
            <Link to="/" className="nav__link">Refeições</Link>
            <Link to="/metrics" className="nav__link">Métricas</Link>
            <AdminLink />
            <span className="nav__user">{userName||'Usuário'}</span>
            <button className="nav__btn" onClick={logout}>Sair</button>
          </>}
        </nav>
      </header>
      <main className="container">{children}</main>
      <footer className="footer">© {new Date().getFullYear()} Daily Diet</footer>
    </div>
  )
}
