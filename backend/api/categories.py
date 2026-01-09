from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import db, Category

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('', methods=['GET'])
@jwt_required()
def get_categories():
    """Get all categories"""
    categories = Category.query.all()
    return jsonify([cat.to_dict() for cat in categories]), 200

