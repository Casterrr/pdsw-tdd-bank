/**
 * Rotas para operações relacionadas às contas bancárias
 */

import { Router } from 'express';
import contaController from '../controllers/ContaController.js';

const router = Router();

// Rotas para consulta de contas
// ------------------------------

// Listar todas as contas
router.get('/contas', contaController.listarContas);

// Buscar uma conta específica pelo ID
router.get('/contas/:id', contaController.buscarConta);

// Buscar uma conta pelo CPF
router.get('/contas/cpf/:cpf', contaController.buscarContaPorCPF);

// Rotas para operações financeiras
// -------------------------------

// Criar uma nova conta
router.post('/contas', contaController.criarConta);

// Realizar depósito
router.post('/contas/:id/depositar', contaController.depositar);

// Realizar saque
router.post('/contas/:id/sacar', contaController.sacar);

// Realizar transferência
router.post('/contas/:idOrigem/transferir', contaController.transferir);

// Rotas para gerenciamento de estado
// --------------------------------

// Inativar conta (usando PATCH que é mais apropriado para mudanças parciais)
// Mantido o POST para compatibilidade com testes existentes
router.post('/contas/:id/inativar', contaController.inativarConta);

// Reativar conta (usando PATCH que é mais apropriado para mudanças parciais)
// Mantido o POST para compatibilidade com testes existentes
router.post('/contas/:id/reativar', contaController.reativarConta);

export default router; 