import json
import traceback
from flask import Blueprint, request, jsonify, Response, stream_with_context

from ..services.data_service import get_data
import json
import traceback
from ..services.draco_service import draco_rec_compute

draco_bp = Blueprint('draco', __name__)
@draco_bp.route('/api/draco', methods=['POST'])
def get_draco_recommendations():

    try:
        # Parse & validate JSON payload
        payload = request.get_json(force=True)
        if not isinstance(payload, dict):
            return jsonify({"error": "Request body must be a JSON object"}), 400

        dataset_id = str(payload.get('dataset_id'))
        specs      = payload.get('specs')
        num_chart  = payload.get('num_chart', 5)

        # Debug logging (truncate specs for brevity)
        print(f"[Draco] dataset_id={dataset_id}, num_chart={num_chart}")
        print(f"[Draco] specs excerpt: {json.dumps(specs)[:200]}...")
        
        if dataset_id is None:
            return jsonify({"error": "dataset_id parameter is missing"}), 400

        data = get_data(dataset_id)
        charts =draco_rec_compute(data,specs=specs,num_chart=num_chart)

        # Wrap our generator in a JSON array:
        def generate():
                for chart in charts:
                    # send only key/name/spec
                    out = {k: chart[k] for k in ("name", "spec")}
                    yield json.dumps(out) + "\n"

        return Response(stream_with_context(generate()),
                            mimetype="application/x-ndjson")

    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON format"}), 400
    except Exception as e:
        print(f"Error: {str(e)}")  # Print the error message
        traceback.print_exc()  # Print the stack trace for more details
        return jsonify({"error": str(e)}), 500
