from flask import Blueprint, jsonify, request
from ..services.data_service import get_data, list_datasets,get_data_fields
import json
import traceback

data_bp = Blueprint('data', __name__)

@data_bp.route('/api/dataset', methods=['GET'])
def get_dataset():
    print("Received /api/dataset call...")   
    try:
        #every API request from react will contain the current chosen dataset
        dataset_id = request.args.get('dataset_id')
        print(f"Dataset: {dataset_id}")
        dataset=get_data(dataset_id)

        print("Data sent!")

        return jsonify(dataset)
    except Exception as e:
        traceback.print_exc()  # Print the traceback to the console
        return jsonify({"error": str(e)}), 500


@data_bp.route('/api/datafields', methods=['GET'])
def get_datafields():
    print("Received /api/datafields call...")
    try:
        #every API request from react will contain the current chosen dataset
        dataset_id = request.args.get('dataset_id')
        print("Getting datafields...")
        data = get_data_fields(dataset_id)
        # Return the fields as a JSON response
        print("Datafields Sent !")
        return jsonify(data)
    
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON format"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@data_bp.route('/api/datasetList', methods=['GET'])
def list_datasets_route():
    print("Received /api/datasetList call...")
    try:
        print("Getting datasetLists...")
        datasets = list_datasets()
        print("DatasetLists Sent !")
        return jsonify(datasets)
    except Exception as e:
        traceback.print_exc()  # Print the traceback to the console
        return jsonify({"error": str(e)}), 500
