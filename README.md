# Smartseason - Field Management System

A strictly functional platform for coordinating field agents and monitoring crop cycles.

## 1. Role-Based Access
- **Admin (Coordinator)**: Full access to system data. Can create/edit/delete fields and assign them to agents.
- **Field Agent**: Access restricted to assigned fields. Responsible for logging updates and monitoring crop progress.

## 2. Field Lifecycle
Fields move through a simple, predictable lifecycle:
- `Planted`: The initial stage after sowing.
- `Growing`: Active growth phase.
- `Ready`: Crop has reached maturity and is ready for harvesting.
- `Harvested`: Lifecycle complete.

## 3. Computed Status Logic
Each field has a computed status based on its data to help coordinators prioritize monitoring:

- **Completed**: Automatically set when the field stage is `Harvested`.
- **At Risk**: Set if the number of days since the `planting_date` exceeds the expected growth limit for the specific crop type.
    - *Maize*: 90 days
    - *Wheat*: 120 days
    - *Rice*: 150 days
    - *Beans*: 60 days
    - *Default*: 90 days
- **Active**: All other fields that are still in progress and within their expected growth timeline.

## 4. Technical Architecture
- **Backend**: Django REST Framework with JWT authentication.
- **Frontend**: Next.js 14 (App Router) with strict CSS Modules.
- **Design Rules**: Adheres to the "Antigravity" linear design philosophy—prioritizing function, contrast, and predictability.
