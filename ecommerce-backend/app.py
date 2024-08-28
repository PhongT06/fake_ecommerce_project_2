from flask import Flask, jsonify, request, session, current_app
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import or_
from marshmallow import ValidationError, fields
import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
import stripe
from functools import wraps
from flask import abort
import json
import traceback
import logging


# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": [
   "https://main--neoversemarketplace.netlify.app",
   "https://neoversemarketplace.netlify.app",
   "http://localhost:3000"
]}})
bcrypt = Bcrypt(app)

####  Configuration ####
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///ecommerce.db')
if app.config['SQLALCHEMY_DATABASE_URI'].startswith("postgres://"):
   app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string-the-second')  
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

db = SQLAlchemy(app)
ma = Marshmallow(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
migrate = Migrate(app, db)

#### Stripe configuration ####
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

if not stripe.api_key:
   raise ValueError("No Stripe API key set. Please set the STRIPE_SECRET_KEY environment variable.")

FAKESTORE_API_URL = "https://fakestoreapi.com"

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


#### Helper function to check if a user is an admin ####
def admin_required(fn):
   @wraps(fn)
   def wrapper(*args, **kwargs):
      current_user_id = get_jwt_identity()
      user = User.query.get(current_user_id)
      if not user or user.role != 'admin':
         return jsonify({"msg": "Admin access required"}), 403
      return fn(*args, **kwargs)
   return wrapper

#### Create admin user ####
def create_admin_user(username, email, password):
   # Check if user already exists
   existing_user = User.query.filter_by(username=username).first()
   if existing_user:
      return "User already exists"

   # Create new admin user
   hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
   new_admin = User(username=username, email=email, password=hashed_password, role='admin')
   
   db.session.add(new_admin)
   db.session.commit()
   
   return "Admin user created successfully"


####  Models  ####
class User(db.Model):
   id = db.Column(db.Integer, primary_key=True)
   username = db.Column(db.String(80), unique=True, nullable=False)
   email = db.Column(db.String(120), unique=True, nullable=False)
   password = db.Column(db.String(255), nullable=False)
   role = db.Column(db.String(20), default='user')
   firstname = db.Column(db.String(80))
   lastname = db.Column(db.String(80))
   address = db.Column(db.String(255))
   phone = db.Column(db.String(20))

class Product(db.Model):
   id = db.Column(db.Integer, primary_key=True)
   title = db.Column(db.String(200), nullable=False)
   price = db.Column(db.Float, nullable=False)
   description = db.Column(db.Text)
   category = db.Column(db.String(100))
   image = db.Column(db.String(200))
   rating = db.Column(db.Float)
   rating_count = db.Column(db.Integer)

class Cart(db.Model):
   id = db.Column(db.Integer, primary_key=True)
   user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
   created_at = db.Column(db.DateTime, default=datetime.utcnow)
   items = db.relationship('CartItem', backref='cart', lazy=True)

class CartItem(db.Model):
   id = db.Column(db.Integer, primary_key=True)
   cart_id = db.Column(db.Integer, db.ForeignKey('cart.id'), nullable=False)
   product_id = db.Column(db.Integer, nullable=False)
   quantity = db.Column(db.Integer, nullable=False)

class Order(db.Model):
   id = db.Column(db.Integer, primary_key=True)
   user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
   total_amount = db.Column(db.Float, nullable=False)
   status = db.Column(db.String(20), default='pending')
   shipping_address = db.Column(db.String(255), nullable=False)
   created_at = db.Column(db.DateTime, default=datetime.utcnow)
   status = db.Column(db.String(20), default='pending')

class OrderItem(db.Model):
   id = db.Column(db.Integer, primary_key=True)
   order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
   product_id = db.Column(db.Integer, nullable=False)
   quantity = db.Column(db.Integer, nullable=False)
   price = db.Column(db.Float, nullable=False)
   title = db.Column(db.String(200), nullable=True)


####  Schemas  ####
class UserSchema(ma.Schema):
   class Meta:
      fields = ("id", "username", "email", "firstname", "lastname", "address", "phone")

class ProductSchema(ma.Schema):
   class Meta:
      fields = ("id", "title", "price", "description", "category", "image")

class CartItemSchema(ma.Schema):
   class Meta:
      fields = ("id", "product_id", "quantity")

class CartSchema(ma.Schema):
   items = fields.Nested(CartItemSchema, many=True)
   class Meta:
      fields = ("id", "user_id", "created_at", "items")

user_schema = UserSchema()
users_schema = UserSchema(many=True)
cart_schema = CartSchema()
product_schema = ProductSchema()
products_schema = ProductSchema(many=True)

####### Seed products###################
def seed_products():
   logger.info("Attempting to seed products...")
   if Product.query.count() == 0:
      current_dir = os.path.dirname(os.path.abspath(__file__))
      json_file_path = os.path.join(current_dir, 'product_data.json')
      
      if not os.path.exists(json_file_path):
         logger.error(f"product_data.json not found at {json_file_path}")
         return
      
      with open(json_file_path, 'r') as f:
         products_data = json.load(f)
      
      for product_data in products_data:
         product = Product(
               title=product_data['title'],
               price=product_data['price'],
               description=product_data['description'],
               category=product_data['category'],
               image=product_data['image'],
               rating=product_data['rating']['rate'],
               rating_count=product_data['rating']['count']
         )
         db.session.add(product)
      
      db.session.commit()
      logger.info(f"Added {len(products_data)} products to the database")
   else:
      logger.info(f"Database already contains {Product.query.count()} products. Skipping seeding.")

def init_db():
   logger.info("Initializing database...")
   with app.app_context():
      db.create_all()
      seed_products()
   logger.info("Database initialization completed.")

# Call init_db()
init_db()

#### Helper function for API requests ####
def make_api_request(endpoint, method='GET', data=None, params=None):
   url = f"{FAKESTORE_API_URL}/{endpoint}"
   try:
      if method == 'GET':
         response = requests.get(url, params=params)
      elif method in ['POST', 'PUT', 'PATCH']:
         response = requests.request(method, url, json=data)
      elif method == 'DELETE':
         response = requests.delete(url)
      response.raise_for_status()
      return response.json()
   except requests.exceptions.RequestException as e:
      return {"message": f"Error: {str(e)}"}, 500

#### Products ####
@app.route('/api/products', methods=['GET'])
def get_products():
   limit = request.args.get('limit', type=int)
   sort = request.args.get('sort')
   
   query = Product.query

   if sort:
      if sort == 'desc':
         query = query.order_by(Product.id.desc())
      elif sort == 'asc':
         query = query.order_by(Product.id.asc())

   if limit:
      query = query.limit(limit)

   products = query.all()
   
   return jsonify([{
      'id': p.id,
      'title': p.title,
      'price': p.price,
      'description': p.description,
      'category': p.category,
      'image': p.image,
      'rating': {
         'rate': p.rating,
         'count': p.rating_count
      }
   } for p in products])

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
   product = Product.query.get_or_404(product_id)
   return jsonify({
      'id': product.id,
      'title': product.title,
      'price': product.price,
      'description': product.description,
      'category': product.category,
      'image': product.image,
      'rating': {
         'rate': product.rating,
         'count': product.rating_count
      }
   })

@app.route('/api/products/categories', methods=['GET'])
def get_categories():
   categories = db.session.query(Product.category).distinct().all()
   return jsonify([category[0] for category in categories])

@app.route('/api/products/category/<category>', methods=['GET'])
def get_products_in_category(category):
   products = Product.query.filter_by(category=category).all()
   return jsonify([{
      'id': p.id,
      'title': p.title,
      'price': p.price,
      'description': p.description,
      'category': p.category,
      'image': p.image,
      'rating': {
         'rate': p.rating,
         'count': p.rating_count
      }
   } for p in products])

##### Search ##########

@app.route('/api/products/search', methods=['GET'])
def search_products():
   query = request.args.get('q', '')
   category = request.args.get('category', '')
   # Start with a base query
   products_query = Product.query

   # Add search condition if query is provided
   if query:
         products_query = products_query.filter(
               or_(
                  Product.title.ilike(f'%{query}%'),
                  Product.description.ilike(f'%{query}%'),
                  Product.category.ilike(f'%{query}%')
               )
         )

   # Add category filter if category is provided
   if category and category.lower() != query:
      products_query = products_query.filter(Product.category == category)

   # Execute the query
   products = products_query.all()

   return jsonify([{
      'id': p.id,
      'title': p.title,
      'price': p.price,
      'description': p.description,
      'category': p.category,
      'image': p.image,
      'rating': {
         'rate': p.rating,
         'count': p.rating_count
      }
   } for p in products])

@app.route('/api/all-categories', methods=['GET'])
def get_all_categories():
   categories = db.session.query(Product.category).distinct().all()
   return jsonify([category[0] for category in categories])

#### Carts ####
@app.route('/api/carts', methods=['GET', 'POST'])
def handle_carts():
   if request.method == 'GET':
      limit = request.args.get('limit')
      sort = request.args.get('sort')
      startdate = request.args.get('startdate')
      enddate = request.args.get('enddate')
      params = {}
      if limit:
         params['limit'] = limit
      if sort:
         params['sort'] = sort
      if startdate:
         params['startdate'] = startdate
      if enddate:
         params['enddate'] = enddate
      return jsonify(make_api_request('carts', params=params))
   elif request.method == 'POST':
      return jsonify(make_api_request('carts', method='POST', data=request.json))

@app.route('/api/carts/<int:cart_id>', methods=['GET', 'PUT', 'PATCH', 'DELETE'])
def handle_cart(cart_id):
   if request.method == 'GET':
      return jsonify(make_api_request(f'carts/{cart_id}'))
   elif request.method in ['PUT', 'PATCH']:
      return jsonify(make_api_request(f'carts/{cart_id}', method=request.method, data=request.json))
   elif request.method == 'DELETE':
      return jsonify(make_api_request(f'carts/{cart_id}', method='DELETE'))

@app.route('/api/carts/user/<int:user_id>', methods=['GET'])
def get_user_carts(user_id):
   return jsonify(make_api_request(f'carts/user/{user_id}'))

#### Users ####
@app.route('/api/users', methods=['GET', 'POST'])
@jwt_required()
def handle_users():
   if request.method == 'GET':
      limit = request.args.get('limit')
      sort = request.args.get('sort')
      params = {}
      if limit:
         params['limit'] = limit
      if sort:
         params['sort'] = sort
      return jsonify(make_api_request('users', params=params))
   elif request.method == 'POST':
      return jsonify(make_api_request('users', method='POST', data=request.json))

@app.route('/api/users/<int:user_id>', methods=['GET', 'PUT', 'PATCH', 'DELETE'])
@jwt_required()
def handle_user(user_id):
   if request.method == 'GET':
      return jsonify(make_api_request(f'users/{user_id}'))
   elif request.method in ['PUT', 'PATCH']:
      return jsonify(make_api_request(f'users/{user_id}', method=request.method, data=request.json))
   elif request.method == 'DELETE':
      return jsonify(make_api_request(f'users/{user_id}', method='DELETE'))
   
@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
   current_user_id = get_jwt_identity()
   user = User.query.get(current_user_id)
   if not user:
      return jsonify({"message": "User not found"}), 404
   return jsonify({
      "id": user.id,
      "username": user.username,
      "email": user.email,
      "role": user.role,
      "firstname": user.firstname,
      "lastname": user.lastname,
      "address": user.address,
      "phone": user.phone
   }), 200

@app.route('/api/user/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
   current_user_id = get_jwt_identity()
   user = User.query.get(current_user_id)
   if not user:
      return jsonify({"message": "User not found"}), 404
   
   data = request.json
   user.firstname = data.get('firstname', user.firstname)
   user.lastname = data.get('lastname', user.lastname)
   user.address = data.get('address', user.address)
   user.phone = data.get('phone', user.phone)

   if 'email' in data and data['email'] != user.email:
      if User.query.filter_by(email=data['email']).first():
         return jsonify({"message": "Email already in use"}), 400
      user.email = data['email']

   db.session.commit()
   return jsonify({"message": "Profile updated successfully"}), 200

@app.route('/api/user/change-password', methods=['POST'])
@jwt_required()
def change_password():
   current_user_id = get_jwt_identity()
   user = User.query.get(current_user_id)
   if not user:
      return jsonify({"message": "User not found"}), 404

   data = request.json
   if not bcrypt.check_password_hash(user.password, data['current_password']):
      return jsonify({"message": "Current password is incorrect"}), 400

   user.password = bcrypt.generate_password_hash(data['new_password']).decode('utf-8')
   db.session.commit()
   return jsonify({"message": "Password changed successfully"}), 200

@app.route('/api/user/orders', methods=['GET'])
@jwt_required()
def get_user_orders():
   current_user_id = get_jwt_identity()
   orders = Order.query.filter_by(user_id=current_user_id).order_by(Order.created_at.desc()).all()
   
   return jsonify([{
      'id': order.id,
      'total_amount': order.total_amount,
      'status': order.status,
      'shipping_address': order.shipping_address,
      'created_at': order.created_at.isoformat(),
      'items': [{
         'product_id': item.product_id,
         'quantity': item.quantity,
         'price': item.price,
         'title': item.title
      } for item in OrderItem.query.filter_by(order_id=order.id).all()]
   } for order in orders]), 200

#### Authentication routes ####
@app.route('/api/auth/login', methods=['POST'])
def login():
   data = request.json
   username = data.get('username')
   password = data.get('password')
   
   user = User.query.filter_by(username=username).first()
   if user and bcrypt.check_password_hash(user.password, password):
      access_token = create_access_token(identity=user.id)
      return jsonify({
         "message": "Login successful", 
         "token": access_token,
         "user": {
               "id": user.id,
               "username": user.username,
               "email": user.email,
               "role": user.role
         }
      }), 200
   
   return jsonify({"message": "Invalid username or password"}), 401

@app.route('/api/auth/register', methods=['POST'])
def register():
   data = request.json
   required_fields = ['username', 'email', 'password']
   
   # Check for missing fields
   missing_fields = [field for field in required_fields if field not in data]
   if missing_fields:
      return jsonify({"message": f"Missing required fields: {', '.join(missing_fields)}"}), 400

   # Check if user already exists
   if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
      return jsonify({"message": "Username or email already exists"}), 400
   
   try:
      hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
      new_user = User(
         username=data['username'],
         email=data['email'],
         password=hashed_password,
         firstname=data.get('firstname'),
         lastname=data.get('lastname')
      )
      db.session.add(new_user)
      db.session.commit()
      
      access_token = create_access_token(identity=new_user.id)
      return jsonify({"message": "User registered successfully", "token": access_token}), 201
   except Exception as e:
      db.session.rollback()
      print(f"Registration error: {str(e)}")  # Log the error
      return jsonify({"message": f"Registration failed: {str(e)}"}), 500


@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
   # JWT doesn't maintain server-side sessions, so we don't need to do anything here
   return jsonify({"message": "Logged out successfully"}), 200

#### Custom cart management ####
@app.route('/api/user/cart', methods=['GET', 'POST', 'PUT', 'DELETE'])
@jwt_required()
def manage_user_cart():
   current_user_id = get_jwt_identity()
   
   if request.method == 'GET':
      cart = Cart.query.filter_by(user_id=current_user_id).order_by(Cart.created_at.desc()).first()
      if not cart:
         return jsonify({"message": "Cart is empty", "items": []}), 200
      
      cart_items = CartItem.query.filter_by(cart_id=cart.id).all()
      items = []
      for item in cart_items:
         # Fetch product details from our database instead of FakeStore API
         product = Product.query.get(item.product_id)
         if product:
            items.append({
               "product_id": item.product_id,
               "title": product.title,
               "price": float(product.price),
               "quantity": item.quantity,
               "image": product.image,
               "description": product.description[:100] + '...' if len(product.description) > 100 else product.description,
               "category": product.category
            })
         else:
            print(f"Failed to fetch product {item.product_id} from database")

      return jsonify({
         "id": cart.id,
         "user_id": cart.user_id,
         "created_at": cart.created_at.isoformat(),
         "items": items
      }), 200

   elif request.method == 'POST':
      data = request.json
      product_id = data.get('product_id')
      quantity = data.get('quantity', 1)
      print(f"Adding to cart: Product ID {product_id}, Quantity {quantity}")  # Debugging

      if not product_id:
         return jsonify({"message": "Product ID is required"}), 400
      if not isinstance(quantity, int) or quantity < 1:
         return jsonify({"message": "Quantity must be a positive integer"}), 400

      cart = Cart.query.filter_by(user_id=current_user_id).order_by(Cart.created_at.desc()).first()
      if not cart:
         cart = Cart(user_id=current_user_id)
         db.session.add(cart)
         db.session.commit()

      cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
      if cart_item:
         cart_item.quantity += quantity
      else:
         cart_item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
         db.session.add(cart_item)

      db.session.commit()

      # Fetch the product details from our database
      product = Product.query.get(product_id)
      if not product:
         return jsonify({"message": "Product not found"}), 404

      return jsonify({
         "message": f"{product.title} added to cart successfully",
         "product_id": product_id,
         "quantity": quantity
      }), 201

   elif request.method == 'PUT':
      data = request.json
      product_id = data.get('product_id')
      quantity = data.get('quantity')

      if not product_id or quantity is None:
         return jsonify({"message": "Product ID and quantity are required"}), 400
      if not isinstance(quantity, int) or quantity < 0:
         return jsonify({"message": "Quantity must be a non-negative integer"}), 400

      cart = Cart.query.filter_by(user_id=current_user_id).order_by(Cart.created_at.desc()).first()
      if not cart:
         return jsonify({"message": "Cart not found"}), 404

      cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
      if not cart_item:
         return jsonify({"message": "Product not found in cart"}), 404

      if quantity == 0:
         db.session.delete(cart_item)
      else:
         cart_item.quantity = quantity

      db.session.commit()
      return jsonify({"message": "Cart updated successfully"}), 200

   elif request.method == 'DELETE':
      cart = Cart.query.filter_by(user_id=current_user_id).order_by(Cart.created_at.desc()).first()
      if cart:
         CartItem.query.filter_by(cart_id=cart.id).delete()
         db.session.delete(cart)
         db.session.commit()
      return jsonify({"message": "Cart cleared successfully"}), 200
   
#### Checkout and Orders ####
@app.route('/api/checkout/create-payment-intent', methods=['POST'])
@jwt_required()
def create_payment_intent():
   try:
      data = request.json
      amount = int(data.get('amount', 0))  # Amount should be in cents

      if amount <= 0:
         return jsonify({"error": "Invalid amount"}), 400

      intent = stripe.PaymentIntent.create(
         amount=amount,
         currency='usd',
         automatic_payment_methods={
               'enabled': True,
         },
      )

      return jsonify({
         'clientSecret': intent.client_secret
      })
   except stripe.error.StripeError as e:
      return jsonify(error=str(e)), 403
   except Exception as e:
      app.logger.error(f"Error creating payment intent: {str(e)}")
      return jsonify(error="An unexpected error occurred"), 500

@app.route('/api/orders', methods=['POST'])
@jwt_required()
def create_order():
   current_user_id = get_jwt_identity()
   data = request.json

   new_order = Order(
      user_id=current_user_id,
      total_amount=data['total_amount'],
      shipping_address=data['shipping_address']
   )
   db.session.add(new_order)
   db.session.commit()

   for item in data['items']:
      order_item = OrderItem(
         order_id=new_order.id,
         product_id=item['product_id'],
         quantity=item['quantity'],
         price=item['price'],
         title=item.get('title', '')
      )
      db.session.add(order_item)
   
   db.session.commit()

   return jsonify({'message': 'Order created successfully', 'order_id': new_order.id}), 201

@app.route('/api/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
   current_user_id = get_jwt_identity()
   order = Order.query.filter_by(id=order_id, user_id=current_user_id).first()
   
   if not order:
      return jsonify({'message': 'Order not found'}), 404

   order_items = OrderItem.query.filter_by(order_id=order.id).all()
   
   return jsonify({
      'id': order.id,
      'total_amount': order.total_amount,
      'status': order.status,
      'shipping_address': order.shipping_address,
      'created_at': order.created_at.isoformat(),
      'items': [{
         'product_id': item.product_id,
         'quantity': item.quantity,
         'price': item.price,
         'title': item.title 
      } for item in order_items]
   }), 200

@app.route('/api/orders/<int:order_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_order(order_id):
   current_user_id = get_jwt_identity()
   order = Order.query.filter_by(id=order_id, user_id=current_user_id).first()
   
   if not order:
      abort(404, description="Order not found")
   
   if order.status not in ['pending', 'processing']:
      abort(400, description="Order cannot be cancelled")
   
   order.status = 'cancelled'
   db.session.commit()
   
   return jsonify({'message': 'Order cancelled successfully'}), 200

#### Admin routes ####
@app.route('/api/admin/products', methods=['GET', 'POST'])
@jwt_required()
@admin_required
def admin_products():
   if request.method == 'GET':
      products = Product.query.all()
      return jsonify(products_schema.dump(products))
   elif request.method == 'POST':
      data = request.json
      new_product = Product(
         title=data['title'],
         price=data['price'],
         description=data.get('description'),
         category=data.get('category'),
         image=data.get('image')
      )
      db.session.add(new_product)
      db.session.commit()
      return jsonify(product_schema.dump(new_product)), 201

@app.route('/api/admin/products/<int:product_id>', methods=['PUT', 'DELETE'])
@jwt_required()
@admin_required
def admin_product(product_id):
   product = Product.query.get_or_404(product_id)
   if request.method == 'PUT':
      data = request.json
      product.title = data.get('title', product.title)
      product.price = data.get('price', product.price)
      product.description = data.get('description', product.description)
      product.category = data.get('category', product.category)
      product.image = data.get('image', product.image)
      db.session.commit()
      return jsonify(product_schema.dump(product))
   elif request.method == 'DELETE':
      db.session.delete(product)
      db.session.commit()
      return '', 204

@app.route('/api/admin/orders', methods=['GET'])
@jwt_required()
@admin_required
def admin_orders():
   orders = Order.query.all()
   return jsonify([{
      'id': order.id,
      'user_id': order.user_id,
      'total_amount': order.total_amount,
      'status': order.status,
      'created_at': order.created_at
   } for order in orders])

@app.route('/api/admin/orders/<int:order_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_order_status(order_id):
   order = Order.query.get_or_404(order_id)
   data = request.json
   order.status = data.get('status', order.status)
   db.session.commit()
   return jsonify({
      'id': order.id,
      'user_id': order.user_id,
      'total_amount': order.total_amount,
      'status': order.status,
      'created_at': order.created_at
   })

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
@admin_required
def admin_users():
   users = User.query.all()
   return jsonify([user_schema.dump(user) for user in users])

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def admin_user(user_id):
   user = User.query.get_or_404(user_id)
   data = request.json
   user.role = data.get('role', user.role)
   db.session.commit()
   return jsonify(user_schema.dump(user))

# You can call this function from a Flask CLI command
@app.cli.command("create-admin")
def create_admin_command():
   username = input("Enter admin username: ")
   email = input("Enter admin email: ")
   password = input("Enter admin password: ")
   result = create_admin_user(username, email, password)
   print(result)

# Alternatively, create a route to create an admin (Do not do this in production)
@app.route('/api/create-admin', methods=['POST'])
def create_admin_route():
   data = request.json
   result = create_admin_user(data['username'], data['email'], data['password'])
   return jsonify({"message": result})

@app.route('/api/admin/make-admin/<int:user_id>', methods=['POST'])
@jwt_required()
@admin_required
def make_admin(user_id):
   user = User.query.get_or_404(user_id)
   user.role = 'admin'
   db.session.commit()
   return jsonify({"message": f"User {user.username} is now an admin"}), 200

# Temporary route to make the first user admin (remove in production)
@app.route('/api/make-first-admin', methods=['POST'])
def make_first_admin():
   user = User.query.first()
   if user:
      user.role = 'admin'
      db.session.commit()
      return jsonify({"message": f"User {user.username} is now an admin"}), 200
   return jsonify({"message": "No users found"}), 404

@app.route('/')
def home():
   return "NeoVerse Market API is running!"

def init_db():
   with app.app_context():
      db.create_all()
      seed_products()

@app.route('/api/seed-products', methods=['POST'])
def seed_products_route():
   try:
      current_app.logger.info("Starting product seeding process")
      seed_products()
      count = Product.query.count()
      return jsonify({"message": "Products seeded successfully", "count": count}), 200
   except Exception as e:
      current_app.logger.error(f"Error seeding products: {str(e)}")
      current_app.logger.error(traceback.format_exc())
      return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route('/api/debug/files', methods=['GET'])
def debug_files():
   current_dir = os.path.dirname(os.path.abspath(__file__))
   files = os.listdir(current_dir)
   return jsonify({"files": files, "current_dir": current_dir})

@app.route('/api/product-count', methods=['GET'])
def get_product_count():
   try:
      count = Product.query.count()
      current_app.logger.info(f"Product count: {count}")
      return jsonify({"product_count": count}), 200
   except Exception as e:
      current_app.logger.error(f"Error getting product count: {str(e)}")
      return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
   init_db()
   app.run(debug=True)

#### Create database tables ####
with app.app_context():
   db.create_all()

if __name__ == '__main__':
   app.run(debug=True)