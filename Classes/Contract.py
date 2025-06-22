from Classes.config import db

class Contract(db.Model):
    __tablename__ = 'contracts'

    id = db.Column(db.BigInteger, primary_key=True)
    apartment_id = db.Column(db.BigInteger, db.ForeignKey('apartments.id'), nullable=False)
    buyer_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    owner_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    contract_type = db.Column( db.Enum('Rent', 'Sale', 'Lease', name='contract_type_enum'),nullable=False)
    contract_details = db.Column(db.Text, nullable=False)
    signed_by_buyer = db.Column(db.Boolean, default=False)
    signed_by_owner = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())
    finalized_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    apartment = db.relationship('Apartment', backref='contracts')
    buyer = db.relationship('User', foreign_keys=[buyer_id], backref='contracts_as_buyer')
    owner = db.relationship('User', foreign_keys=[owner_id], backref='contracts_as_owner')

    def __repr__(self):
        return f'<Contract {self.id} - {self.contract_type} for apartment {self.apartment_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'apartment_id': self.apartment_id,
            'apartment_location': self.apartment.location if self.apartment else None,
            'buyer_id': self.buyer_id,
            'buyer_name': self.buyer.full_name if self.buyer else None,
            'owner_id': self.owner_id,
            'owner_name': self.owner.full_name if self.owner else None,
            'contract_type': self.contract_type,
            'contract_details': self.contract_details,
            'signed_by_buyer': self.signed_by_buyer,
            'signed_by_owner': self.signed_by_owner,
            'created_at': self.created_at,
            'finalized_at': self.finalized_at
        }
