# Sistema Bancário - Regras de Negócio e Processo TDD

## 📜 Regras de Negócio

### 🏦 Conta Bancária

#### Criação de Conta
- Toda conta precisa de um titular (campo obrigatório e não pode ser vazio).
- Toda conta precisa de um CPF válido (campo obrigatório e deve passar na validação).
- Não é permitido criar mais de uma conta com o mesmo CPF.
- O saldo inicial pode ser zero ou positivo, nunca negativo.
- O limite de crédito deve ser sempre um valor positivo.
- Cada conta recebe um ID único gerado via UUID.
- Ao ser criada, a conta é automaticamente ativada e recebe um registro da data de criação.

#### Depósitos
- Somente valores positivos podem ser depositados.
- Não é possível depositar em contas inativas.
- O depósito aumenta o saldo da conta.

#### Saques
- Somente valores positivos podem ser sacados.
- Não é possível sacar de contas inativas.
- O cliente pode sacar até o valor do saldo + limite de crédito.
- Se o saque exceder o saldo disponível, o saldo fica negativo (dentro do limite).
- Não é permitido sacar um valor que exceda o saldo + limite.

#### Transferências
- Uma transferência só pode ocorrer entre contas válidas.
- A conta de origem deve ter saldo + limite suficiente para realizar a transferência.
- O valor é debitado da conta de origem e creditado na conta de destino.
- As mesmas regras de saque e depósito se aplicam nas transferências.

#### Gerenciamento de Contas
- Uma conta pode ser inativada, impedindo operações de saque e depósito.
- Uma conta inativada pode ser reativada posteriormente.
- É possível consultar contas por ID ou CPF.
- Uma conta não localizada resulta em erro apropriado.

#### Validação de CPF
- O CPF deve conter 11 dígitos numéricos.
- CPFs com todos os dígitos iguais são inválidos.
- O CPF deve passar na validação de dígitos verificadores.

### 🔐 Segurança
- Todas as operações financeiras (depósito, saque, transferência) são registradas e persistidas.
- Modificações no estado da conta (ativação/inativação) são persistidas.
- Operações inválidas lançam erros específicos para facilitar o tratamento pelo cliente.

### 🌐 API
- A API fornece endpoints para todas as operações bancárias básicas.
- Os códigos de retorno HTTP são apropriados para cada tipo de operação:
  - `201` para criação,
  - `200` para consultas bem-sucedidas, etc.
- Erros são retornados com mensagens descritivas e códigos HTTP adequados.

---

## 🧪 Fases do TDD no Projeto

### 🔴 Fase Vermelha (Red)
> Nenhuma funcionalidade implementada; todos os testes falham.

**Classe Conta (`src/models/Conta.js`):**
- Construtor não inicializa propriedades.
- Métodos de validação retornam `false`.
- Operações financeiras retornam `0` ou `false`.

**Serviço de Conta (`src/services/ContaService.js`):**
- Métodos retornam `null` ou arrays vazias.
- Sem tratamento de erros.

**Mock do Banco de Dados (`src/data/mockDB.js`):**
- Métodos de busca retornam `null`.
- Operações de atualização/remoção retornam `false`.

---

### 🟢 Fase Verde (Green)
> Implementações mínimas para que todos os testes passem.

**Classe Conta (`src/models/Conta.js`):**
- Construtor inicializa propriedades: `id`, `titular`, `cpf`, `saldo`, `limite`, `ativa`, `dataCriacao`.
- `validarCPF`: valida CPFs específicos para testes.
- `formatarCPF`: formata no padrão `XXX.XXX.XXX-XX`.

**Operações financeiras:**
- `depositar`: valor positivo e conta ativa.
- `sacar`: valor positivo, conta ativa e saldo+limite suficiente.
- `transferir`: impede transferências para a mesma conta e valida conta de destino.

**Status:**
- `inativar`: muda status para inativo.
- `reativar`: muda status para ativo.

**Serviço de Conta (`src/services/ContaService.js`):**
- Métodos com validação e tratamento de erros:
  - `criarConta`, `buscarConta`, `buscarContaPorCPF`, `listarContas`, `depositar`, `sacar`, `transferir`, `inativarConta`, `reativarConta`.

**Mock DB (`src/data/mockDB.js`):**
- Armazenamento em array.
- Métodos: `criarConta`, `encontrarConta`, `encontrarContaPorCPF`, `listarContas`, `atualizarConta`, `removerConta`.

---

### 🛠️ Fase de Refatoração (Refactor)
> Código aprimorado e mais robusto, mantendo os testes passando.

**Classe Conta (`src/models/Conta.js`):**
- Validação real de CPF com algoritmo oficial.
- `formatarCPF` adaptado para múltiplos formatos de entrada.
- Validação robusta de valores numéricos.
- Prevenção de transferências para a mesma conta.
- Arredondamento e precisão para evitar erros de ponto flutuante.
- Validação rigorosa no construtor.

**Serviço de Conta (`src/services/ContaService.js`):**
- Validação e conversão adequada de parâmetros.
- Prevenção de operações inválidas.
- Documentação JSDoc aprimorada.

**Mock DB (`src/data/mockDB.js`):**
- Tratamento de erros e validação de parâmetros.
- Documentação JSDoc.
- Verificações adicionais contra inconsistências.

**Controlador (`src/controllers/ContaController.js`):**
- Método `handleError` padroniza tratamento de erros.
- Validações aprimoradas.
- Tratamento específico para diferentes erros.
- Documentação clara.

**Rotas (`src/routes/contaRoutes.js`):**
- Organização por categoria.
- Comentários sobre melhores práticas RESTful (ex: uso de `PATCH`).
- Compatibilidade com os testes existentes mantida.

---

