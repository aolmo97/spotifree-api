FROM node:18-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Instalar spotdl
RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir spotdl && \
    spotdl --download-ffmpeg

WORKDIR /app

# Crear directorio de audios
RUN mkdir -p /app/audios

# Copiar archivos del proyecto
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

# Instalar dependencias
RUN npm ci

# Construir la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]
