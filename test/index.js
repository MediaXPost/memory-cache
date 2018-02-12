// test/index.js

/* eslint id-length: warn */

const chai = require('chai');
const lolex = require('lolex');
const expect = chai.expect;
// Dependencies
const MemoryCache = require('../');
const MemoryCacheError = require('../').MemoryCacheError;

describe('Memory Cache', () => {
  let client;
  before((done) => {
    client = new MemoryCache({ bypassUnsupported: false });
    done();
  });

  it('constructor', () => {
    expect(client).to.be.instanceof(MemoryCache);
  });

  describe('Core', () => {
    it('createClient', (done) => {
      client.once('ready', () => {
        expect(client.connected).to.equal(true);
        done();
      });
      client.createClient();
    });

    it('auth', () => {
      expect(client.auth('password')).to.equal('OK');
    });

    it('auth with callback', (done) => {
      client.auth('password', (err, res) => {
        expect(res).to.equal('OK');
        done();
      });
    });

    it('echo', () => {
      expect(client.echo('message')).to.equal('message');
    });

    it('echo with callback', (done) => {
      client.echo('message', (err, res) => {
        expect(res).to.equal('message');
        done();
      });
    });

    it('quit', (done) => {
      client.once('end', () => {
        expect(client.connected).to.equal(false);
        done();
      });
      client.quit();
    });
  });

  describe('Hash', () => {
    before(() => {
      client.createClient();
    });

    it('hset (non-existing)', () => {
      const val = client.hset('testkey', 'testfield', 1);
      expect(val).to.equal(1);
    });

    it('hset (existing)', () => {
      const val = client.hset('testkey', 'testfield', 2);
      expect(val).to.equal(0);
    });

    it('hset with callback', (done) => {
      client.hset('testkey', 'testfield2', 1, (err, res) => {
        expect(res).to.equal(1);
        done();
      });
    });

    it('hsetnx (non-existing)', () => {
      const val = client.hsetnx('testkey', 'testfield3', 0);
      expect(val).to.equal(1);
    });

    it('hsetnx (existing)', () => {
      const val = client.hsetnx('testkey', 'testfield3', 'm1');
      expect(val).to.equal(0);
    });

    it('hsetnx with callback', (done) => {
      client.hsetnx('testkey', 'testfield4', 'shit', (err, res) => {
        expect(res).to.equal(1);
        done();
      });
    });

    it('hget (non-existing)', () => {
      const val = client.hget('testkey', 'testfield5');
      expect(val).to.be.equal(null);
    });

    it('hget (existing)', () => {
      const val = client.hget('testkey', 'testfield3');
      expect(val).to.be.equal('0');
    });

    it('hget with callback', (done) => {
      client.hget('testkey', 'testfield4', (err, res) => {
        expect(res).to.be.equal('shit');
        done();
      });
    });

    it('hdel (non-existing)', () => {
      const val = client.hdel('testkey', 'testfield5');
      expect(val).to.be.equal(0);
    });

    it('hdel (existing)', () => {
      const val = client.hdel('testkey', 'testfield');
      expect(val).to.be.equal(1);
    });

    it('hdel with multi-callback', (done) => {
      client.hset('testkey', 'multi1', 1);
      client.hset('testkey', 'multi2', 1);
      client.hset('testkey', 'multi3', 1);
      client.hdel('testkey', 'multi1', 'multi2', 'multi3', (err, res) => {
        expect(res).to.be.equal(3);
        done();
      });
    });

    it('hexists (non-existing)', () => {
      const val = client.hexists('testkey', 'testfield5');
      expect(val).to.be.equal(0);
    });

    it('hexists (existing)', () => {
      const val = client.hexists('testkey', 'testfield3');
      expect(val).to.be.equal(1);
    });

    it('hexists with callback', (done) => {
      client.hexists('testkey', 'testfield4', (err, res) => {
        expect(res).to.be.equal(1);
        done();
      });
    });

    it('hgetall', () => {
      const val = client.hgetall('testkey');
      expect(val).to.be.instanceof(Object);
      expect(Object.keys(val).includes('testfield2')).to.be.equal(true);
      expect(Object.keys(val).includes('testfield3')).to.be.equal(true);
      expect(Object.keys(val).includes('testfield4')).to.be.equal(true);
      expect(val.testfield2).to.be.equal('1');
      expect(val.testfield4).to.be.equal('shit');
    });

    it('hgetall with callback', (done) => {
      client.hgetall('testkey', (err, res) => {
        expect(res).to.be.instanceof(Object);
        expect(Object.keys(res).includes('testfield2')).to.be.equal(true);
        expect(Object.keys(res).includes('testfield3')).to.be.equal(true);
        expect(Object.keys(res).includes('testfield4')).to.be.equal(true);
        expect(res.testfield2).to.be.equal('1');
        expect(res.testfield4).to.be.equal('shit');
        done();
      });
    });

    it('hincrby (non-existing)', () => {
      const val = client.hincrby('testkey', 'no-exist', '12');
      expect(val).to.be.equal(12);
      client.hdel('testkey', 'no-exist');
    });

    it('hincrby (existing)', () => {
      const val = client.hincrby('testkey', 'testfield2', '12');
      expect(val).to.be.equal(13);
    });

    it('hincrby with callback', (done) => {
      client.hincrby('testkey', 'testfield2', '12', (err, res) => {
        expect(res).to.be.equal(25);
        done();
      });
    });

    it('hincrbyfloat (non-existing)', () => {
      const val = client.hincrbyfloat('testkey', 'no-exist', '3.14');
      expect(val).to.be.equal(3.14);
      client.hdel('testkey', 'no-exist');
    });

    it('hincrbyfloat (existing)', () => {
      const val = client.hincrbyfloat('testkey', 'testfield2', '1.5');
      expect(val).to.be.equal(26.5);
    });

    it('hincrbyfloat with callback', (done) => {
      client.hincrbyfloat('testkey', 'testfield2', '-12.1', (err, res) => {
        expect(res).to.be.equal(14.4);
        done();
      });
    });

    it('hkeys', () => {
      const val = client.hkeys('testkey');
      expect(val).to.be.instanceof(Array);
      expect(val).to.include.members(['testfield2', 'testfield3', 'testfield4']);
    });

    it('hkeys with callback', (done) => {
      client.hkeys('testkey', (err, res) => {
        expect(res).to.be.instanceof(Array);
        expect(res).to.include.members(['testfield2', 'testfield3', 'testfield4']);
        done();
      });
    });

    it('hlen', () => {
      const val = client.hlen('testkey');
      expect(val).to.be.equal(3);
    });

    it('hlen with callback', (done) => {
      client.hlen('testkey', (err, res) => {
        expect(res).to.be.equal(3);
        done();
      });
    });

    it('hmget multi-field (non-exist key)', () => {
      const val = client.hmget('testkey2', 'a', 'b', 'c');
      expect(val).to.include.members([null]);
      expect(val.length).to.be.equal(3);
    });

    it('hmget multi-field', () => {
      const val = client.hmget('testkey', 'testfield2', 'testfield4', 'testfield5');
      expect(val).to.include.members(['14.4', 'shit', null]);
      expect(val.indexOf(null)).to.be.equal(2);
    });

    it('hmget multi-field with callback', (done) => {
      client.hmget('testkey', 'testfield2', 'testfield4', 'testfield5', (err, res) => {
        expect(res).to.include.members(['14.4', 'shit', null]);
        expect(res.indexOf(null)).to.be.equal(2);
        done();
      });
    });

    it('hmset multi-field object (non-exist key)', () => {
      const val = client.hmset('testkey2', { a: 'a', b: 'b', c: 'c' });
      expect(val).to.be.equal('OK');
    });

    it('hmset multi-field object (existing key)', () => {
      const val = client.hmset('testkey2', { a: 'z', d: 'd' });
      expect(val).to.be.equal('OK');
    });

    it('hmset multi-field object with callback', (done) => {
      client.hmset('testkey2', { e: 'e', f: '1234' }, (err, res) => {
        expect(res).to.be.equal('OK');
        done();
      });
    });

    it('hmset field-value pairs', () => {
      const val = client.hmset('testkey2', 'q', '123', 'r', '987');
      expect(val).to.be.equal('OK');
    });

    it('hmset field-value pairs with callback', (done) => {
      client.hmset('testkey2', 'x', 'v', 'y', 'w', (err, res) => {
        expect(res).to.be.equal('OK');
        done();
      });
    });

    it('hmgetall results from hmset', () => {
      const val = client.hkeys('testkey2');
      expect(val).to.include.members(['a', 'b', 'c', 'd', 'e', 'f', 'q', 'r', 'x', 'y']);
      const val2 = client.hvals('testkey2');
      expect(val2).to.include.members(['z', 'b', 'c', 'd', 'e', '1234', '123', '987', 'v', 'w']);
    });

    it('hstrlen (non-existing)', () => {
      const val = client.hstrlen('testkey', 'testfield5');
      expect(val).to.be.equal(0);
    });

    it('hstrlen (existing)', () => {
      const test = client.hstrlen('testkey', 'testfield3');
      expect(test).to.be.equal(1);
    });

    it('hstrlen with callback', (done) => {
      client.hstrlen('testkey', 'testfield4', (err, res) => {
        expect(res).to.be.equal(4);
        done();
      });
    });

    it('hvals', () => {
      const val = client.hvals('testkey');
      expect(val).to.be.instanceof(Array);
      expect(val).to.include.members(['14.4', 'shit', '0']);
    });

    it('hvals with callback', (done) => {
      client.hvals('testkey', (err, res) => {
        expect(res).to.be.instanceof(Array);
        expect(res).to.include.members(['14.4', 'shit', '0']);
        done();
      });
    });
  });

  describe('Key Maintenance', () => {
    let clock;
    before(() => {
      clock = lolex.install();
    });

    after(() => {
      clock.uninstall();
    });

    it('del', () => {
      const val = client.del('testkey2', 'no-exist');
      expect(val).to.be.equal(1);
    });

    it('del with callback', (done) => {
      client.del('no-exist', (err, res) => {
        expect(res).to.be.equal(0);
        done();
      });
    });

    it('dump', () => {
      const val = client.dump('testkey');
      expect(val).to.be.a('string');
      expect(JSON.parse(val)).to.be.an('object');
    });

    it('dump with callback', (done) => {
      client.dump('testkey', (err, res) => {
        expect(res).to.be.a('string');
        expect(JSON.parse(res)).to.be.an('object');
        done();
      });
    });

    it('exists', () => {
      const val = client.exists('no-exists', 'testkey');
      expect(val).to.be.equal(1);
    });

    it('exists with callback', (done) => {
      client.exists('no-exists', 'testkey', (err, res) => {
        expect(res).to.be.equal(1);
        done();
      });
    });

    it('expire (non-existing)', () => {
      const val = client.expire('newkey', 1);
      expect(val).to.be.equal(0);
    });

    it('expire (existing)', () => {
      client.hset('newkey', 'val1', 'test');
      let val = client.expire('newkey', 1);
      expect(val).to.be.equal(1);
      clock.tick(1500);
      val = client.hget('newkey', 'val1');
      expect(val).to.be.equal(null);
    });

    it('expire with callback', (done) => {
      client.hset('newkey', 'val1', 'test');
      client.expire('newkey', 1, (err, res) => {
        expect(res).to.be.equal(1);
        clock.tick(1500);
        const val = client.hget('newkey', 'val1');
        expect(val).to.be.equal(null);
        done();
      });
    });

    it('expireat (non-existing)', () => {
      const val = client.expireat('newkey', 4500);
      expect(val).to.be.equal(0);
    });

    it('expireat (existing)', () => {
      client.hset('newkey', 'val1', 'test');
      let val = client.expireat('newkey', 4);
      expect(val).to.be.equal(1);
      clock.tick(1500);
      val = client.hget('newkey', 'val1');
      expect(val).to.be.equal(null);
    });

    it('expireat with callback', (done) => {
      client.hset('newkey', 'val1', 'test');
      client.expireat('newkey', 5, (err, res) => {
        expect(res).to.be.equal(1);
        clock.tick(1500);
        res = client.hget('newkey', 'val1');
        expect(res).to.be.equal(null);
        done();
      });
    });

    it('keys (no pattern)', () => {
      const val = client.keys();
      expect(val).to.include.members(['testkey']);
    });

    it('keys (no matches)', () => {
      const val = client.keys('nokey*');
      expect(val).to.be.empty;
    });

    it('keys with callback', (done) => {
      client.keys('test*', (err, res) => {
        expect(res).to.include.members(['testkey']);
        done();
      });
    });

    it('move (non-existing)', () => {
      const val = client.move('test', 1);
      expect(val).to.be.equal(0);
    });

    it('move (existing)', () => {
      client.hset('testkey2', 'val', 1);
      let val = client.move('testkey2', 1);
      expect(val).to.be.equal(1);
      val = client.exists('testkey2');
      expect(val).to.be.equal(0);
    });

    it('move (already existing target)', () => {
      client.hset('testkey2', 'val', 1);
      const val = client.move('testkey2', 1);
      expect(val).to.be.equal(0);
    });

    it('move with callback', (done) => {
      client.hset('testkey3', 'val', 1);
      client.move('testkey3', 1, (err, res) => {
        expect(res).to.be.equal(1);
        done();
      });
    });

    it('persist (non-existing)', () => {
      const val = client.persist('newkey');
      expect(val).to.be.equal(0);
    });

    it('persist (existing)', () => {
      client.hset('newkey', 'val1', 'test');
      client.expire('newkey', 1);
      let val = client.persist('newkey');
      expect(val).to.be.equal(1);
      clock.tick(1500);
      val = client.hget('newkey', 'val1');
      expect(val).to.be.equal('test');
    });

    it('persist with callback', (done) => {
      client.expire('newkey', 1);
      client.persist('newkey', (err, res) => {
        expect(res).to.be.equal(1);
        clock.tick(1500);
        const val = client.hget('newkey', 'val1');
        expect(val).to.be.equal('test');
        done();
      });
    });

    it('pexpire (non-existing)', () => {
      const val = client.pexpire('newkey2', 1);
      expect(val).to.be.equal(0);
    });

    it('pexpire (existing)', () => {
      client.hset('newkey', 'val1', 'test');
      let val = client.pexpire('newkey', 1);
      expect(val).to.be.equal(1);
      clock.tick(2);
      val = client.hget('newkey', 'val1');
      expect(val).to.be.equal(null);
    });

    it('pexpire with callback', (done) => {
      client.hset('newkey', 'val1', 'test');
      client.pexpire('newkey', 1, (err, res) => {
        expect(res).to.be.equal(1);
        clock.tick(2);
        const val = client.hget('newkey', 'val1');
        expect(val).to.be.equal(null);
        done();
      });
    });

    it('pexpireat (non-existing)', () => {
      const val = client.pexpireat('no-key', 5);
      expect(val).to.be.equal(0);
    });

    it('pexpireat (existing)', () => {
      client.hset('no-key', 'val1', 'test');
      let val = client.pexpireat('no-key', 10000);
      expect(val).to.be.equal(1);
      clock.tick(1096);
      val = client.hget('no-key', 'val1');
      expect(val).to.be.equal(null);
    });

    it('pexpireat with callback', (done) => {
      client.hset('no-key', 'val1', 'test');
      client.pexpireat('no-key', 10200, (err, res) => {
        expect(res).to.be.equal(1);
        clock.tick(200);
        res = client.hget('no-key', 'val1');
        expect(res).to.be.equal(null);
        done();
      });
    });

    it('pttl (non-existing)', () => {
      const val = client.pttl('no-key');
      expect(val).to.be.equal(-2);
    });

    it('pttl (existing no expire)', () => {
      client.hset('no-key', 'val1', 'test');
      const val = client.pttl('no-key');
      expect(val).to.be.equal(-1);
    });

    it('pttl (existing)', () => {
      client.pexpireat('no-key', 10400);
      const val = client.pttl('no-key');
      expect(val).to.be.equal(100);
    });

    it('pttl with callback', (done) => {
      client.pttl('no-key', (err, res) => {
        expect(res).to.be.equal(100);
        done();
      });
    });

    it('randomkey', () => {
      const val = client.randomkey();
      expect(val).to.not.be.equal(null);
    });

    it('randomkey with callback', (done) => {
      client.randomkey((err, res) => {
        expect(res).to.not.be.equal(null);
        done();
      });
    });

    it('rename (non-existing)', () => {
      const testfn = () => { client.rename('lame', 'somekey'); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('rename (existing)', () => {
      const val = client.rename('no-key', 'somekey');
      expect(val).to.be.equal('OK');
    });

    it('rename with callback', (done) => {
      client.rename('somekey', 'no-key', (err, res) => {
        expect(res).to.be.equal('OK');
        done();
      });
    });

    it('renamenx (non-existing)', () => {
      const testfn = () => { client.renamenx('lame', 'somekey'); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('renamenx (already existing dest)', () => {
      const val = client.renamenx('no-key', 'testkey');
      expect(val).to.be.equal(0);
    });

    it('renamenx (already existing dest)', () => {
      const val = client.renamenx('no-key', 'somekey');
      expect(val).to.be.equal(1);
    });

    it('renamenx with callback', (done) => {
      client.renamenx('somekey', 'no-key', (err, res) => {
        expect(res).to.be.equal(1);
        done();
      });
    });

    it('restore (already exists)', () => {
      const dump = client.dump('no-key');
      const testfn = () => { client.restore('testkey', null, dump); };
      expect(testfn).to.throw('busy');
    });

    it('restore (bad payload)', () => {
      const dump = 'garbage';
      const testfn = () => { client.restore('somekey', null, dump); };
      expect(testfn).to.throw('payload');
    });

    it('restore', () => {
      const dump = client.dump('no-key');
      const val = client.restore('somekey', 1500, dump);
      expect(val).to.be.equal('OK');
    });

    it('restore (replace existing)', () => {
      const dump = client.dump('no-key');
      const val = client.restore('no-key', 16000, dump, true);
      expect(val).to.be.equal('OK');
    });

    it('restore with callback', (done) => {
      const dump = client.dump('no-key');
      client.restore('somekey', 16000, dump, true, (err, res) => {
        expect(res).to.be.equal('OK');
        done();
      });
    });

    it('touch', () => {
      clock.tick(1000);
      const val = client.touch('no-key', 'somekey', 'bad');
      expect(val).to.be.equal(2);
      expect(client.cache['no-key'].lastAccess).to.be.equal(Date.now());
    });

    it('touch with callback', (done) => {
      clock.tick(1000);
      client.touch('no-key', 'somekey', 'bad', (err, res) => {
        expect(res).to.be.equal(2);
        expect(client.cache['no-key'].lastAccess).to.be.equal(Date.now());
        done();
      });
    });

    it('ttl', () => {
      const val = client.ttl('somekey');
      expect(val).to.be.equal(14);
    });

    it('ttl with callback', (done) => {
      client.ttl('somekey', (err, res) => {
        expect(res).to.be.equal(14);
        done();
      });
    });

    it('type (non-existing)', () => {
      const val = client.type('bad');
      expect(val).to.be.equal('none');
    });

    it('type', () => {
      const val = client.type('somekey');
      expect(val).to.be.equal('hash');
    });

    it('type with callback', (done) => {
      client.type('somekey', (err, res) => {
        expect(res).to.be.equal('hash');
        done();
      });
    });

    it('unlink', () => {
      const val = client.unlink('somekey', 'bad');
      expect(val).to.be.equal(1);
    });

    it('unlink with callback', (done) => {
      client.unlink('somekey', 'bad', (err, res) => {
        expect(res).to.be.equal(0);
        done();
      });
    });
  });

  describe('Lists', () => {
    it('lpush (wrong type)', () => {
      const testfn = () => { client.lpush('no-key', '1'); };
      expect(testfn).to.throw('WRONGTYPE');
    });

    it('lpush', () => {
      let val = client.lpush('listkey', '1');
      expect(val).to.be.equal(1);
      val = client.lpush('listkey', '12');
      expect(val).to.be.equal(2);
    });

    it('lpush with callback', (done) => {
      client.lpush('listkey', 'abc', (err, res) => {
        expect(res).to.be.equal(3);
        done();
      });
    });

    it('lpushx', () => {
      const val = client.lpushx('bad', '1');
      expect(val).to.be.equal(0);
    });

    it('lpushx with callback', (done) => {
      client.lpushx('listkey', 'zyx', (err, res) => {
        expect(res).to.be.equal(4);
        done();
      });
    });

    it('lindex', () => {
      const val = client.lindex('listkey', 0);
      expect(val).to.be.equal('zyx');
    });

    it('lindex (negative index)', () => {
      const val = client.lindex('listkey', -1);
      expect(val).to.be.equal('1');
    });

    it('lindex with callback', (done) => {
      client.lindex('listkey', 1, (err, res) => {
        expect(res).to.be.equal('abc');
        done();
      });
    });

    it('linsert (non-existing)', () => {
      const val = client.linsert('listkey2', 'before', 1, 'def');
      expect(val).to.be.equal(-1);
    });

    it('linsert', () => {
      const val = client.linsert('listkey', 'before', 1, 'def');
      expect(val).to.be.equal(5);
    });

    it('linsert (out of range)', () => {
      const val = client.linsert('listkey', 'before', 10, 'uvw');
      expect(val).to.be.equal(-1);
    });

    it('linsert with callback', (done) => {
      client.linsert('listkey', 'after', 1, 'uvw', (err, res) => {
        expect(res).to.be.equal(6);
        done();
      });
    });

    it('llen (non-existing)', () => {
      const val = client.llen('listkey2');
      expect(val).to.be.equal(0);
    });

    it('llen', () => {
      const val = client.llen('listkey');
      expect(val).to.be.equal(6);
    });

    it('llen with callback', (done) => {
      client.llen('listkey', (err, res) => {
        expect(res).to.be.equal(6);
        done();
      });
    });

    it('lpop (non-existing)', () => {
      let val = client.lpop('bad');
      expect(val).to.be.equal(null);
    });

    it('lpop', () => {
      let val = client.lpop('listkey');
      expect(val).to.be.equal('zyx');
    });

    it('lpop with callback', (done) => {
      client.lpop('listkey', (err, res) => {
        expect(res).to.be.equal('def');
        done();
      });
    });

    it('lrange (non-existing)', () => {
      let val = client.lrange('bad', 1, 1);
      expect(val).to.be.empty;
    });

    it('lrange', () => {
      let val = client.lrange('listkey', 0, -1);
      expect(val.length).to.be.equal(4);
      expect(val).to.include.members(['uvw', '1', '12', 'abc']);
    });

    it('lrange with callback', (done) => {
      client.lrange('listkey', 0, 1, (err, res) => {
        expect(res.length).to.be.equal(2);
        expect(res).to.include.members(['uvw','abc']);
        done();
      });
    });

    it('lrem (non-existing key)', () => {
      let val = client.lrem('bad', 1, 'thing');
      expect(val).to.be.equal(0);
    });

    it('lrem (non-existing value)', () => {
      let val = client.lrem('listkey', -1, 'nope');
      expect(val).to.be.equal(0);
    });

    it('lrem', () => {
      let val = client.lrem('listkey', 10, '12');
      expect(val).to.be.equal(1);
    });

    it('lrem with callback', (done) => {
      client.lrem('listkey', -1, '1', (err, res) => {
        expect(res).to.be.equal(1);
        done();
      });
    });

    it('lset (non-existing key)', () => {
      let testfn = () => { client.lset('bad', 1, '1'); }
      expect(testfn).to.throw('no such key');
    });

    it('lset (out-of-range)', () => {
      let testfn = () => { client.lset('listkey', 10, '1'); }
      expect(testfn).to.throw('out of range');
    });

    it('lset (bad index)', () => {
      let testfn = () => { client.lset('listkey', 'mm', '1'); }
      expect(testfn).to.throw('not an integer');
    });

    it('lset', () => {
      let val = client.lset('listkey', 0, 'abc');
      expect(val).to.be.equal('OK');
    });

    it('lset with callback', (done) => {
      client.lset('listkey', 1, 'def', (err, res) => {
        expect(res).to.be.equal('OK');
        done();
      });
    });

    it('rpush', () => {
      let val = client.rpush('listkey', 'ghi');
      expect(val).to.be.equal(3);
      val = client.rpush('listkey', 'jkl');
      expect(val).to.be.equal(4);
    });

    it('rpush with callback', (done) => {
      client.rpush('listkey', 'mno', (err, res) => {
        expect(res).to.be.equal(5);
        done();
      });
    });

    it('rpushx (non-existing)', () => {
      let val = client.rpushx('bad', '1');
      expect(val).to.be.equal(0);
    });

    it('rpushx', () => {
      let val = client.rpushx('listkey', 'pqr');
      expect(val).to.be.equal(6);
    });

    it('rpushx with callback', (done) => {
      client.rpushx('listkey', 'st', (err, res) => {
        expect(res).to.be.equal(7);
        done();
      });
    });

    it('rpop (non-existing)', () => {
      let val = client.rpop('bad');
      expect(val).to.be.equal(null);
    });

    it('rpop', () => {
      let val = client.rpop('listkey');
      expect(val).to.be.equal('st');
    });

    it('rpop with callback', (done) => {
      client.rpop('listkey', (err, res) => {
        expect(res).to.be.equal('pqr');
        done();
      });
    });

    it('rpoplpush (non-existing)', () => {
      let val = client.rpoplpush('bad');
      expect(val).to.be.equal(null);
    });

    it('rpoplpush', () => {
      let val = client.rpoplpush('listkey', 'listkey');
      expect(val).to.be.equal('mno');
      val = client.lindex('listkey', 0);
      expect(val).to.be.equal('mno');
    });

    it('rpoplpush with callback', (done) => {
      client.rpoplpush('listkey', 'listkey', (err, res) => {
        expect(res).to.be.equal('jkl');
        let val = client.lindex('listkey', 0);
        expect(val).to.be.equal('jkl');
        done();
      });
    });

    it('ltrim (non-existing)', () => {
      let val = client.ltrim('bad', 1, 1);
      expect(val).to.be.equal('OK');
    });

    it('ltrim', () => {
      client.rpush('listkey', '111');
      let val = client.ltrim('listkey', 2, -2);
      expect(val).to.be.equal('OK');
      val = client.llen('listkey');
      expect(val).to.be.equal(3);
      expect(client.cache['listkey'].value).to.include.members(['abc', 'def', 'ghi']);
    });

    it('ltrim with callback', (done) => {
      client.lpush('listkey', '111');
      client.rpush('listkey', '111');
      client.ltrim('listkey', 1, -2, (err, res) => {
        expect(res).to.be.equal('OK');
        let val = client.llen('listkey');
        expect(val).to.be.equal(3);
        expect(client.cache['listkey'].value).to.include.members(['abc', 'def', 'ghi']);
        done();
      });
    });
  });

  describe('Sets', () => {
    it('sadd', () => {
      let val = client.sadd('setkey', 'abc', 'def', 'abc', 'ghi');
      expect(val).to.be.equal(3);
    });

    it('sadd with callback', (done) => {
      client.sadd('setkey', 'abc', 'xyz', (err, res) => {
        expect(res).to.be.equal(1);
        done();
      });
    });

    it('scard (non-existing)', () => {
      let val = client.scard('bad');
      expect(val).to.be.equal(0);
    });

    it('scard', () => {
      let val = client.scard('setkey');
      expect(val).to.be.equal(4);
    });

    it('scard with callback', (done) => {
      client.scard('setkey', (err, res) => {
        expect(res).to.be.equal(4);
        done();
      });
    });

    it('sdiff (non-existing)', () => {
      let val = client.sdiff('setkey2', 'setkey3', 'setkey4');
      expect(val).to.be.empty;
    });

    it('sdiff', () => {
      client.sadd('setkey2', 'def');
      client.sadd('setkey3', 'abc', 'def', 'xyz', 'mno');
      let val = client.sdiff('setkey', 'setkey2', 'setkey3', 'setkey4');
      expect(val.length).to.be.equal(1);
      expect(val).to.include.members(['ghi']);
    });

    it('sdiff with callback', (done) => {
      client.sdiff('setkey', 'setkey2', 'setkey3', 'setkey4', (err, res) => {
        expect(res.length).to.be.equal(1);
        expect(res).to.include.members(['ghi']);
        done();
      });
    });

    it('sdiffstore', () => {
      let val = client.sdiffstore('newset', 'setkey', 'setkey2', 'setkey3', 'setkey4');
      expect(val).to.be.equal(1);
    });

    it('sdiffstore with callback', (done) => {
      let val = client.sdiffstore('newset', 'setkey', 'setkey2', 'setkey3', 'setkey4', (err, res) => {
        expect(res).to.be.equal(1);
        done();
      });
    });

    it('sinter', () => {
      let val = client.sinter('setkey', 'setkey2', 'setkey3');
      expect(val.length).to.be.equal(1);
      expect(val).to.include.members(['def']);
    });

    it('sinter with callback', (done) => {
      client.sinter('setkey', 'setkey2', 'setkey3', (err, res) => {
        expect(res.length).to.be.equal(1);
        expect(res).to.include.members(['def']);
        done();
      });
    });

    it('sinterstore', () => {
      let val = client.sinterstore('newset', 'setkey', 'setkey2', 'setkey3');
      expect(val).to.be.equal(1);
    });

    it('sinterstore with callback', (done) => {
      let val = client.sdiffstore('newset', 'setkey', 'setkey2', 'setkey3', (err, res) => {
        expect(res).to.be.equal(1);
        done();
      });
    });

    it('sunion', () => {
      let val = client.sunion('setkey', 'setkey2', 'setkey3', 'setkey4');
      expect(val.length).to.be.equal(5);
      expect(val).to.include.members(['abc', 'def', 'ghi', 'mno', 'xyz']);
    });

    it('sunion with callback', (done) => {
      client.sunion('setkey', 'setkey2', 'setkey3', 'setkey4', (err, res) => {
        expect(res.length).to.be.equal(5);
        expect(res).to.include.members(['abc', 'def', 'ghi', 'mno', 'xyz']);
        done();
      });
    });

    it('sunionstore', () => {
      let val = client.sunionstore('newset', 'setkey', 'setkey2', 'setkey3');
      expect(val).to.be.equal(4);
    });

    it('sunionstore with callback', (done) => {
      client.sunionstore('newset', 'setkey', 'setkey2', 'setkey3', 'setkey4', (err, res) => {
        expect(res).to.be.equal(4);
        done();
      });
    });

    it('sismember (non-existing)', () => {
      let val = client.sismember('bad', 'a');
      expect(val).to.be.equal(0);
    });

    it('sismember', () => {
      let val = client.sismember('setkey', 'a');
      expect(val).to.be.equal(0);
      val = client.sismember('setkey', 'abc');
      expect(val).to.be.equal(1);
    });

    it('sismember with callback', (done) => {
      client.sismember('setkey', 'abc', (err, res) => {
        expect(res).to.be.equal(1);
        done();
      });
    });

    it('smembers (non-existing)', () => {
      let val = client.smembers('badkey');
      expect(val).to.be.empty;
    });

    it('smembers', () => {
      let val = client.smembers('setkey');
      expect(val.length).to.be.equal(4);
      expect(val).to.include.members(['abc', 'def', 'ghi', 'xyz']);
    });

    it('smembers with callback', (done) => {
      client.smembers('setkey', (err, res) => {
        expect(res.length).to.be.equal(4);
        expect(res).to.include.members(['abc', 'def', 'ghi', 'xyz']);
        done();
      });
    });

    it('smove (non-existing)', () => {
      let val = client.smove('bad', 'newkey', 'a');
      expect(val).to.be.equal(0);
    });

    it('smove', () => {
      let val = client.smove('setkey', 'newset', 'abc');
      expect(val).to.be.equal(1);
    });

    it('smove with callback', (done) => {
      client.smove('newset', 'setkey', 'abc', (err, res) => {
        expect(res).to.be.equal(1);
        done();
      });
    });

    it('spop (non-existing)', () => {
      let val = client.spop('bad');
      expect(val).to.be.equal(null);
    });

    it('spop', () => {
      let val = client.spop('newset', 2);
      expect(val.length).to.be.equal(2);
    });

    it('spop with callback', (done) => {
      client.spop('newset', 2, (err, res) => {
        expect(res.length).to.be.equal(1);
        done();
      });
    });

    it('srandmember (non-existing)', () => {
      let val = client.srandmember('bad');
      expect(val).to.be.equal(null);
    });

    it('srandmember (non-existing /w count)', () => {
      let val = client.srandmember('bad', 1);
      expect(val).to.be.empty;
    });

    it('srandmember (no count)', () => {
      let val = client.srandmember('setkey');
      expect(val.length).to.be.equal(1);
    });

    it('srandmember (positive count)', () => {
      let val = client.srandmember('setkey', 10);
      expect(val.length).to.be.equal(4);
    });

    it('srandmember (negative count)', () => {
      let val = client.srandmember('setkey', -10);
      expect(val.length).to.be.equal(10);
    });

    it('srandmember with callback', (done) => {
      client.srandmember('setkey', 1, (err, res) => {
        expect(res.length).to.be.equal(1);
        done();
      })
    });

    it('srem (non-existing)', () => {
      let val = client.srem('bad', 'a', 'b');
      expect(val).to.be.equal(0);
    });

    it('srem', () => {
      let val = client.srem('setkey', 'a', 'xyz');
      expect(val).to.be.equal(1);
    });

    it('srem with callback', (done) => {
      client.srem('setkey', 'ghi', '123', (err, res) => {
        expect(res).to.be.equal(1);
        done();
      });
    });
  });

  describe('Sorted Sets', () => {
    it('zadd');
    it('zadd with callback');
    it('zcard');
    it('zcard with callback');
    it('zcount');
    it('zcount with callback');
    it('zincrby');
    it('zincrby with callback');
    it('zlexcount');
    it('zlexcount with callback');
    it('zrange');
    it('zrange with callback');
    it('zrangebylex');
    it('zrangebylex with callback');
    it('zrangebyscore');
    it('zrangebyscore with callback');
    it('zrank');
    it('zrank with callback');
    it('zrem');
    it('zrem with callback');
    it('zremrangebylex');
    it('zremrangebylex with callback');
    it('zremrangebyrank');
    it('zremrangebyrank with callback');
    it('zremrangebyscore');
    it('zremrangebyscore with callback');
    it('zrevrange');
    it('zrevrange with callback');
    it('zrevrangebylex');
    it('zrevrangebylex with callback');
    it('zrevrangebyscore');
    it('zrevrangebyscore with callback');
    it('zrevrank');
    it('zrevrank with callback');
    it('zscore');
    it('zscore with callback');
  });

  describe('Strings', () => {
    it('set');
    it('set with callback');
    it('append');
    it('append with callback');
    it('bitcount');
    it('bitcount with callback');
    it('bitop');
    it('bitop with callback');
    it('decr');
    it('decr with callback');
    it('decrby');
    it('decrby with callback');
    it('get');
    it('get with callback');
    it('getbit');
    it('getbit with callback');
    it('getrange');
    it('getrange with callback');
    it('getset');
    it('getset with callback');
    it('incr');
    it('incr with callback');
    it('incrby');
    it('incrby with callback');
    it('incrbyfloat');
    it('incrbyfloat with callback');
    it('mget');
    it('mget with callback');
    it('mset');
    it('mset with callback');
    it('msetnx');
    it('msetnx with callback');
    it('psetex');
    it('psetex with callback');
    it('setbit');
    it('setbit with callback');
    it('setex');
    it('setex with callback');
    it('setnx');
    it('setnx with callback');
    it('setrange');
    it('setrange with callback');
    it('strlen');
    it('strlen with callback');
  });

  describe('Transactions', () => {
    it('discard');
    it('discard with callback');
    it('exec');
    it('exec with callback');
    it('multi');
    it('multi with callback');
  });

  describe('Server', () => {
    let clock;
    before(() => {
      clock = lolex.install();
    });

    after(() => {
      clock.uninstall();
    });

    it('bgsave', () => {
      let val = client.bgsave();
      expect(val).to.equal('OK');
    });

    it('bgsave with callback', (done) => {
      client.bgsave((err, res) => {
        expect(res).to.equal('OK');
        done();
      });
    });

    it('dbsize', () => {
      let val = client.dbsize();
      expect(val).to.equal(8);
    });

    it('dbsize with callback', (done) => {
      client.dbsize((err, res) => {
        expect(res).to.equal(8);
        done();
      });
    });

    it('info', () => {
      let val = client.info();
      expect(val).to.be.equal('');
    });

    it('info with callback', (done) => {
      client.info(null, (err, res) => {
        expect(res).to.be.equal('');
        done();
      });
    });

    it('lastsave', () => {
      let val = client.lastsave();
      expect(val).to.be.equal(Date.now());
    });

    it('lastsave with callback', (done) => {
      client.lastsave((err, res) => {
        expect(res).to.be.equal(Date.now());
        done();
      });
    });

    it('role', () => {
      let val = client.role();
      expect(val).to.include.members(['master', 0, null]);
    });

    it('role with callback', (done) => {
      client.role((err, res) => {
        expect(res).to.include.members(['master', 0, null]);
        done();
      });
    });

    it('save', () => {
      let val = client.save();
      expect(val).to.equal('OK');
    });

    it('save with callback', (done) => {
      client.save((err, res) => {
        expect(res).to.equal('OK');
        done();
      });
    });

    it('time', () => {
      clock.tick(52002)
      let val = client.time();
      expect(val[0]).to.be.equal(52);
      expect(val[1]).to.be.equal(2000);
    });

    it('time with callback', (done) => {
      client.time((err, res) => {
        expect(res[0]).to.be.equal(52);
        expect(res[1]).to.be.equal(2000);
        done();
      });
    });

    it('select (bad index)', () => {
      let testfn = () => { client.select('bad'); }
      expect(testfn).to.throw('invalid DB index');
    });

    it('select', () => {
      let val = client.select(2);
      expect(val).to.be.equal('OK');
      expect(client.currentDBIndex).to.be.equal(2);
    });

    it('select with callback', () => {
      client.select(3, (err, res) => {
        expect(res).to.be.equal('OK');
        expect(client.currentDBIndex).to.be.equal(3);
      });
    })

    it('swapdb (bad source index)', () => {
      let testfn = () => { client.swapdb('bad', 1); }
      expect(testfn).to.throw('invalid DB index');
    });

    it('swapdb (bad dest index)', () => {
      let testfn = () => { client.swapdb(1, 'bad'); }
      expect(testfn).to.throw('invalid DB index');
    });

    it('swapdb', () => {
      client.set('c', 'd');
      let val = client.swapdb(2, 3);
      expect(val).to.be.equal('OK');
      expect(Object.keys(client.databases[2]).length).to.be.equal(1);
    });

    it('swapdb with callback', () => {
      client.swapdb(2, 3, (err, res) => {
        expect(res).to.be.equal('OK');
        expect(Object.keys(client.databases[3]).length).to.be.equal(1);
      });
    });

    it('flushdb', () => {
      client.set('a', 'b');
      let val = client.flushdb();
      expect(val).to.be.equal('OK');
      expect(client.cache).to.be.empty;
    });

    it('flushdb with callback', (done) => {
      client.set('a', 'b');
      client.flushdb((err, res) => {
        expect(res).to.be.equal('OK');
        expect(client.cache).to.be.empty;
        done();
      });
    });

    it('flushall', () => {
      client.select(1);
      client.set('a', 'b');
      let val = client.flushall();
      expect(val).to.be.equal('OK');
      expect(client.currentDBIndex).to.be.equal(0);
      expect(Object.keys(client.databases).length).to.be.equal(1);
      expect(client.cache).to.be.empty;
    });

    it('flushall with callback', (done) => {
      client.select(1);
      client.set('a', 'b');
      client.flushall((err, res) => {
        expect(res).to.be.equal('OK');
        expect(client.currentDBIndex).to.be.equal(0);
        expect(Object.keys(client.databases).length).to.be.equal(1);
        expect(client.cache).to.be.empty;
        done();
      });
    });
  });

  describe('Unsupported', () => {
    it('cluster', () => {
      const testfn = () => { client.cluster(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('readonly', () => {
      const testfn = () => { client.readonly(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('readwrite', () => {
      const testfn = () => { client.readwrite(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('geoadd', () => {
      const testfn = () => { client.readwrite(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('geodist', () => {
      const testfn = () => { client.geodist(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('geohash', () => {
      const testfn = () => { client.geohash(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('geopos', () => {
      const testfn = () => { client.geopos(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('georadius', () => {
      const testfn = () => { client.georadius(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('georadiusbymember', () => {
      const testfn = () => { client.georadiusbymember(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('hscan', () => {
      const testfn = () => { client.hscan(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('pfadd', () => {
      const testfn = () => { client.pfadd(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('pfcount', () => {
      const testfn = () => { client.pfcount(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('pfmerge', () => {
      const testfn = () => { client.pfmerge(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('migrate', () => {
      const testfn = () => { client.migrate(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('object', () => {
      const testfn = () => { client.object(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('scan', () => {
      const testfn = () => { client.scan(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('sort', () => {
      const testfn = () => { client.sort(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('wait', () => {
      const testfn = () => { client.wait(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('blpop', () => {
      const testfn = () => { client.blpop(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('brpop', () => {
      const testfn = () => { client.brpop(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('brpoplpush', () => {
      const testfn = () => { client.brpoplpush(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('psubscribe', () => {
      const testfn = () => { client.psubscribe(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('pubsub', () => {
      const testfn = () => { client.pubsub(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('publish', () => {
      const testfn = () => { client.publish(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('punsubscribe', () => {
      const testfn = () => { client.punsubscribe(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('suscribe', () => {
      const testfn = () => { client.suscribe(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('unsubscribe', () => {
      const testfn = () => { client.unsubscribe(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('script', () => {
      const testfn = () => { client.script(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('bgrewriteaof', () => {
      const testfn = () => { client.bgrewriteaof(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('client', () => {
      const testfn = () => { client.client(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('config', () => {
      const testfn = () => { client.config(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('debug', () => {
      const testfn = () => { client.debug(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('monitor', () => {
      const testfn = () => { client.monitor(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('shutdown', () => {
      const testfn = () => { client.shutdown(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('slaveof', () => {
      const testfn = () => { client.slaveof(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('slowlog', () => {
      const testfn = () => { client.slowlog(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('sync', () => {
      const testfn = () => { client.sync(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('sscan', () => {
      const testfn = () => { client.sscan(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('zinterstore', () => {
      const testfn = () => { client.zinterstore(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('zunionstore', () => {
      const testfn = () => { client.zunionstore(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('zscan', () => {
      const testfn = () => { client.zscan(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('bitfield', () => {
      const testfn = () => { client.bitfield(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('unwatch', () => {
      const testfn = () => { client.unwatch(); };
      expect(testfn).to.throw(MemoryCacheError);
    });

    it('watch', () => {
      const testfn = () => { client.watch(); };
      expect(testfn).to.throw(MemoryCacheError);
    });
  });
});
