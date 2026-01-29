from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from apps.api.modules.auth.database import Base

from sqlalchemy import Table

# Many-to-Many relationship table for Product and Tag
product_tags = Table(
    "product_tags",
    Base.metadata,
    Column("product_id", String, ForeignKey("products.id"), primary_key=True),
    Column("tag_id", String, ForeignKey("product_tags_list.id"), primary_key=True)
)

class ProductCategory(Base):
    __tablename__ = "product_categories"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    products = relationship("Product", back_populates="category")
    
    def __repr__(self):
        return f"<ProductCategory {self.name}>"

class Collection(Base):
    __tablename__ = "collections"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    season = Column(String, nullable=True) # e.g., "Summer 2024"
    year = Column(Integer, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    products = relationship("Product", back_populates="collection")

    def __repr__(self):
        return f"<Collection {self.name}>"

class Tag(Base):
    __tablename__ = "product_tags_list"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    
    # Relationship
    products = relationship("Product", secondary=product_tags, back_populates="tags")

    def __repr__(self):
        return f"<Tag {self.name}>"

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category_id = Column(String, ForeignKey("product_categories.id"), nullable=True)
    collection_id = Column(String, ForeignKey("collections.id"), nullable=True)
    image_url = Column(String, nullable=True)
    stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    category = relationship("ProductCategory", back_populates="products")
    collection = relationship("Collection", back_populates="products")
    tags = relationship("Tag", secondary=product_tags, back_populates="products")
    
    def __repr__(self):
        return f"<Product {self.name}>"
