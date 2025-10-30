## Example Usage

```ts
const body: BulkCreateTeamMembersRequest = {
  teamMembers: {
    'idempotency-key-1': {
      teamMember: {
        referenceId: 'reference_id_1',
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
    },
    'idempotency-key-2': {
      teamMember: {
        referenceId: 'reference_id_2',
        givenName: 'Jane',
        familyName: 'Smith',
        emailAddress: 'jane_smith@gmail.com',
        phoneNumber: '+14159223334',
        assignedLocations: {
          assignmentType: 'ALL_CURRENT_AND_FUTURE_LOCATIONS',
        },
      },
    }
  },
};

try {
  const { result, ...httpResponse } = await teamApi.bulkCreateTeamMembers(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Bulk Update Team Members

Updates multiple `TeamMember` objects. The updated `TeamMember` objects are returned on successful updates.
This process is non-transactional and processes as much of the request as possible. If one of the updates in
the request cannot be successfully processed, the request is not marked as failed, but the body of the response
contains explicit error information for the failed update.
Learn about [Troubleshooting the Team API](https://developer.squareup.com/docs/team/troubleshooting#bulk-update-team-members).

```ts
async bulkUpdateTeamMembers(
  body: BulkUpdateTeamMembersRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkUpdateTeamMembersResponse>>
```
