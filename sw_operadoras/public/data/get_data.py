import sys
sys.path.append('/home/rodrigo/Twitter Analysis Library/lib')
from FileWorker import *
import re
from pymongo import *

client = MongoClient('localhost', 27017)
db = client['db_terremoto']
collection = db['ecuador_terremoto']

tweets_iterator = collection.find()

data = {}
locations = []
for tweet in tweets_iterator:
	if 'coordinates' in tweet.keys():
		if tweet['coordinates']!= None:
			coordinates = tweet['coordinates']
			lng = coordinates['coordinates'][0]
			lat = coordinates['coordinates'][1]
			obj = {}
			obj['coordinates'] = {}
			obj['coordinates']['lat'] = lat
			obj['coordinates']['lng'] = lng
			locations.append(obj)


data["num_tweets"] = len(locations)
data["tweets"] = locations

FileWorker().writeJSON("locations.json",data)

