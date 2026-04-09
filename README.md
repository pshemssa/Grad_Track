# GradTrack

GradTrack is a graduate management system for recording student journeys from school to university, employment, further study, and funding recovery. It helps track personal information, education history, employment outcomes, mobility, and loan repayment in one place.

## How It Works

The system stores each graduate as a single record and follows their journey across different stages:

1. Add a graduate with personal, education, funding, and outcome details.
2. View all graduates in a searchable list.
3. Open a graduate record to review or edit it.
4. Use dashboards and analytics pages to understand outcomes, completion, mobility, and funding recovery.

## Pages

### Dashboard

The dashboard gives a quick overview of the whole system. It shows total graduates, employment rate, average time to job, study abroad count, funding sources, completion status, geographic distribution, and loan recovery summary.

![Dashboard](docs/screenshots/dashboard.png)

### Graduates

The graduates page is the main records list. It lets users search, filter, view, edit, and delete graduate records while seeing key summary details for each person.

![Graduates List](docs/screenshots/graduates-list.png)

### Add Graduate

The add graduate flow is a step-by-step form used to register a new graduate and capture their full journey.

#### Personal Information

This section captures identity and contact information such as name, email, phone number, date of birth, and gender.

![Add Graduate - Personal Information](docs/screenshots/add-graduate-personal.png)

#### Education

This section records primary school, O-Level school, A-Level school, university details, degree level, completion status, and study location.

![Add Graduate - Education](docs/screenshots/add-graduate-education.png)

#### Funding

This section captures how the graduate was funded, including funding type, sponsor or lender, loan amount, and repayment status.

![Add Graduate - Funding](docs/screenshots/add-graduate-funding.png)

#### Employment and Further Study

This section records the graduate outcome after study. It supports employment details, unemployment status, or further study information such as country of study, field of study, graduation year, and funding source.

![Edit Graduate - Employment](docs/screenshots/edit-graduate-employment.png)

### Programs

The programs page groups graduates by academic program. It shows enrollment by program, average months to employment, and a summary table for completion and employment rates.

![Programs](docs/screenshots/programs.png)

### Analytics

The analytics page provides deeper insight into graduate outcomes through three focused views.

#### Employment Analytics

This view shows employment status breakdown, time-to-employment distribution, and employment by sector.

![Analytics - Employment](docs/screenshots/analytics-employment.png)

#### Completion Analytics

This view shows completion rate by program and compares study duration against completion performance.

![Analytics - Completion](docs/screenshots/analytics-completion.png)

#### Mobility Analytics

This view shows study-abroad patterns, return-versus-stay-abroad outcomes, and the return rate for graduates who studied outside Rwanda.

![Analytics - Mobility](docs/screenshots/analytics-mobility.png)

### Funding & Recovery

This page focuses on financial support and repayment tracking. It shows loan repayment status, funding distribution, sponsor performance, loan value by repayment stage, and borrower details.

![Funding & Recovery](docs/screenshots/funding-recovery.png)

## Notes

- Screenshots above are expected in `docs/screenshots/`.
- Suggested file names:
  - `dashboard.png`
  - `graduates-list.png`
  - `add-graduate-personal.png`
  - `add-graduate-education.png`
  - `add-graduate-funding.png`
  - `edit-graduate-employment.png`
  - `programs.png`
  - `analytics-employment.png`
  - `analytics-completion.png`
  - `analytics-mobility.png`
  - `funding-recovery.png`
