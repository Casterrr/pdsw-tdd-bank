/**
 * Mock de banco de dados para simular operações CRUD
 */

import Conta from '../models/Conta.js';

class MockDB {
  constructor() {
    this.contas = [];
    this.adicionarContasIniciais();
  }

  /**
   * Adiciona contas iniciais para demonstração
   */
  adicionarContasIniciais() {
    try {
      const conta1 = new Conta('João Silva', '529.982.247-25', 1000, 500);
      const conta2 = new Conta('Maria Souza', '048.454.787-06', 2500, 1000);
      
      this.contas.push(conta1, conta2);
      console.log('Contas iniciais criadas com sucesso');
    } catch (error) {
      console.error('Erro ao criar contas iniciais:', error.message);
    }
  }

  /**
   * Cria uma nova conta
   * @param {string} titular - Nome do titular
   * @param {string} cpf - CPF do titular
   * @param {number} saldoInicial - Saldo inicial da conta
   * @param {number} limite - Limite de crédito da conta
   * @returns {Conta} Nova conta criada
   * @throws {Error} Se houver erro ao criar a conta
   */
  criarConta(titular, cpf, saldoInicial = 0, limite = 1000) {
    try {
      // Verificar se já existe conta com este CPF
      const cpfLimpo = cpf.toString().replace(/\D/g, '');
      const contaExistente = this.contas.find(
        conta => conta.cpf.toString().replace(/\D/g, '') === cpfLimpo
      );
      
      if (contaExistente) {
        throw new Error('CPF já cadastrado no sistema');
      }
      
      // Criar a conta
      const novaConta = new Conta(titular, cpf, saldoInicial, limite);
      this.contas.push(novaConta);
      
      return novaConta;
    } catch (error) {
      console.error(`Erro ao criar conta: ${error.message}`);
      throw error;
    }
  }

  /**
   * Encontra uma conta pelo ID
   * @param {string} id - ID da conta
   * @returns {Conta|null} A conta encontrada ou null
   */
  encontrarConta(id) {
    if (!id) {
      console.warn('ID não fornecido para busca de conta');
      return null;
    }
    
    return this.contas.find(conta => conta.id === id);
  }

  /**
   * Encontra uma conta pelo CPF
   * @param {string} cpf - CPF do titular
   * @returns {Conta|null} A conta encontrada ou null
   */
  encontrarContaPorCPF(cpf) {
    if (!cpf) {
      console.warn('CPF não fornecido para busca de conta');
      return null;
    }
    
    // Remove caracteres não numéricos para comparação
    const cpfLimpo = cpf.toString().replace(/\D/g, '');
    return this.contas.find(
      conta => conta.cpf.toString().replace(/\D/g, '') === cpfLimpo
    );
  }

  /**
   * Lista todas as contas
   * @returns {Array<Conta>} Lista de contas
   */
  listarContas() {
    return [...this.contas];
  }

  /**
   * Atualiza uma conta existente
   * @param {Conta} conta - Conta com dados atualizados
   * @returns {boolean} true se a conta foi atualizada, false caso contrário
   */
  atualizarConta(conta) {
    if (!conta || !conta.id) {
      console.error('Tentativa de atualizar conta sem ID válido');
      return false;
    }
    
    const index = this.contas.findIndex(c => c.id === conta.id);
    if (index === -1) {
      console.error(`Conta ${conta.id} não encontrada para atualização`);
      return false;
    }
    
    this.contas[index] = conta;
    return true;
  }

  /**
   * Remove uma conta
   * @param {string} id - ID da conta a ser removida
   * @returns {boolean} true se a conta foi removida, false caso contrário
   */
  removerConta(id) {
    if (!id) {
      console.error('ID não fornecido para remoção de conta');
      return false;
    }
    
    const index = this.contas.findIndex(c => c.id === id);
    if (index === -1) {
      console.error(`Conta ${id} não encontrada para remoção`);
      return false;
    }
    
    this.contas.splice(index, 1);
    return true;
  }
}

// Exportar uma única instância para ser usada em toda a aplicação
const mockDB = new MockDB();
export default mockDB; 