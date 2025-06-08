/**
 * Serviço para gerenciar as regras de negócio das contas bancárias
 */

import mockDB from '../data/mockDB.js';

class ContaService {
  /**
   * Cria uma nova conta bancária
   */
  criarConta(titular, saldoInicial, limite) {
    if (!titular || titular.trim() === '') {
      throw new Error('O titular da conta é obrigatório');
    }
    
    if (saldoInicial < 0) {
      throw new Error('Saldo inicial não pode ser negativo');
    }
    
    if (limite < 0) {
      throw new Error('Limite não pode ser negativo');
    }
    
    return mockDB.criarConta(titular, saldoInicial, limite);
  }

  /**
   * Busca uma conta pelo ID
   */
  buscarConta(id) {
    if (!id) {
      throw new Error('ID da conta é obrigatório');
    }
    
    const conta = mockDB.encontrarConta(Number(id));
    if (!conta) {
      throw new Error('Conta não encontrada');
    }
    
    return conta;
  }

  /**
   * Lista todas as contas
   */
  listarContas() {
    return mockDB.listarContas();
  }

  /**
   * Realiza depósito em uma conta
   */
  depositar(id, valor) {
    const conta = this.buscarConta(id);
    conta.depositar(Number(valor));
    mockDB.atualizarConta(conta);
    return conta;
  }

  /**
   * Realiza saque em uma conta
   */
  sacar(id, valor) {
    const conta = this.buscarConta(id);
    conta.sacar(Number(valor));
    mockDB.atualizarConta(conta);
    return conta;
  }

  /**
   * Realiza transferência entre contas
   */
  transferir(idOrigem, idDestino, valor) {
    const contaOrigem = this.buscarConta(idOrigem);
    const contaDestino = this.buscarConta(idDestino);
    
    contaOrigem.transferir(Number(valor), contaDestino);
    
    mockDB.atualizarConta(contaOrigem);
    mockDB.atualizarConta(contaDestino);
    
    return { contaOrigem, contaDestino };
  }

  /**
   * Inativa uma conta
   */
  inativarConta(id) {
    const conta = this.buscarConta(id);
    conta.inativar();
    mockDB.atualizarConta(conta);
    return conta;
  }

  /**
   * Reativa uma conta
   */
  reativarConta(id) {
    const conta = this.buscarConta(id);
    conta.reativar();
    mockDB.atualizarConta(conta);
    return conta;
  }
}

export default new ContaService(); 