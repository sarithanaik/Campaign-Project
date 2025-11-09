from flask import Flask, request, jsonify, send_from_directory
import json
from datetime import datetime
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='../frontend')
CORS(app)

USERS_FILE = '/tmp/users.json'
CAMPAIGNS_FILE = '/tmp/campaigns.json'

def read_json(file):
    if not os.path.exists(file):
        with open(file, 'w') as f:
            json.dump([], f)
    with open(file, 'r') as f:
        return json.load(f)

def write_json(file, data):
    with open(file, 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    users = read_json(USERS_FILE)
    if any(u['username'] == data['username'] for u in users):
        return jsonify({'success': False, 'message': 'Username already exists'}), 400
    users.append({'username': data['username'], 'password': data['password']})
    write_json(USERS_FILE, users)
    return jsonify({'success': True, 'message': 'Registered successfully'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    users = read_json(USERS_FILE)
    user = next((u for u in users if u['username'] == data['username'] and u['password'] == data['password']), None)
    if user:
        return jsonify({'success': True, 'message': 'Login successful'})
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/campaigns', methods=['GET'])
def get_campaigns():
    campaigns = read_json(CAMPAIGNS_FILE)
    return jsonify(campaigns)

@app.route('/campaigns', methods=['POST'])
def add_campaign():
    data = request.json
    if not data.get('campaignName') or not data.get('clientName') or not data.get('startDate'):
        return jsonify({'success': False, 'message': 'All fields are required'}), 400
    campaigns = read_json(CAMPAIGNS_FILE)
    data['id'] = int(datetime.now().timestamp())
    campaigns.append(data)
    write_json(CAMPAIGNS_FILE, campaigns)
    return jsonify({'success': True, 'message': 'Campaign added'})

@app.route('/campaigns/<int:campaign_id>', methods=['PUT'])
def update_campaign(campaign_id):
    campaigns = read_json(CAMPAIGNS_FILE)
    data = request.json
    for c in campaigns:
        if c['id'] == campaign_id:
            c.update(data)
            write_json(CAMPAIGNS_FILE, campaigns)
            return jsonify({'success': True, 'message': 'Campaign updated'})
    return jsonify({'success': False, 'message': 'Campaign not found'}), 404

@app.route('/campaigns/<int:campaign_id>', methods=['DELETE'])
def delete_campaign(campaign_id):
    campaigns = read_json(CAMPAIGNS_FILE)
    campaigns = [c for c in campaigns if c['id'] != campaign_id]
    write_json(CAMPAIGNS_FILE, campaigns)
    return jsonify({'success': True, 'message': 'Campaign deleted'})

@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_frontend(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    port=int(os.environ.get("PORT",4000))
    app.run(host="0.0.0.0", port=port)


