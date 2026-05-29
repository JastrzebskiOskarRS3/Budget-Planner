from flask import jsonify, request, render_template
from models import Transaction, Category
from database import db
import re

class BudgetController:
    
    @staticmethod
    def index():
        """Strona główna - tylko szablon, dane przez API (CSR)"""
        return render_template('index.html')
    
    @staticmethod
    def get_transactions():
        """REST API - GET wszystkie transakcje"""
        try:
            transactions = Transaction.query.order_by(Transaction.date.desc()).all()
            return jsonify([t.to_dict() for t in transactions]), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_transaction(id):
        """REST API - GET pojedyncza transakcja"""
        try:
            transaction = db.session.get(Transaction, id)
            if not transaction:
                return jsonify({'error': 'Transakcja nie znaleziona'}), 404
            return jsonify(transaction.to_dict()), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def create_transaction():
        """REST API - CREATE transakcji"""
        try:
            data = request.get_json()
            
            # Walidacja
            if not data.get('description') or len(data['description'].strip()) < 2:
                return jsonify({'error': 'Opis musi mieć min. 2 znaki'}), 400
            
            try:
                amount = float(data['amount'])
            except (ValueError, TypeError):
                return jsonify({'error': 'Kwota musi być liczbą'}), 400
            
            if amount == 0:
                return jsonify({'error': 'Kwota nie może być zerowa'}), 400
            
            date_pattern = r'^\d{4}-\d{2}-\d{2}$'
            if not data.get('date') or not re.match(date_pattern, data['date']):
                return jsonify({'error': 'Data musi być w formacie YYYY-MM-DD'}), 400
            
            category_id = data.get('category_id', 1)
            category = db.session.get(Category, category_id)
            if not category:
                return jsonify({'error': 'Nieprawidłowa kategoria'}), 400
            
            if category.type == 'expense' and amount > 0:
                amount = -amount
            
            transaction = Transaction(
                description=data['description'].strip(),
                amount=amount,
                date=data['date'],
                category_id=category_id
            )
            
            db.session.add(transaction)
            db.session.commit()
            
            return jsonify(transaction.to_dict()), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def update_transaction(id):
        """REST API - UPDATE transakcji"""
        try:
            transaction = db.session.get(Transaction, id)
            if not transaction:
                return jsonify({'error': 'Transakcja nie znaleziona'}), 404
            
            data = request.get_json()
            
            if 'description' in data:
                if len(data['description'].strip()) < 2:
                    return jsonify({'error': 'Opis musi mieć min. 2 znaki'}), 400
                transaction.description = data['description'].strip()
            
            if 'amount' in data:
                try:
                    amount = float(data['amount'])
                    if amount == 0:
                        return jsonify({'error': 'Kwota nie może być zerowa'}), 400
                    transaction.amount = amount
                except (ValueError, TypeError):
                    return jsonify({'error': 'Kwota musi być liczbą'}), 400
            
            if 'date' in data:
                date_pattern = r'^\d{4}-\d{2}-\d{2}$'
                if not re.match(date_pattern, data['date']):
                    return jsonify({'error': 'Data musi być w formacie YYYY-MM-DD'}), 400
                transaction.date = data['date']
            
            if 'category_id' in data:
                category = db.session.get(Category, data['category_id'])
                if not category:
                    return jsonify({'error': 'Nieprawidłowa kategoria'}), 400
                transaction.category_id = data['category_id']
            
            db.session.commit()
            return jsonify(transaction.to_dict()), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def delete_transaction(id):
        """REST API - DELETE transakcji"""
        try:
            transaction = db.session.get(Transaction, id)
            if not transaction:
                return jsonify({'error': 'Transakcja nie znaleziona'}), 404
            
            db.session.delete(transaction)
            db.session.commit()
            return jsonify({'message': 'Transakcja usunięta'}), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_categories():
        """REST API - GET wszystkie kategorie"""
        try:
            categories = Category.query.all()
            return jsonify([c.to_dict() for c in categories]), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500