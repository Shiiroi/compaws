-- 0. Clean up existing columns if they exist to support clean re-running
alter table pet_policy_reports drop column if exists pet_menu cascade;
alter table pet_policy_reports drop column if exists price_range cascade;

-- 1. Add pet_menu and price_range columns to pet_policy_reports table (allowing null initially)
alter table pet_policy_reports add column pet_menu text;
alter table pet_policy_reports add column price_range text;

-- 2. Populate existing rows with default values
update pet_policy_reports set pet_menu = 'not_sure' where pet_menu is null;
update pet_policy_reports set price_range = 'mid' where price_range is null;

-- 3. Alter columns to set not null and apply check constraints
alter table pet_policy_reports alter column pet_menu set not null;
alter table pet_policy_reports add constraint pet_menu_check check (pet_menu in ('yes', 'no', 'not_sure'));

alter table pet_policy_reports alter column price_range set not null;
alter table pet_policy_reports add constraint price_range_check check (price_range in ('budget', 'mid', 'splurge'));

-- 4. Create pet_menu consensus views
create or replace view place_pet_menu_summary as
select 
  place_id, 
  pet_menu, 
  count(distinct device_id) as agreeing_devices,
  max(created_at) as last_reported_at
from pet_policy_reports 
group by place_id, pet_menu;

create or replace view place_current_pet_menu as
select distinct on (place_id)
  place_id, 
  pet_menu, 
  agreeing_devices, 
  last_reported_at
from place_pet_menu_summary
order by place_id, agreeing_devices desc, last_reported_at desc;

-- 5. Create price_range consensus views
create or replace view place_price_range_summary as
select 
  place_id, 
  price_range, 
  count(distinct device_id) as agreeing_devices,
  max(created_at) as last_reported_at
from pet_policy_reports 
group by place_id, price_range;

create or replace view place_current_price_range as
select distinct on (place_id)
  place_id, 
  price_range, 
  agreeing_devices, 
  last_reported_at
from place_price_range_summary
order by place_id, agreeing_devices desc, last_reported_at desc;

-- 6. Drop and redefine functions to reflect schema changes
drop function if exists create_place_with_report(text, text, text, text, text, double precision, double precision, uuid, text, text);

create or replace function create_place_with_report(
  p_name text,
  p_address text,
  p_city text,
  p_province text,
  p_category text,
  p_latitude double precision,
  p_longitude double precision,
  p_device_id uuid,
  p_claim text,
  p_pet_menu text,
  p_price_range text,
  p_notes text
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_place_id uuid;
begin
  -- Insert new place row
  insert into places (
    name,
    address,
    city,
    province,
    category,
    geom,
    status,
    created_by_device_id
  ) values (
    p_name,
    p_address,
    p_city,
    p_province,
    p_category,
    st_setsrid(st_point(p_longitude, p_latitude), 4326),
    'user_submitted',
    p_device_id
  )
  returning id into v_place_id;

  -- Insert corresponding report row
  insert into pet_policy_reports (
    place_id,
    device_id,
    claim,
    pet_menu,
    price_range,
    notes
  ) values (
    v_place_id,
    p_device_id,
    p_claim,
    p_pet_menu,
    p_price_range,
    p_notes
  );

  return v_place_id;
end;
$$;

drop function if exists get_places_in_bounds(double precision, double precision, double precision, double precision);

create or replace function get_places_in_bounds(
  min_lat double precision,
  min_lng double precision,
  max_lat double precision,
  max_lng double precision
)
returns table (
  id uuid,
  name text,
  address text,
  city text,
  latitude double precision,
  longitude double precision,
  category text,
  status text,
  claim text,
  agreeing_devices bigint,
  pet_menu text,
  pet_menu_agreeing_devices bigint,
  price_range text,
  price_range_agreeing_devices bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    p.id,
    p.name,
    p.address,
    p.city,
    st_y(p.geom::geometry) as latitude,
    st_x(p.geom::geometry) as longitude,
    p.category,
    p.status,
    pcs.claim,
    coalesce(pcs.agreeing_devices, 0)::bigint as agreeing_devices,
    pcpm.pet_menu,
    coalesce(pcpm.agreeing_devices, 0)::bigint as pet_menu_agreeing_devices,
    pcpr.price_range,
    coalesce(pcpr.agreeing_devices, 0)::bigint as price_range_agreeing_devices
  from places p
  left join place_current_status pcs on p.id = pcs.place_id
  left join place_current_pet_menu pcpm on p.id = pcpm.place_id
  left join place_current_price_range pcpr on p.id = pcpr.place_id
  where p.status != 'delisted'
    -- Bounding box check using GIST index spatial operator
    and p.geom && st_makeenvelope(min_lng, min_lat, max_lng, max_lat, 4326);
end;
$$;
