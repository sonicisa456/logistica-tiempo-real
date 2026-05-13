# app.py

import logging
from flask import Flask, render_template
from flask_cors import CORS

from routes.api import api as api_routes
from routes.pedidos import routes
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
app.register_blueprint(api_routes)
app.register_blueprint(usuarios_routes, url_prefix="/api")

@app.route("/")
def home():
    return {"mensaje": "Marketplace Flask funcionando"}

@app.route('/admin')
def admin_page():
    # Esto sirve para mostrar admin.html
    return render_template('admin.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

