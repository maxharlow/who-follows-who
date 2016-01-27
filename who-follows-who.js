const Highland = require('highland')
const Request = require('request')
const CSVParser = require('neat-csv')
const CSVWriter = require('csv-write-stream')
const FS = require('fs')
const Config = require('./config')

function queryTwitterFriends(account) {
    return {
        screen_name: account,
        count: 200
    }
}

function createTwitterFollowingListing(parser) {
    return function query(qs, callback) {
        const sleep = 60 * 1000 // 60 seconds
        const params = {
            url: 'https://api.twitter.com/1.1/friends/list.json',
            qs: qs,
            oauth: {
                consumer_key: Config.twitter.consumerKey,
                consumer_secret: Config.twitter.consumerSecret,
                token: Config.twitter.accessTokenKey,
                token_secret: Config.twitter.accessTokenSecret
            }
        }
        console.log('Requesting following list for: ' + qs.screen_name)
        Request.get(params, (e, response) => {
            if (e || response === undefined || response.statusCode !== 200) {
                console.log('Error! Sleeping before retrying...')
                setTimeout(() => query(qs, callback), sleep)
                return
            }
            const body = JSON.parse(response.body)
            const data = parser(qs, body)
            if (body.next_cursor_str !== '0') setTimeout(() => {
                qs.cursor = body.next_cursor_str
                query(qs, (_, dataNext) => callback(null, data.concat(dataNext)))
            }, sleep)
            else callback(null, data)
        })
    }
}

const doTwitterFollowingListing = createTwitterFollowingListing((qs, response) => {
    return response.users.map(accountFollowed => {
        return {
            account: qs.screen_name,
            follows: accountFollowed.screen_name.toLowerCase()
        }
    })
})

CSVParser(FS.createReadStream('accounts.csv'), (e, csv) => {
    if (e) throw e
    const accounts = csv.map(line => line.account.toLowerCase())
    Highland(accounts)
        .map(queryTwitterFriends)
        .flatMap(Highland.wrapCallback(doTwitterFollowingListing))
        .flatten()
        .filter(account => account !== null && accounts.indexOf(account.follows.toLowerCase()) >= 0)
        .pipe(CSVWriter())
        .pipe(FS.createWriteStream('results.csv'))
})
