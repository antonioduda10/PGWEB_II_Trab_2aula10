import React from 'react'

export default function ConfirmModal({ open, title, message, confirmLabel='OK', cancelLabel='Cancelar', onConfirm, onCancel }){
  if(!open) return null
  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.45)',zIndex:9999}}>
      <div style={{background:'#fff',padding:22,borderRadius:8,width:'min(600px,92%)',boxShadow:'0 10px 30px rgba(0,0,0,0.25)'}}>
        {title && <h3 style={{marginTop:0,color:'#111',fontSize:18}}>{title}</h3>}
        <div style={{margin:'14px 0',color:'#111',fontSize:15,lineHeight:1.4,fontWeight:500}}>{message}</div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
          <button
            onClick={onCancel}
            style={{background:'transparent',border:'1px solid rgba(0,0,0,0.12)',color:'#111',padding:'8px 12px',borderRadius:6,cursor:'pointer'}}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{background:'transparent',border:'1px solid #d9534f',color:'#d9534f',padding:'8px 12px',borderRadius:6,cursor:'pointer'}}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
