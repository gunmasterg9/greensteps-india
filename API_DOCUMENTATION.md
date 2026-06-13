# GreenSteps India - API Documentation

The GreenSteps India backend service runs on port `5000` in development. All endpoints are relative to the API gateway path `/api/v1`.

---

## Authentication & Authorization

All private endpoints require a bearer JSON Web Token (JWT) sent in the HTTP headers:
```http
Authorization: Bearer <TOKEN>
```
The application supports dual token modes:
1. **Firebase ID Token**: Issued by Google/Firebase Auth client SDK. Validated using the Firebase Admin SDK on the backend.
2. **Developer Mock Token**: Toggled in development mode. Any token starting with `mock-token-` is authenticated.
   - Example: `mock-token-citizen@greensteps.in|Rahul Kumar`

---

## Endpoint Index

### 1. Authentication
*   **POST** `/auth/login` - Synchronize profile.
*   **GET** `/auth/me` - Retrieve current verified profile.

### 2. Citizens Profile
*   **GET** `/users/profile` - Fetch current user.
*   **PUT** `/users/profile` - Update profile state, city, name, or carbonScore.

### 3. Footprint Logging
*   **GET** `/activities` - Fetch activity history.
*   **POST** `/activities` - Record an activity and claim green points.

### 4. Calculator (Public)
*   **POST** `/carbon/calculate` - Estimate footprint from aggregated parameters.

### 5. Gamification (Challenges & Rewards)
*   **GET** `/challenges` - Fetch active community challenges.
*   **POST** `/challenges/:id/join` - Join a challenge.
*   **POST** `/challenges/:id/complete` - Claim rewards and earn badge.

### 6. Standings (Leaderboard)
*   **GET** `/leaderboard` - Fetch top citizen rankings and state-wise averages.

### 7. Administrative Controls
*   **GET** `/admin/users` - List all registered citizens.
*   **DELETE** `/admin/users/:id` - Delete user and clean associated activities.
*   **POST** `/admin/challenges` - Create new challenges.
*   **GET** `/admin/analytics` - System metrics (users count, savings index, category distributions).

---

## Detailed Endpoint Specifications

### Synchronize / Login Profile
Syncs user details after authentication popup.

*   **URL**: `/auth/login`
*   **Method**: `POST`
*   **Auth Required**: YES
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "user": {
        "_id": "6612d3e9c5f87b328a6f44d1",
        "name": "Rahul Kumar",
        "email": "citizen@greensteps.in",
        "firebaseUid": "mock-uid-citizen@greensteps.in",
        "state": "Delhi",
        "city": "New Delhi",
        "carbonScore": 2400,
        "greenPoints": 120,
        "badges": ["Earth Friend"],
        "role": "user",
        "createdAt": "2026-06-13T14:51:15.000Z"
      },
      "message": "Authentication successful"
    }
    ```

---

### Update User Profile
Saves new state, city, or carbon footprint score to a user's account.

*   **URL**: `/users/profile`
*   **Method**: `PUT`
*   **Auth Required**: YES
*   **Request Body**:
    ```json
    {
      "name": "Rahul Kumar",
      "state": "Gujarat",
      "city": "Ahmedabad",
      "carbonScore": 1850
    }
    ```
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "user": {
        "_id": "6612d3e9c5f87b328a6f44d1",
        "name": "Rahul Kumar",
        "email": "citizen@greensteps.in",
        "state": "Gujarat",
        "city": "Ahmedabad",
        "carbonScore": 1850,
        "greenPoints": 120,
        "badges": ["Earth Friend"]
      },
      "message": "Profile updated successfully"
    }
    ```

---

### Record Eco-Activity
Logs daily transport, power utility bills, lpg canisters, vegan meals, or dry recycling.

*   **URL**: `/activities`
*   **Method**: `POST`
*   **Auth Required**: YES
*   **Request Body**:
    ```json
    {
      "category": "transport",
      "value": 150,
      "unit": "km",
      "subtype": "metro"
    }
    ```
    *Note: `category` must be one of: `transport`, `electricity`, `lpg`, `food`, `shopping`, `waste`.*
    *Subtype keys:*
    - `transport`: `petrolCar`, `dieselCar`, `twoWheeler`, `ev`, `bus`, `metro`
    - `food`: `highMeat`, `vegetarian`, `vegan`
    - `waste`: `landfill`, `organic`, `recyclable`
*   **Response Payload (`210 Created`)**:
    ```json
    {
      "activity": {
        "_id": "6612d4a5c5f87b328a6f44e3",
        "userId": "6612d3e9c5f87b328a6f44d1",
        "category": "transport",
        "value": 150,
        "unit": "km",
        "co2Emission": 2.25,
        "date": "2026-06-13T14:52:00.000Z"
      },
      "greenPointsEarned": 25,
      "message": "Activity logged successfully! Earned 25 Green Points."
    }
    ```

---

### Aggregated Footprint Calculation (Public)
Estimates carbon footprints on-the-fly without database writes.

*   **URL**: `/carbon/calculate`
*   **Method**: `POST`
*   **Auth Required**: NO
*   **Request Body**:
    ```json
    {
      "electricity": { "value": 150 },
      "lpg": { "value": 1 },
      "transport": { "value": 300, "subtype": "twoWheeler" },
      "food": { "subtype": "vegetarian" },
      "shopping": { "value": 4 },
      "waste": { "value": 8, "subtype": "organic" }
    }
    ```
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "dailyCO2": 5.92,
      "monthlyCO2": 180.12,
      "annualCO2": 2161.4,
      "units": "kg CO2"
    }
    ```

---

### Claim Challenge Completion
Claims points and awards challenge certificates.

*   **URL**: `/challenges/:id/complete`
*   **Method**: `POST`
*   **Auth Required**: YES
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "user": {
        "_id": "6612d3e9c5f87b328a6f44d1",
        "greenPoints": 270,
        "badges": ["Earth Friend", "Plastic Master"]
      },
      "pointsEarned": 100,
      "message": "Challenge completed! You earned 100 Green Points."
    }
    ```

---

### State standings & Rankings
Fetches global list averages.

*   **URL**: `/leaderboard`
*   **Method**: `GET`
*   **Auth Required**: NO
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "topUsers": [
        { "name": "Kavitha Ramaswamy", "state": "Tamil Nadu", "city": "Chennai", "greenPoints": 640, "carbonScore": 1200 },
        { "name": "Rohan Deshmukh", "state": "Maharashtra", "city": "Mumbai", "greenPoints": 480, "carbonScore": 1850 }
      ],
      "stateRankings": [
        {
          "state": "Kerala",
          "userCount": 2,
          "avgCarbonScore": 1025,
          "avgGreenPoints": 655,
          "carbonSavings": 2950
        },
        {
          "state": "Tamil Nadu",
          "userCount": 1,
          "avgCarbonScore": 1200,
          "avgGreenPoints": 640,
          "carbonSavings": 1300
        }
      ]
    }
    ```
