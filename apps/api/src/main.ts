import express from 'express'
import cors from 'cors'
import { router as orgaosRouter } from './modules/orgaos/routes'
import { router as unidadesRouter } from './modules/unidades/routes'
import { router as requisitantesRouter } from './modules/requisitantes/routes'
import { router as dfdRouter } from './modules/dfd/routes'
import { router as pcaRouter } from './modules/pca/routes'
import { router as itensRouter } from './modules/itens/routes'
import { router as categoriasRouter } from './modules/categorias/routes'
import { router as authRouter } from './modules/auth/routes'
import { router as pncpRouter } from './modules/pncp/routes'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'planejax-api' })
})

app.use('/api/auth', authRouter)
app.use('/api/orgaos', orgaosRouter)
app.use('/api/unidades', unidadesRouter)
app.use('/api/requisitantes', requisitantesRouter)
app.use('/api/dfd', dfdRouter)
app.use('/api/pca', pcaRouter)
app.use('/api/itens', itensRouter)
app.use('/api/categorias', categoriasRouter)
app.use('/api/pncp', pncpRouter)

const PORT = process.env.PORT || 3001

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[planejax-api] running on http://localhost:${PORT}`)
  })
}

export default app
