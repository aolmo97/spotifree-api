FROM node:18-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    python3-full \
    python3-pip \
    python3-venv \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Crear y activar entorno virtual
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Instalar spotdl en el entorno virtual (sin descargar ffmpeg ya que ya está instalado)
RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir spotdl

# Verificar instalación
RUN spotdl --version

WORKDIR /app

# Crear directorio de audios con permisos correctos
RUN mkdir -p /app/audios && chmod 777 /app/audios

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
