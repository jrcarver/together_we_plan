from flask import Flask, jsonify, request
import os
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import or_
from datetime import datetime

app = Flask(__name__)
CORS(app)

#
# DATABASE CONFIG
#

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%s:%s@localhost:5432/together_we_plan' % (os.environ['DB_USERNAME'], os.environ['DB_PASSWORD'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

app.app_context().push()

#
# CLASSES
#

class User(db.Model):
  __tablename__ = 'users'

  id = db.Column(db.Integer, primary_key=True)
  token = db.Column(db.String(255), nullable=False)
  email = db.Column(db.String(255), nullable=False)
  name = db.Column(db.String(255), nullable=False)
  alias = db.Column(db.String(255))

  def __init__(self, token, email, name):
    self.token = token
    self.email = email
    self.name = name
  
  def __repr__(self):
    return f'<User {self.email}>'
  
  def serialize(self):
    return {
      'id': self.id,
      'email': self.email,
      'name': self.name,
      'alias': self.alias
    }
  
class Friends(db.Model):
  __tablename__ = 'friends'

  id = db.Column(db.Integer, primary_key=True)
  userid = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  userid2 = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  accepted = db.Column(db.Boolean, nullable=False, default=False)
  waitingon = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

  def __init__(self, userid, userid2, waitingon):
    self.userid = userid
    self.userid2 = userid2
    self.waitingon = waitingon
  
  def serialize(self):
    return {
      'userid': self.userid,
      'userid2': self.userid2,
      'accepted': self.accepted,
      'waitingon': self.waitingon
    }
  
class Event(db.Model):
  __tablename__ = 'events'

  id = db.Column(db.Integer, primary_key=True)
  owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  user_ids = db.Column(db.ARRAY(db.Integer))
  name = db.Column(db.String(255), nullable=False)
  start_time = db.Column(db.DateTime)
  end_time = db.Column(db.DateTime)
  location = db.Column(db.String(255))
  description = db.Column(db.Text)

  def __init__(self, owner_id, name, user_ids=None, start_time=None, end_time=None, location=None, description=None):
    self.owner_id = owner_id
    self.user_ids = user_ids
    self.name = name
    self.start_time = start_time
    self.end_time = end_time
    self.location = location
    self.description = description
    
  def __repr__(self):
    return f"<Event {self.id} - {self.name}>"

  def serialize(self):
    return {
      'id': self.id,
      'owner_id': self.owner_id,
      'user_ids': self.user_ids,
      'name': self.name,
      'start_time': self.start_time.strftime('%Y-%m-%d %H:%M:%S') if self.start_time else None,
      'end_time': self.end_time.strftime('%Y-%m-%d %H:%M:%S') if self.end_time else None,
      'location': self.location,
      'description': self.description
    }

#
# ROUTES
#

# get user info or create new user
@app.route('/user/<string:token>', methods=['GET', 'POST'])
def get_user_id(token):
  user = User.query.filter_by(token=token).first()

  if not user:
    data = request.json
    email = data.get('email')
    name = data.get('name')

    new_user = User(token=token, email=email, name=name)

    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.serialize()), 201
  
  else:
    return jsonify(user.serialize())
  
# get user info with ID
@app.route('/userId/<int:id>', methods=['GET'])
def get_user(id):
  user = User.query.filter_by(id=id).first()

  return jsonify(user.serialize())

# create/change alias
@app.route('/user-alias', methods=['POST'])
def change_alias():
  user_id = request.json.get('user_id')
  alias = request.json.get('alias')

  print(user_id)

  user = User.query.filter_by(id=user_id).first()

  if not user:
    return jsonify({"message": "Couldn't find user."}), 404

  user.alias = alias

  db.session.commit()

  return jsonify({"message": "Successfully changed alias!"}), 200

# get friends
@app.route('/get-friends', methods=['POST'])
def get_friends():
  user_id = request.json.get('user_id')

  friends = Friends.query.filter(or_(Friends.userid==user_id, Friends.userid2==user_id), Friends.accepted==True).all()

  friend_ids = [f.userid if f.userid != user_id else f.userid2 for f in friends]
  friend_users = User.query.filter(User.id.in_(friend_ids)).all()

  return jsonify([user.serialize() for user in friend_users])

# get pending friends
@app.route('/get-pending-friends', methods=['POST'])
def get_pending_friends():
  user_id = request.json.get('user_id')

  friends = Friends.query.filter(or_(Friends.userid==user_id, Friends.userid2==user_id), Friends.accepted==False).all()

  response = []
  for f in friends:
    friend_id = f.userid if f.userid != user_id else f.userid2
    user = User.query.filter_by(id=friend_id).first()
    response.append({
      "user": user.serialize(),
      "waitingon": f.waitingon
    })

  return jsonify(response)

# create friend request
@app.route('/add-friend', methods=['POST'])
def add_friend():
  user_id = request.json.get('user_id')
  friend_email = request.json.get('friend_email')

  friend = User.query.filter_by(email=friend_email).first()

  if not friend:
    return jsonify({"message": "User with the given email does not exist!"}), 404
  
  friend_id = friend.id
  
  friendship1 = Friends.query.filter_by(userid=user_id, userid2=friend_id).first()
  friendship2 = Friends.query.filter_by(userid=friend_id, userid2=user_id).first()

  if friendship1 or friendship2:
    return jsonify({"message": "You are already friends or a request is pending!"}), 400
  
  new_friendship = Friends(userid=user_id, userid2=friend_id, waitingon=friend_id)

  db.session.add(new_friendship)
  db.session.commit()

  return jsonify({"message": "Friend added successfully"})

# remove friend
@app.route('/remove-friend', methods=['POST'])
def remove_friend():
  user_id = request.json.get('user_id')
  friend_id = request.json.get('friend_id')

  friendship = Friends.query.filter(or_(Friends.userid==user_id, Friends.userid2==user_id)).first()

  if not friendship:
    return jsonify({"error": "Friend record not found"}), 404
  
  db.session.delete(friendship)
  db.session.commit()

  return jsonify({"message": "Successfully removed friend"}), 200

# accept friend request
@app.route('/accept-friend', methods=['POST'])
def accept_friend():
  user_id = request.json.get('user_id')
  friend_id = request.json.get('friend_id')

  friendship = Friends.query.filter_by(userid=friend_id, userid2=user_id).first()

  if not friendship:
    return jsonify({"error": "Friend record not found"}), 404
  
  friendship.accepted = True
  friendship.waitingon = None

  db.session.commit()

  return jsonify({"message": "Successfully added friend"}), 200

# deny friend request
@app.route('/deny-friend', methods=['POST'])
def deny_friend():
  user_id = request.json.get('user_id')
  friend_id = request.json.get('friend_id')

  friendship = Friends.query.filter_by(userid=friend_id, userid2=user_id).first()

  if not friendship:
    friendship = Friends.query.filter_by(userid=user_id, userid2=friend_id).first()

  if not friendship:
    return jsonify({"error": "Friend record not found"}), 404
  
  db.session.delete(friendship)
  db.session.commit()

  return jsonify({"message": "Successfully removed request"}), 200

# create a new event
@app.route('/create-event', methods=['POST'])
def create_event():
  data = request.get_json()

  start_time_converted=None
  end_time_converted=None

  if data.get('start_time'):
    start_time_converted = datetime.fromisoformat(data.get('start_time'))
  if data.get('end_time'):
    end_time_converted = datetime.fromisoformat(data.get('end_time'))

  new_event = Event(
    owner_id=data['owner_id'],
    user_ids=data.get('user_ids', []),
    name=data['name'],
    start_time=start_time_converted,
    end_time=end_time_converted,
    location=data.get('location'),
    description=data.get('description')
  )

  try:
    db.session.add(new_event)
    db.session.commit()
    return jsonify({"message": "Event created successfully!", "event_id": new_event.id}), 201
  except Exception as e:
    db.session.rollback()
    return jsonify({"error": f"An error occurred: {str(e)}"}), 400
  
# get user events
@app.route('/get-events', methods=['POST'])
def get_user_events():
    user_id = request.json.get('user_id')

    events = Event.query.filter_by(owner_id=user_id).all()

    serialized_events = [event.serialize() for event in events]
    
    return jsonify(serialized_events)

# delete event
@app.route('/delete-event', methods=['POST'])
def delete_event():
  user_id = request.json.get('user_id')
  event_id = request.json.get('event_id')

  event = Event.query.filter_by(owner_id=user_id, id=event_id).first()

  if not event:
    return jsonify({"error": "Event record not found"}), 404
  
  db.session.delete(event)
  db.session.commit()

  return jsonify({"message": "Successfully removed event"}), 200

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=5000)