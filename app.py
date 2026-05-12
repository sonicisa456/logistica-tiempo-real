# app.py

import logging
from flask import Flask
from flask_cors import CORS

from routes.pedidos import routes
from routes.productos import productos_routes
from routes.usuarios import usuarios_routes

app = Flask(__name__)

# ACTIVAR CORS
CORS(app)

logging.basicConfig(
    filename="logs/app.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

app.register_blueprint(routes, url_prefix="/api")
app.register_blueprint(productos_routes, url_prefix="/api")
app.register_blueprint(usuarios_routes, url_prefix="/api")

@app.route("/")
def home():
    return {"mensaje": "Marketplace Flask funcionando"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)