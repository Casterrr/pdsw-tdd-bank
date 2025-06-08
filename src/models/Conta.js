/**
 * Classe que representa uma conta bancária
 */
class Conta {
  constructor(id, titular, saldo = 0, limite = 1000) {
    this.id = id;
    this.titular = titular;
    this.saldo = saldo;
    this.limite = limite;
    this.ativa = true;
    this.dataCriacao = new Date();
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