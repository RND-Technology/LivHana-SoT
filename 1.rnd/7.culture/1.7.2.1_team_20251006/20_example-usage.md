## Example Usage

```ts
const jobId = 'job_id2';

try {
  const { result, ...httpResponse } = await teamApi.retrieveJob(jobId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Job

Updates the title or tip eligibility of a job. Changes to the title propagate to all
`JobAssignment`, `Shift`, and `TeamMemberWage` objects that reference the job ID. Changes to
tip eligibility propagate to all `TeamMemberWage` objects that reference the job ID.

```ts
async updateJob(
  jobId: string,
  body: UpdateJobRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateJobResponse>>
```
