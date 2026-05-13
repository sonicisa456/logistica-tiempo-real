<<<<<<< HEAD
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

EXPOSE 5000

CMD ["node", "src/server.js"]
=======
# Usa Python 3.10
FROM python:3.10-slim

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copia todos los archivos
COPY . .

# Instala dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Expone puerto 5000
EXPOSE 5000

# Comando para correr Flask
CMD ["python", "app.py"]
>>>>>>> 17dd0cd1002a8a6892f34d4b76e874ebac00acd1
