## 前端部署
- 进入前端项目目录
``` cd frontend ```
- 安装依赖
``` npm install ```
- 打包项目
``` npm run build ```
- 拷贝nginx配置文件
``` cp demo.conf /etc/nginx/conf.d/demo.conf ```
- 加载nginx配置
``` nginx -s reload ```

## 后端部署
- 进入后端项目目录
``` cd backend ```
- 安装依赖
``` pip install -r requirements.txt ```
- 切换conda环境（需安装conda）
``` conda activate demo ```
- 启动后端服务
```bash start.sh```