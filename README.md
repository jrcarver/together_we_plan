Frontend Setup:
npm install @auth0/auth0-react js-cookie react-bootstrap

Backend Setup:
Create venv in backend folder: py -m venv env
Run venv from project base: .\backend\env\Scripts\activate
pip install flask python-dotenv Flask-SQLAlchemy Flask-CORS
Need a .flaskenv file with these things:
FLASK_APP=base.py
FLASK_ENV=development
DB_USERNAME=username
DB_PASSWORD=password

Start frontend: npm start

Start backend: npm run start-backend