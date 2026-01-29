from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

# Collection Schemas
class CollectionBase(BaseModel):
    name: str
    description: Optional[str] = None
    season: Optional[str] = None
    year: Optional[int] = None

class CollectionCreate(CollectionBase):
    pass

class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    season: Optional[str] = None
    year: Optional[int] = None

class CollectionResponse(CollectionBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Tag Schemas
class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagUpdate(BaseModel):
    name: Optional[str] = None

class TagResponse(TagBase):
    id: str
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(gt=0, description="Price must be greater than 0")
    category_id: Optional[str] = None
    collection_id: Optional[str] = None
    image_url: Optional[str] = None
    stock: int = Field(ge=0, default=0, description="Stock must be non-negative")

class ProductCreate(ProductBase):
    tags: Optional[list[str]] = Field(default=[], description="List of tag names")

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category_id: Optional[str] = None
    collection_id: Optional[str] = None
    image_url: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    tags: Optional[list[str]] = None

class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    collection: Optional[CollectionResponse] = None
    tags: list[TagResponse] = []
    
    class Config:
        from_attributes = True

# Pagination and Filtering
class ProductFilter(BaseModel):
    category_id: Optional[str] = None
    collection_id: Optional[str] = None
    tag: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    search: Optional[str] = None
    sort_by: Optional[str] = Field(None, description="Sort by: name, price, created_at")
    sort_order: Optional[str] = Field("asc", description="Sort order: asc or desc")
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)

class ProductListResponse(BaseModel):
    products: list[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
