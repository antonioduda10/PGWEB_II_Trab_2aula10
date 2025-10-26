import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const DB_FILE = fileURLToPath(new URL('./db.json', import.meta.url))

function write(obj) {
  fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2))
}

function ensure() {
  if (!fs.existsSync(DB_FILE)) {
    write({ users: [], meals: [] })
  }
}

export function loadDB() {
  ensure()
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.error('[DB] Arquivo inválido. Recriando db.json:', e.message)
    const fresh = { users: [], meals: [] }
    write(fresh)
    return fresh
  }
}

export function saveDB(data) {
  write(data)
}
