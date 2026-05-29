from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
        
        # Seed danych - PROSTSZE KATEGORIE
        from models import Category
        if Category.query.count() == 0:
            categories = [
                ('💰 Przychód', 'income'),
                ('🛒 Jedzenie', 'expense'),
                ('🏠 Mieszkanie', 'expense'),
                ('🚗 Transport', 'expense'),
                ('🎬 Rozrywka', 'expense'),
                ('🏥 Zdrowie', 'expense'),
                ('📚 Edukacja', 'expense'),
                ('👕 Ubrania', 'expense'),
                ('📱 Rachunki', 'expense'),
                ('🎁 Inne', 'expense')
            ]
            for name, type_ in categories:
                cat = Category(name=name, type=type_)
                db.session.add(cat)
            db.session.commit()