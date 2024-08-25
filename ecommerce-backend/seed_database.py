from app import app, db, Product
import json

def seed_products():
   with app.app_context():
      # Clear existing products
      db.session.query(Product).delete()
      db.session.commit()

      # Load product data from JSON file
      with open('product_data.json', 'r') as f:
         products_data = json.load(f)

      # Insert products into database
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
      print("Database seeded successfully!")

if __name__ == "__main__":
   seed_products()