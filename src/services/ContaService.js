/**
 * Serviço para gerenciar as regras de negócio das contas bancárias
 */

import mockDB from '../data/mockDB.js';

class ContaService {
  /**
   * Cria uma nova conta bancária
   * @param {string} titular - Nome do titular da conta
   * @param {string} cpf - CPF do titular
   * @param {number} saldoInicial - Saldo inicial da conta (opcional)
   * @param {number} limite - Limite de crédito da conta (opcional)
   * @returns {Object} - A conta criada
   * @throws {Error} Se houver erro na validação dos dados
   */
  criarConta(titular, cpf, saldoInicial, limite) {
    // Validar titular
    if (!titular || typeof titular !== 'string' || titular.trim() === '') {
      throw new Error('O titular da conta é obrigatório');
    }
    
    // Validar CPF
    if (!cpf) {
      throw new Error('O CPF é obrigatório');
    }
    
    // Verifica se já existe uma conta com o mesmo CPF
    const contaExistente = mockDB.encontrarContaPorCPF(cpf);
    if (contaExistente) {
      throw new Error('Já existe uma conta com este CPF');
    }
    
    // Validar saldo inicial (se fornecido)
    const saldoNumerico = saldoInicial !== undefined ? Number(saldoInicial) : 0;
    if (isNaN(saldoNumerico)) {
      throw new Error('Saldo inicial deve ser um número válido');
    }
    if (saldoNumerico < 0) {
      throw new Error('Saldo inicial não pode ser negativo');
    }
    
    // Validar limite (se fornecido)
    const limiteNumerico = limite !== undefined ? Number(limite) : 1000;
    if (isNaN(limiteNumerico)) {
      throw new Error('Limite deve ser um número válido');
    }
    if (limiteNumerico < 0) {
      throw new Error('Limite não pode ser negativo');
    }
    
    // Criar a conta com os valores validados
    return mockDB.criarConta(titular, cpf, saldoNumerico, limiteNumerico);
  }

  /**
   * Busca uma conta pelo ID
   * @param {string} id - ID da conta
   * @returns {Object} - A conta encontrada
   * @throws {Error} Se a conta não for encontrada
   */
  buscarConta(id) {
    if (!id) {
      throw new Error('ID da conta é obrigatório');
    }
    
    const conta = mockDB.encontrarConta(id);
    if (!conta) {
      throw new Error('Conta não encontrada');
    }
    
    return conta;
  }

  /**
   * Busca uma conta pelo CPF
   * @param {string} cpf - CPF do titular
   * @returns {Object} - A conta encontrada
   * @throws {Error} Se a conta não for encontrada
   */
  buscarContaPorCPF(cpf) {
    if (!cpf) {
      throw new Error('CPF é obrigatório');
    }
    
    const conta = mockDB.encontrarContaPorCPF(cpf);
    if (!conta) {
      throw new Error('Conta não encontrada');
    }
    
    return conta;
  }

  /**
   * Lista todas as contas
   * @returns {Array} - Lista de contas
   */
  listarContas() {
    return mockDB.listarContas();
  }

  /**
   * Realiza depósito em uma conta
   * @param {string} id - ID da conta
   * @param {number} valor - Valor a ser depositado
   * @returns {Object} - A conta atualizada
   * @throws {Error} Se houver erro na operação
   */
  depositar(id, valor) {
    // Validar parâmetros
    if (!id) {
      throw new Error('ID da conta é obrigatório');
    }
    
    // Validar valor
    const valorNumerico = Number(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      throw new Error('Valor do depósito deve ser um número positivo');
    }
    
    // Buscar a conta e realizar o depósito
    const conta = this.buscarConta(id);
    conta.depositar(valorNumerico);
    
    // Atualizar a conta no banco de dados
    mockDB.atualizarConta(conta);
    
    return conta;
  }

  /**
   * Realiza saque em uma conta
   * @param {string} id - ID da conta
   * @param {number} valor - Valor a ser sacado
   * @returns {Object} - A conta atualizada
   * @throws {Error} Se houver erro na operação
   */
  sacar(id, valor) {
    // Validar parâmetros
    if (!id) {
      throw new Error('ID da conta é obrigatório');
    }
    
    // Validar valor
    const valorNumerico = Number(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      throw new Error('Valor do saque deve ser um número positivo');
    }
    
    // Buscar a conta e realizar o saque
    const conta = this.buscarConta(id);
    conta.sacar(valorNumerico);
    
    // Atualizar a conta no banco de dados
    mockDB.atualizarConta(conta);
    
    return conta;
  }

  /**
   * Realiza transferência entre contas
   * @param {string} idOrigem - ID da conta de origem
   * @param {string} idDestino - ID da conta de destino
   * @param {number} valor - Valor a ser transferido
   * @returns {Object} - Objeto com as contas origem e destino
   * @throws {Error} Se houver erro na operação
   */
  transferir(idOrigem, idDestino, valor) {
    // Validar parâmetros
    if (!idOrigem) {
      throw new Error('ID da conta de origem é obrigatório');
    }
    
    if (!idDestino) {
      throw new Error('ID da conta de destino é obrigatório');
    }
    
    // Verificar se as contas são diferentes
    if (idOrigem === idDestino) {
      throw new Error('Não é possível transferir para a mesma conta');
    }
    
    // Validar valor
    const valorNumerico = Number(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      throw new Error('Valor da transferência deve ser um número positivo');
    }
    
    // Buscar as contas
    const contaOrigem = this.buscarConta(idOrigem);
    const contaDestino = this.buscarConta(idDestino);
    
    // Realizar a transferência
    contaOrigem.transferir(valorNumerico, contaDestino);
    
    // Atualizar as contas no banco de dados
    mockDB.atualizarConta(contaOrigem);
    mockDB.atualizarConta(contaDestino);
    
    return { contaOrigem, contaDestino };
  }

  /**
   * Inativa uma conta
   * @param {string} id - ID da conta
   * @returns {Object} - A conta atualizada
   * @throws {Error} Se houver erro na operação
   */
  inativarConta(id) {
    if (!id) {
      throw new Error('ID da conta é obrigatório');
    }
    
    const conta = this.buscarConta(id);
    conta.inativar();
    mockDB.atualizarConta(conta);
    
    return conta;
  }

  /**
   * Reativa uma conta
   * @param {string} id - ID da conta
   * @returns {Object} - A conta atualizada
   * @throws {Error} Se houver erro na operação
   */
  reativarConta(id) {
    if (!id) {
      throw new Error('ID da conta é obrigatório');
    }
    
    const conta = this.buscarConta(id);
    conta.reativar();
    mockDB.atualizarConta(conta);
    
    return conta;
  }
}

export default new ContaService(); 