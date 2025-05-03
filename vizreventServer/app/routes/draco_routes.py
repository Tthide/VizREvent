from flask import Blueprint, jsonify, request
from flask_cors import CORS

from ..services.data_service import get_data, list_datasets,get_data_fields
import json
import traceback
from ..services.draco_service import draco_rec_compute

draco_bp = Blueprint('draco', __name__)
@draco_bp.route('/api/draco', methods=['GET'])
def get_draco_recommendations():

    try:
        # Retrieve query parameters
        dataset_id = request.args.get('dataset_id')
        specs = request.args.get('specs')
        num_chart = request.args.get('num_chart')

        print(f"get_draco_recommendations/Dataset: {dataset_id}, Specs: {specs}, NumChart: {num_chart}")  # Debugging print statement

        if dataset_id is None:
            return jsonify({"error": "dataset_id parameter is missing"}), 400

        data = get_data(dataset_id)
        
        charts_spec=draco_rec_compute(data)
        return jsonify(charts_spec)

    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON format"}), 400
    except Exception as e:
        print(f"Error: {str(e)}")  # Print the error message
        traceback.print_exc()  # Print the stack trace for more details
        return jsonify({"error": str(e)}), 500
