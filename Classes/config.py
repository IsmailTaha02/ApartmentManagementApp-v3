# config.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

# Initialize db and migrate instances
db = SQLAlchemy()
migrate = Migrate()

def configure_app(app):
    """Configure app with database and other settings."""
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Aa123123123.@localhost/apartmentmanagementdb'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    migrate.init_app(app, db)

    # Import models after initializing db
    from Classes.User import User
    from Classes.Apartment import Apartment
    from Classes.MaintenanceRequest import MaintenanceRequest

    CORS(app)
