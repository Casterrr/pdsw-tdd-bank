/**
 * Arquivo principal da aplicação
 */

import express from 'express';
import contaRoutes from './routes/contaRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para processar JSON
app.use(express.json());

// Rotas
app.use('/api', contaRoutes);

// Rota de boas-vindas
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API de Banco com TDD',
    versao: '1.0.0',
    endpoints: {
      contas: '/api/contas',
      contaEspecifica: '/api/contas/:id',
      depositar: '/api/contas/:id/depositar',
      sacar: '/api/contas/:id/sacar',
      transferir: '/api/contas/:idOrigem/transferir'
    }
  });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app; // Exportando para testes 