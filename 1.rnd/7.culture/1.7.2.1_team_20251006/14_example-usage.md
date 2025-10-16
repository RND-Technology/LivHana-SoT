## Example Usage

```ts
try {
  const { result, ...httpResponse } = await teamApi.listJobs();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Job

Creates a job in a seller account. A job defines a title and tip eligibility. Note that
compensation is defined in a [job assignment](../../doc/models/job-assignment.md) in a team member's wage setting.

```ts
async createJob(
  body: CreateJobRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateJobResponse>>
```
