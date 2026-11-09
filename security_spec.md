# RycreoShop Security Specification

## 1. Data Invariants
- Only verified administrators (`isAdmin()`) can modify store configurations, products, categories, hero slides, and static content.
- Public visitors can read the store catalog (`/store/{docId}`) but cannot write to it.
- Public customers can only create valid orders with strict validation (`/orders/{orderId}`) and cannot read, list, update, or delete orders directly.
- Orders collection list and get operations are strictly restricted to authenticated administrators.
- Search telemetry logs can only be created with string queries under 200 characters, and can only be read/deleted by administrators.
- Catch-all default deny prevents access to undeclared collections or paths.

## 2. The "Dirty Dozen" Threat Payloads
1. **Unauthenticated Store Overwrite:** An anonymous user attempts to update `/store/data` with modified product prices -> Expected: PERMISSION_DENIED.
2. **Catalog Deletion Attack:** An unauthenticated user attempts to delete `/store/data` -> Expected: PERMISSION_DENIED.
3. **Public Order Scraping:** An unauthenticated user tries to list all customer orders via `getDocs(collection(db, 'orders'))` -> Expected: PERMISSION_DENIED.
4. **Order Status Tampering:** A visitor attempts to mark an order as "Delivered" or "Paid" via `updateDoc` -> Expected: PERMISSION_DENIED.
5. **Malicious Order Deletion:** A visitor attempts to delete an order record -> Expected: PERMISSION_DENIED.
6. **Order Bombing (Empty/Invalid):** A bot attempts to create an order without items or customer information -> Expected: PERMISSION_DENIED.
7. **Negative Total Amount:** A user attempts to submit an order with a negative total amount -> Expected: PERMISSION_DENIED.
8. **Extreme Payload Injection:** A user attempts to submit an order with a 50MB string in the address field -> Expected: PERMISSION_DENIED.
9. **Admin Document Spoofing:** An unauthenticated user attempts to create a document in `/admins/{uid}` claiming admin privilege -> Expected: PERMISSION_DENIED.
10. **Telemetry Scraping:** A public user attempts to read search telemetry logs containing customer search history -> Expected: PERMISSION_DENIED.
11. **Telemetry Poisoning:** A user attempts to submit a search log with a non-string or 100KB query -> Expected: PERMISSION_DENIED.
12. **Undeclared Collection Injection:** An attacker attempts to write to `/internal_secrets/key` -> Expected: PERMISSION_DENIED.
