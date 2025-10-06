export default function(interpolator, n) {
  const samples = new Array(n);
  for (let i = 0; i < n; ++i) samples[i] = interpolator(i / (n - 1));
  return samples;
}
