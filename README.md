Here is a short, crisp, and clean markdown section ready to add to your [`README.md`](file:///d:/EMS/employee-management/README.md):

```markdown
## API Documentation & Testing

Base URL: `http://localhost:3000`

### Endpoints

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/employees` | Fetch all employees | `200`, `500` |
| `POST` | `/api/employees` | Create a new employee | `201`, `400`, `409`, `500` |
| `PUT` | `/api/employees/:id` | Update an existing employee | `200`, `400`, `404`, `409`, `500` |
| `DELETE` | `/api/employees/:id` | Delete an employee by ID | `200`, `400`, `404`, `500` |

---

### Request Payloads (JSON)

#### 1. Create Employee (`POST /api/employees`)
```json
{
  "name": "Priya Sharma",
  "email": "priya.sharma@example.com",
  "department": "Human Resources",
  "position": "HR Executive",
  "salary": 48000
}
```

#### 2. Update Employee (`PUT /api/employees/:id`)
```json
{
  "name": "Priya Sharma Updated",
  "email": "priya.sharma@example.com",
  "department": "Human Resources",
  "position": "Senior HR Lead",
  "salary": 58000
}
```

---

### Quick Test Commands

#### cURL (Terminal / Command Prompt)

```bash
# 1. GET all
curl.exe -s http://localhost:3000/api/employees

# 2. POST create
curl.exe -X POST http://localhost:3000/api/employees -H "Content-Type: application/json" -d "{\"name\":\"Priya Sharma\",\"email\":\"priya.sharma@example.com\",\"department\":\"Human Resources\",\"position\":\"HR Executive\",\"salary\":48000}"

# 3. PUT update (replace 1 with actual ID)
curl.exe -X PUT http://localhost:3000/api/employees/1 -H "Content-Type: application/json" -d "{\"name\":\"Priya Sharma Updated\",\"email\":\"priya.sharma@example.com\",\"department\":\"Human Resources\",\"position\":\"Senior HR Lead\",\"salary\":58000}"

# 4. DELETE (replace 1 with actual ID)
curl.exe -X DELETE http://localhost:3000/api/employees/1
```

#### Browser Console (`F12` -> Console)

```javascript
// GET
fetch("/api/employees").then(r => r.json()).then(console.log);

// POST
fetch("/api/employees", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Priya Sharma", email: "priya@example.com", department: "HR", position: "Lead", salary: 48000 })
}).then(r => r.json()).then(console.log);

// PUT (replace 1 with ID)
fetch("/api/employees/1", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Priya Sharma Updated", email: "priya@example.com", department: "HR", position: "Director", salary: 60000 })
}).then(r => r.json()).then(console.log);

// DELETE (replace 1 with ID)
fetch("/api/employees/1", { method: "DELETE" }).then(r => r.json()).then(console.log);
```
```
*