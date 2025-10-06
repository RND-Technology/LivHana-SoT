// test the discrete distribution behavior, in which TDigest merging is
// disabled and mass is accumulated at points and reported exactly.
//
const TDigest = require('../tdigest').TDigest;
const assert = require('better-assert');
assert.deepEqual = require('chai').assert.deepEqual;

describe('discrete digests', function(){
    it('consumes increasing-valued points', function(){
        const tdigest = new TDigest(false);
        let i, N = 100;
        for (i = 0 ; i < N ; i += 1) {
            tdigest.push(i*10);
        }
        const points = tdigest.toArray(true);
        for (i = 0 ; i < N ; i += 1) {
            assert(points[i].mean === i*10);
        }
    });
    it('consumes decreasing-valued points', function(){
        const tdigest = new TDigest(false);
        let i, N = 100;
        for (i = N - 1 ; i >= 0 ; i = i - 1) {
            tdigest.push(i*10);
        }
        const points = tdigest.toArray(true);
        for (i = 0 ; i < N ; i += 1) {
            assert(points[i].mean === i*10);
        }
    });
    it('consumes nonnumeric points', function(){
        const tdigest = new TDigest(false);
        tdigest.push("foo");
        tdigest.push("bar");
        tdigest.push("baz");
        tdigest.push("foo");
        tdigest.push("freen");
        tdigest.push("bork");
        tdigest.push("bork");
        tdigest.push("bork");
        tdigest.push("books");
        const points = tdigest.toArray();
        assert.deepEqual(points, [
            {mean:"bar", n:1},
            {mean:"baz", n:1},
            {mean:"books", n:1},
            {mean:"bork", n:3},
            {mean:"foo", n:2},
            {mean:"freen", n:1},
        ]);
    });
    it('consumes same-valued points into a single point', function(){
        const tdigest = new TDigest(false);
        let i, N = 100;
        for (i = 0 ; i < N ; i = i + 1) {
            tdigest.push(1000);
        }
        const points = tdigest.toArray();
        assert.deepEqual(points, [{mean: 1000, n:N}]);
    });
    it('selects a run of duplicates containing the percentile', function(){
        const tdigest = new TDigest(false);
        tdigest.push([ 5, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                       3, 0, 0, 0, 0, 6, 1, 0, 6, 5, 3, 6, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0 ]);
        assert(tdigest.percentile(0.5) === 0);
    });
    it('handles multiple duplicates', function(){
        const tdigest = new TDigest(false);
        let i, N = 10;
        for (i = 0 ; i < N ; i++) {
            tdigest.push(0.0);
            tdigest.push(1.0);
            tdigest.push(0.5);
        }
        assert.deepEqual(
            tdigest.toArray(),
            [{mean:0.0, n:N},
             {mean:0.5, n:N},
             {mean:1.0, n:N}]
        );
    });
});

describe('discrete percentile ranks', function(){
    it('from a single point', function(){
        const tdigest = new TDigest(false);
        tdigest.push(0);
        const x = [-0.5, 0, 0.5, 1.0, 1.5];
        const q = [0, 1, 1, 1, 1];
        assert.deepEqual(tdigest.p_rank(x), q);
    });
    it('from two points', function(){
        const tdigest = new TDigest(false);
        tdigest.push([0, 1]);
        const x = [-0.5, 0, 0.5, 1.0, 1.5];
        const q = [0, 0.5, 0.5, 1.0, 1.0];
        assert.deepEqual(tdigest.p_rank(x), q);
    });
    it('from three points', function(){
        const tdigest = new TDigest(false);
        tdigest.push([-1, 0, 1] );
        const x = [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5];
        const q = [0, 1/3, 1/3, 2/3, 2/3, 1, 1];
        assert.deepEqual(tdigest.p_rank(x), q);
    });
    it('from three points is same as from multiples of those points', function(){
        const tdigest = new TDigest(false);
        tdigest.push([0,1,-1]);
        const x = [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5];
        const result1 = tdigest.p_rank(x);
        tdigest.push([0,1,-1]);
        tdigest.push([0,1,-1]);
        const result2 = tdigest.p_rank(x);
        assert.deepEqual(result1, result2);
    });
    it('from four points away from the origin', function(){
        const tdigest = new TDigest(false);
        tdigest.push([10,11,12,13]);
        const x = [9, 10, 11, 12, 13, 14];
        const q = [0, 1/4, 2/4, 3/4, 1, 1];
        assert.deepEqual(tdigest.p_rank(x), q);
    });
    it('from four points is same as from multiples of those points', function(){
        const tdigest = new TDigest(false);
        tdigest.push([10,11,12,13]);
        const x = [9, 10, 11, 12, 13, 14];
        const result1 = tdigest.p_rank(x);
        tdigest.push([10,11,12,13]);
        tdigest.push([10,11,12,13]);
        const result2 = tdigest.p_rank(x);
        assert.deepEqual(result1, result2);
    });
    it('from nonnumeric points', function(){
        const tdigest = new TDigest(false);
        tdigest.push("foo");
        tdigest.push("bar");
        tdigest.push("baz");
        tdigest.push("freen");
        const x = ["bar", "baz", "foo", "freen"];
        const q = [1/4, 2/4, 3/4, 4/4];
        assert.deepEqual(tdigest.p_rank(x), q);
    });
});

describe('discrete percentiles', function(){
    it('from a single point', function(){
        const tdigest = new TDigest(false);
        tdigest.push(0);
        const p = [0, 0.5, 1.0];
        const x = [0, 0, 0];
        assert.deepEqual(tdigest.percentile(p), x);
    });
    it('from two points', function(){
        const tdigest = new TDigest(false);
        tdigest.push([0, 10]);
        const p = [0, 1/4, 1/2, 3/4, 1];
        const x = [0, 0, 0, 10, 10];
        assert.deepEqual(tdigest.percentile(p), x);
    });
    it('from three points', function(){
        const tdigest = new TDigest(false);
        tdigest.push([0, 5, 10]);
        const p = [0, 1/4, 1/2.9, 1/2, 2/3, 3/4, 1];
        const x = [0, 0, 5, 5, 5, 10, 10];
        assert.deepEqual(tdigest.percentile(p), x);
    });
    it('from four points away from the origin', function(){
        const tdigest = new TDigest(false);
        tdigest.push([10,11,12,13]);
        const p = [0, 1/4, 1/2, 3/4, 1];
        const x = [10, 10, 11, 12, 13];
        assert.deepEqual(tdigest.percentile(p), x);
    });
    it('from nonnumeric points', function(){
        const tdigest = new TDigest(false);
        tdigest.push("foo");
        tdigest.push("bar");
        tdigest.push("baz");
        tdigest.push("freen");
        const p = [0, 1/4, 1/2, 3/4, 1];
        const x = ["bar", "bar", "baz", "foo", "freen"];
        assert.deepEqual(tdigest.percentile(p), x);
    });
});
