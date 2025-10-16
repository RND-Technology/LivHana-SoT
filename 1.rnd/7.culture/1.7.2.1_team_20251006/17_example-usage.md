## Example Usage

```ts
const body: CreateJobRequest = {
  job: {
    title: 'Cashier',
    isTipEligible: true,
  },
  idempotencyKey: 'idempotency-key-0',
};

try {
  const { result, ...httpResponse } = await teamApi.createJob(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Job

Retrieves a specified job.

```ts
async retrieveJob(
  jobId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveJobResponse>>
```
