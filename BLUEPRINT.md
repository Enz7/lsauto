
# LSAuto Digital Ecosystem Blueprint

## SECTION 4 — FULL DATABASE SCHEMA (English)

### Table: Users
- `id`: UUID (Primary Key)
- `role_id`: FK -> Roles
- `email`: VARCHAR(255) (Unique)
- `password_hash`: TEXT
- `full_name`: VARCHAR(255)
- `phone`: VARCHAR(20)
- `is_verified`: BOOLEAN
- `created_at`: TIMESTAMP
- `device_fingerprint`: VARCHAR(255) (For Anti-Fraud)

### Table: Suppliers
- `id`: UUID (FK -> Users)
- `level`: INT (1-8)
- `vlog_url`: VARCHAR(255)
- `passport_scan`: BLOB (Encrypted)
- `video_verification_url`: VARCHAR(255)
- `rating`: DECIMAL(3,2)
- `deals_completed`: INT

### Table: Requests (Clients)
- `id`: UUID
- `client_id`: FK -> Users
- `budget_rub`: DECIMAL(15,2)
- `car_specs`: JSONB
- `status`: ENUM('open', 'in_progress', 'closed')

### Table: Chats & Messages
- `id`: UUID
- `chat_type`: ENUM('p2p', 'suppliers_global')
- `participant_ids`: ARRAY(UUID)

---

## SECTION 5 — API ARCHITECTURE (REST)

### AUTH
- `POST /v1/auth/register` (Roles: Client, Supplier, Broker)
- `POST /v1/auth/login` (Returns JWT + Device Check)

### SUPPLIERS
- `GET /v1/suppliers` (Filters: City, Level, Rating)
- `POST /v1/suppliers/verify` (Passport + Video Upload)

### REQUESTS
- `POST /v1/requests` (Client only)
- `GET /v1/requests/feed` (Supplier/Broker only)

---

## SECTION 9 — ANTI-FRAUD & SECURITY

### Fraud Scoring Formula:
`S = (0.3 * V) + (0.2 * D) + (0.5 * B)`
- `V`: Verification Status (Video + Docs)
- `D`: Device Uniqueness (Fingerprint)
- `B`: Behavior Pattern (Clickstream analysis)

### Logic:
1. **Device Fingerprinting:** Prevent multi-account supplier spam.
2. **Video Verification:** Comparison of AI-face-check from video vs Passport photo.
3. **Secure Escrow:** Payment release only after customs clearance document upload.

---

## SECTION 10 — BUSINESS PLAN

### Revenue Model:
- **Phase 1 (Growth):** First 100 suppliers FREE (Lifetime level 1).
- **Phase 2 (Scaling):** 1-3% transaction fee for Level 2-8 suppliers.
- **Phase 3 (Premium):** Paid promotion in search results for Brokers.

### Unit Economics (Target):
- **CAC (Customer Acquisition Cost):** $45
- **LTV (Lifetime Value):** $650
- **Payback Period:** 2 months

---

## SECTION 11 — 12-MONTH ROADMAP
- **M0-M3:** MVP Launch (Catalog, Requests, Basic Auth).
- **M4-M6:** Supplier Levels + Vlog + Anti-Fraud v1.
- **M7-M12:** Mobile App (Native iOS/Android) + Global Expansion.
