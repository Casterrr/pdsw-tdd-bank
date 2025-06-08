/**
 * Testes para as funcionalidades de contas bancárias
 */

import Conta from '../src/models/Conta.js';
import contaService from '../src/services/ContaService.js';
import mockDB from '../src/data/mockDB.js';

// Mock do crypto.randomUUID para testes determinísticos
jest.mock('crypto', () => ({
  randomUUID: () => 'abc123-teste-uuid'
}));

// Mock do banco de dados para os testes
jest.mock('../src/data/mockDB.js', () => ({
  contas: [],
  criarConta: jest.fn(),
  encontrarConta: jest.fn(),
  encontrarContaPorCPF: jest.fn(),
  listarContas: jest.fn(),
  atualizarConta: jest.fn(),
  removerConta: jest.fn()
}));

describe('Modelo de Conta', () => {
  let conta;
  let cpfValido = '529.982.247-25'; // CPF válido para testes
  
  beforeEach(() => {
    conta = new Conta('Teste', cpfValido, 1000, 500);
  });
  
  test('deve criar uma conta corretamente', () => {
    expect(conta.id).toBe('abc123-teste-uuid');
    expect(conta.titular).toBe('Teste');
    expect(conta.cpf).toBe(cpfValido);
    expect(conta.saldo).toBe(1000);
    expect(conta.limite).toBe(500);
    expect(conta.ativa).toBe(true);
    expect(conta.dataCriacao).toBeInstanceOf(Date);
  });
  
  test('não deve criar conta com CPF inválido', () => {
    expect(() => new Conta('Teste', '123.456.789-00', 1000, 500)).toThrow('CPF inválido');
    expect(() => new Conta('Teste', '111.111.111-11', 1000, 500)).toThrow('CPF inválido');
    expect(() => new Conta('Teste', '123.456.789', 1000, 500)).toThrow('CPF inválido');
    expect(() => new Conta('Teste', null, 1000, 500)).toThrow('CPF inválido');
  });
  
  test('deve validar CPF corretamente', () => {
    expect(conta.validarCPF(cpfValido)).toBe(true);
    expect(conta.validarCPF('529.982.247-25')).toBe(true);
    expect(conta.validarCPF('52998224725')).toBe(true);
    
    expect(conta.validarCPF('111.111.111-11')).toBe(false);
    expect(conta.validarCPF('123.456.789-00')).toBe(false);
    expect(conta.validarCPF('123')).toBe(false);
    expect(conta.validarCPF('')).toBe(false);
  });
  
  test('deve formatar CPF corretamente', () => {
    conta.cpf = '52998224725';
    expect(conta.formatarCPF()).toBe('529.982.247-25');
    
    conta.cpf = '529.982.247-25';
    expect(conta.formatarCPF()).toBe('529.982.247-25');
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
    const contaDestino = new Conta('Destino', '048.454.787-06', 500, 500);
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
  const cpfValido = '529.982.247-25';
  
  beforeEach(() => {
    // Limpar os mocks antes de cada teste
    jest.clearAllMocks();
  });
  
  test('deve criar uma conta com parâmetros válidos', () => {
    const contaMock = new Conta('Teste', cpfValido, 1000, 500);
    mockDB.criarConta.mockReturnValue(contaMock);
    mockDB.encontrarContaPorCPF.mockReturnValue(null); // Simula CPF não existente
    
    const conta = contaService.criarConta('Teste', cpfValido, 1000, 500);
    
    expect(mockDB.encontrarContaPorCPF).toHaveBeenCalledWith(cpfValido);
    expect(mockDB.criarConta).toHaveBeenCalledWith('Teste', cpfValido, 1000, 500);
    expect(conta).toEqual(contaMock);
  });
  
  test('não deve criar conta sem titular', () => {
    expect(() => contaService.criarConta('', cpfValido, 1000, 500)).toThrow('O titular da conta é obrigatório');
    expect(() => contaService.criarConta(null, cpfValido, 1000, 500)).toThrow('O titular da conta é obrigatório');
  });
  
  test('não deve criar conta sem CPF', () => {
    expect(() => contaService.criarConta('Teste', '', 1000, 500)).toThrow('O CPF é obrigatório');
    expect(() => contaService.criarConta('Teste', null, 1000, 500)).toThrow('O CPF é obrigatório');
  });
  
  test('não deve criar conta com CPF já existente', () => {
    const contaExistente = new Conta('Teste Existente', cpfValido, 1000, 500);
    mockDB.encontrarContaPorCPF.mockReturnValue(contaExistente);
    
    expect(() => contaService.criarConta('Teste', cpfValido, 1000, 500)).toThrow('Já existe uma conta com este CPF');
  });
  
  test('não deve criar conta com saldo inicial negativo', () => {
    mockDB.encontrarContaPorCPF.mockReturnValue(null);
    expect(() => contaService.criarConta('Teste', cpfValido, -100, 500)).toThrow('Saldo inicial não pode ser negativo');
  });
  
  test('não deve criar conta com limite negativo', () => {
    mockDB.encontrarContaPorCPF.mockReturnValue(null);
    expect(() => contaService.criarConta('Teste', cpfValido, 1000, -500)).toThrow('Limite não pode ser negativo');
  });
  
  test('deve buscar uma conta pelo ID', () => {
    const contaMock = new Conta('Teste', cpfValido, 1000, 500);
    mockDB.encontrarConta.mockReturnValue(contaMock);
    
    const conta = contaService.buscarConta('abc123-teste-uuid');
    
    expect(mockDB.encontrarConta).toHaveBeenCalledWith('abc123-teste-uuid');
    expect(conta).toEqual(contaMock);
  });
  
  test('deve lançar erro ao buscar conta inexistente pelo ID', () => {
    mockDB.encontrarConta.mockReturnValue(null);
    
    expect(() => contaService.buscarConta('id-nao-existente')).toThrow('Conta não encontrada');
  });
  
  test('deve buscar uma conta pelo CPF', () => {
    const contaMock = new Conta('Teste', cpfValido, 1000, 500);
    mockDB.encontrarContaPorCPF.mockReturnValue(contaMock);
    
    const conta = contaService.buscarContaPorCPF(cpfValido);
    
    expect(mockDB.encontrarContaPorCPF).toHaveBeenCalledWith(cpfValido);
    expect(conta).toEqual(contaMock);
  });
  
  test('deve lançar erro ao buscar conta inexistente pelo CPF', () => {
    mockDB.encontrarContaPorCPF.mockReturnValue(null);
    
    expect(() => contaService.buscarContaPorCPF('123.456.789-10')).toThrow('Conta não encontrada');
  });
  
  test('deve listar todas as contas', () => {
    const contasMock = [
      new Conta('Teste 1', '529.982.247-25', 1000, 500),
      new Conta('Teste 2', '048.454.787-06', 2000, 1000)
    ];
    mockDB.listarContas.mockReturnValue(contasMock);
    
    const contas = contaService.listarContas();
    
    expect(mockDB.listarContas).toHaveBeenCalled();
    expect(contas).toEqual(contasMock);
  });
  
  test('deve realizar depósito em uma conta', () => {
    const contaMock = new Conta('Teste', cpfValido, 1000, 500);
    const depositarSpy = jest.spyOn(contaMock, 'depositar');
    
    mockDB.encontrarConta.mockReturnValue(contaMock);
    
    const conta = contaService.depositar('abc123-teste-uuid', 500);
    
    expect(mockDB.encontrarConta).toHaveBeenCalledWith('abc123-teste-uuid');
    expect(depositarSpy).toHaveBeenCalledWith(500);
    expect(mockDB.atualizarConta).toHaveBeenCalledWith(contaMock);
    expect(conta).toEqual(contaMock);
  });
  
  test('deve realizar saque em uma conta', () => {
    const contaMock = new Conta('Teste', cpfValido, 1000, 500);
    const sacarSpy = jest.spyOn(contaMock, 'sacar');
    
    mockDB.encontrarConta.mockReturnValue(contaMock);
    
    const conta = contaService.sacar('abc123-teste-uuid', 500);
    
    expect(mockDB.encontrarConta).toHaveBeenCalledWith('abc123-teste-uuid');
    expect(sacarSpy).toHaveBeenCalledWith(500);
    expect(mockDB.atualizarConta).toHaveBeenCalledWith(contaMock);
    expect(conta).toEqual(contaMock);
  });
  
  test('deve realizar transferência entre contas', () => {
    const contaOrigem = new Conta('Origem', '529.982.247-25', 1000, 500);
    const contaDestino = new Conta('Destino', '048.454.787-06', 500, 500);
    const transferirSpy = jest.spyOn(contaOrigem, 'transferir');
    
    mockDB.encontrarConta.mockImplementation((id) => {
      if (id === 'id-origem') return contaOrigem;
      if (id === 'id-destino') return contaDestino;
      return null;
    });
    
    const resultado = contaService.transferir('id-origem', 'id-destino', 300);
    
    expect(mockDB.encontrarConta).toHaveBeenCalledWith('id-origem');
    expect(mockDB.encontrarConta).toHaveBeenCalledWith('id-destino');
    expect(transferirSpy).toHaveBeenCalledWith(300, contaDestino);
    expect(mockDB.atualizarConta).toHaveBeenCalledWith(contaOrigem);
    expect(mockDB.atualizarConta).toHaveBeenCalledWith(contaDestino);
    expect(resultado).toEqual({ contaOrigem, contaDestino });
  });
});

// Na versão 3, adicionar testes de integração e da API com supertest