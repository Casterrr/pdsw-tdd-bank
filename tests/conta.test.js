/**
 * Testes para as funcionalidades de contas bancárias
 */

import Conta from '../src/models/Conta.js';
import contaService from '../src/services/ContaService.js';
import mockDB from '../src/data/mockDB.js';

// Mock do banco de dados para os testes
jest.mock('../src/data/mockDB.js', () => ({
  contas: [],
  contadorId: 1,
  criarConta: jest.fn(),
  encontrarConta: jest.fn(),
  listarContas: jest.fn(),
  atualizarConta: jest.fn(),
  removerConta: jest.fn()
}));

describe('Modelo de Conta', () => {
  let conta;
  
  beforeEach(() => {
    conta = new Conta(1, 'Teste', 1000, 500);
  });
  
  test('deve criar uma conta corretamente', () => {
    expect(conta.id).toBe(1);
    expect(conta.titular).toBe('Teste');
    expect(conta.saldo).toBe(1000);
    expect(conta.limite).toBe(500);
    expect(conta.ativa).toBe(true);
    expect(conta.dataCriacao).toBeInstanceOf(Date);
  });
  
  test('deve depositar um valor positivo', () => {
    const saldoAnterior = conta.saldo;
    const valor = 500;
    
    const novoSaldo = conta.depositar(valor);
    
    expect(novoSaldo).toBe(saldoAnterior + valor);
    expect(conta.saldo).toBe(saldoAnterior + valor);
  });
  
  test('não deve permitir depósito de valor zero ou negativo', () => {
    expect(() => conta.depositar(0)).toThrow('O valor do depósito deve ser positivo');
    expect(() => conta.depositar(-100)).toThrow('O valor do depósito deve ser positivo');
  });
  
  test('não deve permitir depósito em conta inativa', () => {
    conta.inativar();
    expect(() => conta.depositar(100)).toThrow('Não é possível depositar em uma conta inativa');
  });
  
  test('deve sacar um valor dentro do limite disponível', () => {
    const saldoAnterior = conta.saldo;
    const valor = 500;
    
    const novoSaldo = conta.sacar(valor);
    
    expect(novoSaldo).toBe(saldoAnterior - valor);
    expect(conta.saldo).toBe(saldoAnterior - valor);
  });
  
  test('deve permitir saque usando o limite', () => {
    conta.saldo = 100;
    
    // Saque de 500, usando 400 do limite
    conta.sacar(500);
    
    expect(conta.saldo).toBe(-400);
  });
  
  test('não deve permitir saque além do saldo + limite', () => {
    conta.saldo = 100;
    conta.limite = 500;
    
    expect(() => conta.sacar(601)).toThrow('Saldo insuficiente');
  });
  
  test('não deve permitir saque de valor zero ou negativo', () => {
    expect(() => conta.sacar(0)).toThrow('O valor do saque deve ser positivo');
    expect(() => conta.sacar(-100)).toThrow('O valor do saque deve ser positivo');
  });
  
  test('não deve permitir saque em conta inativa', () => {
    conta.inativar();
    expect(() => conta.sacar(100)).toThrow('Não é possível sacar de uma conta inativa');
  });
  
  test('deve transferir um valor para outra conta', () => {
    const contaDestino = new Conta(2, 'Destino', 500, 500);
    const saldoOrigem = conta.saldo;
    const saldoDestino = contaDestino.saldo;
    const valor = 300;
    
    conta.transferir(valor, contaDestino);
    
    expect(conta.saldo).toBe(saldoOrigem - valor);
    expect(contaDestino.saldo).toBe(saldoDestino + valor);
  });
  
  test('não deve transferir para uma conta inválida', () => {
    expect(() => conta.transferir(100, null)).toThrow('Conta de destino inválida');
    expect(() => conta.transferir(100, {})).toThrow('Conta de destino inválida');
  });
  
  test('deve inativar uma conta', () => {
    expect(conta.ativa).toBe(true);
    
    conta.inativar();
    
    expect(conta.ativa).toBe(false);
  });
  
  test('deve reativar uma conta', () => {
    conta.inativar();
    expect(conta.ativa).toBe(false);
    
    conta.reativar();
    
    expect(conta.ativa).toBe(true);
  });
});

describe('Serviço de Conta', () => {
  beforeEach(() => {
    // Limpar os mocks antes de cada teste
    jest.clearAllMocks();
  });
  
  test('deve criar uma conta com parâmetros válidos', () => {
    const contaMock = new Conta(1, 'Teste', 1000, 500);
    mockDB.criarConta.mockReturnValue(contaMock);
    
    const conta = contaService.criarConta('Teste', 1000, 500);
    
    expect(mockDB.criarConta).toHaveBeenCalledWith('Teste', 1000, 500);
    expect(conta).toEqual(contaMock);
  });
  
  test('não deve criar conta sem titular', () => {
    expect(() => contaService.criarConta('', 1000, 500)).toThrow('O titular da conta é obrigatório');
    expect(() => contaService.criarConta(null, 1000, 500)).toThrow('O titular da conta é obrigatório');
  });
  
  test('não deve criar conta com saldo inicial negativo', () => {
    expect(() => contaService.criarConta('Teste', -100, 500)).toThrow('Saldo inicial não pode ser negativo');
  });
  
  test('não deve criar conta com limite negativo', () => {
    expect(() => contaService.criarConta('Teste', 1000, -500)).toThrow('Limite não pode ser negativo');
  });
  
  test('deve buscar uma conta pelo ID', () => {
    const contaMock = new Conta(1, 'Teste', 1000, 500);
    mockDB.encontrarConta.mockReturnValue(contaMock);
    
    const conta = contaService.buscarConta(1);
    
    expect(mockDB.encontrarConta).toHaveBeenCalledWith(1);
    expect(conta).toEqual(contaMock);
  });
  
  test('deve lançar erro ao buscar conta inexistente', () => {
    mockDB.encontrarConta.mockReturnValue(null);
    
    expect(() => contaService.buscarConta(999)).toThrow('Conta não encontrada');
  });
  
  test('deve listar todas as contas', () => {
    const contasMock = [
      new Conta(1, 'Teste 1', 1000, 500),
      new Conta(2, 'Teste 2', 2000, 1000)
    ];
    mockDB.listarContas.mockReturnValue(contasMock);
    
    const contas = contaService.listarContas();
    
    expect(mockDB.listarContas).toHaveBeenCalled();
    expect(contas).toEqual(contasMock);
  });
  
  test('deve realizar depósito em uma conta', () => {
    const contaMock = new Conta(1, 'Teste', 1000, 500);
    const depositarSpy = jest.spyOn(contaMock, 'depositar');
    
    mockDB.encontrarConta.mockReturnValue(contaMock);
    
    const conta = contaService.depositar(1, 500);
    
    expect(mockDB.encontrarConta).toHaveBeenCalledWith(1);
    expect(depositarSpy).toHaveBeenCalledWith(500);
    expect(mockDB.atualizarConta).toHaveBeenCalledWith(contaMock);
    expect(conta).toEqual(contaMock);
  });
  
  test('deve realizar saque em uma conta', () => {
    const contaMock = new Conta(1, 'Teste', 1000, 500);
    const sacarSpy = jest.spyOn(contaMock, 'sacar');
    
    mockDB.encontrarConta.mockReturnValue(contaMock);
    
    const conta = contaService.sacar(1, 500);
    
    expect(mockDB.encontrarConta).toHaveBeenCalledWith(1);
    expect(sacarSpy).toHaveBeenCalledWith(500);
    expect(mockDB.atualizarConta).toHaveBeenCalledWith(contaMock);
    expect(conta).toEqual(contaMock);
  });
  
  test('deve realizar transferência entre contas', () => {
    const contaOrigem = new Conta(1, 'Origem', 1000, 500);
    const contaDestino = new Conta(2, 'Destino', 500, 500);
    const transferirSpy = jest.spyOn(contaOrigem, 'transferir');
    
    mockDB.encontrarConta.mockImplementation((id) => {
      if (id === 1) return contaOrigem;
      if (id === 2) return contaDestino;
      return null;
    });
    
    const resultado = contaService.transferir(1, 2, 300);
    
    expect(mockDB.encontrarConta).toHaveBeenCalledWith(1);
    expect(mockDB.encontrarConta).toHaveBeenCalledWith(2);
    expect(transferirSpy).toHaveBeenCalledWith(300, contaDestino);
    expect(mockDB.atualizarConta).toHaveBeenCalledWith(contaOrigem);
    expect(mockDB.atualizarConta).toHaveBeenCalledWith(contaDestino);
    expect(resultado).toEqual({ contaOrigem, contaDestino });
  });
});

// Você poderá adicionar testes de integração e da API com supertest em uma versão futura 