from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime

app = Flask(__name__)

# Define the base directory for the mounted volume
BASE_DIR = "/app/db"

# Ensure the directory exists (optional, but useful during development)
if not os.path.exists(BASE_DIR):
    os.makedirs(BASE_DIR)

# Set the database path
DB_PATH = os.path.join(BASE_DIR, "expenses.db")

# Configure SQLAlchemy to use the SQLite database at the mounted volume
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Expense model
class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, nullable=False)

# Create database if it doesn't exist
with app.app_context():
    db.create_all()

# Route to serve the HTML page
@app.route('/')
def home():
    return render_template('index.html')

# Route to add a new expense
@app.route('/add_expense', methods=['POST'])
def add_expense():
    data = request.json
    new_expense = Expense(
        amount=data['amount'],
        category=data['category'],
        date=datetime.strptime(data['date'], '%Y-%m-%d')
    )
    db.session.add(new_expense)
    db.session.commit()
    return jsonify({'message': 'Expense added successfully.'}), 201

# Route to get all expenses
@app.route('/get_expenses', methods=['GET'])
def get_expenses():
    expenses = Expense.query.all()
    return jsonify([{
        'amount': expense.amount,
        'category': expense.category,
        'date': expense.date.strftime('%Y-%m-%d')
    } for expense in expenses])

# Route to filter expenses by category and/or month
@app.route('/filter_expenses', methods=['POST'])
def filter_expenses():
    data = request.json
    query = Expense.query

    if data.get('category'):
        query = query.filter_by(category=data['category'])

    if data.get('month'):
        start_date = datetime.strptime(data['month'], '%Y-%m')
        end_date = (start_date.replace(month=start_date.month % 12 + 1, day=1)
                    if start_date.month < 12
                    else start_date.replace(year=start_date.year + 1, month=1, day=1))
        query = query.filter(Expense.date >= start_date, Expense.date < end_date)

    expenses = query.all()
    return jsonify([{
        'amount': expense.amount,
        'category': expense.category,
        'date': expense.date.strftime('%Y-%m-%d')
    } for expense in expenses])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

