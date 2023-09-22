# How to setup!

Start by cloning this project to your computer, then follow the following instructions

### Frontend Setup
Install react
Run from command line in base folder: npm install @auth0/auth0-react js-cookie react-bootstrap  
  
FYI: frontend runs on localhost:3000

### Flask Setup
Install python
Navigate into backend folder and create venv: py -m venv env  
Navigate back into together_we_plan base folder and activate venv: .\backend\env\Scripts\activate  
Run after activating venv: pip install flask python-dotenv Flask-SQLAlchemy Flask-CORS  
Need a .flaskenv file in the backend folder with these things, make sure to specify your database username and password:  
  
FLASK_APP=base.py  
FLASK_ENV=development  
DB_USERNAME=username  
DB_PASSWORD=password  

FYI: backend runs on localhost:5000

### Postgres Setup
Install Postgres
Create a together_we_plan database, use whatever username and password you want just specify it in your .flaskenv file  
There are table creation commands to run in postgres in psql_tables.txt in the backend folder  

FYI: postgres runs on localhost:5432

# Run it!

### Start frontend from command line in base folder  
npm start

### Start backend from command line in base folder  
npm run start-backend

### Access the website  
Navigate to http://localhost:3000 in your browser and you're set!
