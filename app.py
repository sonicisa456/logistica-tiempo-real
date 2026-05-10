# app.py

import logging
from flask import Flask
from flask_cors import CORS
from routes.pedidos import routes

app = Flask(__name__)

# ACTIVAR CORS
CORS(app)

logging.basicConfig(
    filename="logs/app.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

app.register_blueprint(routes)

@app.route("/")
def home():
    return "Servidor funcionando"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)