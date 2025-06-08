/**
 * Classe que representa uma conta bancária
 */
import { randomUUID } from 'crypto';

class Conta {
  constructor(titular, cpf, saldo = 0, limite = 1000) {
    this.id = randomUUID();
    this.titular = titular;
    
    if (!this.validarCPF(cpf)) {
      throw new Error('CPF inválido');
    }
    
    this.cpf = cpf;
    this.saldo = saldo;
    this.limite = limite;
    this.ativa = true;
    this.dataCriacao = new Date();
  }

  /**
   * Valida se um CPF é válido
   * @param {string} cpf - O CPF a ser validado
   * @returns {boolean} - Verdadeiro se o CPF for válido, falso caso contrário
   */
  validarCPF(cpf) {
    if (!cpf) return false;
    
    // Remove caracteres não numéricos
    const cpfLimpo = cpf.toString().replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (caso inválido)
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
    
    // Validação dos dígitos verificadores
    let soma = 0;
    let resto;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;
    
    // Segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;
    
    return true;
  }

  /**
   * Formata o CPF com a máscara padrão (XXX.XXX.XXX-XX)
   * @returns {string} - O CPF formatado
   */
  formatarCPF() {
    const cpfLimpo = this.cpf.toString().replace(/[^\d]/g, '');
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  depositar(valor) {
    if (valor <= 0) {
      throw new Error('O valor do depósito deve ser positivo');
    }
    
    if (!this.ativa) {
      throw new Error('Não é possível depositar em uma conta inativa');
    }

    this.saldo += valor;
    return this.saldo;
  }

  sacar(valor) {
    if (valor <= 0) {
      throw new Error('O valor do saque deve ser positivo');
    }
    
    if (!this.ativa) {
      throw new Error('Não é possível sacar de uma conta inativa');
    }
    
    if (valor > this.saldo + this.limite) {
      throw new Error('Saldo insuficiente');
    }
    
    this.saldo -= valor;
    return this.saldo;
  }

  transferir(valor, contaDestino) {
    if (!contaDestino || !(contaDestino instanceof Conta)) {
      throw new Error('Conta de destino inválida');
    }
    
    this.sacar(valor);
    contaDestino.depositar(valor);
    return true;
  }
  
  inativar() {
    this.ativa = false;
    return this.ativa;
  }
  
  reativar() {
    this.ativa = true;
    return this.ativa;
  }
}

export default Conta; 