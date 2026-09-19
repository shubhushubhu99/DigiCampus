from flask import Blueprint, jsonify, request
from services.ai_service import ai_service

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/api/ai/recommendations", methods=["GET"])
def get_recommendations():
    recs = ai_service.get_recommendations()
    return jsonify(recs)

@ai_bp.route("/api/ai/evaluate", methods=["POST"])
def evaluate():
    recs = ai_service.evaluate_optimizations()
    return jsonify({"success": True, "recommendations": recs})

@ai_bp.route("/api/ai/apply", methods=["POST"])
def apply_rec():
    data = request.get_json() or {}
    rec_id = data.get("id")
    if not rec_id:
        return jsonify({"error": "Missing recommendation id"}), 400

    res = ai_service.apply_recommendation(rec_id)
    return jsonify(res)
