from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import Optional
import math
from apps.api.modules.products.models import Product, ProductCategory, Collection, Tag, product_tags
from apps.api.modules.products.schemas import (
    ProductCreate, ProductUpdate, ProductFilter, ProductListResponse,
    CategoryCreate, CategoryUpdate, CollectionCreate, CollectionUpdate, TagCreate, TagUpdate
)

class ProductService:
    @staticmethod
    def create_product(db: Session, product_data: ProductCreate) -> Product:
        """Create a new product"""
        # Extract relationship data
        tags = product_data.tags
        product_data_dict = product_data.model_dump(exclude={'tags'})
        
        product = Product(**product_data_dict)
        
        # Handle tags
        if tags:
            for tag_name in tags:
                tag = TagService.get_or_create_tag(db, tag_name)
                product.tags.append(tag)
        
        db.add(product)
        db.commit()
        db.refresh(product)
        return product
    
    @staticmethod
    def update_product(db: Session, product_id: str, product_data: ProductUpdate) -> Optional[Product]:
        """Update a product"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None
        
        # Handle tags update if provided
        if product_data.tags is not None:
            product.tags = []
            for tag_name in product_data.tags:
                tag = TagService.get_or_create_tag(db, tag_name)
                product.tags.append(tag)
        
        update_data = product_data.model_dump(exclude_unset=True, exclude={'tags'})
        for field, value in update_data.items():
            setattr(product, field, value)
        
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def get_product(db: Session, product_id: str) -> Optional[Product]:
        """Get a product by ID"""
        return db.query(Product).filter(Product.id == product_id).first()
    
    @staticmethod
    def delete_product(db: Session, product_id: str) -> bool:
        """Delete a product"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return False
        
        db.delete(product)
        db.commit()
        return True
    
    @staticmethod
    def list_products(db: Session, filters: ProductFilter) -> ProductListResponse:
        """List products with filtering, sorting, and pagination"""
        query = db.query(Product)
        
        # Apply filters
        if filters.category_id:
            query = query.filter(Product.category_id == filters.category_id)
            
        if filters.collection_id:
            query = query.filter(Product.collection_id == filters.collection_id)
            
        if filters.tag:
            query = query.join(Product.tags).filter(Tag.name == filters.tag)
        
        if filters.min_price is not None:
            query = query.filter(Product.price >= filters.min_price)
        
        if filters.max_price is not None:
            query = query.filter(Product.price <= filters.max_price)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.description.ilike(search_term)
                )
            )
        
        # Count total before pagination
        total = query.count()
        
        # Apply sorting
        sort_column = getattr(Product, filters.sort_by, Product.created_at)
        if filters.sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        products = query.offset(offset).limit(filters.page_size).all()
        
        total_pages = math.ceil(total / filters.page_size) if total > 0 else 0
        
        return ProductListResponse(
            products=products,
            total=total,
            page=filters.page,
            page_size=filters.page_size,
            total_pages=total_pages
        )

class CategoryService:
    @staticmethod
    def create_category(db: Session, category_data: CategoryCreate) -> ProductCategory:
        """Create a new category"""
        category = ProductCategory(**category_data.model_dump())
        db.add(category)
        db.commit()
        db.refresh(category)
        return category
    
    @staticmethod
    def get_category(db: Session, category_id: str) -> Optional[ProductCategory]:
        """Get a category by ID"""
        return db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    
    @staticmethod
    def list_categories(db: Session) -> list[ProductCategory]:
        """List all categories"""
        return db.query(ProductCategory).all()
    
    @staticmethod
    def update_category(db: Session, category_id: str, category_data: CategoryUpdate) -> Optional[ProductCategory]:
        """Update a category"""
        category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
        if not category:
            return None
            
        update_data = category_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)
            
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def delete_category(db: Session, category_id: str) -> bool:
        """Delete a category"""
        category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
        if not category:
            return False
        
        # Check if any products use this category
        if category.products:
            raise ValueError("Cannot delete category being used by products")
            
        db.delete(category)
        db.commit()
        return True

class CollectionService:
    @staticmethod
    def create_collection(db: Session, collection_data: CollectionCreate) -> Collection:
        """Create a new collection"""
        collection = Collection(**collection_data.model_dump())
        db.add(collection)
        db.commit()
        db.refresh(collection)
        return collection
    
    @staticmethod
    def list_collections(db: Session) -> list[Collection]:
        """List all collections"""
        return db.query(Collection).all()

    @staticmethod
    def update_collection(db: Session, collection_id: str, collection_data: CollectionUpdate) -> Optional[Collection]:
        """Update a collection"""
        collection = db.query(Collection).filter(Collection.id == collection_id).first()
        if not collection:
            return None
            
        update_data = collection_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(collection, field, value)
            
        db.commit()
        db.refresh(collection)
        return collection
    
    @staticmethod
    def delete_collection(db: Session, collection_id: str) -> bool:
        """Delete a collection"""
        collection = db.query(Collection).filter(Collection.id == collection_id).first()
        if not collection:
            return False
            
        # Check if any products use this collection
        if collection.products:
            raise ValueError("Cannot delete collection being used by products")
            
        db.delete(collection)
        db.commit()
        return True

class TagService:
    @staticmethod
    def get_or_create_tag(db: Session, name: str) -> Tag:
        """Get existing tag or create new one"""
        tag = db.query(Tag).filter(Tag.name == name).first()
        if not tag:
            tag = Tag(name=name)
            db.add(tag)
            db.commit()
            db.refresh(tag)
        return tag
    
    @staticmethod
    def list_tags(db: Session) -> list[Tag]:
        """List all tags"""
        return db.query(Tag).all()

    @staticmethod
    def update_tag(db: Session, tag_id: str, tag_data: TagUpdate) -> Optional[Tag]:
        """Update a tag"""
        tag = db.query(Tag).filter(Tag.id == tag_id).first()
        if not tag:
            return None
            
        tag.name = tag_data.name
        db.commit()
        db.refresh(tag)
        return tag
    
    @staticmethod
    def delete_tag(db: Session, tag_id: str) -> bool:
        """Delete a tag"""
        tag = db.query(Tag).filter(Tag.id == tag_id).first()
        if not tag:
            return False
            
        # Check if any products use this tag
        # Since it's many-to-many, we check the relationship
        if tag.products:
             raise ValueError("Cannot delete tag being used by products")

        db.delete(tag)
        db.commit()
        return True
