var highland = require('highland')
var request = require('request')
var csvParser = require('neat-csv')
var csvWriter = require('csv-write-stream')
var fs = require('fs')
var config = require('./config')

function queryTwitterFriends(account) {
    return {
        screen_name: account,
        count: 200
    }
}

function createTwitterFollowingListing(parser) {
    return function query(qs, callback) {
        var sleep = 60 * 1000 // 60 seconds
        var params = {
            url: 'https://api.twitter.com/1.1/friends/list.json',
            qs: qs,
            oauth: {
                consumer_key: config.twitter.consumerKey,
                consumer_secret: config.twitter.consumerSecret,
                token: config.twitter.accessTokenKey,
                token_secret: config.twitter.accessTokenSecret
            }
        }
        console.log('Requesting following list for: ' + qs.screen_name)
        request.get(params, function (error, response) {
            if (error || response === undefined || response.statusCode !== 200) {
                console.log('Error! Sleeping before retrying...')
                setTimeout(function () { query(qs, callback) }, sleep)
                return
            }
            var body = JSON.parse(response.body)
            var data = parser(qs, body)
            if (body.next_cursor_str !== '0') {
                setTimeout(function () {
                    qs.cursor = body.next_cursor_str
                    query(qs, function (_, dataNext) {
                        callback(null, data.concat(dataNext))
                    })
                }, sleep)
            }
            else callback(null, data)
        })
    }
}

var doTwitterFollowingListing = createTwitterFollowingListing(function (qs, response) {
    return response.users.map(function (accountFollowed) {
        return {
            account: qs.screen_name,
            follows: accountFollowed.screen_name
        }
    })
})

csvParser(fs.createReadStream('accounts.csv'), function (error, csv) {
    if (error) throw error
    var accounts = csv.map(function (line) {
        return line.account.toLowerCase()
    })
    highland(accounts)
        .map(queryTwitterFriends)
        .flatMap(highland.wrapCallback(doTwitterFollowingListing))
        .flatten()
        .filter(function (account) { return account !== null && accounts.indexOf(account.follows.toLowerCase()) >= 0 })
        .pipe(csvWriter())
        .pipe(fs.createWriteStream('results.csv'))
})
