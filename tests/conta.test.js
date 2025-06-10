/**
 * Testes para as funcionalidades de contas bancárias
 */

import Conta from '../src/models/Conta.js';
import contaService from '../src/services/ContaService.js';
import mockDB from '../src/data/mockDB.js';

// Mock do crypto.randomUUID para gerar IDs diferentes
jest.mock('crypto', () => {
  let counter = 0;
  return {
    randomUUID: () => `teste-uuid-${counter++}`
  };
});

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


/*
Testar o modelo. O modelo encapsula lógica de negócio. Nesse caso:

- Validação e formatação de CPF.

- Controle de saldo e limite.

- Regras de depósito, saque e transferência.

- Estados da conta (ativa/inativa).

Esses comportamentos são unidades isoladas, com entradas bem definidas e resultados previsíveis — o cenário ideal para testes unitários com TDD.
*/

describe('Modelo de Conta', () => {
  let conta;
  let cpfValido = '529.982.247-25'; // CPF válido para testes
  
  beforeEach(() => {
    // Criar uma nova conta para cada teste
    conta = new Conta('Teste', cpfValido, 1000, 500);
  });
  
  test('deve criar uma conta corretamente', () => {
    const novaConta = new Conta('Teste', cpfValido, 1000, 500);
    
    expect(novaConta.id).toBeTruthy(); // Verifica se um ID foi gerado
    expect(typeof novaConta.id).toBe('string'); // Verifica se o ID é uma string
    expect(novaConta.titular).toBe('Teste');
    expect(novaConta.cpf).toBe(cpfValido);
    expect(novaConta.saldo).toBe(1000);
    expect(novaConta.limite).toBe(500);
    expect(novaConta.ativa).toBe(true);
    expect(novaConta.dataCriacao).toBeInstanceOf(Date);
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
  
  test('não deve permitir depósito de valor não numérico', () => {
    expect(() => conta.depositar('abc')).toThrow('O valor do depósito deve ser um número');
    expect(() => conta.depositar(null)).toThrow('O valor do depósito deve ser um número');
    expect(() => conta.depositar(undefined)).toThrow('O valor do depósito deve ser um número');
    expect(() => conta.depositar({})).toThrow('O valor do depósito deve ser um número');
    expect(() => conta.depositar([])).toThrow('O valor do depósito deve ser um número');
  });
  
  test('não deve permitir depósito em conta inativa', () => {
    conta.inativar();
    expect(() => conta.depositar(100)).toThrow('Não é possível depositar em uma conta inativa');
  });
  
  test('deve retornar valor com 2 casas decimais ao depositar', () => {
    // Criar uma conta com saldo inicial de valor exato
    const contaDecimal = new Conta('Teste Decimal', cpfValido, 100, 500);
    
    // Depositar um valor com mais de 2 casas decimais
    const novoSaldo = contaDecimal.depositar(10.005);
    
    // Verificar se o saldo tem exatamente 2 casas decimais
    expect(novoSaldo).toBe(110.01); // 100 + 10.005 = 110.005, arredondado para 110.01
    expect(novoSaldo.toString()).toMatch(/^\d+\.\d{2}$/);
    
    // Verificar se não há problema com valores que resultariam em mais de 2 casas
    const outroSaldo = contaDecimal.depositar(0.009);
    expect(outroSaldo).toBe(110.02); // 110.01 + 0.009 = 110.019, arredondado para 110.02
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
  
  test('não deve permitir saque de valor não numérico', () => {
    expect(() => conta.sacar('abc')).toThrow('O valor do saque deve ser um número');
    expect(() => conta.sacar(null)).toThrow('O valor do saque deve ser um número');
    expect(() => conta.sacar(undefined)).toThrow('O valor do saque deve ser um número');
    expect(() => conta.sacar({})).toThrow('O valor do saque deve ser um número');
    expect(() => conta.sacar([])).toThrow('O valor do saque deve ser um número');
  });
  
  test('não deve permitir saque em conta inativa', () => {
    conta.inativar();
    expect(() => conta.sacar(100)).toThrow('Não é possível sacar de uma conta inativa');
  });
  
  test('deve retornar valor com 2 casas decimais ao sacar', () => {
    // Criar uma conta com saldo inicial de valor exato
    const contaDecimal = new Conta('Teste Decimal', cpfValido, 100, 500);
    
    // Sacar um valor com mais de 2 casas decimais
    const novoSaldo = contaDecimal.sacar(10.005);
    
    // Verificar se o saldo tem exatamente 2 casas decimais
    expect(novoSaldo).toBe(90.00); // 100 - 10.005 = 89.995, arredondado para 90.00
    
    // Testar com outro valor para verificar o arredondamento
    contaDecimal.depositar(10); // Saldo agora é 100.00
    const outroSaldo = contaDecimal.sacar(0.009);
    expect(outroSaldo).toBe(99.99); // 100 - 0.009 = 99.991, arredondado para 99.99
    
    // Verificar formato decimal
    const saldoString = outroSaldo.toString();
    expect(saldoString).toMatch(/^\d+\.\d{2}$/);
  });
  
  test('deve transferir um valor para outra conta', () => {
    const contaOrigem = conta; // Usa a conta criada no beforeEach
    const contaDestino = new Conta('Destino', '975.711.270-41', 500, 500);
    const saldoOrigem = contaOrigem.saldo;
    const saldoDestino = contaDestino.saldo;
    const valor = 300;
    
    // IDs são gerados aleatoriamente, então serão diferentes
    contaOrigem.transferir(valor, contaDestino);
    
    expect(contaOrigem.saldo).toBe(saldoOrigem - valor);
    expect(contaDestino.saldo).toBe(saldoDestino + valor);
  });
  
  test('não deve transferir para uma conta inválida', () => {
    expect(() => conta.transferir(100, null)).toThrow('Conta de destino inválida');
    expect(() => conta.transferir(100, {})).toThrow('Conta de destino inválida');
  });
  
  test('não deve transferir para a mesma conta', () => {
    // Transferir para a mesma instância deve falhar
    expect(() => conta.transferir(100, conta)).toThrow('Não é possível transferir para a mesma conta');
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
  
  test('não deve inativar uma conta já inativa', () => {
    conta.inativar();
    expect(conta.ativa).toBe(false);
    
    expect(() => conta.inativar()).toThrow('A conta já está inativa');
  });
  
  test('não deve reativar uma conta já ativa', () => {
    expect(conta.ativa).toBe(true);
    
    expect(() => conta.reativar()).toThrow('A conta já está ativa');
  });
  
  test('não deve permitir transferência além do saldo + limite', () => {
    const contaOrigem = new Conta('Origem', '157.277.570-02', 100, 500);
    const contaDestino = new Conta('Destino', '975.711.270-41', 500, 500);
    
    // Tenta transferir 601, que é maior que saldo (100) + limite (500)
    expect(() => contaOrigem.transferir(601, contaDestino))
      .toThrow('Saldo insuficiente');
      
    // Verifica que os saldos não foram alterados
    expect(contaOrigem.saldo).toBe(100);
    expect(contaDestino.saldo).toBe(500);
  });
});


/*
Testar o serviço também, pois o serviço coordena o uso do modelo com a camada de persistência (mockDB). Ele:

- Contém validações de alto nível (ex: titular obrigatório).

- Garante regras como "CPF único".

- Organiza fluxo de dados (buscar, atualizar, salvar).

- Lida com erros e retorna mensagens coerentes.

Aqui entramos no nível de teste de integração de componentes internos: você verifica como o serviço interage com o modelo e com a persistência (mesmo que mockada).
*/

// Simula o que a aplicação realmente faria sob condições reais. Com mocks
describe('Serviço de Conta', () => {
  const cpfValido1 = '157.277.570-02';
  const cpfValido2 = '361.048.660-00';
  
  beforeEach(() => {
    // Limpar os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Configurar mockDB.encontrarConta para buscar por ID
    mockDB.encontrarConta.mockImplementation((id) => {
      // Na maioria dos testes, apenas retorna o que foi configurado no teste específico
      return null;
    });
  });
  
  test('deve criar uma conta com parâmetros válidos', () => {
    const contaMock = new Conta('Teste', cpfValido1, 1000, 500);
    mockDB.criarConta.mockReturnValue(contaMock);
    mockDB.encontrarContaPorCPF.mockReturnValue(null); // Simula CPF não existente
    
    const conta = contaService.criarConta('Teste', cpfValido1, 1000, 500);
    
    expect(mockDB.encontrarContaPorCPF).toHaveBeenCalledWith(cpfValido1);
    expect(mockDB.criarConta).toHaveBeenCalledWith('Teste', cpfValido1, 1000, 500);
    expect(conta).toEqual(contaMock);
  });
  
  test('não deve criar conta sem titular', () => {
    expect(() => contaService.criarConta('', cpfValido1, 1000, 500)).toThrow('O titular da conta é obrigatório');
    expect(() => contaService.criarConta(null, cpfValido1, 1000, 500)).toThrow('O titular da conta é obrigatório');
  });
  
  test('não deve criar conta sem CPF', () => {
    expect(() => contaService.criarConta('Teste', '', 1000, 500)).toThrow('O CPF é obrigatório');
    expect(() => contaService.criarConta('Teste', null, 1000, 500)).toThrow('O CPF é obrigatório');
  });
  
  test('não deve criar conta com CPF já existente', () => {
    const contaExistente = new Conta('Teste Existente', cpfValido1, 1000, 500);
    mockDB.encontrarContaPorCPF.mockReturnValue(contaExistente);
    
    expect(() => contaService.criarConta('Teste', cpfValido1, 1000, 500)).toThrow('Já existe uma conta com este CPF');
  });
  
  test('não deve criar conta com saldo inicial negativo', () => {
    mockDB.encontrarContaPorCPF.mockReturnValue(null);
    expect(() => contaService.criarConta('Teste', cpfValido1, -100, 500)).toThrow('Saldo inicial não pode ser negativo');
  });
  
  test('não deve criar conta com limite negativo', () => {
    mockDB.encontrarContaPorCPF.mockReturnValue(null);
    expect(() => contaService.criarConta('Teste', cpfValido1, 1000, -500)).toThrow('Limite não pode ser negativo');
  });
  
  test('deve buscar uma conta pelo ID', () => {
    const contaMock = new Conta('Teste', cpfValido1, 1000, 500);
    const contaId = contaMock.id; // Armazena o ID gerado
    
    mockDB.encontrarConta.mockReturnValue(contaMock);
    
    const conta = contaService.buscarConta(contaId);
    
    expect(mockDB.encontrarConta).toHaveBeenCalledWith(contaId);
    expect(conta).toEqual(contaMock);
  });
  
  test('deve lançar erro ao buscar conta inexistente pelo ID', () => {
    mockDB.encontrarConta.mockReturnValue(null);
    
    expect(() => contaService.buscarConta('id-nao-existente')).toThrow('Conta não encontrada');
  });
  
  test('deve buscar uma conta pelo CPF', () => {
    const contaMock = new Conta('Teste', cpfValido1, 1000, 500);
    mockDB.encontrarContaPorCPF.mockReturnValue(contaMock);
    
    const conta = contaService.buscarContaPorCPF(cpfValido1);
    
    expect(mockDB.encontrarContaPorCPF).toHaveBeenCalledWith(cpfValido1);
    expect(conta).toEqual(contaMock);
  });
  
  test('deve lançar erro ao buscar conta inexistente pelo CPF', () => {
    mockDB.encontrarContaPorCPF.mockReturnValue(null);
    
    expect(() => contaService.buscarContaPorCPF('123.456.789-10')).toThrow('Conta não encontrada');
  });
  
  test('deve listar todas as contas', () => {
    const contasMock = [
      new Conta('Teste 1', cpfValido1, 1000, 500),
      new Conta('Teste 2', cpfValido2, 2000, 1000)
    ];
    mockDB.listarContas.mockReturnValue(contasMock);
    
    const contas = contaService.listarContas();
    
    expect(mockDB.listarContas).toHaveBeenCalled();
    expect(contas).toEqual(contasMock);
  });
  
  test('deve realizar depósito em uma conta', () => {
    const contaMock = new Conta('Teste', cpfValido1, 1000, 500);
    const contaId = contaMock.id; // Armazena o ID gerado
    const depositarSpy = jest.spyOn(contaMock, 'depositar');
    
    mockDB.encontrarConta.mockReturnValue(contaMock);
    
    const conta = contaService.depositar(contaId, 500);
    
    expect(mockDB.encontrarConta).toHaveBeenCalledWith(contaId);
    expect(depositarSpy).toHaveBeenCalledWith(500);
    expect(mockDB.atualizarConta).toHaveBeenCalledWith(contaMock);
    expect(conta).toEqual(contaMock);
  });
  
  test('deve realizar saque em uma conta', () => {
    const contaMock = new Conta('Teste', cpfValido1, 1000, 500);
    const contaId = contaMock.id; // Armazena o ID gerado
    const sacarSpy = jest.spyOn(contaMock, 'sacar');
    
    mockDB.encontrarConta.mockReturnValue(contaMock);
    
    const conta = contaService.sacar(contaId, 500);
    
    expect(mockDB.encontrarConta).toHaveBeenCalledWith(contaId);
    expect(sacarSpy).toHaveBeenCalledWith(500);
    expect(mockDB.atualizarConta).toHaveBeenCalledWith(contaMock);
    expect(conta).toEqual(contaMock);
  });
  
  test('deve realizar transferência entre contas', () => {
    const contaOrigem = new Conta('Origem', cpfValido1, 1000, 500);
    const contaDestino = new Conta('Destino', cpfValido2, 500, 500);
    const idOrigem = contaOrigem.id;
    const idDestino = contaDestino.id;
    
    const transferirSpy = jest.spyOn(contaOrigem, 'transferir');
    
    mockDB.encontrarConta.mockImplementation((id) => {
      if (id === idOrigem) return contaOrigem;
      if (id === idDestino) return contaDestino;
      return null;
    });
    
    const resultado = contaService.transferir(idOrigem, idDestino, 300);
    
    expect(mockDB.encontrarConta).toHaveBeenCalledWith(idOrigem);
    expect(mockDB.encontrarConta).toHaveBeenCalledWith(idDestino);
    expect(transferirSpy).toHaveBeenCalledWith(300, contaDestino);
    expect(mockDB.atualizarConta).toHaveBeenCalledWith(contaOrigem);
    expect(mockDB.atualizarConta).toHaveBeenCalledWith(contaDestino);
    expect(resultado).toEqual({ contaOrigem, contaDestino });
  });
  
  test('não deve permitir transferência para a mesma conta no serviço', () => {
    // Criar uma conta com ID gerado automaticamente
    const contaOrigem = new Conta('Origem', cpfValido1, 1000, 500);
    const idOrigem = contaOrigem.id;
    
    // Configurar o mock para retornar a mesma conta independente do ID
    mockDB.encontrarConta.mockReturnValue(contaOrigem);
    
    // Tentativa de transferir para a mesma conta deve falhar
    expect(() => contaService.transferir(idOrigem, idOrigem, 300))
      .toThrow('Não é possível transferir para a mesma conta');
  });
});