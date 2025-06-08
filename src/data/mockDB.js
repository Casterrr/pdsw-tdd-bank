/**
 * Mock de banco de dados para simular operações CRUD
 */

import Conta from '../models/Conta.js';

class MockDB {
  constructor() {
    this.contas = [];
    
    // Adicionar algumas contas de exemplo
    this.adicionarContasIniciais();
  }

  adicionarContasIniciais() {
    const conta1 = new Conta('João Silva', '123.456.789-00', 1000, 500);
    const conta2 = new Conta('Maria Souza', '987.654.321-00', 2500, 1000);
    const conta3 = new Conta('Pedro Santos', '111.222.333-44', 100, 200);
    
    this.contas.push(conta1, conta2, conta3);
  }

  criarConta(titular, cpf, saldoInicial = 0, limite = 1000) {
    const novaConta = new Conta(titular, cpf, saldoInicial, limite);
    this.contas.push(novaConta);
    return novaConta;
  }

  encontrarConta(id) {
    return this.contas.find(conta => conta.id === id);
  }

  encontrarContaPorCPF(cpf) {
    // Remove caracteres não numéricos para comparação
    const cpfLimpo = cpf.toString().replace(/[^\d]/g, '');
    return this.contas.find(conta => conta.cpf.toString().replace(/[^\d]/g, '') === cpfLimpo);
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