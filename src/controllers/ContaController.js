/**
 * Controlador para gerenciar as requisições relacionadas às contas bancárias
 */

import contaService from '../services/ContaService.js';

class ContaController {
  /**
   * Trata erros de forma padronizada
   * @private
   * @param {Response} res - Objeto de resposta do Express
   * @param {Error} error - Erro a ser tratado
   * @param {number} defaultStatus - Status HTTP padrão (default: 400)
   * @returns {Response} Resposta HTTP com o erro
   */
  _handleError(res, error, defaultStatus = 400) {
    console.error(`[Erro] ${error.message}`);
    
    // Erros de não encontrado
    if (error.message.includes('não encontrada') || 
        error.message.includes('não encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    
    // Erros de validação ou regras de negócio
    return res.status(defaultStatus).json({ error: error.message });
  }

  /**
   * Cria uma nova conta
   * @param {Request} req - Requisição
   * @param {Response} res - Resposta
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
      return this._handleError(res, error);
    }
  }

  /**
   * Busca uma conta pelo ID
   * @param {Request} req - Requisição
   * @param {Response} res - Resposta
   */
  buscarConta(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }
      
      const conta = contaService.buscarConta(id);
      return res.status(200).json(conta);
    } catch (error) {
      return this._handleError(res, error);
    }
  }

  /**
   * Busca uma conta pelo CPF
   * @param {Request} req - Requisição
   * @param {Response} res - Resposta
   */
  buscarContaPorCPF(req, res) {
    try {
      const { cpf } = req.params;
      
      if (!cpf) {
        return res.status(400).json({ error: 'CPF é obrigatório' });
      }
      
      const conta = contaService.buscarContaPorCPF(cpf);
      return res.status(200).json(conta);
    } catch (error) {
      return this._handleError(res, error);
    }
  }

  /**
   * Lista todas as contas
   * @param {Request} req - Requisição
   * @param {Response} res - Resposta
   */
  listarContas(req, res) {
    try {
      const contas = contaService.listarContas();
      return res.status(200).json(contas);
    } catch (error) {
      return this._handleError(res, error, 500);
    }
  }

  /**
   * Realiza depósito em uma conta
   * @param {Request} req - Requisição
   * @param {Response} res - Resposta
   */
  depositar(req, res) {
    try {
      const { id } = req.params;
      const { valor } = req.body;
      
      if (!valor) {
        return res.status(400).json({ error: 'Valor do depósito é obrigatório' });
      }
      
      const valorNumerico = Number(valor);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        return res.status(400).json({ error: 'Valor do depósito deve ser um número positivo' });
      }
      
      const conta = contaService.depositar(id, valor);
      return res.status(200).json(conta);
    } catch (error) {
      return this._handleError(res, error);
    }
  }

  /**
   * Realiza saque em uma conta
   * @param {Request} req - Requisição
   * @param {Response} res - Resposta
   */
  sacar(req, res) {
    try {
      const { id } = req.params;
      const { valor } = req.body;
      
      if (!valor) {
        return res.status(400).json({ error: 'Valor do saque é obrigatório' });
      }
      
      const valorNumerico = Number(valor);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        return res.status(400).json({ error: 'Valor do saque deve ser um número positivo' });
      }
      
      const conta = contaService.sacar(id, valor);
      return res.status(200).json(conta);
    } catch (error) {
      return this._handleError(res, error);
    }
  }

  /**
   * Realiza transferência entre contas
   * @param {Request} req - Requisição
   * @param {Response} res - Resposta
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
      
      const valorNumerico = Number(valor);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        return res.status(400).json({ error: 'Valor da transferência deve ser um número positivo' });
      }
      
      if (idOrigem === idDestino) {
        return res.status(400).json({ error: 'Não é possível transferir para a mesma conta' });
      }
      
      const resultado = contaService.transferir(idOrigem, idDestino, valor);
      return res.status(200).json(resultado);
    } catch (error) {
      return this._handleError(res, error);
    }
  }

  /**
   * Inativa uma conta
   * @param {Request} req - Requisição
   * @param {Response} res - Resposta
   */
  inativarConta(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'ID da conta é obrigatório' });
      }
      
      const conta = contaService.inativarConta(id);
      return res.status(200).json(conta);
    } catch (error) {
      return this._handleError(res, error);
    }
  }

  /**
   * Reativa uma conta
   * @param {Request} req - Requisição
   * @param {Response} res - Resposta
   */
  reativarConta(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'ID da conta é obrigatório' });
      }
      
      const conta = contaService.reativarConta(id);
      return res.status(200).json(conta);
    } catch (error) {
      return this._handleError(res, error);
    }
  }
}

export default new ContaController(); 