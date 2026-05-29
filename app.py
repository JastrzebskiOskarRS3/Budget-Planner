from flask import Flask, send_from_directory
from flask_cors import CORS
from database import init_db
from controllers import BudgetController

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///budget.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)

# Inicjalizacja bazy
init_db(app)

# ==================== ROUTING SSR ====================
@app.route('/')
def index():
    """Strona główna - tylko szablon, dane przez API"""
    return BudgetController.index()

# ==================== ROUTING REST API ====================
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    return BudgetController.get_transactions()

@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    return BudgetController.create_transaction()

@app.route('/api/transactions/<int:id>', methods=['GET'])
def get_transaction(id):
    return BudgetController.get_transaction(id)

@app.route('/api/transactions/<int:id>', methods=['PUT'])
def update_transaction(id):
    return BudgetController.update_transaction(id)

@app.route('/api/transactions/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    return BudgetController.delete_transaction(id)

@app.route('/api/categories', methods=['GET'])
def get_categories():
    return BudgetController.get_categories()

# ==================== STATIC FILES ====================
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, port=5000)  # reloader wyłączony