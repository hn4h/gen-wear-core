from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from apps.api.modules.auth.database import get_db
from apps.api.modules.auth.service import get_current_user, get_current_admin_user
from apps.api.modules.auth.models import User
from apps.api.modules.products.service import (
    ProductService, CategoryService, CollectionService, TagService
)
from apps.api.modules.products.schemas import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse, ProductFilter,
    CategoryCreate, CategoryResponse, CategoryUpdate,
    CollectionCreate, CollectionResponse, CollectionUpdate, TagResponse, TagCreate, TagUpdate
)

router = APIRouter(tags=["products"])

@router.get("", response_model=ProductListResponse)
async def list_products(
    category_id: Optional[str] = Query(None),
    collection_id: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_order: Optional[str] = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List products with filtering"""
    filters = ProductFilter(
        category_id=category_id,
        collection_id=collection_id,
        tag=tag,
        min_price=min_price,
        max_price=max_price,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )
    try:
        return ProductService.list_products(db, filters)
    except Exception as e:
        print(f"Error listing products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new product (Admin only)"""
    return ProductService.create_product(db, product_data)

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    product = ProductService.get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a product (Admin only)"""
    product = ProductService.update_product(db, product_id, product_data)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a product (Admin only)"""
    if not ProductService.delete_product(db, product_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

category_router = APIRouter()

# Category Endpoints
@category_router.get("", response_model=list[CategoryResponse])
async def list_categories(db: Session = Depends(get_db)):
    """List all categories"""
    return CategoryService.list_categories(db)

@category_router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str, db: Session = Depends(get_db)):
    """Get a specific category by ID"""
    category = CategoryService.get_category(db, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category

@category_router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new category (Admin only)"""
    return CategoryService.create_category(db, category_data)

@category_router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a category (Admin only)"""
    category = CategoryService.update_category(db, category_id, category_data)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category

from sqlalchemy.exc import IntegrityError

@category_router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a category (Admin only)"""
    try:
        if not CategoryService.delete_category(db, category_id):
            raise HTTPException(status_code=404, detail="Category not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Cannot delete: {str(e.orig)}")
    except Exception as e:
        print(f"Delete category error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Collection Endpoints
collection_router = APIRouter()

@collection_router.get("", response_model=list[CollectionResponse])
async def list_collections(db: Session = Depends(get_db)):
    """List all collections"""
    return CollectionService.list_collections(db)

@collection_router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    collection_data: CollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new collection (Admin only)"""
    return CollectionService.create_collection(db, collection_data)

@collection_router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: str,
    collection_data: CollectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a collection (Admin only)"""
    collection = CollectionService.update_collection(db, collection_id, collection_data)
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found"
        )
    return collection

@collection_router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(
    collection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a collection (Admin only)"""
    try:
        if not CollectionService.delete_collection(db, collection_id):
            raise HTTPException(status_code=404, detail="Collection not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Cannot delete: {str(e.orig)}")
    except Exception as e:
        print(f"Delete collection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Tag Endpoints
tag_router = APIRouter()

@tag_router.get("", response_model=list[TagResponse])
async def list_tags(db: Session = Depends(get_db)):
    """List all tags"""
    return TagService.list_tags(db)

@tag_router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_data: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new tag (Admin only)"""
    return TagService.get_or_create_tag(db, tag_data.name)

@tag_router.put("/{tag_id}", response_model=TagResponse)
async def update_tag(
    tag_id: str,
    tag_data: TagUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a tag (Admin only)"""
    tag = TagService.update_tag(db, tag_id, tag_data)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    return tag

@tag_router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a tag (Admin only)"""
    try:
        if not TagService.delete_tag(db, tag_id):
            raise HTTPException(status_code=404, detail="Tag not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Cannot delete: {str(e.orig)}")
    except Exception as e:
        print(f"Delete tag error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
