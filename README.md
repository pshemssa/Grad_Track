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

![Dashboard](public/readme/dashboard.png)

### Graduates

The graduates page is the main records list. It lets users search, filter, view, edit, and delete graduate records while seeing key summary details for each person.

![Graduates List](public/readme/graduate_list.png)

### Add Graduate

The add graduate flow is a step-by-step form used to register a new graduate and capture their full journey.

#### Personal Information

This section captures identity and contact information such as name, email, phone number, date of birth, and gender.

![Add Graduate - Personal Information](public/readme/addgraduate_personalInfo.png)

#### Education

This section records primary school, O-Level school, A-Level school, university details, degree level, completion status, and study location.

![Add Graduate - Education](public/readme/add_education.png)

#### Funding

This section captures how the graduate was funded, including funding type, sponsor or lender, loan amount, and repayment status.

![Add Graduate - Funding](public/readme/add_funding.png)

#### Employment and Further Study

This section records the graduate outcome after study. It supports employment details, unemployment status, or further study information such as country of study, field of study, graduation year, and funding source.

![Edit Graduate - Employment](public/readme/add_employment.png)

### Programs

The programs page groups graduates by academic program. It shows enrollment by program, average months to employment, and a summary table for completion and employment rates.

![Programs](public/readme/programs.png)

### Analytics

The analytics page provides deeper insight into graduate outcomes through three focused views.

#### Employment Analytics

This view shows employment status breakdown, time-to-employment distribution, and employment by sector.

![Analytics - Employment](public/readme/analytics_employment.png)

#### Completion Analytics

This view shows completion rate by program and compares study duration against completion performance.

![Analytics - Completion](public/readme/analytics_completion.png)

#### Mobility Analytics

This view shows study-abroad patterns, return-versus-stay-abroad outcomes, and the return rate for graduates who studied outside Rwanda.

![Analytics - Mobility](public/readme/analytics.png)

### Funding & Recovery

This page focuses on financial support and repayment tracking. It shows loan repayment status, funding distribution, sponsor performance, loan value by repayment stage, and borrower details.

![Funding & Recovery](public/readme/funding.png)

## Notes

- Screenshots above are expected in `public/readme/`.
- Suggested file names:
  - `dashboard.png`
  - `graduate-list.png`
  - `addgraduate_personalInfo.png`
  - `add_education.png`
  - `add_funding.png`
  - `add_employment.png`
  - `programs.png`
  - `analytics_employment.png`
  - `analytics_completion.png`
  - `analytics.png`
  - `funding.png`

## Future Improvements

- Add authentication and role-based access so only authorized users can manage graduate records.
- Tighten Supabase Row Level Security policies for safer production use.
- Move sensitive write logic and graduate ID generation to backend functions or Supabase Edge Functions.
- Add audit fields such as `created_by`, `updated_by`, and `updated_at`.
- Improve validation for dates, country names, employment transitions, and funding combinations.
- Add export options for CSV, Excel, and PDF reports.
- Add notifications or reminders for loan repayment and graduate follow-up.
- Add stronger dashboards with year-by-year and cohort-based trend analysis.
- Add document upload support for sponsorship letters, loan agreements, and related files.
- Add better production readiness features such as backups, monitoring, and error reporting.

## What Can Be Added Next

- User login for admins, staff, and reviewers.
- A settings page for managing programs, sectors, and funding options.
- Bulk import for graduate records from CSV or Excel.
- A graduate timeline view showing the full journey from school to employment or further study.
- A reports page for printable summaries and executive insights.
- Email or SMS integration for graduate communication and tracking.
- Public-safe analytics views that show summary statistics without exposing personal data.
