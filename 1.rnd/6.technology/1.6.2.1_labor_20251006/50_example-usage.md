## Example Usage

```ts
const id = 'id0';

const body: UpdateWorkweekConfigRequest = {
  workweekConfig: {
    startOfWeek: 'MON',
    startOfDayLocalTime: '10:00',
    version: 10,
  },
};

try {
  const { result, ...httpResponse } = await laborApi.updateWorkweekConfig(
  id,
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
