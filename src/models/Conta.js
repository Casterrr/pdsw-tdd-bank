/**
 * Classe que representa uma conta bancária
 */
import { randomUUID } from 'crypto';

class Conta {
  constructor(titular, cpf, saldo = 0, limite = 1000) {
    this.id = randomUUID(); // Valor fixo para atender ao mock nos testes
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

  validarCPF(cpf) {
    if (!cpf) return false;

    const cpfLimpo = cpf.toString().replace(/\D/g, '');

    if (cpfLimpo.length !== 11) return false;
    
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    
    let resto = soma % 11;
    let digitoVerificador1 = resto < 2 ? 0 : 11 - resto;
    
    if (digitoVerificador1 !== parseInt(cpfLimpo.charAt(9))) {
      return false;
    }
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    
    resto = soma % 11;
    let digitoVerificador2 = resto < 2 ? 0 : 11 - resto;
    
    if (digitoVerificador2 !== parseInt(cpfLimpo.charAt(10))) {
      return false;
    }
    
    return true;
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
    
    if (contaDestino.id === this.id) {
      throw new Error('Não é possível transferir para a mesma conta');
    }
    
    this.sacar(valor);
    contaDestino.depositar(valor);
    return true;
  }
  
  inativar() {
    if (!this.ativa) {
      throw new Error('A conta já está inativa');
    }
    
    this.ativa = false;
    return this.ativa;
  }
  
  reativar() {
    if (this.ativa) {
      throw new Error('A conta já está ativa');
    }
    
    this.ativa = true;
    return this.ativa;
  }
}

export default Conta; 