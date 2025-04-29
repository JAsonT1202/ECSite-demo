## Frontend
- Navigate to the frontend project directory
``` cd frontend ```
- Install dependencies
``` npm install ```
- Build the project
``` npm run build ```
- Copy the nginx configuration file
``` cp demo.conf /etc/nginx/conf.d/demo.conf ```
- Reload the nginx configuration
``` nginx -s reload ```

## Backend
- Navigate to the backend project directory
``` cd backend ```
- Install dependencies
``` pip install -r requirements.txt ```
- Activate the conda environment
``` conda activate demo ```
- Start the backend service
```bash start.sh```
