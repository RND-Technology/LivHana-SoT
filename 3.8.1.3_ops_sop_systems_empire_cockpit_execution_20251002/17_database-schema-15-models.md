## 🗄️ DATABASE SCHEMA (15 MODELS)

| Model | Relations | Purpose |
|-------|-----------|---------|
| **User** | missions, orders, raffles, petitions, xp, notifications | Core user account + gamification |
| **Mission** | completions | Gamified tasks with XP rewards |
| **UserMission** | user, mission | Completion tracking + progress |
| **XPEvent** | user | XP transaction log for auditing |
| **Product** | orderItems | Cannabis products with COA + Greeks |
| **Order** | user, items | E-commerce orders with status |
| **OrderItem** | order, product | Order line items |
| **Raffle** | entries | Blue Dream pre-roll giveaways |
| **RaffleEntry** | raffle, user | User raffle participation |
| **Petition** | signatures | Policy petitions (SB3, etc.) |
| **PetitionSignature** | petition, user | User signatures with comments |
| **Episode** | - | High Noon Cartoon episodes |
| **Notification** | user | User notifications for events |

**Total Relations**: 25+ foreign keys ensuring referential integrity

---
