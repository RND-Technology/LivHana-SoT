const Digest = require('../tdigest').Digest;
const assert = require('better-assert');
assert.deepEqual = require('chai').assert.deepEqual;

describe('Digests in discrete mode', function(){
    it('consumes same-valued points into a single point', function(){
        const digest = new Digest({mode:'disc'}); 
        let i, N = 1000;
        for (i = 0 ; i < N ; i = i + 1) {
            digest.push(42);
        }
        const points = digest.toArray();
        assert.deepEqual(points, [{mean: 42, n:N}]);
    });
    it('handles multiple duplicates', function(){
        const digest = new Digest({mode:'disc'}); 
        let i, N = 10;
        for (i = 0 ; i < N ; i++) {
            digest.push(0.0);
            digest.push(1.0);
            digest.push(0.5);
        }
        assert.deepEqual(
            digest.toArray(),
            [{mean:0.0, n:N},
             {mean:0.5, n:N},
             {mean:1.0, n:N}]
        );
    }); 
});

describe('Digests in continuous mode', function(){
    // these results should be the same as a plain old TDigest
    //
    it('compresses points and preserves bounds', function(){
        const digest = new Digest({mode:'cont'}); 
        let i, N = 100;
        for (i = 0 ; i < N ; i += 1) {
            digest.push(i*10);
        }
        assert(digest.size() === 100);
        digest.delta = 0.1; // encourage merging (don't do this!)
        digest.compress();
        const points = digest.toArray();
        assert(points.length < 100);
        assert(points[0].mean === 0);
        assert(points[points.length-1].mean === (N - 1) * 10);
    });
    it('automatically compresses during ingest', function(){
        const digest = new Digest({mode:'cont'}); 
        let i, N = 10000;
        for (i = 0 ; i < N ; i += 1) {
            digest.push(i*10);
        }
        const points = digest.toArray();
        assert(digest.nreset > 1);
        assert(points.length < 10000);
        assert(points[0].mean === 0);
        assert(points[points.length-1].mean === 99990);
    });
});

describe('Digests in auto mode', function(){
    it('preserves a discrete distribution', function(){
        const digest = new Digest(); 
        let i, ntimes = 1000, nvals=100;
        for (i = 0 ; i < ntimes ; i++) {
            for (j = 0 ; j < nvals ; j++) {
                digest.push(j);
            }
        }
        const result = digest.toArray();
        for (i = 0 ; i < nvals ; i++) {
            assert.deepEqual(result[i], {mean:i, n:ntimes});
        }
    }); 
    it('compresses a continuous distribution', function(){
        const digest = new Digest(); 
        let i, N = 10, M=1000;
        for (i = 0 ; i < N ; i++) {
            for (i = 0 ; i < M ; i++) {
                digest.push(Math.random());
            }
        }
        const result = digest.toArray();
        assert(result.length < digest.n);
    }); 
});


