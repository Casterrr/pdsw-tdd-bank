/**
 * Mock de banco de dados para simular operações CRUD
 */

import Conta from '../models/Conta.js';

class MockDB {
  constructor() {
    this.contas = [];
    this.contadorId = 1;

    // Adicionar algumas contas de exemplo
    this.adicionarContasIniciais();
  }

  adicionarContasIniciais() {
    const conta1 = new Conta(this.contadorId++, 'João Silva', 1000, 500);
    const conta2 = new Conta(this.contadorId++, 'Maria Souza', 2500, 1000);
    const conta3 = new Conta(this.contadorId++, 'Pedro Santos', 100, 200);
    
    this.contas.push(conta1, conta2, conta3);
  }

  criarConta(titular, saldoInicial = 0, limite = 1000) {
    const novaConta = new Conta(this.contadorId++, titular, saldoInicial, limite);
    this.contas.push(novaConta);
    return novaConta;
  }

  encontrarConta(id) {
    return this.contas.find(conta => conta.id === id);
  }

  listarContas() {
    return [...this.contas];
  }

  atualizarConta(conta) {
    const index = this.contas.findIndex(c => c.id === conta.id);
    if (index === -1) {
      return false;
    }
    
    this.contas[index] = conta;
    return true;
  }

  removerConta(id) {
    const index = this.contas.findIndex(c => c.id === id);
    if (index === -1) {
      return false;
    }
    
    this.contas.splice(index, 1);
    return true;
  }
}

// Exportar uma única instância para ser usada em toda a aplicação
const mockDB = new MockDB();
export default mockDB; 