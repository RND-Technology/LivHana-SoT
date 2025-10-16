### Email Volume by Day

```sql
SELECT * FROM `communications.gmail_daily_volume`
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
ORDER BY date DESC;
```
