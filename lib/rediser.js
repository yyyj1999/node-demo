'use strict';

let RedLock = require('redlock');
let Redis = require('ioredis');

function Rediser() {
    this.redis = null;
    this._status = false;
    this.redlock = null;
}

Rediser.prototype.init = function (conf, callback) {
    let self = this;
    let redis = new Redis({
        port: conf.port,
        host: conf.host,
        db: conf.db,
        password: conf.password,
        retryStrategy: function (times) {
            return Math.min(times * 10, 2000); // delay in ms
        },
    });
    redis.on('connect', function () {
        self._status = true;
        self.redis = redis;
        self.redlock = new RedLock([redis]);
        callback(null);
    });
    redis.on('error', function (err) {
        self._status = false;
        callback(err);
    });
};

Rediser.prototype.get = function (key, callback) {
    this.redis.get(key, function (err, value) {
        if (err) {
            return callback(err, null);
        }
        if (!value) {
            return callback(null, null);
        }
        try {
            value = JSON.parse(value);
        } catch (err) {
            return callback(err, null);
        }
        return callback(null, value);
    });
};

Rediser.prototype.set = function (key, value, time, callback) {
    let self = this;

    if (typeof time === 'function') {
        callback = time;
        time = null;
    }
    if (!value) {
        return callback(null, null);
    }

    callback = callback || function () { };
    try {
        value = JSON.stringify(value);
    } catch (e) {
        return callback(e, null);
    }

    if (!time) {
        self.redis.set(key, value, callback);
    } else {
        self.redis.setex(key, time, value, callback);
    }
};

Rediser.prototype.del = function (key, callback) {
    callback = callback || function () { };
    this.redis.del(key, callback);
};

Rediser.prototype.setrange = function (key, index, value) {
    this.redis.setrange(key, index, value);
};

module.exports = new Rediser();