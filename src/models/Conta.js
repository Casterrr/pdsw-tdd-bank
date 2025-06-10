/**
 * Classe que representa uma conta bancária
 */
import { randomUUID } from 'crypto';

class Conta {
  constructor(titular, cpf, saldo = 0, limite = 1000) {
    // Sempre gerar um ID aleatório usando randomUUID
    this.id = randomUUID();
    
    // Validar o titular
    if (!titular || typeof titular !== 'string' || titular.trim() === '') {
      throw new Error('Titular da conta é obrigatório');
    }
    this.titular = titular.trim();
    
    // Validar o CPF
    if (!this.validarCPF(cpf)) {
      throw new Error('CPF inválido');
    }
    this.cpf = cpf;
    
    // Validar o saldo inicial
    const saldoNumerico = Number(saldo);
    if (isNaN(saldoNumerico)) {
      throw new Error('Saldo inicial deve ser um número');
    }
    this.saldo = saldoNumerico;
    
    // Validar o limite
    const limiteNumerico = Number(limite);
    if (isNaN(limiteNumerico) || limiteNumerico < 0) {
      throw new Error('Limite deve ser um número não negativo');
    }
    this.limite = limiteNumerico;
    
    // Inicializar outros campos
    this.ativa = true;
    this.dataCriacao = new Date();
  }

  /**
   * Valida se um CPF é válido
   * @param {string} cpf - O CPF a ser validado
   * @returns {boolean} - Verdadeiro se o CPF for válido, falso caso contrário
   */
  validarCPF(cpf) {
    if (typeof cpf !== 'string') return false;

    // Remove pontuação
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos e se todos são iguais
    if (cpf.length !== 11 || cpf.split('').every(d => d === cpf[0])) {
      return false;
    }

    // Cálculo dos dígitos verificadores
    const calcDigito = (base, pesoInicial) => {
      let soma = 0;
      for (let i = 0; i < base.length; i++) {
        soma += parseInt(base[i]) * (pesoInicial - i);
      }
      let resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const base = cpf.substring(0, 9);
    const digito1 = calcDigito(base, 10);
    const digito2 = calcDigito(base + digito1, 11);

    return cpf === base + digito1.toString() + digito2.toString();
  }

  depositar(valor) {
    const valorPositivo = valor > 0;
    const contaAtiva = this.ativa;
  
    if (!valorPositivo) {
      throw new Error('O valor do depósito deve ser positivo');
    }
  
    if (!contaAtiva) {
      throw new Error('Não é possível depositar em uma conta inativa');
    }
  
    this.saldo += valor;
    return this.saldo;
  }
  

  sacar(valor) {
    // Garantir que o valor é um número
    const valorNumerico = Number(valor);
    
    // Verificar se é um número válido
    if (isNaN(valorNumerico)) {
      throw new Error('O valor do saque deve ser um número');
    }
    
    // Verificar se é positivo
    if (valorNumerico <= 0) {
      throw new Error('O valor do saque deve ser positivo');
    }
    
    // Verificar se a conta está ativa
    if (!this.ativa) {
      throw new Error('Não é possível sacar de uma conta inativa');
    }
    
    // Verificar se há saldo suficiente (considerando o limite)
    const saldoDisponivel = this.saldo + this.limite;
    if (valorNumerico > saldoDisponivel) {
      throw new Error('Saldo insuficiente');
    }
    
    // Arredondar para 2 casas decimais para evitar problemas de ponto flutuante
    this.saldo = Math.round((this.saldo - valorNumerico) * 100) / 100;
    return this.saldo;
  }

  transferir(valor, contaDestino) {
    // Validar a conta de destino
    if (!contaDestino || !(contaDestino instanceof Conta)) {
      throw new Error('Conta de destino inválida');
    }
    
    // Garantir que o valor é um número
    const valorNumerico = Number(valor);
    
    // Verificar se é um número válido
    if (isNaN(valorNumerico)) {
      throw new Error('O valor da transferência deve ser um número');
    }
    
    // Verificar se é positivo
    if (valorNumerico <= 0) {
      throw new Error('O valor da transferência deve ser positivo');
    }
    
    // Verificar se as contas são diferentes
    if (this.id === contaDestino.id) {
      throw new Error('Não é possível transferir para a mesma conta');
    }
    
    // Realizar o saque na conta de origem
    this.sacar(valorNumerico);
    
    // Realizar o depósito na conta de destino
    contaDestino.depositar(valorNumerico);
    
    return true;
  }
  
  inativar() {
    // Verificar se a conta já está inativa
    if (!this.ativa) {
      throw new Error('A conta já está inativa');
    }
    
    this.ativa = false;
    return this.ativa;
  }
  
  reativar() {
    // Verificar se a conta já está ativa
    if (this.ativa) {
      throw new Error('A conta já está ativa');
    }
    
    this.ativa = true;
    return this.ativa;
  }
}

export default Conta; 