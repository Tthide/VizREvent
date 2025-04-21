from flask import Flask, jsonify, make_response
from flask_cors import CORS
import json
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/data', methods=['GET'])
def get_data():
    try:
        with open('./data/events/3900493.json', 'r') as file:
            data = json.load(file)

        # Process the data (e.g., filter, sort, etc.)
        processed_data = process_data(data)

        response = make_response(jsonify(processed_data))
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as e:
        traceback.print_exc()  # Print the traceback to the console
        response = make_response(jsonify({"error": str(e)}), 500)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

def process_data(data):
    # Example: Return only the first 10 items
    return data[2:1000]

if __name__ == '__main__':
    app.run(debug=True, port=5000)
