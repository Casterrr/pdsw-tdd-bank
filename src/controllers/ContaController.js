/**
 * Controlador para gerenciar as requisições relacionadas às contas bancárias
 */

import contaService from '../services/ContaService.js';

class ContaController {
  /**
   * Cria uma nova conta
   */
  criarConta(req, res) {
    try {
      const { titular, cpf, saldoInicial, limite } = req.body;
      
      if (!cpf) {
        return res.status(400).json({ error: 'CPF é obrigatório' });
      }
      
      const novaConta = contaService.criarConta(titular, cpf, saldoInicial, limite);
      return res.status(201).json(novaConta);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Busca uma conta pelo ID
   */
  buscarConta(req, res) {
    try {
      const { id } = req.params;
      const conta = contaService.buscarConta(id);
      return res.status(200).json(conta);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  /**
   * Busca uma conta pelo CPF
   */
  buscarContaPorCPF(req, res) {
    try {
      const { cpf } = req.params;
      const conta = contaService.buscarContaPorCPF(cpf);
      return res.status(200).json(conta);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  /**
   * Lista todas as contas
   */
  listarContas(req, res) {
    try {
      const contas = contaService.listarContas();
      return res.status(200).json(contas);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Realiza depósito em uma conta
   */
  depositar(req, res) {
    try {
      const { id } = req.params;
      const { valor } = req.body;
      
      if (!valor) {
        return res.status(400).json({ error: 'Valor do depósito é obrigatório' });
      }
      
      const conta = contaService.depositar(id, valor);
      return res.status(200).json(conta);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Realiza saque em uma conta
   */
  sacar(req, res) {
    try {
      const { id } = req.params;
      const { valor } = req.body;
      
      if (!valor) {
        return res.status(400).json({ error: 'Valor do saque é obrigatório' });
      }
      
      const conta = contaService.sacar(id, valor);
      return res.status(200).json(conta);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Realiza transferência entre contas
   */
  transferir(req, res) {
    try {
      const { idOrigem } = req.params;
      const { idDestino, valor } = req.body;
      
      if (!idDestino) {
        return res.status(400).json({ error: 'ID da conta de destino é obrigatório' });
      }
      
      if (!valor) {
        return res.status(400).json({ error: 'Valor da transferência é obrigatório' });
      }
      
      const resultado = contaService.transferir(idOrigem, idDestino, valor);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Inativa uma conta
   */
  inativarConta(req, res) {
    try {
      const { id } = req.params;
      const conta = contaService.inativarConta(id);
      return res.status(200).json(conta);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Reativa uma conta
   */
  reativarConta(req, res) {
    try {
      const { id } = req.params;
      const conta = contaService.reativarConta(id);
      return res.status(200).json(conta);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default new ContaController(); 