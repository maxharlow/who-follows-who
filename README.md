Who Follows Who?
================

Get who is following who from a list of Twitter account names as a spreadsheet.

Part of a set of Twitter tools, also including [Who Says What?] (https://github.com/maxharlow/who-says-what/) and [Who Said That?] (https://github.com/maxharlow/who-said-that).

Requires [Node] (https://nodejs.org/).


Usage
-----

*(A beginners guide.)*

You will need to have [Git] (http://git-scm.com/) and [Node] (https://nodejs.org/) installed, and be comfortable using the terminal.

Firstly, clone this repository:

    $ git clone https://github.com/maxharlow/who-follows-who.git
    $ cd who-follows-who

To use the Twitter API, you need credentials, by [creating a new Twitter app] (https://apps.twitter.com/). The credentials are made up of four parts, the 'consumer key', 'consumer secret', 'access token key', and 'access token secret'. These are stored in a Json configuration file -- an example is included, which we will copy:

    $ cp config.example.json config.json

Then open `config.json` in your text editor and add in the credentials you just created.

Next, we will need to install the dependencies:

    $ npm install

We now need to prepare a list of accounts we want to look up. These should be in a CSV file named `accounts.csv`, with a column header named 'account' (case sensitive). The account names should not include the leading `@` symbol.

Finally, we can run it:

    $ node who-follows-who

This may take some time, depending on how many accounts are listed, and how many people each of those accounts follow -- the Twitter API limits us to requesting the names 200 people being followed by a user every minute.

Once finished, the results can be found in `results.csv`.


Importing into Neo4j
--------------------

A script such as this would import the results produced above into the [Neo4j] (http://neo4j.com/) graph database.
Note that the full path to `results.csv` needs to be filled in before running.

```neo4j
CREATE CONSTRAINT ON (user: User) ASSERT user.name IS UNIQUE;

USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM 'file://.../results.csv' AS record
  MERGE (a:User {name: record.account})
  MERGE (b:User {name: record.follows})
  CREATE (a)-[:FOLLOWS]->(b)
;
```
