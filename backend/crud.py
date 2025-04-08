# crud.py
from sqlalchemy.orm import Session
from models import (
    ProductModel,
    UserModel,
    CartItemModel,
    OrderModel,
    OrderItemModel
)
from schemas import (
    ProductCreate,
    ProductUpdate,
    UserCredentials,
    CartItemCreate,
    OrderCreate
)
from uuid import uuid4
import datetime
import bcrypt
# -----------------------
# 商品相关 CRUD
# -----------------------

def get_products(db: Session):
    return db.query(ProductModel).all()

def create_product(db: Session, product: ProductCreate):
    db_product = ProductModel(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int, username: str):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        return None
    if product.addedBy != username:
        return False
    db.delete(product)
    db.commit()
    return True

def update_product(db: Session, product_id: int, update_data: dict, username: str):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        return None
    if product.addedBy != username:
        return False
    for key, value in update_data.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

# -----------------------
# 用户相关 CRUD
# -----------------------

def get_user(db: Session, username: str):
    return db.query(UserModel).filter(UserModel.username == username).first()

def create_user(db: Session, user_data: UserCredentials):
    hashed_pw = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
    db_user = UserModel(username=user_data.username, password=hashed_pw.decode('utf-8'), role=user_data.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# -----------------------
# 购物车相关 CRUD
# -----------------------

def get_cart_items(db: Session, username: str):
    return db.query(CartItemModel).filter(CartItemModel.username == username).all()

def add_cart_item(db: Session, cart_item: CartItemCreate):
    db_item = CartItemModel(id=str(uuid4()), **cart_item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_cart_item(db: Session, cart_item_id: str, username: str, new_quantity: int):
    item = db.query(CartItemModel).filter(CartItemModel.id == cart_item_id).first()
    if not item:
        return None
    if item.username != username:
        return False
    item.quantity = new_quantity
    db.commit()
    db.refresh(item)
    return item

def delete_cart_item(db: Session, cart_item_id: str, username: str):
    item = db.query(CartItemModel).filter(CartItemModel.id == cart_item_id).first()
    if not item:
        return None
    if item.username != username:
        return False
    db.delete(item)
    db.commit()
    return True

# -----------------------
# 订单相关 CRUD（含库存扣减与购物车清空）
# -----------------------

def create_order(db: Session, order_data: OrderCreate):
    # 1. 创建订单记录
    new_order = OrderModel(
        id=str(uuid4()),
        username=order_data.username,
        created_at=datetime.datetime.utcnow().isoformat()
    )
    db.add(new_order)
    db.commit()

    # 2. 为每个订单项创建记录并扣减库存
    for item in order_data.items:
        # 检查库存
        product = db.query(ProductModel).filter(ProductModel.id == item.productId).first()
        if not product:
            raise Exception(f"商品 {item.productId} 不存在")
        if product.stock < item.quantity:
            raise Exception(f"商品 {product.name} 库存不足")
        # 扣库存
        product.stock -= item.quantity
        # 添加订单项
        order_item = OrderItemModel(
            order_id=new_order.id,
            productId=item.productId,
            quantity=item.quantity
        )
        db.add(order_item)

    db.commit()
    db.refresh(new_order)

    # 3. 清空该用户的购物车
    db.query(CartItemModel).filter(CartItemModel.username == order_data.username).delete()
    db.commit()

    return new_order
