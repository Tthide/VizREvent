from flask import Blueprint, jsonify, request
from ..services.data_service import get_data, process_data
import json
import traceback

data_bp = Blueprint('data', __name__)

@data_bp.route('/api/dataset', methods=['GET'])
def get_dataset():
    try:
        #every API request from react will contain the current chosen dataset
        dataset_param = request.args.get('dataset')
        print(f"Dataset: {dataset_param}")
        
        dataset=get_data(dataset_param)
        
        # Process the data based on query parameters
        processed_data = process_data(dataset)

        return jsonify(processed_data)
    except Exception as e:
        traceback.print_exc()  # Print the traceback to the console
        return jsonify({"error": str(e)}), 500

