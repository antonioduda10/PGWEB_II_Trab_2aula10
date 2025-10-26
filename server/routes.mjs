import { Router } from 'express'
import { nanoid } from 'nanoid'
import { loadDB, saveDB } from './db.mjs'

export const router = Router()

// DEV helper: criar usuário admin temporário via API
// Só funciona quando NODE_ENV !== 'production' para evitar uso indevido em produção
router.post('/__create-admin', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production' })
  }
  const { name, email } = req.body || {}
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' })
  const db = loadDB()
  const found = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase())
  if (found) {
    // tornar admin se já existir
    found.isAdmin = true
    saveDB(db)
    return res.json({ id: found.id, name: found.name, email: found.email, isAdmin: true })
  }
  const user = { id: nanoid(12), name, email, isAdmin: true, createdAt: new Date().toISOString() }
  db.users.push(user); saveDB(db)
  res.status(201).json({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin })
})

const nowISO = () => new Date().toISOString()

function requireUser(req, res, next) {
  const userId = req.header('x-user-id')
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  const db = loadDB()
  const user = db.users.find(u => u.id === userId)
  if (!user) return res.status(401).json({ error: 'User not found' })
  req.user = user
  next()
}

function requireAdmin(req, res, next) {
  const userId = req.header('x-user-id')
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  const db = loadDB()
  const user = db.users.find(u => u.id === userId)
  if (!user) return res.status(401).json({ error: 'User not found' })
  if (!user.isAdmin) return res.status(403).json({ error: 'Admin privileges required' })
  req.user = user
  next()
}

// -------------------- Admin routes --------------------

/** Informações do usuário identificado (útil para debug) */
router.get('/admin/me', requireUser, (req, res) => {
  // Retorna o usuário identificado a partir do header x-user-id
  const { id, name, email, createdAt, isAdmin } = req.user || {}
  res.json({ id, name, email, createdAt, isAdmin: !!isAdmin })
})

/** Lista todos os usuários (admin) incluindo contagem de refeições por usuário */
router.get('/admin/users', requireAdmin, (req, res) => {
  const db = loadDB()
  const usersWithCount = db.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    isAdmin: !!u.isAdmin,
    createdAt: u.createdAt,
    mealsCount: db.meals.filter(m => m.userId === u.id).length,
  }))
  res.json(usersWithCount)
})

/** Ver um usuário pelo id (admin) */
router.get('/admin/users/:id', requireAdmin, (req, res) => {
  const db = loadDB()
  const user = db.users.find(u => u.id === req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

/** Criar usuário (admin) - idempotente por email */
router.post('/admin/users', requireAdmin, (req, res) => {
  const { name, email, isAdmin = false } = req.body || {}
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' })
  const db = loadDB()
  const found = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase())
  if (found) return res.status(200).json({ id: found.id, name: found.name, email: found.email, isAdmin: !!found.isAdmin })
  const user = { id: nanoid(12), name, email, isAdmin: Boolean(isAdmin), createdAt: new Date().toISOString() }
  db.users.push(user); saveDB(db)
  res.status(201).json({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin })
})

/** Editar usuário (admin) */
router.put('/admin/users/:id', requireAdmin, (req, res) => {
  const db = loadDB()
  const idx = db.users.findIndex(u => u.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'User not found' })
  const u = db.users[idx]
  const { name, email, isAdmin } = req.body || {}
  if (name !== undefined) u.name = name
  if (email !== undefined) u.email = email
  if (isAdmin !== undefined) u.isAdmin = Boolean(isAdmin)
  db.users[idx] = u; saveDB(db)
  res.json(u)
})

/** Apagar usuário (admin)
 * Regras:
 *  - um administrador NÃO pode apagar outro administrador (403)
 *  - um usuário só pode ser apagado se NÃO tiver refeições; caso haja refeições, retorna 400 e instrui a apagar as refeições primeiro
 */
router.delete('/admin/users/:id', requireAdmin, (req, res) => {
  const db = loadDB()
  const idx = db.users.findIndex(u => u.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'User not found' })
  const target = db.users[idx]
  // não permitir apagar outro admin
  if (target.isAdmin) return res.status(403).json({ error: 'Cannot delete an administrator' })
  // verificar se usuário possui refeições
  const hasMeals = db.meals.some(m => m.userId === target.id)
  if (hasMeals) {
    return res.status(400).json({
      error: 'User has meals. Delete the user\'s meals before removing the user. Use DELETE /api/admin/meals/:mealId for individual meals.'
    })
  }
  // sem refeições e não é admin -> pode apagar
  const [removed] = db.users.splice(idx, 1)
  saveDB(db)
  res.json({ ok: true, removedId: removed.id })
})

/** Criar refeição para qualquer usuário (admin) */
router.post('/admin/users/:id/meals', requireAdmin, (req, res) => {
  const { name, description = '', dateTime, inDiet } = req.body || {}
  if (!name || !dateTime || typeof inDiet !== 'boolean') {
    return res.status(400).json({ error: 'name, dateTime(ISO) and inDiet(boolean) are required' })
  }
  const db = loadDB()
  const user = db.users.find(u => u.id === req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const meal = {
    id: nanoid(12),
    userId: user.id,
    name,
    description,
    dateTime,
    inDiet: Boolean(inDiet),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  db.meals.push(meal); saveDB(db)
  res.status(201).json(meal)
})

/** Listar refeições de um usuário (admin) */
router.get('/admin/users/:id/meals', requireAdmin, (req, res) => {
  const db = loadDB()
  const user = db.users.find(u => u.id === req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const meals = db.meals.filter(m => m.userId === user.id).sort((a,b)=>b.dateTime.localeCompare(a.dateTime))
  res.json(meals)
})

/** Apagar todas as refeições de um usuário (admin) */
router.delete('/admin/users/:id/meals', requireAdmin, (req, res) => {
  const db = loadDB()
  const user = db.users.find(u => u.id === req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const before = db.meals.length
  db.meals = db.meals.filter(m => m.userId !== user.id)
  const removed = before - db.meals.length
  saveDB(db)
  res.json({ ok: true, removedMeals: removed })
})

/** Editar refeição por id (admin) */
router.put('/admin/meals/:id', requireAdmin, (req, res) => {
  const db = loadDB()
  const idx = db.meals.findIndex(m => m.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Meal not found' })
  const m = db.meals[idx]
  const { name, description, dateTime, inDiet, userId } = req.body || {}
  if (userId !== undefined) m.userId = userId
  if (name !== undefined) m.name = name
  if (description !== undefined) m.description = description
  if (dateTime !== undefined) m.dateTime = dateTime
  if (inDiet !== undefined) m.inDiet = Boolean(inDiet)
  m.updatedAt = new Date().toISOString()
  db.meals[idx] = m; saveDB(db)
  res.json(m)
})

/** Apagar refeição por id (admin) */
router.delete('/admin/meals/:id', requireAdmin, (req, res) => {
  const db = loadDB()
  const idx = db.meals.findIndex(m => m.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Meal not found' })
  const [removed] = db.meals.splice(idx, 1); saveDB(db)
  res.json({ ok: true, removedId: removed.id })
})

// ------------------ end admin ------------------

/** 1) Criar usuário (idempotente por email) */
router.post('/users', (req, res) => {
  const { name, email } = req.body || {}
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' })
  const db = loadDB()
  const found = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase())
  if (found) return res.status(200).json({ id: found.id, name: found.name, email: found.email })
  const user = { id: nanoid(12), name, email, isAdmin: false, createdAt: nowISO() }
  db.users.push(user); saveDB(db)
  res.status(201).json({ id: user.id, name: user.name, email: user.email })
})

/** 3) Registrar refeição (ligada ao usuário) */
router.post('/meals', requireUser, (req, res) => {
  const { name, description = '', dateTime, inDiet } = req.body || {}
  if (!name || !dateTime || typeof inDiet !== 'boolean') {
    return res.status(400).json({ error: 'name, dateTime(ISO) and inDiet(boolean) are required' })
  }
  const db = loadDB()
  const meal = {
    id: nanoid(12),
    userId: req.user.id,
    name,
    description,
    dateTime,                 // ISO string
    inDiet: Boolean(inDiet),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  db.meals.push(meal); saveDB(db)
  res.status(201).json(meal)
})

/** 4) Editar refeição */
router.put('/meals/:id', requireUser, (req, res) => {
  const db = loadDB()
  const idx = db.meals.findIndex(m => m.id === req.params.id && m.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'Meal not found' })
  const m = db.meals[idx]
  const { name, description, dateTime, inDiet } = req.body || {}
  if (name !== undefined) m.name = name
  if (description !== undefined) m.description = description
  if (dateTime !== undefined) m.dateTime = dateTime
  if (inDiet !== undefined) m.inDiet = Boolean(inDiet)
  m.updatedAt = nowISO()
  db.meals[idx] = m; saveDB(db)
  res.json(m)
})

/** 5) Apagar refeição */
router.delete('/meals/:id', requireUser, (req, res) => {
  const db = loadDB()
  const idx = db.meals.findIndex(m => m.id === req.params.id && m.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'Meal not found' })
  const [removed] = db.meals.splice(idx, 1); saveDB(db)
  res.json({ ok: true, removedId: removed.id })
})

/** 6) Listar refeições do usuário */
router.get('/meals', requireUser, (req, res) => {
  const db = loadDB()
  const meals = db.meals
    .filter(m => m.userId === req.user.id)
    .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
  res.json(meals)
})

/** 7) Visualizar uma refeição */
router.get('/meals/:id', requireUser, (req, res) => {
  const db = loadDB()
  const meal = db.meals.find(m => m.id === req.params.id && m.userId === req.user.id)
  if (!meal) return res.status(404).json({ error: 'Meal not found' })
  res.json(meal)
})

/** 8) Métricas do usuário */
router.get('/metrics', requireUser, (req, res) => {
  const db = loadDB()
  const meals = db.meals
    .filter(m => m.userId === req.user.id)
    .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
  const total = meals.length
  const inDiet = meals.filter(m => m.inDiet).length
  const outDiet = total - inDiet
  let best = 0, current = 0
  for (const m of meals) {
    if (m.inDiet) { current++; best = Math.max(best, current) }
    else current = 0
  }
  res.json({ total, inDiet, outDiet, bestInDietStreak: best })
})
