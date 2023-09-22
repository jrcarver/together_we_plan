from flask import Flask, jsonify, request
import os
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import or_

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
      'name': self.name
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
    return jsonify({"error": "Friend record not found"}), 404
  
  db.session.delete(friendship)
  db.session.commit()

  return jsonify({"message": "Successfully removed request"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)