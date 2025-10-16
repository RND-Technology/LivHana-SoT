### Raffle System

- `GET /api/raffles` - List all raffles
- `GET /api/raffles/:raffleId` - Get raffle details
- `GET /api/raffles/:raffleId/progress` - Raffle progress
- `GET /api/raffles/:raffleId/tickets/:customerId` - Customer tickets
- `POST /api/raffles/:raffleId/purchase` - Buy raffle tickets
- `POST /api/raffles` - Create new raffle
- `PUT /api/raffles/:raffleId` - Update raffle
- `POST /api/raffles/:raffleId/draw` - Draw raffle winner
- `GET /api/raffles/stats` - Raffle statistics
- `DELETE /api/raffles/:raffleId/cancel` - Cancel raffle
