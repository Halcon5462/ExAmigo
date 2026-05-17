# запуск backend
Start-Process powershell -ArgumentList "cd backend; .\.venv\Scripts\activate; python manage.py migrate; python manage.py runserver"

# запуск frontend
Start-Process powershell -ArgumentList "cd frontend; npm install; npm run dev"