from Classes.config import db
from datetime import datetime

class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.BigInteger, primary_key=True)
    apartment_id = db.Column(db.BigInteger, db.ForeignKey('apartments.id'))
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    transaction_type = db.Column(db.Enum('Rent', 'Sale', 'Maintenance'), nullable=False)
    status = db.Column(db.Enum('Pending', 'Completed', 'Overdue'), default='Pending')
    payment_method = db.Column(db.Enum('Visa', 'MasterCard', 'Cash'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Optional relationships
    user = db.relationship('User', backref='transactions')
    apartment = db.relationship('Apartment', backref='transactions')

    def __repr__(self):
        return f'<Transaction {self.id} - User {self.user_id} - Apt {self.apartment_id}>'
