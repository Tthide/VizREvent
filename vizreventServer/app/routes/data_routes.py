from flask import Blueprint, jsonify, request
from ..services.data_service import get_data, list_datasets
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
        # Open and read the JSON file
        with open("./data/events/temps/draco_dataframe.json", "r") as file:
            data = json.load(file)

        # Extract the 'field' property
        fields = data.get("field", [])

        # Return the fields as a JSON response
        return jsonify(fields)

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
