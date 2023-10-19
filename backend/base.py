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
  allow_time_input = db.Column(db.Boolean, nullable=False, default=True)
  allow_time_voting = db.Column(db.Boolean, nullable=False, default=True)
  allow_activity_input = db.Column(db.Boolean, nullable=False, default=True)
  allow_activity_voting = db.Column(db.Boolean, nullable=False, default=True)
  chosen_time_id = db.Column(db.Integer, db.ForeignKey('times.id'))
  chosen_activity_id = db.Column(db.Integer, db.ForeignKey('activities.id'))

  def __init__(self, owner_id, name, user_ids=None, start_time=None, end_time=None, location=None, description=None, allow_time_input=None, allow_time_voting=None, allow_activity_input=None, allow_activity_voting=None, chosen_time_id=None, chosen_activity_id=None):
    self.owner_id = owner_id
    self.user_ids = user_ids
    self.name = name
    self.start_time = start_time
    self.end_time = end_time
    self.location = location
    self.description = description
    self.allow_time_input = allow_time_input
    self.allow_time_voting = allow_time_voting
    self.allow_activity_input = allow_activity_input
    self.allow_activity_voting = allow_activity_voting
    self.chosen_time_id = chosen_time_id
    self.chosen_activity_id = chosen_activity_id
    
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
      'description': self.description,
      'allow_time_input': self.allow_time_input,
      'allow_time_voting': self.allow_time_voting,
      'allow_activity_input': self.allow_activity_input,
      'allow_activity_voting': self.allow_activity_voting,
      'chosen_time_id': self.chosen_time_id,
      'chosen_activity_id': self.chosen_activity_id
    }

class Attendee(db.Model):
  __tablename__ = 'attendees'

  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
  status = db.Column(db.String(255), nullable=False)
  owner = db.Column(db.Boolean, nullable=False, default=False)

  def __init__(self, user_id, event_id, status, owner):
    self.user_id = user_id
    self.event_id = event_id
    self.status = status
    self.owner = owner

  def __repr__(self):
    return f"<Attendee {self.id}>"

  def serialize(self):
    return {
      'id': self.id,
      'user_id': self.user_id,
      'event_id': self.event_id,
      'status': self.status,
      'owner': self.owner
    }

class Activity(db.Model):
  __tablename__ = 'activities'

  id = db.Column(db.Integer, primary_key=True)
  event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
  user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  activity = db.Column(db.String(255), nullable=False)
  description = db.Column(db.Text)

  def __init__(self, event_id, user_id, activity, description):
    self.event_id = event_id
    self.user_id = user_id
    self.activity = activity
    self.description = description

  def __repr__(self):
    return f"<Activity {self.id}>"

  def serialize(self):
    return {
      'id': self.id,
      'event_id': self.event_id,
      'user_id': self.user_id,
      'activity': self.activity,
      'description': self.description
    }

class ActivityVote(db.Model):
  __tablename__ = 'activity_votes'

  id = db.Column(db.Integer, primary_key=True)
  event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
  user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  activity_id = db.Column(db.Integer, db.ForeignKey('activities.id'), nullable=False)

class Time(db.Model):
  __tablename__ = 'times'

  id = db.Column(db.Integer, primary_key=True)
  event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
  user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  start_time = db.Column(db.DateTime, nullable=False)
  end_time = db.Column(db.DateTime)

  def __init__(self, event_id, user_id, start_time, end_time):
    self.event_id = event_id
    self.user_id = user_id
    self.start_time = start_time
    self.end_time = end_time

  def __repr__(self):
    return f"<Time {self.id}>"

  def serialize(self):
    return {
      'id': self.id,
      'event_id': self.event_id,
      'user_id': self.user_id,
      'start_time': self.start_time.strftime('%Y-%m-%d %H:%M:%S'),
      'end_time': self.end_time.strftime('%Y-%m-%d %H:%M:%S') if self.end_time else None
    }

class TimeVote(db.Model):
  __tablename__ = 'time_votes'

  id = db.Column(db.Integer, primary_key=True)
  event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
  user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  time_id = db.Column(db.Integer, db.ForeignKey('times.id'), nullable=False)

  def __init__(self, event_id, user_id, time_id):
    self.event_id = event_id
    self.user_id = user_id
    self.time_id = time_id

  def __repr__(self):
    return f"<TimeVote {self.id}>"

  def serialize(self):
    return {
      'id': self.id,
      'event_id': self.event_id,
      'user_id': self.user_id,
      'time_id': self.time_id
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

# get all users
@app.route('/get-all-users', methods = ['POST'])
def get_all_users():
  users = User.query.all()

  return jsonify([user.serialize() for user in users])

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
    description=data.get('description'),
    allow_time_input=data.get('allow_time_input', True),
    allow_time_voting=data.get('allow_time_voting', True),
    allow_activity_input=data.get('allow_activity_input', True),
    allow_activity_voting=data.get('allow_activity_voting', True),
    chosen_time_id=data.get('chosen_time_id', None),
    chosen_activity_id=data.get('chosen_activity_id', None)
  )

  try:
    db.session.add(new_event)
    db.session.commit()

  except Exception as e:
    db.session.rollback()
    return jsonify({"error": f"An error occurred: {str(e)}"}), 400

  for id in data.get('user_ids'):
    new_attendee = Attendee(
      user_id=id,
      event_id=new_event.id,
      status='yes' if id == data.get('owner_id') else 'pending',
      owner=True if id == data.get('owner_id') else False
    )

    try:
      db.session.add(new_attendee)
      db.session.commit()
    
    except Exception as e:
      db.session.rollback()
      return jsonify({"error": f"An error occurred: {str(e)}"}), 400

  return jsonify({'message': 'Event and attendees created successfully.', 'event_id': new_event.id}), 201


# edit an event
@app.route('/edit-event', methods=['POST'])
def edit_event():
  data = request.get_json()

  event_id = data.get('event_id')

  if not event_id:
    return jsonify({'error': 'Event ID required.'}), 400

  event = Event.query.filter_by(id=event_id).first()

  if not event:
    return jsonify({'error': 'Event not found'}), 404

  start_time_converted = end_time_converted = None
  if data.get('start_time'):
    start_time_converted = datetime.fromisoformat(data.get('start_time'))
  if data.get('end_time'):
    end_time_converted = datetime.fromisoformat(data.get('end_time'))

  event.owner_id = data.get('owner_id')
  event.user_ids = data.get('user_ids')
  event.name = data.get('name')
  event.start_time = start_time_converted
  event.end_time = end_time_converted
  event.location = data.get('location')
  event.description = data.get('description')

  attendees = Attendee.query.filter_by(event_id=event_id).all()

  for attendee in attendees:
    if attendee.user_id not in data.get('user_ids'):
      db.session.delete(attendee)
  
  atendee_ids = [attendee.user_id for attendee in attendees]

  for id in data.get('user_ids'):
    if id not in atendee_ids:
      new_attendee = Attendee(
        user_id=id,
        event_id=event_id,
        status='pending',
        owner=False
      )

      try:
        db.session.add(new_attendee)
        db.session.commit()
      
      except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 400

  try:
    db.session.commit()
    return jsonify({'message': 'Event updated successfully.'}), 200
  except Exception as e:
    db.session.rollback()
    return jsonify({"error": f"An error occurred: {str(e)}"}), 400


# get details for event
@app.route('/get-event', methods=['POST'])
def get_event():
  event_id = request.json.get('event_id')

  event = Event.query.filter_by(id=event_id).first()

  return jsonify(event.serialize())
  
# get user events
@app.route('/get-events', methods=['POST'])
def get_user_events():
    user_id = request.json.get('user_id')

    events = Event.query.filter(or_(Event.owner_id==user_id, Event.user_ids.any(user_id))).all()

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
  
  try:
    # delete attendees
    attendees = Attendee.query.filter_by(event_id=event_id).all()
    for attendee in attendees:
      db.session.delete(attendee)

    # delete event
    db.session.delete(event)

    db.session.commit()

  except Exception as e:
    db.session.rollback()
    return jsonify({"error": f"An error occurred during deletion: {str(e)}"}), 400

  return jsonify({"message": "Successfully removed event"}), 200

# get user attendances
@app.route('/get-user-attendance', methods=['POST'])
def get_user_attendances():
  data = request.get_json()

  user_id = data.get('user_id')
  event_id = data.get('event_id')

  attendee = Attendee.query.filter_by(user_id=user_id, event_id=event_id).first()

  if not attendee:
    return jsonify({'error': 'Attendee not found.'}), 400

  return {'status': attendee.status}, 200

# get attendees
@app.route('/get-attendees', methods=['POST'])
def get_attendees():
  data = request.get_json()

  user_id = data.get('user_id')

  attendees = Attendee.query.all()

  if not attendees:
    return jsonify({'error': 'Attendee not found.'}), 400

  serialized_attendees = [attendee.serialize() for attendee in attendees]

  return jsonify(serialized_attendees)

# change attendee status
@app.route('/change-attendee-status', methods=['POST'])
def change_attendee_status():
  data = request.get_json()

  user_id = data.get('user_id')
  event_id = data.get('event_id')
  status = data.get('status')

  attendee = Attendee.query.filter_by(user_id=user_id, event_id=event_id).first()

  if not attendee:
    return jsonify({'error': 'Attendee not found.'}), 400

  attendee.status = status
  
  try:
    db.session.commit()
    return jsonify({'message': 'Attendee status updated successfully.'})
  
  except Exception as e:
    db.session.rollback()
    return jsonify({'error': f'An error occured: {str(e)}'}), 400

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=5000)