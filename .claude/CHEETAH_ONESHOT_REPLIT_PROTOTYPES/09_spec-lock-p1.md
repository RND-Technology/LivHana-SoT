### Spec Lock (P1)
```yaml
# specs/customer-profile.spec.yaml
paths:
  /api/customers/{id}/profile:
    get:
      summary: Get enriched customer profile
      parameters:
        - name: id
          in: path
          required: true
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CustomerProfile'

components:
  schemas:
    CustomerProfile:
      type: object
      properties:
        id:
          type: string
        basic:
          type: object
        purchase_history:
          type: array
        preferences:
          type: object
        content_engagement:
          type: array
        predictions:
          type: object
```
