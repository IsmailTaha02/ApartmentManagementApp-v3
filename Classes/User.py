from Classes.config import db  # Import db from config.py

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.BigInteger, primary_key=True)
    full_name = db.Column(db.Text, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone_number = db.Column(db.Text, nullable=False)
    role = db.Column(db.Enum('Administrator', 'Buyer/Tenant', 'Owner', 'Technician'), nullable=False)
    job = db.Column(db.Text)
    facebook_link = db.Column(db.Text)
    password = db.Column(db.Text, nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __repr__(self):
        return f'<User {self.full_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'role' : self.role
        }