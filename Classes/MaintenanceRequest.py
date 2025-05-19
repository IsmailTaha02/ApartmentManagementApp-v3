from sqlalchemy.orm import joinedload
from sqlalchemy import func
from Classes.config import db

class MaintenanceRequest(db.Model):
    __tablename__ = 'maintenance_requests'

    id = db.Column(db.BigInteger, primary_key=True)
    apartment_id = db.Column(db.BigInteger, db.ForeignKey('apartments.id'))
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    technician_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    problem_type = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    images = db.Column(db.JSON, nullable=True)
    status = db.Column(
        db.Enum('Pending', 'In Progress', 'Resolved', 'Cancelled', 'Rejected', name='request_status'),
        server_default='Pending',
        nullable=False
    )
    request_date = db.Column(
        db.DateTime,
        server_default=func.current_timestamp(),
        nullable=False
    )
    scheduled_date = db.Column(db.DateTime, nullable=True)
    response = db.Column(db.Text, nullable=True)

    # Relationships with eager loading configuration
    technician = db.relationship(
        'User', 
        foreign_keys=[technician_id], 
        backref='assigned_requests', 
        lazy='joined'  # Changed from lazy=True for immediate loading
    )
    user = db.relationship(
        'User', 
        foreign_keys=[user_id], 
        backref='maintenance_requests', 
        lazy='joined'  # Changed from lazy=True
    )
    apartment = db.relationship(
        'Apartment', 
        backref='maintenance_requests', 
        lazy='joined'  # Changed from lazy=True
    )

    def __repr__(self):
        return f'<MaintenanceRequest {self.id} – {self.problem_type}>'

    def start_request(self):
        self.status = 'In Progress'
        db.session.commit()

    def complete_request(self):
        self.status = 'Resolved'
        db.session.commit()

    def cancel_request(self):
        self.status = 'Cancelled'
        db.session.commit()

    def to_dict(self, include_related=True):
        """Enhanced serialization with relationship control"""
        base_dict = {
            'id': self.id,
            'apartment_id': self.apartment_id,
            'user_id': self.user_id,
            'technician_id': self.technician_id,
            'problem_type': self.problem_type,
            'description': self.description,
            'status': self.status,
            'request_date': self.request_date.isoformat() if self.request_date else None,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'response': self.response,
            'images': [f"http://localhost:5000/{img}" for img in self.images] if self.images else None,
        }

        if include_related:
            base_dict.update({
                'technician': {
                    'id': self.technician.id,
                    'name': self.technician.full_name,
                    'email': self.technician.email,
                    'phone': self.technician.phone_number,
                    'role': self.technician.role
                } if self.technician else None,
                
                'user': {
                    'id': self.user.id,
                    'name': self.user.full_name,
                    'email': self.user.email,
                    'phone': self.user.phone_number,
                    'role': self.user.role
                } if self.user else None,
                
                'apartment': {
                    'id': self.apartment.id,
                    'unit_number': self.apartment.unit_number,
                    'location': self.apartment.location,
                    'type': self.apartment.type
                } if self.apartment else None
            })

        return base_dict

    @classmethod
    def get_with_relations(cls, request_id):
        """Optimized query using joinedload for relationships"""
        return (
            db.session.query(cls)
            .options(
                joinedload(cls.user),
                joinedload(cls.technician),
                joinedload(cls.apartment)
            )
            .filter_by(id=request_id)
            .first()
        )

    @classmethod
    def get_by_status(cls, status):
        """Batch fetch with relationships"""
        return (
            db.session.query(cls)
            .options(
                joinedload(cls.user),
                joinedload(cls.apartment)
            )
            .filter_by(status=status)
            .all()
        )