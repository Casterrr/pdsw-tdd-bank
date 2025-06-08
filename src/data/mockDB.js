/**
 * Mock de banco de dados para simular operações CRUD
 */

import Conta from '../models/Conta.js';

class MockDB {
  constructor() {
    this.contas = [];
  }

  adicionarContasIniciais() {
    // TODO: Implementar adição de contas iniciais
  }

  criarConta(titular, cpf, saldoInicial = 0, limite = 1000) {
    // TODO: Implementar criação de conta
    return null;
  }

  encontrarConta(id) {
    // TODO: Implementar busca de conta por ID
    return null;
  }

  encontrarContaPorCPF(cpf) {
    // TODO: Implementar busca de conta por CPF
    return null;
  }

  listarContas() {
    // TODO: Implementar listagem de contas
    return [];
  }

  atualizarConta(conta) {
    // TODO: Implementar atualização de conta
    return false;
  }

  removerConta(id) {
    // TODO: Implementar remoção de conta
    return false;
  }
}

// Exportar uma única instância para ser usada em toda a aplicação
const mockDB = new MockDB();
export default mockDB; 