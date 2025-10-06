//
// distributions:
//
// measure and report approximation error on classic distribution functions
//
const TDigest = require('./tdigest').TDigest;

function distributions(nruns, nsamples, npercentiles) {
    [uniform,
     gaussian,
     chisq,
     exponential,
     make_brownian()
    ].map( function(dist) {
        const fname = dist.toString().match(/function ([^\(]+)/)[1];
        console.log(fname + ": " + nruns + " runs digesting " +
                    nsamples + " points:");
        const errs = [0,0];
        for (let i = 0 ; i < nruns ; i++) {
            const err = compare_edf(dist, nsamples, npercentiles);
            errs[0] += err[0];
            errs[1] += err[1];
        }
        errs[0] /= nruns; 
        errs[1] /= nruns; 
        console.log(fname + ": avg rmse (relative) == " + errs[0] +
                    ", avg max err (relative) == " + errs[1]);
    });
}

function compare(d1, d2, N) {
    // compare digests d1 and d2 over N evenly spaced percentiles.
    // return RMSE and maximum error, both relative to the
    // distributions' maximum observed magnitude.
    //
    let maxerr = 0;
    let rmse = 0;
    const scale = Math.max(Math.abs(d1.percentile(0)), Math.abs(d1.percentile(1)),
                         Math.abs(d2.percentile(0)), Math.abs(d2.percentile(1)));
    for (var i = 0 ; i <= N ; i += 1) {
        const q1 = d1.percentile(i/N);
        const q2 = d2.percentile(i/N);
        maxerr = Math.max(maxerr, Math.abs(q1 - q2));
        rmse += (q1 - q2) * (q1 - q2);
    }
    rmse = Math.sqrt(rmse/i);
    return [rmse/scale, maxerr/scale];
}
    
function compare_edf(f, nsamples, npercentiles) {
    // draw samples from f, digest them, and compare digest percentile
    // results to EDF of original samples.
    //
    const edf = new TDigest(false);
    const digest = new TDigest();
    for (let i = 0 ; i < nsamples ; i++) {
        const x = f();
        edf.push(x);
        digest.push(x);
    }
    digest.compress();
    return compare(edf, digest, npercentiles);
}

function uniform() {
    return Math.random();
}

let _extra = null;
function gaussian(mean, sigma) {
    mean = mean || 0;
    sigma = sigma || 1;
    if (_extra != null) { 
        const result = mean + sigma * _extra; 
        _extra = null;
        return result;
    } else {
        const u = 2 * Math.random() - 1;
        const v = 2 * Math.random() - 1;
        const r = u*u + v*v;
        if (r == 0 || r > 1) {
            // out of bounds, try again
            return gaussian(mean, sigma);
        }
        const c = Math.sqrt(-2*Math.log(r)/r);
        _extra = u * c;
        return mean + sigma * v * c;
    }
}
    
function chisq() {
    const k = 3;
    let total = 0;
    for (let i = 0 ; i < k ; i++) {
        const x = gaussian();
        total += x * x;
    }
    return total;
}

function exponential() {
    return Math.exp(- Math.random());
}

function make_brownian() {
    let brownian_state = 0;
    return function brownian() {
        brownian_state += gaussian();
        return brownian_state;
    };
}

distributions(10, 100000, 100);
