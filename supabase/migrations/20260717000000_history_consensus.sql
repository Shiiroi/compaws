-- 1. Drop the unique constraint so users can submit new historical reports
alter table pet_policy_reports
drop constraint if exists unique_place_device_report;

-- 2. Redefine the report summary view to group by only the LATEST report per device.
-- This ensures a device's vote is only counted for their current/latest choice.
create or replace view place_report_summary as
with latest_device_reports as (
  select distinct on (place_id, device_id)
    place_id, device_id, claim, created_at
  from pet_policy_reports
  order by place_id, device_id, created_at desc
)
select
  place_id,
  claim,
  count(distinct device_id) as agreeing_devices,
  max(created_at) as last_reported_at
from latest_device_reports
group by place_id, claim;
