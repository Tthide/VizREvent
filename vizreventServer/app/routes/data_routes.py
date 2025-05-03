from flask import Blueprint, jsonify, request
from ..services.data_service import get_data, list_datasets,get_data_fields
import json
import traceback
from ..services.draco_service import draco_rec_compute

data_bp = Blueprint('data', __name__)

@data_bp.route('/api/dataset', methods=['GET'])
def get_dataset():
    try:
        #every API request from react will contain the current chosen dataset
        dataset_id = request.args.get('datasetId')
        print(f"Dataset: {dataset_id}")
        dataset=get_data(dataset_id)
        draco_rec_compute(dataset,Debug=True)

        return jsonify(dataset)
    except Exception as e:
        traceback.print_exc()  # Print the traceback to the console
        return jsonify({"error": str(e)}), 500


@data_bp.route('/api/datafields', methods=['GET'])
def get_datafields():
    try:
        #every API request from react will contain the current chosen dataset
        dataset_id = request.args.get('dataset_id')
        data = get_data_fields(dataset_id)
        # Return the fields as a JSON response
        return jsonify(data)
    
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON format"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@data_bp.route('/api/datasetList', methods=['GET'])
def list_datasets_route():
    try:
        datasets = list_datasets()
        return jsonify(datasets)
    except Exception as e:
        traceback.print_exc()  # Print the traceback to the console
        return jsonify({"error": str(e)}), 500
