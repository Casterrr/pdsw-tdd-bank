/**
 * Classe que representa uma conta bancária
 */
import { randomUUID } from 'crypto';

class Conta {
  constructor(titular, cpf, saldo = 0, limite = 1000) {
    // TODO: Implementar o construtor
  }

  /**
   * Valida se um CPF é válido
   * @param {string} cpf - O CPF a ser validado
   * @returns {boolean} - Verdadeiro se o CPF for válido, falso caso contrário
   */
  validarCPF(cpf) {
    // TODO: Implementar validação de CPF
    return false;
  }

  /**
   * Formata o CPF com a máscara padrão (XXX.XXX.XXX-XX)
   * @returns {string} - O CPF formatado
   */
  formatarCPF() {
    // TODO: Implementar formatação de CPF
    return '';
  }

  depositar(valor) {
    // TODO: Implementar depósito
    return 0;
  }

  sacar(valor) {
    // TODO: Implementar saque
    return 0;
  }

  transferir(valor, contaDestino) {
    // TODO: Implementar transferência
    return false;
  }
  
  inativar() {
    // TODO: Implementar inativação da conta
    return false;
  }
  
  reativar() {
    // TODO: Implementar reativação da conta
    return false;
  }
}

export default Conta; 