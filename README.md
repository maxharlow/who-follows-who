Who Follows Who?
================

Given a CSV of Twitter account names, produces another CSV with a column containing all the accounts from the list that they are following. By default takes a CSV named `accounts.csv` with a column named 'Account', and produces a CSV named `results.csv`. An example of the former is included.

Needs [Twitter appliction credentials] (https://apps.twitter.com/), to be added to `who-follows-who.py`.

Requires either version 2 or 3 of [Python] (https://www.python.org/), including `virtualenv` and `pip`.

Set up a virtual environment with `virtualenv venv --no-site-packages` followed by `source venv/bin/activate`. Install the dependencies with `pip install -r requirements.txt`, then run `python whos-follows-who.py`.
