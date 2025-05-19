from Classes.config import db
from sqlalchemy.orm import relationship

class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.BigInteger, primary_key=True)
    sender_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    receiver_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    apartment_id = db.Column(db.BigInteger, db.ForeignKey('apartments.id'), nullable=True)
    message_type = db.Column(db.Enum('General', 'Maintenance', 'Payment','Contract'), default='General')
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

     # ✅ Relationships
    sender = relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    receiver = relationship('User', foreign_keys=[receiver_id], backref='received_messages')

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'apartment_id': self.apartment_id,
            'message_type': self.message_type,
            'content': self.content,
            'is_read': self.is_read,
            'timestamp': self.timestamp.isoformat(),
            'sender': self.sender.to_dict() if self.sender else None,
            'receiver': self.receiver.to_dict() if self.receiver else None
        }
