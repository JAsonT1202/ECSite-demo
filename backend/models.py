# models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class ProductModel(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    category = Column(String)
    stock = Column(Integer)
    addedBy = Column(String, index=True)
    description = Column(String, default="")  # 新增：描述
    imageUrl = Column(String, default="")     # 新增：图片链接

class UserModel(Base):
    __tablename__ = "users"
    username = Column(String, primary_key=True, index=True)  # 唯一标识，全局唯一
    password = Column(String)  # ✅ 新增
    role = Column(String)  # 角色：只能为 "customer" 或 "merchant"

class CartItemModel(Base):
    __tablename__ = "cart_items"
    id = Column(String, primary_key=True, index=True)  # 使用 uuid 字符串
    username = Column(String, ForeignKey("users.username"))
    productId = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    product = relationship("ProductModel")

class OrderModel(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, index=True)
    username = Column(String, ForeignKey("users.username"))
    created_at = Column(String)
    items = relationship("OrderItemModel", back_populates="order", cascade="all, delete-orphan")

class OrderItemModel(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"))
    productId = Column(Integer)
    quantity = Column(Integer)
    order = relationship("OrderModel", back_populates="items")
