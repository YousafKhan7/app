@echo off
echo Setting up Full Stack Application...

echo.
echo 1. Setting up Frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Frontend setup failed!
    pause
    exit /b 1
)

echo.
echo 2. Setting up Backend...
cd ..\backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Backend setup failed!
    pause
    exit /b 1
)

echo.
echo Setup completed successfully!
echo.
echo Next steps:
echo 1. Set up MySQL database and run: mysql -u root -p ^< database/schema.sql
echo 2. Update backend/.env with your database credentials
echo 3. Start backend: cd backend ^&^& python main.py
echo 4. Start frontend: cd frontend ^&^& npm run dev
echo.
pause
