# main.py
from fastapi import FastAPI, HTTPException, Depends, Body, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
import schemas
import crud
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List
import os
from uuid import uuid4
import bcrypt  # ✅ 必须添加这一行

# -----------------------
# 初始化与静态文件服务
# -----------------------

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 确保上传目录存在
os.makedirs("uploads", exist_ok=True)

app = FastAPI()

# 静态文件挂载，供访问上传的图片/PDF
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 添加 CORS 支持（允许所有来源）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 获取数据库 session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------
# 商品接口
# -----------------------

@app.get("/products", response_model=List[schemas.Product])
def get_products(db: Session = Depends(get_db)):
    return crud.get_products(db)

@app.post("/products", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, product)

@app.post("/products/upload", response_model=schemas.Product)
def create_product_with_file(
    name: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    stock: int = Form(...),
    addedBy: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 保存文件
    file_ext = file.filename.split(".")[-1]
    save_name = f"{uuid4()}.{file_ext}"
    save_path = os.path.join("uploads", save_name)

    with open(save_path, "wb") as f:
        f.write(file.file.read())

    # 存储路径（相对路径用于访问）
    image_url = f"uploads/{save_name}"

    product = schemas.ProductCreate(
        name=name,
        price=price,
        category=category,
        stock=stock,
        addedBy=addedBy,
        imageUrl=image_url
    )
    return crud.create_product(db, product)

@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    payload: schemas.UsernameModel = Body(...),
    db: Session = Depends(get_db)
):
    result = crud.delete_product(db, product_id, payload.username)
    if result is None:
        raise HTTPException(status_code=404, detail="商品不存在")
    if result is False:
        raise HTTPException(status_code=403, detail="没有权限删除该商品")
    return {"success": True}

@app.put("/products/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    update_req: schemas.ProductUpdateRequest = Body(...),
    db: Session = Depends(get_db)
):
    update_data = update_req.dict(exclude_unset=True, exclude={"username"})
    product = crud.update_product(db, product_id, update_data, update_req.username)
    if product is None:
        raise HTTPException(status_code=404, detail="商品不存在")
    if product is False:
        raise HTTPException(status_code=403, detail="没有权限修改该商品")
    return product

@app.post("/upload-file")
def upload_file(file: UploadFile = File(...)):
    file_ext = file.filename.split(".")[-1]
    save_name = f"{uuid4()}.{file_ext}"
    save_path = os.path.join("uploads", save_name)

    with open(save_path, "wb") as f:
        f.write(file.file.read())

    return {"imageUrl": f"uploads/{save_name}"}

# -----------------------
# 用户注册与登录
# -----------------------

@app.post("/register", response_model=schemas.User)
def register(user_data: schemas.UserCredentials, db: Session = Depends(get_db)):
    if crud.get_user(db, user_data.username):
        raise HTTPException(status_code=400, detail="用户已存在")
    return crud.create_user(db, user_data)

@app.post("/login", response_model=schemas.User)
def login(credentials: schemas.UserCredentials, db: Session = Depends(get_db)):
    user = crud.get_user(db, credentials.username)
    if not user:
        raise HTTPException(status_code=400, detail="用户不存在，请先注册")
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user.password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="密码错误")
    if user.role != credentials.role:
        raise HTTPException(status_code=400, detail="该用户名已注册为其他角色")
    return user


# -----------------------
# 购物车接口
# -----------------------

@app.get("/cart", response_model=List[schemas.CartItem])
def get_cart(username: str = Query(...), db: Session = Depends(get_db)):
    return crud.get_cart_items(db, username)

@app.post("/cart", response_model=schemas.CartItem)
def add_cart_item(cart_item: schemas.CartItemCreate, db: Session = Depends(get_db)):
    return crud.add_cart_item(db, cart_item)

@app.delete("/cart/{cart_item_id}")
def delete_cart_item(
    cart_item_id: str,
    payload: schemas.UsernameModel = Body(...),
    db: Session = Depends(get_db)
):
    result = crud.delete_cart_item(db, cart_item_id, payload.username)
    if result is None:
        raise HTTPException(status_code=404, detail="购物车项不存在")
    if result is False:
        raise HTTPException(status_code=403, detail="没有权限删除该购物车项")
    return {"success": True}

@app.put("/cart/{cart_item_id}", response_model=schemas.CartItem)
def update_cart_item(cart_item_id: str, payload: schemas.CartItemUpdate, db: Session = Depends(get_db)):
    result = crud.update_cart_item(db, cart_item_id, payload.username, payload.new_quantity)
    if result is None:
        raise HTTPException(status_code=404, detail="购物车项不存在")
    if result is False:
        raise HTTPException(status_code=403, detail="没有权限更新该购物车项")
    return result
    
# -----------------------
# 订单接口（含库存扣减与购物车清空）
# -----------------------

@app.post("/orders", response_model=schemas.Order)
def place_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    try:
        new_order = crud.create_order(db, order)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    order_items = db.query(models.OrderItemModel).filter(
        models.OrderItemModel.order_id == new_order.id
    ).all()
    return schemas.Order(
        id=new_order.id,
        username=new_order.username,
        items=[
            schemas.OrderItem(productId=item.productId, quantity=item.quantity)
            for item in order_items
        ]
    )
