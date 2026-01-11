# Usa a imagem oficial do Remotion que já vem com Chrome e FFmpeg
FROM remotiondev/renderer:7.0-18.16.0

# Instala bibliotecas necessárias para o Chrome rodar no Linux
USER root
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia os arquivos de dependências primeiro (otimiza o cache)
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o resto do código do seu projeto
COPY . .

# Abre a porta 3000 que é a padrão do Remotion
EXPOSE 3000

# Comando para rodar o estúdio acessível de fora
CMD ["npx", "remotion", "studio", "--host", "0.0.0.0"]