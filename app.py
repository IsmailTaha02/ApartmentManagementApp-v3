import re
import uuid
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import logging
from sqlalchemy import exc
from sqlalchemy.orm import joinedload
from Classes.config import configure_app, db
from Classes.Apartment import Apartment
from Classes.MaintenanceRequest import MaintenanceRequest
from Classes.User import User
from Classes.Payment import Payment
from Classes.Message import Message
from Classes.Transaction import Transaction
from Classes.Contract import Contract

from werkzeug.security import generate_password_hash
import jwt

from functools import wraps
from datetime import datetime, timedelta


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# App initialization
app = Flask(__name__)
configure_app(app)
CORS(app, supports_credentials=True, origins="http://localhost:4200", 
     methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])

# Database logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Constants
VALID_STATUSES = ['Pending', 'In Progress', 'Resolved', 'Cancelled', 'Rejected']
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_scheduled_date(date_str):
    """Flexibly parse dates from different formats with timezone support"""
    if not date_str or str(date_str).lower() in ['null', 'none', '']:
        return None
    
    try:
        # Try ISO format first (from Angular Date objects)
        if 'T' in date_str:
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return dt.replace(tzinfo=None)  # Convert to naive datetime for MySQL
        # Try with time (your original format)
        if ':' in date_str:
            return datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        # Try date-only format
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError as e:
        logger.error(f"Failed to parse date: {date_str} - Error: {str(e)}")
        return None

def validate_and_normalize_status(status):
    """Validate status and normalize variations to match database ENUM"""
    if not status:
        return None
        
    status = status.strip().title()  # Normalize case
    status_map = {
        'Completed': 'Resolved',
        'Complete': 'Resolved',
        'Finished': 'Resolved',
        'Done': 'Resolved'
    }
    
    normalized_status = status_map.get(status, status)
    
    if normalized_status not in VALID_STATUSES:
        return None
    return normalized_status

# Initialize database
with app.app_context():
    db.create_all()


SECRET_KEY = 'your-secret-key'  # make sure this matches what you use to create tokens!

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header:
            return jsonify({'error': 'Token is missing!'}), 401
        try:
            token = auth_header.split()[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            current_user = User.query.get(user_id)
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': f'Error decoding token: {str(e)}'}), 401
        return f(current_user, *args, **kwargs)
    return decorated


#############Users Route#######################
@app.route('/users')
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])


SECRET_KEY = 'YOUR_SECRET_KEY'  # Replace with a strong secret key or load from env

@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Invalid request: no JSON body found'}), 400

    full_name = data.get('full_name')
    email = data.get('email')
    phone_number = data.get('phone_number')
    role = data.get('role')
    job = data.get('job')
    facebook_link = data.get('facebook_link')
    password = data.get('password')

    # Basic field validation
    if not all([full_name, email, phone_number, role, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    email = data.get('email')

    # Validate email format
    if not email or not is_valid_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Check if email exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    try:
        password_hash = generate_password_hash(password)

        new_user = User(
            full_name=full_name,
            email=email,
            phone_number=phone_number,
            role=role,
            job=job,
            facebook_link=facebook_link,
            password=password_hash,
            is_verified=False  # default, until verified
        )

        db.session.add(new_user)
        db.session.commit()

        # Optionally generate JWT token
        token = jwt.encode(
            {'user_id': new_user.id, 'email': new_user.email},
            SECRET_KEY,
            algorithm='HS256'
        )

        return jsonify({
            'message': 'User created successfully',
            'user': new_user.to_dict(),
            'token': token
        }), 201

    except exc.SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Error creating user: {str(e)}")
        return jsonify({'error': 'Database error. Please try again.'}), 500

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


def is_valid_email(email: str) -> bool:
    # Simple regex for email validation
    email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(email_regex, email))


# Route to get apartments related to a specific user
@app.route('/user/<int:user_id>/apartments', methods=['GET'])
def get_user_apartments(user_id):
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    apartment_ids = {t.apartment_id for t in transactions}

    apartments = Apartment.query.filter(Apartment.id.in_(apartment_ids)).all()

    return jsonify([{
        'id': apt.id,
        'location': apt.location,
        'unit_number': apt.unit_number,
        'area': apt.area,
        'number_of_rooms': apt.number_of_rooms,
        'type': apt.type,
        'description': apt.description,
        'photos': [f"http://localhost:5000{photo}" for photo in apt.photos] if apt.photos else None,
        'status': apt.status,
        'created_at': apt.created_at
    } for apt in apartments])


###Route to get all apartments and apply filters on them
@app.route('/apartments')
def get_apartments():
    price_min = request.args.get('price_min', type=int)
    price_max = request.args.get('price_max', type=int)
    city = request.args.get('city', type=str)
    location = request.args.get('location', type=str)
    area_min = request.args.get('area_min', type=int)
    area_max = request.args.get('area_max', type=int)
    apt_type = request.args.get('type', type=str)
    unit_number = request.args.get('unit_number', type=str)
    status = request.args.get('status', type=str)
    query = Apartment.query

    if status:
        query = query.filter(Apartment.status.ilike(f'%{status}%'))
    if apt_type:
        query = query.filter(Apartment.type.ilike(f'%{apt_type}%'))
    if price_min:
        query = query.filter(Apartment.price >= price_min)
    if price_max:
        query = query.filter(Apartment.price <= price_max)
    if city:
        query = query.filter(Apartment.city.ilike(f'%{city}%'))
    if location:
        query = query.filter(Apartment.location.ilike(f'%{location}%'))
    if area_min:
        query = query.filter(Apartment.area >= area_min)
    if area_max:
        query = query.filter(Apartment.area <= area_max)
    if unit_number:
        query = query.filter(Apartment.unit_number.ilike(f'%{unit_number}%'))

    apartments = query.all()

    result = []
    for a in apartments:
        owner = a.owner  
        result.append({
            'id': a.id,
            'owner_id': a.owner_id,
            'location': a.location,
            'price': a.price,
            'city': a.city,
            'unit_number': a.unit_number,
            'area': a.area,
            'number_of_rooms': a.number_of_rooms,
            'type': a.type,
            'description': a.description,
            'photos': [f"http://localhost:5000/{p}" for p in a.photos] if a.photos else [],
            'video': f"http://localhost:5000/{a.video}" if a.video else None,   # <-- ADD VIDEO URL
            'parking_availability': bool(a.parking_availability),
            'status': a.status,
            'created_at': a.created_at,
            'owner': {
                'id': owner.id,
                'full_name': owner.full_name,
                'email': owner.email,
                'phone_number': owner.phone_number
            } if owner else None
        })

    return jsonify(result)




###Route to get spsfc app
@app.route('/apartments/<int:id>', methods=['GET'])
def get_apartment(id):
    apartment = Apartment.query.get_or_404(id)

    transaction = None
    if apartment.status in ['Sold', 'Rented','Available']:
        transaction = Transaction.query.filter_by(apartment_id=apartment.id).first()

    return jsonify({
        'id': apartment.id,
        'owner_id': apartment.owner_id,
        'location': apartment.location,
        'city': apartment.city,
        'price': apartment.price,
        'unit_number': apartment.unit_number,
        'area': apartment.area,
        'number_of_rooms': apartment.number_of_rooms,
        'type': apartment.type,
        'description': apartment.description,
        'photos': [f"http://localhost:5000/{p}" for p in apartment.photos] if apartment.photos else [],
        'parking_availability': bool(apartment.parking_availability),
        'video': f"http://localhost:5000/{apartment.video}" if apartment.video else None,
        'map_location': getattr(apartment, 'map_location', None),
        'status': apartment.status,
        'created_at': apartment.created_at,
        'owner': {
            'id': apartment.owner.id,
            'full_name': apartment.owner.full_name,
            'email': apartment.owner.email,
            'phone_number': apartment.owner.phone_number
        } if apartment.owner else None,
        'buyer': transaction.user.to_dict() if transaction else None
    })


@app.route('/api/maintenance-requests', methods=['GET'])
def get_maintenance_requests():
    category = request.args.get('category')
    status = request.args.get('status')
    search_term = request.args.get('searchTerm')
    user_id = request.args.get('user_id', type=int)

    query = MaintenanceRequest.query.options(
        joinedload(MaintenanceRequest.user),
        joinedload(MaintenanceRequest.technician),
        joinedload(MaintenanceRequest.apartment)
    )

    if category:
        query = query.filter(MaintenanceRequest.problem_type.ilike(f'%{category}%'))
    if status:
        query = query.filter(MaintenanceRequest.status.ilike(f'%{status}%'))
    if search_term:
        query = query.filter(MaintenanceRequest.description.ilike(f'%{search_term}%'))
    if user_id is not None:
        query = query.filter(MaintenanceRequest.user_id == user_id)

    requests = query.all()
    return jsonify([r.to_dict() for r in requests])

@app.route('/api/maintenance-requests', methods=['POST'])
def create_maintenance_request():
    user_id = request.form.get('user_id')
    apartment_id = request.form.get('apartment_id')
    technician_id = request.form.get('technician_id') or None
    problem_type = request.form.get('problem_type')
    description = request.form.get('description')
    status = request.form.get('status', 'Pending')

    image_file = request.files.get('image')
    image_path = None

    if image_file and allowed_file(image_file.filename):
        filename = secure_filename(image_file.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(image_path)
        image_path = os.path.relpath(image_path, start='.')

    new_request = MaintenanceRequest(
        user_id=user_id,
        apartment_id=apartment_id,
        technician_id=technician_id,
        problem_type=problem_type,
        description=description,
        status=status,
        images=image_path
    )

    db.session.add(new_request)
    db.session.commit()

    # Return the full request data with relationships
    full_request = MaintenanceRequest.get_with_relations(new_request.id)
    return jsonify({
        'message': 'Maintenance request submitted successfully!',
        'request': full_request.to_dict()
    }), 201

@app.route('/api/maintenance-requests/<int:id>', methods=['PATCH'])
def update_maintenance_request(id):
    logger.info(f"Received PATCH request for maintenance request {id}")
    
    try:
        data = request.get_json()
        if not data:
            logger.error("No data provided in request")
            return jsonify({'error': 'No data provided'}), 400

        # Log incoming data
        logger.info(f"Request data: {data}")

        maintenance_request = MaintenanceRequest.get_with_relations(id)
        if not maintenance_request:
            logger.error(f"Maintenance request {id} not found")
            return jsonify({'error': 'Maintenance request not found'}), 404

        # Log current state
        logger.info(f"Current state - Status: {maintenance_request.status}, Scheduled: {maintenance_request.scheduled_date}")

        # Process status update
        if 'status' in data:
            normalized_status = validate_and_normalize_status(data['status'])
            if not normalized_status:
                error_msg = f'Invalid status. Must be one of: {", ".join(VALID_STATUSES)}'
                logger.error(error_msg)
                return jsonify({'error': error_msg}), 400
            maintenance_request.status = normalized_status
            logger.info(f"Updating status to: {normalized_status}")

        # Process scheduled date update
        if 'scheduled_date' in data:
            parsed_date = parse_scheduled_date(str(data['scheduled_date']))
            if parsed_date is None and data['scheduled_date'] not in [None, '', 'null']:
                error_msg = 'Invalid date format. Use YYYY-MM-DD, YYYY-MM-DD HH:MM:SS, or ISO format'
                logger.error(error_msg)
                return jsonify({'error': error_msg}), 400
            maintenance_request.scheduled_date = parsed_date
            logger.info(f"Updating scheduled_date to: {parsed_date}")

        # Process other fields
        if 'response' in data:
            maintenance_request.response = data['response']
        if 'technician_id' in data:
            maintenance_request.technician_id = data['technician_id']

        db.session.commit()
        logger.info("Transaction committed successfully")

        # Get the updated request with relationships
        updated_request = MaintenanceRequest.get_with_relations(id)
        return jsonify({
            'message': 'Maintenance request updated successfully',
            'request': updated_request.to_dict()
        })

    except exc.SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error updating request {id}: {str(e)}")
        return jsonify({
            'error': 'Database operation failed',
            'details': str(e),
            'solution': 'Check database logs for more information'
        }), 500
    except Exception as e:
        db.session.rollback()
        logger.error(f"Unexpected error updating request {id}: {str(e)}")
        return jsonify({
            'error': 'Unexpected server error',
            'details': str(e)
        }), 500

@app.route('/api/technician/<int:technician_id>/requests', methods=['GET'])
def get_requests_for_technician(technician_id):
    requests = MaintenanceRequest.query.options(
        joinedload(MaintenanceRequest.user),
        joinedload(MaintenanceRequest.apartment)
    ).filter_by(technician_id=technician_id).all()
    return jsonify([r.to_dict() for r in requests])

@app.route('/api/technician/<int:technician_id>/requests/pending', methods=['GET'])
def get_pending_requests_for_technician(technician_id):
    requests = MaintenanceRequest.query.options(
        joinedload(MaintenanceRequest.user),
        joinedload(MaintenanceRequest.apartment)
    ).filter_by(technician_id=technician_id, status='Pending').all()
    return jsonify([r.to_dict() for r in requests])

@app.route('/api/maintenance-requests/<int:request_id>', methods=['GET'])
def get_maintenance_request(request_id):
    request = MaintenanceRequest.get_with_relations(request_id)
    if request is None:
        return jsonify({'error': 'Request not found'}), 404
    return jsonify(request.to_dict())

@app.route('/api/technician/<int:technician_id>/stats', methods=['GET'])
def get_technician_stats(technician_id):
    # Count total non-rejected requests
    total_requests = MaintenanceRequest.query.filter(
        MaintenanceRequest.technician_id == technician_id,
        MaintenanceRequest.status != 'Rejected'  # Explicitly exclude rejected
    ).count()

    # Count pending requests (already excludes rejected by status filter)
    pending_requests = MaintenanceRequest.query.filter(
        MaintenanceRequest.technician_id == technician_id,
        MaintenanceRequest.status == 'Pending'
    ).count()

    # Count completed requests (using resolved statuses)
    completed_requests = MaintenanceRequest.query.filter(
        MaintenanceRequest.technician_id == technician_id,
        MaintenanceRequest.status.in_(['Resolved', 'Completed'])
    ).count()

    return jsonify({
        'total': total_requests,
        'pending': pending_requests,
        'completed': completed_requests
    })

from werkzeug.security import check_password_hash
SECRET_KEY = 'YOUR_SECRET_KEY'  # Use a real secret key, or load from env

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        token = jwt.encode({
            'user_id': user.id,
            'email': user.email,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(hours=12)
        }, SECRET_KEY, algorithm='HS256')

        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'full_name': user.full_name,
                'email': user.email,
                'role': user.role,
                'is_verified': user.is_verified
            },
            'token': token
        }), 200

    else:
        return jsonify({'error': 'Invalid email or password'}), 401




############### New route to update an apartment #################
@app.route('/apartments/<int:id>', methods=['PUT'])
def update_apartment(id):
    apartment = Apartment.query.get_or_404(id)

    # Extract form fields
    location = request.form.get('location')
    city = request.form.get('city')
    unit_number = request.form.get('unit_number')
    area = request.form.get('area', type=float)
    number_of_rooms = request.form.get('number_of_rooms', type=int)
    apt_type = request.form.get('type')
    description = request.form.get('description')
    price = request.form.get('price', type=int)
    status = request.form.get('status')

    apartment.location = location or apartment.location
    apartment.city = city or apartment.city
    apartment.unit_number = unit_number or apartment.unit_number
    apartment.area = area or apartment.area
    apartment.number_of_rooms = number_of_rooms or apartment.number_of_rooms
    apartment.type = apt_type or apartment.type
    apartment.description = description or apartment.description
    apartment.price = price or apartment.price
    apartment.status = status or apartment.status

    # --- Handle new image uploads ---
    new_photos = []
    if 'new_images' in request.files:
        files = request.files.getlist('new_images')
        for file in files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                unique_name = f"{uuid.uuid4()}_{filename}"
                save_path = os.path.join(UPLOAD_FOLDER, unique_name)
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                file.save(save_path)

                # Convert to web-safe path
                photo_url = f"/{UPLOAD_FOLDER}/{unique_name}".replace('\\', '/')
                new_photos.append(photo_url)


    # --- Handle existing photos sent from client ---
    existing_photos = request.form.get('existing_photos')
    if existing_photos:
        try:
            import json
            existing_photos = json.loads(existing_photos)
            existing_photos = [
                photo.replace("http://localhost:5000", "") for photo in existing_photos
            ]
        except:
            existing_photos = []
    else:
        existing_photos = []

    apartment.photos = existing_photos + new_photos

    db.session.commit()

    return jsonify({'message': 'Apartment updated successfully'})



############### New route to ADD an apartment #################
@app.route('/apartments', methods=['POST'])
def add_apartment():
    
    location = request.form.get('location')
    city = request.form.get('city')
    unit_number = request.form.get('unit_number')
    area = request.form.get('area', type=float)
    number_of_rooms = request.form.get('number_of_rooms', type=int)
    apt_type = request.form.get('type')
    description = request.form.get('description')
    price = request.form.get('price', type=int)
    status = request.form.get('status', default='Available')
    owner_id = request.form.get('owner_id', type=int)

    # Validate required fields
    if not all([location, unit_number, area, number_of_rooms, apt_type, price, status]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Handle photo uploads
    uploaded_photos = []
    if 'photos' in request.files:
        files = request.files.getlist('photos')
        for file in files:
            if file:
                filename = secure_filename(file.filename)
                unique_name = f"{uuid.uuid4()}_{filename}"
                save_path = os.path.join(UPLOAD_FOLDER, unique_name)
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                file.save(save_path)
                # Convert to web-safe path
                photo_url = f"/{UPLOAD_FOLDER}/{unique_name}".replace('\\', '/')
                uploaded_photos.append(photo_url)

    # Create apartment instance
    new_apartment = Apartment(
        owner_id=owner_id,
        location=location,
        city=city,
        unit_number=unit_number,
        area=area,
        number_of_rooms=number_of_rooms,
        type=apt_type,
        description=description,
        price=price,
        status=status,
        photos=uploaded_photos
    )

    db.session.add(new_apartment)
    db.session.commit()

    return jsonify({'message': 'Apartment added successfully', 'id': new_apartment.id}), 201


###Route to delete an apartment
@app.route('/apartments/<int:id>', methods=['DELETE'])
def delete_apartment(id):
    apartment = Apartment.query.get_or_404(id)

    # Optionally: delete photo files from disk
    for photo in apartment.photos or []:
        try:
            photo_path = os.path.join('.', photo.lstrip('/'))
            if os.path.exists(photo_path):
                os.remove(photo_path)
        except Exception as e:
            logger.warning(f"Could not delete file {photo}: {str(e)}")

    db.session.delete(apartment)
    db.session.commit()

    return jsonify({'message': 'Apartment deleted successfully'}), 200


################Payments Route#######################
@app.route('/payments')
def get_payments():
    all_payments = Payment.query.all()
    current_time = datetime.utcnow()

    due = []
    overdue = []
    completed = []

    for payment in all_payments:
        transaction = Transaction.query.get(payment.transaction_id)
        
        if not transaction:
            continue  # skip this payment if transaction is missing

        # Optional: fetch related user/apartment info
        user = User.query.get(transaction.user_id)
        apartment = Apartment.query.get(transaction.apartment_id)

        payment_data = {
            'id': payment.id,
            'transaction_id': payment.transaction_id,
            'amount': float(payment.amount),
            'due_date': payment.due_date.strftime('%Y-%m-%d'),
            'paid_date': payment.paid_date.strftime('%Y-%m-%d') if payment.paid_date else None,
            'status': payment.status,
            'user': {
                'id': user.id,
                'full_name': user.full_name,
                'email': user.email
            } if user else None,
            'apartment': {
                'id': apartment.id,
                'location': apartment.location,
                'unit_number': apartment.unit_number
            } if apartment else None
        }

        if payment.status == 'Completed':
            completed.append(payment_data)
        elif payment.due_date < current_time:
            overdue.append(payment_data)
        else:
            due.append(payment_data)

    return jsonify({
        'due': due,
        'overdue': overdue,
        'completed': completed
    })



####################Messages Route######################
@app.route('/messages', methods=['GET'])
def get_messages_for_user():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    messages = Message.query.filter(
        (Message.sender_id == user_id) | (Message.receiver_id == user_id)
    ).order_by(Message.timestamp.desc()).all()
    return jsonify([msg.to_dict() for msg in messages])



@app.route('/messages', methods=['POST'])
def send_message():
    try:
        data = request.json
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        apartment_id = data.get('apartment_id')
        content = data.get('content')

        if not sender_id or not content:
            return jsonify({"error": "sender_id and content are required"}), 400

        if not receiver_id and apartment_id:
            apartment = Apartment.query.get(apartment_id)
            if not apartment:
                return jsonify({"error": "Apartment not found"}), 404
            receiver_id = apartment.owner_id

        if not receiver_id:
            return jsonify({"error": "receiver_id is required if apartment_id not provided"}), 400

        msg = Message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            apartment_id=apartment_id,
            message_type = data.get('message_type', 'General'),
            content=content
        )

        db.session.add(msg)
        db.session.commit()

        return jsonify(msg.to_dict()), 201

    except Exception as e:
        print(f"Error in /messages: {e}")
        return jsonify({"error": str(e)}), 500



##################CONTRACTS ROUTES###################3
@app.route('/contracts', methods=['GET'])
def get_contracts():
    # Optional filters
    buyer_id = request.args.get('user_id', type=int)
    owner_id = request.args.get('owner_id', type=int)
    apartment_id = request.args.get('apartment_id', type=int)
    contract_type = request.args.get('contract_type', type=str)
    status = request.args.get('status', type=str)

    query = Contract.query

    if status == 'signed':
        query = query.filter(Contract.signed_by_buyer == True, Contract.signed_by_owner == True)
    elif status == 'pending':
        query = query.filter(
            (Contract.signed_by_buyer != True) | (Contract.signed_by_owner != True)
        )
    
    if buyer_id:
        query = query.filter(Contract.buyer_id == buyer_id)
    if owner_id:
        query = query.filter(Contract.owner_id == owner_id)
    if apartment_id:
        query = query.filter(Contract.apartment_id == apartment_id)
    if contract_type:
        query = query.filter(Contract.contract_type == contract_type)

    contracts = query.all()

    result = []
    for c in contracts:
        result.append({
            'id': c.id,
            'apartment_id': c.apartment_id,
            'apartment_location': c.apartment.location if c.apartment else None,
            'buyer_id': c.buyer_id,
            'buyer_name': c.buyer.full_name if c.buyer else None,
            'owner_id': c.owner_id,
            'owner_name': c.owner.full_name if c.owner else None,
            'contract_type': c.contract_type,
            'signed_by_buyer': c.signed_by_buyer,
            'signed_by_owner': c.signed_by_owner,
            'created_at': c.created_at,
            'finalized_at': c.finalized_at
        })

    return jsonify(result)


@app.route('/contracts/<int:id>', methods=['GET'])
def get_contract(id):
    contract = Contract.query.get(id)
    if not contract:
        return jsonify({'error': 'Contract not found'}), 404

    apartment = contract.apartment
    buyer = contract.buyer
    owner = contract.owner

    return jsonify({
        'id': contract.id,
        'apartment_id': contract.apartment_id,
        'apartment': {
            'location': apartment.location if apartment else None,
            'unit_number': apartment.unit_number if apartment else None,
            'area': float(apartment.area) if apartment else None,
            'number_of_rooms': apartment.number_of_rooms if apartment else None,
            'type': apartment.type if apartment else None,
            'description': apartment.description if apartment else None,
            'price': apartment.price if apartment else None,
            'parking_availability': bool(apartment.parking_availability) if apartment else None,
            'status': apartment.status if apartment else None,
            'created_at': apartment.created_at.isoformat() if apartment else None,
            'city': apartment.city if apartment else None
        },
        'buyer': {
            'id': buyer.id if buyer else None,
            'full_name': buyer.full_name if buyer else None,
            'email': buyer.email if buyer else None,
            'phone_number': buyer.phone_number if buyer else None,
            'role': buyer.role if buyer else None,
            'job': buyer.job if buyer else None,
            'facebook_link': buyer.facebook_link if buyer else None,
            'is_verified': bool(buyer.is_verified) if buyer else None,
            'created_at': buyer.created_at.isoformat() if buyer else None
        },
        'owner': {
            'id': owner.id if owner else None,
            'full_name': owner.full_name if owner else None,
            'email': owner.email if owner else None,
            'phone_number': owner.phone_number if owner else None,
            'role': owner.role if owner else None,
            'job': owner.job if owner else None,
            'facebook_link': owner.facebook_link if owner else None,
            'is_verified': bool(owner.is_verified) if owner else None,
            'created_at': owner.created_at.isoformat() if owner else None
        },
        'contract_type': contract.contract_type,
        'contract_details': contract.contract_details,
        'signed_by_buyer': bool(contract.signed_by_buyer),
        'signed_by_owner': bool(contract.signed_by_owner),
        'created_at': contract.created_at.isoformat() if contract.created_at else None,
        'finalized_at': contract.finalized_at.isoformat() if contract.finalized_at else None
    })


@app.route('/customer-contracts', methods=['GET'])
@token_required  # Assuming you have auth
def get_customer_contracts(current_user):
    if current_user.role != 'Buyer/Tenant':
        return jsonify({'error': 'Unauthorized'}), 403

    query = Contract.query.filter_by(buyer_id=current_user.id)

    status = request.args.get('status')
    if status == 'signed':
        query = query.filter(Contract.signed_by_buyer == True, Contract.signed_by_owner == True)
    elif status == 'pending':
        query = query.filter((Contract.signed_by_buyer == False) | (Contract.signed_by_owner == False))

    contracts = query.all()

    return jsonify([{
        'id': c.id,
        'apartment_location': c.apartment.location if c.apartment else '',
        'contract_type': c.contract_type,
        'created_at': c.created_at,
        'signed_by_owner': c.signed_by_owner,
        'signed_by_buyer': c.signed_by_buyer
    } for c in contracts])


SECRET_KEY = 'your-secret-key'  # make sure this matches what you use to create tokens!

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header:
            return jsonify({'error': 'Token is missing!'}), 401
        try:
            token = auth_header.split()[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            current_user = User.query.get(user_id)
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': f'Error decoding token: {str(e)}'}), 401
        return f(current_user, *args, **kwargs)
    return decorated



@app.route('/contracts', methods=['POST'])
def create_contract():
    data = request.get_json()

    required_fields = ['apartment_id', 'buyer_id', 'owner_id', 'contract_type', 'contract_details']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    contract = Contract(
        apartment_id=data['apartment_id'],
        buyer_id=data['buyer_id'],
        owner_id=data['owner_id'],
        contract_type=data['contract_type'],
        contract_details=data['contract_details']
    )

    db.session.add(contract)
    db.session.commit()

    return jsonify({'message': 'Contract created', 'id': contract.id}), 201


#######Routes to get and assign/remove apartment to as specific user
@app.route('/api/potential-buyers-tenants')
def potential_buyers_tenants():
    users = User.query.filter(User.role == 'Buyer/Tenant').all()
    return jsonify([user.to_dict() for user in users])

@app.route('/api/assign-apartment', methods=['POST'])
def assign_apartment():
    data = request.get_json()
    apartment_id = data.get('apartment_id')
    user_id = data.get('user_id')

    apartment = Apartment.query.get(apartment_id)
    if not apartment:
        return jsonify({'error': 'Apartment not found'}), 404

    if apartment.status not in ['Sold', 'Rented']:
        return jsonify({'error': 'Apartment must be Sold or Rented'}), 400

    # Create transaction
    transaction = Transaction(user_id=user_id, apartment_id=apartment_id)
    db.session.add(transaction)
    db.session.commit()

    return jsonify({'message': 'Apartment assigned to user successfully'})


@app.route('/apartments/<int:apartment_id>/status-with-transaction', methods=['POST'])
def update_status(apartment_id):
    try:
        data = request.json
        transaction_type = data.get('transaction_type')
        transaction_data = data.get('transaction')
        userId = data.get('buyerId')

        apartment = Apartment.query.get_or_404(apartment_id)

        # Update status
        if transaction_type == "Rent":
            apartment.status = "Rented"
        elif transaction_type == "Sale":
            apartment.status = "Sold"
        else:
            apartment.status = "Available"    

        print(f"📌 transaction_type: {transaction_type}")
        print(f"📌 transaction_data: {transaction_data}")
        print(f"📌 buyerId: {userId}")

        # Add transaction if provided
        if transaction_data:
            transaction = Transaction(
                apartment_id=apartment_id,
                user_id=userId,
                amount=transaction_data['amount'],
                transaction_type=transaction_type,  # FIXED: correct type
                payment_method=transaction_data['payment_method'],
                status='Completed'
            )
            db.session.add(transaction)

        db.session.commit()
        return jsonify({'message': 'Status and transaction updated'})
    
    except Exception as e:
        db.session.rollback()
        print(f"❌ DB ERROR: {e}")
        return jsonify({'message': 'Database error', 'error': str(e)}), 500





@app.route('/api/remove-apartment-buyer', methods=['POST'])
def remove_apartment_buyer():
    data = request.get_json()
    Transaction.query.filter_by(apartment_id=data['apartment_id']).delete()
    db.session.commit()
    return jsonify({'message': 'Buyer/tenant removed'})



if __name__ == '__main__':
    app.run(debug=True)