FROM node:20-alpine
WORKDIR /usr/src/app

# Instalação de dependências
COPY package*.json ./
RUN npm install

# Cópia do código-fonte e bundle de produção
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

# Execução obrigatória de testes de integridade antes do CMD final
RUN node tests/run_all.js

EXPOSE 3000

CMD ["node", "server.js"]
