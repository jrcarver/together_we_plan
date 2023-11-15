from flask import Blueprint, jsonify, request
import requests
import os
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

main = Blueprint('main', __name__)

#
# CLASSES
#

class YelpAPI:
  def __init__(self, api_key):
    self.api_key = api_key
    self.base_url = 'https://api.yelp.com/v3/'

  def search(self, location, terms):
    url = f'{self.base_url}businesses/search'
    headers = {
      'Authorization': f'Bearer {self.api_key}'
    }
    params = {
      'location': location,
      'term': terms
    }
    response = requests.get(url, headers=headers, params=params)
    return response.json()

# Instantiate YelpAPI
yelp_api = YelpAPI(os.environ['YELP_API_KEY'])

#
# ROUTES
#

# default view for the things to do page, uses the user defined location
@main.route('/yelp-things-to-do', methods=['POST'])
def things_to_do():
  location = request.json.get('location')

  result = yelp_api.search(location, terms='things to do')
  return jsonify(result)

# search yelp with a custom location and search terms
@main.route('/yelp-search', methods=['POST'])
def search():
  location = request.json.get('location')
  terms = request.json.get('terms')

  result = yelp_api.search(location, terms)
  return jsonify(result)