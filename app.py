import logging
from flask import Flask, jsonify
from flask_cors import CORS

from db import init_database
from routes.api import api_blueprint


def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    logging.basicConfig(
        filename="logs/app.log",
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
    )

    init_database()
    app.register_blueprint(api_blueprint)

    @app.route("/")
    def home():
        return jsonify({"mensaje": "Marketplace funcionando", "base": "logistica"})

    @app.route("/health")
    def health():
        return jsonify({"status": "ok"})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)