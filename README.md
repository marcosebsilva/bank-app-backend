# Bank App

API RESTful que te permite realizar operações básicas relacionadas a contas bancárias.

## Regras de negócio

+ Para abrir uma conta é necessário apenas o nome completo e CPF da pessoa, mas só é permitido uma conta por pessoa;
+ Com essa conta é possível realizar transferências para outras contas e depositar;
+ Só é possível executar transações caso esteja autenticado;
+ Não é aceito negativos nas contas ou transações;
+ Cada transação de depósito não pode ser maior do que R$2.000;
+ As transferências entre contas são gratuitas e ilimitadas;

## Setup
1. Clone esse repósitório usando: `git clone git@github.com:marcosebsilva/bank-app-backend.git`
2. Na pasta clonada, instale as dependencias do projeto: `npm install`
3. No arquivo `.env`, coloque sua chave secreta em `JWT_SECRET_KEY`
4. Execute `npm run dev` para rodar o projeto usando o nodemon

#### Endpoints disponiveis
   */register*  
   */login*  
   */transfer*    
   */deposit*  


### Database
+ É possível substituir a variável MONGO_DB_URL pela url da sua instancia de preferência
+ Caso possua o Docker Compose instalado, digite `docker-compose up -d` no diretório do projeto para instanciar um servidor do mongo
### Testes
+ `npm test` - executa todos os testes
+ `NAME=services npm test` executa os testes da camada de serviço
