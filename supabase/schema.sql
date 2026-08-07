create table if not exists companies (
  id text primary key,
  name text not null,
  ticker text not null,
  logo_url text not null,
  industry text not null,
  overall_score numeric(5,2) not null,
  category_scores jsonb not null,
  ai_layoff_tracked boolean not null default false,
  reskilling_funded boolean not null default false,
  human_in_the_loop_mandate boolean not null default false,
  tos_scraping_opt_out boolean not null default false,
  last_updated date not null
);

create table if not exists company_citations (
  id text primary key,
  company_id text not null references companies(id) on delete cascade,
  title text not null,
  source_name text not null,
  url text not null,
  snippet text not null,
  source_date date not null,
  category text not null
);

create table if not exists cause_profiles (
  company_id text primary key references companies(id) on delete cascade,
  profile_status text not null,
  cause_score numeric(5,2),
  disclosed_spend_usd bigint,
  category_spend_usd jsonb,
  top_cause_category_id text,
  evidence_records integer not null default 0,
  high_confidence_records integer not null default 0,
  last_updated date not null
);

create table if not exists cause_evidence (
  id bigserial primary key,
  record_key text not null unique,
  company_id text not null references companies(id) on delete cascade,
  category_id text not null,
  amount_usd bigint,
  source_name text not null,
  source_url text not null,
  source_date date not null,
  signal text not null,
  confidence text not null
);

create table if not exists political_profiles (
  company_id text primary key references companies(id) on delete cascade,
  profile_status text not null,
  election_cycle text,
  pac_contributions_usd bigint,
  democratic_pct numeric(5,2),
  republican_pct numeric(5,2),
  third_party_pct numeric(5,2),
  lobbying_spend_usd bigint,
  lobbying_spend_prior_year_usd bigint,
  lobbying_focus_summary text,
  lobbying_policy_area text,
  lobbying_bill_summary text,
  lobbying_focus_areas jsonb,
  top_lobbied_bill_id text,
  top_lobbied_bill_title text,
  top_lobbied_bill_url text,
  lobbying_source_url text,
  revolving_door_current jsonb,
  revolving_door_prior jsonb,
  trade_association_risk_flag boolean,
  evidence_records integer not null default 0,
  high_confidence_records integer not null default 0,
  last_updated date not null
);

create table if not exists political_evidence (
  id bigserial primary key,
  record_key text not null unique,
  company_id text not null references companies(id) on delete cascade,
  metric_key text not null,
  metric_value text,
  source_name text not null,
  source_url text not null,
  source_date date not null,
  confidence text not null
);

create table if not exists layoffs_fyi_signals (
  company_id text primary key references companies(id) on delete cascade,
  source_name text not null,
  source_updated_at timestamptz,
  last_checked_at timestamptz not null,
  matched boolean not null default false,
  matched_name text,
  matched_slug text,
  source_company_url text,
  layoffs_total integer,
  layoffs_latest date,
  layoffs_industry text,
  ai_layoff_employees integer,
  ai_layoff_events integer not null default 0,
  ai_layoff_tracked_from_source boolean not null default false,
  ai_events jsonb not null default '[]'::jsonb
);

create index if not exists idx_company_citations_company_id on company_citations(company_id);
create index if not exists idx_cause_evidence_company_id on cause_evidence(company_id);
create index if not exists idx_cause_evidence_category_id on cause_evidence(category_id);
create index if not exists idx_political_evidence_company_id on political_evidence(company_id);
create index if not exists idx_layoffs_fyi_signals_ai_tracked on layoffs_fyi_signals(ai_layoff_tracked_from_source);