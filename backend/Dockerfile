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