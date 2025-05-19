from Classes.config import db  # Import db from db.py

class Apartment(db.Model):
    __tablename__ = 'apartments'  # Explicitly define the table name

    id = db.Column(db.BigInteger, primary_key=True)
    owner_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    unit_number = db.Column(db.String(50), nullable=False)
    area = db.Column(db.Numeric(10, 2), nullable=False)  # ✅ Define precision for decimals
    number_of_rooms = db.Column(db.Integer, nullable=False)
    type = db.Column(db.Enum('For Sale', 'For Rent', name='apartment_type'), nullable=False)
    description = db.Column(db.Text)
    photos = db.Column(db.JSON, nullable=True)  # ✅ JSON field for multiple images
    parking_availability = db.Column(db.Boolean, default=False)  # ✅ Boolean for parking
    video = db.Column(db.String(500), nullable=True)  # ✅ New field for video link
    map_location = db.Column(db.String(500), nullable=True)  # ✅ New field for map location
    status = db.Column(db.Enum('Available', 'Sold', 'Rented', name='apartment_status'), default='Available')
    created_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())

    # Relationship with users
    owner = db.relationship('User', backref='apartments')

    def __repr__(self):
        return f'<Apartment {self.unit_number} at {self.location}>'
