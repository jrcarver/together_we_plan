<u>How to setup!</u>

Clone this project to your computer

<u>Frontend Setup</u>  
Run from command line in base folder: npm install @auth0/auth0-react js-cookie react-bootstrap

<u>Flask Setup</u>  
Navigate into backend folder and create venv: py -m venv env  
Navigate back into together_we_plan base folder and activate venv: .\backend\env\Scripts\activate  
Run after activating venv: pip install flask python-dotenv Flask-SQLAlchemy Flask-CORS  
Need a .flaskenv file in the backend folder with these things, make sure to specify your database username and password:  
FLASK_APP=base.py  
FLASK_ENV=development  
DB_USERNAME=username  
DB_PASSWORD=password  

<u>Postgres Setup</u>  
Get Postgres setup and create a together_we_plan database, use whatever username and password you want just specify it in your .flaskenv file  
There are table creation commands in psql_tables.txt in the backend folder

<u>Start frontend from command line in base folder:</u> npm start

<u>Start backend from command line in base folder:</u> npm run start-backend
