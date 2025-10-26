import express from 'express'
import cors from 'cors'
import { router } from './routes.mjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
app.use(cors())
app.use(express.json())
// Request logging (helps debug headers / incoming requests)
app.use((req, res, next) => {
  try {
    const uid = req.headers['x-user-id'] || req.headers['X-User-Id'] || ''
    console.log(`[REQ] ${req.method} ${req.url} x-user-id=${uid}`)
  } catch (e) {
    console.log('[REQ] error reading headers', e && e.message)
  }
  next()
})
app.use('/api', router)

// Servir front build (se existir)
try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const distPath = path.join(__dirname, '../web/dist')
  const indexHtml = path.join(distPath, 'index.html')
  if (fs.existsSync(distPath)) {
    if (fs.existsSync(indexHtml)) {
      app.use(express.static(distPath))
      // fallback para SPA: qualquer rota que não seja /api/* retorna index.html
      app.get('*', (req, res) => {
        res.sendFile(indexHtml)
      })
      console.log('[STATIC SERVE] Serving web/dist on /')
    } else {
      console.warn('[STATIC SERVE] web/dist exists but index.html is missing. Run `npm run build` in web/.')
    }
  }
} catch (e) {
  console.error('[STATIC SERVE ERROR]', e)
}

// Middleware de erro para responder JSON claro e logar stack
app.use((err, req, res, next) => {
  console.error('[API ERROR]', err)
  const status = err?.status || 500
  const message = err?.message || 'Internal Server Error'
  res.status(status).json({ error: message })
})

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`Daily Diet API running on http://localhost:${PORT}`)
})
