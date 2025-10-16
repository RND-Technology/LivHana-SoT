## Example Usage

```ts
const jobId = 'job_id2';

const body: UpdateJobRequest = {
  job: {
    title: 'Cashier 1',
    isTipEligible: true,
  },
};

try {
  const { result, ...httpResponse } = await teamApi.updateJob(
  jobId,
  body
);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Team Members

Returns a paginated list of `TeamMember` objects for a business.
The list can be filtered by location IDs, `ACTIVE` or `INACTIVE` status, or whether
the team member is the Square account owner.

```ts
async searchTeamMembers(
  body: SearchTeamMembersRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchTeamMembersResponse>>
```
