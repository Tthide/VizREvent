import sys
import os
from flask import Flask, send_from_directory
from flask_cors import CORS

def create_app():
    if getattr(sys, 'frozen', False):
        # Running inside PyInstaller bundle
        base_path = sys._MEIPASS
    else:
        # Running normally
        base_path = os.path.abspath(os.path.dirname(__file__))

    static_folder_path = os.path.join(base_path, "frontend_build")
    
    app = Flask(__name__, static_folder=static_folder_path, static_url_path="")
    CORS(app)

    # Register blueprints
    from .routes.data_routes import data_bp
    app.register_blueprint(data_bp)
    from .routes.draco_routes import draco_bp
    app.register_blueprint(draco_bp)
    
    
    @app.route('/')
    def serve_react():
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/<path:path>')
    def serve_static(path):
        file_path = os.path.join(app.static_folder, path)
        if os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    return app
