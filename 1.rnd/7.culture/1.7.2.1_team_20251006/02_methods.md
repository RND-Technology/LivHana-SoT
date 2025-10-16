## Methods

* [Create Team Member](../../doc/api/team.md#create-team-member)
* [Bulk Create Team Members](../../doc/api/team.md#bulk-create-team-members)
* [Bulk Update Team Members](../../doc/api/team.md#bulk-update-team-members)
* [List Jobs](../../doc/api/team.md#list-jobs)
* [Create Job](../../doc/api/team.md#create-job)
* [Retrieve Job](../../doc/api/team.md#retrieve-job)
* [Update Job](../../doc/api/team.md#update-job)
* [Search Team Members](../../doc/api/team.md#search-team-members)
* [Retrieve Team Member](../../doc/api/team.md#retrieve-team-member)
* [Update Team Member](../../doc/api/team.md#update-team-member)
* [Retrieve Wage Setting](../../doc/api/team.md#retrieve-wage-setting)
* [Update Wage Setting](../../doc/api/team.md#update-wage-setting)

# Create Team Member

Creates a single `TeamMember` object. The `TeamMember` object is returned on successful creates.
You must provide the following values in your request to this endpoint:

* `given_name`
* `family_name`

Learn about [Troubleshooting the Team API](https://developer.squareup.com/docs/team/troubleshooting#createteammember).

```ts
async createTeamMember(
  body: CreateTeamMemberRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateTeamMemberResponse>>
```
