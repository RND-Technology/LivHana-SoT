## Example Usage

```ts
const body: BulkUpdateTeamMembersRequest = {
  teamMembers: {
    'AFMwA08kR-MIF-3Vs0OE': {
      teamMember: {
        referenceId: 'reference_id_2',
        status: 'ACTIVE',
        givenName: 'Jane',
        familyName: 'Smith',
        emailAddress: 'jane_smith@gmail.com',
        phoneNumber: '+14159223334',
        assignedLocations: {
          assignmentType: 'ALL_CURRENT_AND_FUTURE_LOCATIONS',
        },
      },
    },
    'fpgteZNMaf0qOK-a4t6P': {
      teamMember: {
        referenceId: 'reference_id_1',
        status: 'ACTIVE',
        givenName: 'Joe',
        familyName: 'Doe',
        emailAddress: 'joe_doe@gmail.com',
        phoneNumber: '+14159283333',
        assignedLocations: {
          assignmentType: 'EXPLICIT_LOCATIONS',
          locationIds: [
            'YSGH2WBKG94QZ',
            'GA2Y9HSJ8KRYT'
          ],
        },
      },
    }
  },
};

try {
  const { result, ...httpResponse } = await teamApi.bulkUpdateTeamMembers(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# List Jobs

Lists jobs in a seller account. Results are sorted by title in ascending order.

```ts
async listJobs(
  cursor?: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListJobsResponse>>
```
