# models/technician_schedule.py

from datetime import datetime
from Classes.config import db  # Make sure this import path is correct
from sqlalchemy.orm import relationship
from sqlalchemy import Enum, BigInteger, DateTime, Text, ForeignKey

class TechnicianSchedule(db.Model):  # type: ignore
    __tablename__ = 'technician_schedule'
    
    id = db.Column(BigInteger, primary_key=True)
    technician_id = db.Column(BigInteger, ForeignKey('users.id'))
    request_id = db.Column(BigInteger, ForeignKey('maintenance_requests.id'), unique=True)
    scheduled_date = db.Column(DateTime)
    status = db.Column(Enum('Scheduled', 'Completed', 'Cancelled', name='status_enum'))
    cancellation_reason = db.Column(Text)
    
    technician = relationship('User', backref='schedules')
    request = relationship('MaintenanceRequest', backref='schedule')
