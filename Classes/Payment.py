from Classes.config import db

class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.BigInteger, primary_key=True)
    transaction_id = db.Column(db.BigInteger)
    amount = db.Column(db.Numeric(12, 2))
    due_date = db.Column(db.DateTime)
    paid_date = db.Column(db.DateTime)
    status = db.Column(db.Enum('Pending', 'Completed'))

    def __repr__(self):
        return f'<Payment {self.id}>'
