import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from services.iot_service import iot_service

# Import blueprints
from routes.campus_routes import campus_bp
from routes.digital_twin_routes import twin_bp
from routes.booking_routes import booking_bp
from routes.parking_routes import parking_bp
from routes.equipment_routes import equipment_bp
from routes.ai_routes import ai_bp

from flask.json.provider import DefaultJSONProvider
import datetime
from decimal import Decimal

class CustomJSONProvider(DefaultJSONProvider):
    def default(self, o):
        if isinstance(o, datetime.timedelta):
            total_seconds = int(o.total_seconds())
            hours, remainder = divmod(total_seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            return f"{hours:02}:{minutes:02}:{seconds:02}"
        if isinstance(o, (datetime.date, datetime.datetime)):
            return o.isoformat()
        if isinstance(o, Decimal):
            return float(o)
        return super().default(o)

def create_app():
    app = Flask(__name__)
    app.json = CustomJSONProvider(app)
    app.config.from_object(Config)

    # Enable CORS for frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register Blueprints
    app.register_blueprint(campus_bp)
    app.register_blueprint(twin_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(parking_bp)
    app.register_blueprint(equipment_bp)
    app.register_blueprint(ai_bp)

    @app.route("/api/health")
    def health():
        return jsonify({
            "status": "healthy",
            "service": "DigiCampus Digital Twin Backend",
            "database": "MySQL Connected",
            "simulation": "ACTIVE"
        })

    # Start IoT background telemetry generator
    iot_service.start_simulation()

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
