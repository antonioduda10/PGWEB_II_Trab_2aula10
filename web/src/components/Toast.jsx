import React, { useEffect } from 'react'

export default function Toast({ message, onClose, duration = 3500 }){
  useEffect(()=>{
    if(!message) return
    const t = setTimeout(()=> onClose && onClose(), duration)
    return ()=> clearTimeout(t)
  },[message])
  if(!message) return null
  return (
    <div style={{position:'fixed',right:20,bottom:20,background:'#222',color:'#fff',padding:'10px 16px',borderRadius:6,boxShadow:'0 6px 18px rgba(0,0,0,0.2)',zIndex:9999}}>
      {message}
    </div>
  )
}
