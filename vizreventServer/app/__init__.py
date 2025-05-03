from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes

    # Register blueprints
    from .routes.data_routes import data_bp
    app.register_blueprint(data_bp)
    from .routes.draco_routes import draco_bp
    app.register_blueprint(draco_bp)


    return app
