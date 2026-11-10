# Controle de Automóveis - Teste Técnico

API RESTful desenvolvida em Node.js (Express) para gerenciamento de veículos, motoristas e controle de utilização, conforme solicitado no teste técnico.

## 🚀 Tecnologias Utilizadas
- Node.js
- Express
- Jest + Supertest (Testes Automatizados)
- Persistência em memória (conforme permitido no enunciado)

## ⚙️ Pré-requisitos
Antes de rodar o projeto, você vai precisar ter instalado na sua máquina:
- [Node.js](https://nodejs.org/) (Recomendado versão LTS 20+)
- [Git](https://git-scm.com)
- [Postman](https://www.postman.com/downloads/) (Opcional, para testar as rotas)

---

## 🛠️ Como Executar o Projeto (Passo a Passo)

**1. Clone o repositório:**
Abra o seu terminal e rode o comando:
git clone https://github.com/steniobarroso/controle-automoveis.git

**2. Acesse a pasta do projeto:**
cd controle-automoveis

**3. Instale as dependências:**
Este comando vai baixar o Express, Jest e todas as bibliotecas necessárias.
npm install

**4. Inicie o servidor:**
npm start

Se tudo der certo, o terminal exibirá a mensagem: "🚀 Servidor rodando na porta 3000".
A API estará disponível para receber requisições em http://localhost:3000.

---

## 🧪 Como rodar os Testes Automatizados

Para garantir que todas as regras de negócio estão funcionando, o projeto conta com uma suíte de testes.

**1. No terminal, pare o servidor (se estiver rodando) apertando Ctrl + C.**

**2. Rode o comando:**
npm test

O terminal exibirá o relatório com todos os testes passando (verdes).

---

## 📬 Como testar as rotas (Postman)

Para facilitar a avaliação, exportei todas as rotas prontas no arquivo `controle-automoveis.postman_collection.json` que está na raiz deste repositório.

1. Baixe o arquivo JSON.
2. Abra o Postman (ou Insomnia).
3. Clique em **Import** e selecione o arquivo baixado.
4. A collection aparecerá na barra lateral com todas as requisições organizadas.
5. **Importante:** Certifique-se de que o servidor (npm start) está rodando antes de fazer as requisições.

---

## 📌 Decisões de Arquitetura e Regras de Negócio

- **Separação de Responsabilidades:** O código foi dividido em Controllers (HTTP), Services (Regras de Negócio) e Database (Memória).
- **Soft Delete:** A exclusão de veículos foi implementada como Soft Delete (desativação via `isEnable = false`), preservando o histórico no banco de dados.
- **Regras de Negócio Validadas e Testadas:**
  - Um veículo não pode ser usado por mais de um motorista ao mesmo tempo.
  - Um motorista não pode usar mais de um veículo ao mesmo tempo.
  - Não é possível desativar (deletar) um veículo que está em uso.
  - Não é possível deletar um motorista que está em uso.
  - Veículos desativados não aparecem na listagem padrão e não podem ser utilizados.