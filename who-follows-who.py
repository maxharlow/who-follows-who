import csv
from birdy.twitter import UserClient

# fill these in...
twitter_consumer_key = ''
twitter_consumer_secret = ''
twitter_access_token = ''
twitter_access_token_secret = ''

twitter = UserClient(twitter_consumer_key, twitter_consumer_secret, twitter_access_token, twitter_access_token_secret)

with open('accounts.csv', 'r') as input:
    accounts = set(map(lambda each: each['Account'], csv.DictReader(input)))
with open('accounts.csv', 'r') as input:
    rows = csv.DictReader(input)
    with open('results.csv', 'w') as output:
        writer = csv.DictWriter(output, ['Account', 'Following'])
        for row in rows:
            following_response = twitter.api.friends.ids.get(screen_name=row['Account'])
            following_ids = list(map(str, following_response.data['ids'])) # extract the id field
            following_ids_grouped = [following_ids[i:i + 100] for i in range(0, len(following_ids), 100)] # grouped by 100
            following = []
            for ids in following_ids_grouped:
                lookup_response = twitter.api.users.lookup.get(user_id=','.join(ids))
                for user in lookup_response.data:
                    following.append(user['screen_name'])
            following_accounts = [u for u in following if u in accounts] # filter matching accounts
            data = {
                'Account': row['Account'],
                'Following': ', '.join(following_accounts)
            }
            writer.writerow(data)
