# schemas.py
from pydantic import BaseModel
from typing import List, Optional

# 商品相关
class Product(BaseModel):
    id: int
    name: str
    price: float
    category: str
    stock: int
    addedBy: Optional[str] = None
    description: Optional[str] = None         # 新增
    imageUrl: Optional[str] = None            # 新增

    class Config:
        orm_mode = True

class ProductCreate(BaseModel):
    name: str
    price: float
    category: str
    stock: int
    addedBy: str
    description: Optional[str] = ""           # 新增
    imageUrl: Optional[str] = ""              # 新增

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    description: Optional[str] = None         # 新增
    imageUrl: Optional[str] = None            # 新增

class CartItemUpdate(BaseModel):
    username: str
    new_quantity: int

# 用于 PUT 请求时，包含更新字段及用户名
class ProductUpdateRequest(ProductUpdate):
    username: str

# 用户相关
class User(BaseModel):
    username: str
    role: str

    class Config:
        orm_mode = True

class UserCredentials(BaseModel):
    username: str
    password: str  # ✅ 新增
    role: str

# 用于 DELETE 请求时解析用户名
class UsernameModel(BaseModel):
    username: str

# 购物车相关
class CartItem(BaseModel):
    id: str
    username: str
    productId: int
    quantity: int
    product: Optional[Product] = None

    class Config:
        orm_mode = True

class CartItemCreate(BaseModel):
    username: str
    productId: int
    quantity: int

# 订单相关
class OrderItem(BaseModel):
    productId: int
    quantity: int

class Order(BaseModel):
    id: str
    username: str
    items: List[OrderItem]

    class Config:
        orm_mode = True

class OrderCreate(BaseModel):
    username: str
    items: List[OrderItem]
