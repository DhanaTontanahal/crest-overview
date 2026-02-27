# Data Models — Platform Maturity Assessment System

> This document defines the canonical data models for the backend. All relationships, constraints, and field types are specified for future database implementation.

---

## Entity Relationship Overview

```
Platform ──┐
           ├──► Assessment ──► AssessmentAnswer ──► Question
Quarter  ──┘                                          │
                                                      ├── Pillar
Questionnaire ──► QuestionnaireQuestion ──► Question  ├── Dimension
                                                      └── Attribute

Persona (User) ──► Assessment (submitter / reviewer)

Benchmark ──► Platform × Dimension × Attribute
```

---

## Models

### 1. Platform

Represents an organizational platform (e.g., Consumer, Commercial, Wealth & Investment).

| Field         | Type      | Constraints          | Description                    |
|---------------|-----------|----------------------|--------------------------------|
| `id`          | UUID      | PK                   | Unique identifier              |
| `name`        | VARCHAR   | UNIQUE, NOT NULL     | Platform display name          |
| `description` | TEXT      | NULLABLE             | Optional description           |
| `is_active`   | BOOLEAN   | DEFAULT true         | Soft-delete / archive flag     |
| `created_at`  | TIMESTAMP | DEFAULT now()        |                                |
| `updated_at`  | TIMESTAMP | DEFAULT now()        |                                |

---

### 2. Pillar

Assessment pillars that group questions thematically (e.g., "Engineering Excellence", "All in on Agile").

| Field         | Type      | Constraints          | Description                    |
|---------------|-----------|----------------------|--------------------------------|
| `id`          | UUID      | PK                   | Unique identifier              |
| `name`        | VARCHAR   | UNIQUE, NOT NULL     | Pillar display name            |
| `sort_order`  | INTEGER   | DEFAULT 0            | Display ordering               |
| `is_active`   | BOOLEAN   | DEFAULT true         | Soft-delete flag               |
| `created_at`  | TIMESTAMP | DEFAULT now()        |                                |

---

### 3. Quarter

Time periods for assessments (e.g., "Q4 2025").

| Field         | Type      | Constraints          | Description                    |
|---------------|-----------|----------------------|--------------------------------|
| `id`          | UUID      | PK                   | Unique identifier              |
| `label`       | VARCHAR   | UNIQUE, NOT NULL     | Display label (e.g., "Q4 2025")|
| `start_date`  | DATE      | NOT NULL             | Quarter start                  |
| `end_date`    | DATE      | NOT NULL             | Quarter end                    |
| `is_current`  | BOOLEAN   | DEFAULT false        | Active quarter flag            |
| `created_at`  | TIMESTAMP | DEFAULT now()        |                                |

---

### 4. Dimension

Top-level scoring dimensions (Maturity, Performance, Stability, Agility).

| Field         | Type      | Constraints          | Description                    |
|---------------|-----------|----------------------|--------------------------------|
| `id`          | UUID      | PK                   | Unique identifier              |
| `name`        | VARCHAR   | UNIQUE, NOT NULL     | Dimension name                 |
| `description` | TEXT      | NULLABLE             | What this dimension measures   |
| `sort_order`  | INTEGER   | DEFAULT 0            | Display ordering               |
| `created_at`  | TIMESTAMP | DEFAULT now()        |                                |

**Seed values:** Maturity, Performance, Stability, Agility

---

### 5. Attribute

Sub-metrics under each Dimension (e.g., Clarity, Leadership under Maturity).

| Field          | Type      | Constraints          | Description                    |
|----------------|-----------|----------------------|--------------------------------|
| `id`           | UUID      | PK                   | Unique identifier              |
| `dimension_id` | UUID      | FK → Dimension, NOT NULL | Parent dimension           |
| `name`         | VARCHAR   | NOT NULL             | Attribute name                 |
| `weight`       | DECIMAL   | DEFAULT 1.0          | Relative weight in scoring     |
| `sort_order`   | INTEGER   | DEFAULT 0            | Display ordering               |
| `created_at`   | TIMESTAMP | DEFAULT now()        |                                |

**Unique constraint:** `(dimension_id, name)`

**Seed values:**
- Maturity → Clarity, Leadership, Culture, Foundation
- Performance → Throughput, Predictability, Change Fail Rate, Deployment Frequency, Mean Time to Deploy, Lead Time
- Stability → Attrition Rate, Tenure, Role Clarity, Succession Plan
- Agility → Adaptability, Innovation, Time to Market, Responsiveness, Continuous Improvement

---

### 6. Persona

Users of the system with role-based access.

| Field          | Type      | Constraints          | Description                    |
|----------------|-----------|----------------------|--------------------------------|
| `id`           | UUID      | PK                   | Unique identifier              |
| `auth_user_id` | UUID      | FK → auth.users, UNIQUE | Link to auth system        |
| `name`         | VARCHAR   | NOT NULL             | Display name                   |
| `email`        | VARCHAR   | UNIQUE, NOT NULL     | Email address                  |
| `role`         | ENUM      | NOT NULL             | One of: `admin`, `user`, `reviewer`, `supervisor`, `superuser` |
| `platform_id`  | UUID      | FK → Platform, NULLABLE | Assigned platform (for users/supervisors) |
| `is_active`    | BOOLEAN   | DEFAULT true         | Account active flag            |
| `created_at`   | TIMESTAMP | DEFAULT now()        |                                |
| `updated_at`   | TIMESTAMP | DEFAULT now()        |                                |

**Notes:**
- `user` role = Platform Lead / TPL (assigned to one platform)
- `supervisor` role = CIO-level (oversees one platform)
- `superuser` role = full org visibility
- `reviewer` role = peer review access
- `admin` role = system management

---

### 7. Question

Individual assessment questions linked to a pillar, dimension, and attribute.

| Field               | Type      | Constraints               | Description                       |
|---------------------|-----------|---------------------------|-----------------------------------|
| `id`                | UUID      | PK                        | Unique identifier                 |
| `pillar_id`         | UUID      | FK → Pillar, NOT NULL     | Parent pillar                     |
| `dimension_id`      | UUID      | FK → Dimension, NOT NULL  | Scoring dimension                 |
| `attribute_id`      | UUID      | FK → Attribute, NOT NULL  | Scoring sub-metric                |
| `question_text`     | TEXT      | NOT NULL                  | The assessment question           |
| `low_maturity_desc` | TEXT      | NULLABLE                  | Description of score = 1          |
| `high_maturity_desc`| TEXT      | NULLABLE                  | Description of score = 5          |
| `observable_metrics`| TEXT      | NULLABLE                  | What to observe/measure           |
| `is_active`         | BOOLEAN   | DEFAULT true              | Soft-delete flag                  |
| `created_by`        | UUID      | FK → Persona, NULLABLE    | Admin who created it              |
| `created_at`        | TIMESTAMP | DEFAULT now()             |                                   |
| `updated_at`        | TIMESTAMP | DEFAULT now()             |                                   |

---

### 8. Questionnaire

A published snapshot of questions that users assess against. Implements the "publish" workflow.

| Field          | Type      | Constraints          | Description                    |
|----------------|-----------|----------------------|--------------------------------|
| `id`           | UUID      | PK                   | Unique identifier              |
| `title`        | VARCHAR   | NOT NULL             | e.g., "Q4 2025 Assessment"    |
| `description`  | TEXT      | NULLABLE             | Optional notes                 |
| `status`       | ENUM      | DEFAULT 'draft'      | `draft` or `published`         |
| `published_at` | TIMESTAMP | NULLABLE             | When it was published          |
| `published_by` | UUID      | FK → Persona, NULLABLE | Admin who published          |
| `created_at`   | TIMESTAMP | DEFAULT now()        |                                |
| `updated_at`   | TIMESTAMP | DEFAULT now()        |                                |

---

### 9. QuestionnaireQuestion

Join table linking a Questionnaire to its Questions (snapshot at publish time).

| Field              | Type      | Constraints                    | Description                 |
|--------------------|-----------|--------------------------------|-----------------------------|
| `id`               | UUID      | PK                             | Unique identifier           |
| `questionnaire_id` | UUID      | FK → Questionnaire, NOT NULL   | Parent questionnaire        |
| `question_id`      | UUID      | FK → Question, NOT NULL        | Included question           |
| `sort_order`       | INTEGER   | DEFAULT 0                      | Display ordering            |

**Unique constraint:** `(questionnaire_id, question_id)`

---

### 10. Assessment

A platform's completed assessment for a given questionnaire and quarter.

| Field              | Type      | Constraints                    | Description                    |
|--------------------|-----------|--------------------------------|--------------------------------|
| `id`               | UUID      | PK                             | Unique identifier              |
| `questionnaire_id` | UUID      | FK → Questionnaire, NOT NULL   | Which published questionnaire  |
| `platform_id`      | UUID      | FK → Platform, NOT NULL        | Assessed platform              |
| `quarter_id`       | UUID      | FK → Quarter, NOT NULL         | Assessment period              |
| `submitted_by`     | UUID      | FK → Persona, NOT NULL         | Who submitted                  |
| `submitted_at`     | TIMESTAMP | NULLABLE                       | Submission timestamp           |
| `reviewed_by`      | UUID      | FK → Persona, NULLABLE         | Peer reviewer                  |
| `reviewed_at`      | TIMESTAMP | NULLABLE                       | Review timestamp               |
| `status`           | ENUM      | DEFAULT 'draft'                | `draft`, `submitted`, `reviewed` |
| `created_at`       | TIMESTAMP | DEFAULT now()                  |                                |
| `updated_at`       | TIMESTAMP | DEFAULT now()                  |                                |

**Unique constraint:** `(questionnaire_id, platform_id, quarter_id)` — one assessment per platform per questionnaire per quarter.

---

### 11. AssessmentAnswer

Individual scored answers within an assessment.

| Field           | Type      | Constraints                    | Description                    |
|-----------------|-----------|--------------------------------|--------------------------------|
| `id`            | UUID      | PK                             | Unique identifier              |
| `assessment_id` | UUID      | FK → Assessment, NOT NULL      | Parent assessment              |
| `question_id`   | UUID      | FK → Question, NOT NULL        | Which question                 |
| `score`         | INTEGER   | CHECK (1–5), NOT NULL          | Maturity score                 |
| `comments`      | TEXT      | NULLABLE                       | Evidence / justification       |
| `created_at`    | TIMESTAMP | DEFAULT now()                  |                                |
| `updated_at`    | TIMESTAMP | DEFAULT now()                  |                                |

**Unique constraint:** `(assessment_id, question_id)`

---

### 12. Benchmark

Target / expected scores per platform, dimension, and attribute. Used for gap analysis and radar charts.

| Field          | Type      | Constraints                    | Description                    |
|----------------|-----------|--------------------------------|--------------------------------|
| `id`           | UUID      | PK                             | Unique identifier              |
| `platform_id`  | UUID      | FK → Platform, NULLABLE        | Specific platform (NULL = org-wide) |
| `dimension_id` | UUID      | FK → Dimension, NOT NULL       | Target dimension               |
| `attribute_id` | UUID      | FK → Attribute, NULLABLE       | Specific attribute (NULL = dimension-level) |
| `target_score` | DECIMAL   | NOT NULL, CHECK (1–10)         | Target score (scaled 2–10)     |
| `quarter_id`   | UUID      | FK → Quarter, NULLABLE         | Quarter-specific (NULL = evergreen) |
| `created_at`   | TIMESTAMP | DEFAULT now()                  |                                |
| `updated_at`   | TIMESTAMP | DEFAULT now()                  |                                |

---

## Models Removed from Original List

| Proposed     | Reason                                                              |
|--------------|---------------------------------------------------------------------|
| **Criteria** | Merged into `Question` as `low_maturity_desc` / `high_maturity_desc` |
| **Metric**   | Split into `Dimension` (top-level) + `Attribute` (sub-metric) for clarity |

## Models Added

| Model                     | Reason                                                      |
|---------------------------|-------------------------------------------------------------|
| **Question**              | Distinct from Questionnaire — individual reusable questions |
| **QuestionnaireQuestion** | Join table for publish snapshots                            |
| **AssessmentAnswer**      | Normalized answer storage per question                      |

---

## Key Relationships Summary

```
Platform        1 ←──► N  Assessment
Quarter         1 ←──► N  Assessment
Questionnaire   1 ←──► N  Assessment
Questionnaire   M ←──► N  Question        (via QuestionnaireQuestion)
Assessment      1 ←──► N  AssessmentAnswer
Question        1 ←──► N  AssessmentAnswer
Pillar          1 ←──► N  Question
Dimension       1 ←──► N  Attribute
Dimension       1 ←──► N  Question
Attribute       1 ←──► N  Question
Persona         1 ←──► N  Assessment      (submitter)
Persona         1 ←──► N  Assessment      (reviewer)
Benchmark       N ←──► 1  Platform        (optional)
Benchmark       N ←──► 1  Dimension
Benchmark       N ←──► 1  Attribute       (optional)
```

---

## Scoring Convention

- **Raw score:** 1–5 (from assessment answers)
- **Scaled score:** 2–10 (raw × 2, used in dimension charts and heatmaps)
- **Benchmark targets:** stored in 1–10 scale

---

## Future Considerations

- **Audit log** — track all changes to questions, assessments, and benchmarks
- **Team** — if team-level granularity is needed below Platform
- **Action Item** — link improvement actions to specific assessment gaps
- **Notification** — alert users when questionnaires are published or reviews are due
