# Data Model: Project Audit and Polish

The audit does not introduce new database tables, but it reviews existing models.

## Entities

### CartItem (Client-Side)
- **id**: string
- **name**: string
- **price**: number
- **image**: string
- **category**: string
- **size**: string
- **quantity**: number

### Products (Supabase)
- Requires review of Row Level Security to ensure read operations are public and mutations are restricted to authenticated admins.
