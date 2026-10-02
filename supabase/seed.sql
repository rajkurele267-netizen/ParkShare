-- =====================================================================
-- ParkShare DEMO data (optional). Run AFTER schema.sql.
-- Requires at least one account registered as "Parking Owner" first.
-- The listings are attached to the first owner account.
-- Safe to run twice: existing demo titles are skipped.
-- To remove demo data later, run the DELETE at the bottom of this file.
-- =====================================================================

do $$
declare
  v_owner uuid;
begin
  select id into v_owner from public.profiles where role = 'owner' order by created_at limit 1;
  if v_owner is null then
    raise exception 'No owner account found. Register as a Parking Owner in the app first, then run this seed.';
  end if;

  insert into public.parking_spaces
    (owner_id, title, description, rules, address, area, city, price_per_hour, vehicle_type, available_from, available_to)
  select v_owner, d.title, d.description, d.rules, d.address, d.area, d.city, d.price, d.vtype, d.t_from::time, d.t_to::time
  from (values
    ('Covered bay near Sector 18 market',
     'Covered, gated residential bay a short walk from the Sector 18 market area. Easy entry from the main road.',
     'Park within the marked bay. No overnight parking. Please leave on time.',
     'Block C, Sector 18', 'Sector 18', 'Noida', 40, 'car', '07:00', '22:00'),
    ('Central Delhi parking slot, Connaught Place',
     'Private slot in a commercial building close to Connaught Place and the metro. Security guard on duty during the day.',
     'Show your booking at the gate. Cars only. Height limit 2 m.',
     'Barakhamba Road, Connaught Place', 'Connaught Place', 'Delhi', 90, 'car', '08:00', '21:00'),
    ('Open parking spot in HSR Layout',
     'Open spot in a quiet residential lane in HSR Layout, close to cafes and coworking spaces.',
     'Do not block the neighbouring gate. Two-wheelers and cars both fit.',
     '27th Main Road, HSR Layout Sector 2', 'HSR Layout', 'Bengaluru', 50, 'any', '06:00', '23:00'),
    ('Bike and scooter bay, Andheri West',
     'Compact, shaded bay for two-wheelers near Andheri West station. Ideal for commuters.',
     'Two-wheelers only. Lock your vehicle. Owner is not responsible for helmets left behind.',
     'Lokhandwala Complex, Andheri West', 'Andheri West', 'Mumbai', 20, 'bike', '06:00', '22:00'),
    ('SUV-friendly driveway, Andheri West',
     'Wide private driveway that fits one large SUV. Easy access from the main road.',
     'One vehicle only. Reverse parking recommended.',
     'Veera Desai Road, Andheri West', 'Andheri West', 'Mumbai', 85, 'suv', '09:00', '20:00')
  ) as d(title, description, rules, address, area, city, price, vtype, t_from, t_to)
  where not exists (
    select 1 from public.parking_spaces s where s.owner_id = v_owner and s.title = d.title
  );
end $$;

-- To remove the demo listings later (only works for ones with no bookings), run:
-- delete from public.parking_spaces where title in (
--   'Covered bay near Sector 18 market', 'Central Delhi parking slot, Connaught Place',
--   'Open parking spot in HSR Layout', 'Bike and scooter bay, Andheri West', 'SUV-friendly driveway, Andheri West');
