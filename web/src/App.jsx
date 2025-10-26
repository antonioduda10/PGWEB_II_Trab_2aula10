import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import MealsList from './pages/MealsList.jsx'
import MealForm from './pages/MealForm.jsx'
import MealView from './pages/MealView.jsx'
import Metrics from './pages/Metrics.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import AdminUserMeals from './pages/AdminUserMeals.jsx'
function RequireUser({ children }){
  const uid = localStorage.getItem('dd:userId')
  if(!uid) return <Navigate to="/login" replace />
  return children
}
export default function App(){
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireUser><MealsList/></RequireUser>} />
        <Route path="/meals/new" element={<RequireUser><MealForm/></RequireUser>} />
        <Route path="/meals/:id" element={<RequireUser><MealView/></RequireUser>} />
        <Route path="/meals/:id/edit" element={<RequireUser><MealForm/></RequireUser>} />
        <Route path="/metrics" element={<RequireUser><Metrics/></RequireUser>} />
        <Route path="/admin" element={<RequireUser><AdminUsers/></RequireUser>} />
  <Route path="/admin/users/:id/meals" element={<RequireUser><AdminUserMeals/></RequireUser>} />
      </Routes>
    </Layout>
  )
}
