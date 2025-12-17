/*
  # Seed Assets for Production

  1. Assets Created
    - 45 Dock Doors (DD-1 through DD-45)
    - 25 PIT units (PIT-1 through PIT-25)
    - 20 MAXX Reach units (MR-1 through MR-20)
    - 4 Yard Gates (YG-1 through YG-4)

  2. Details
    - All assets set to Active status
    - Located at various warehouse locations
    - Ready for PM tracking
*/

DO $$
DECLARE
  dock_door_type_id uuid;
  pit_type_id uuid;
  maxx_reach_type_id uuid;
  yard_gate_type_id uuid;
  i integer;
BEGIN
  -- Get asset type IDs
  SELECT id INTO dock_door_type_id FROM asset_types WHERE name = 'Dock Doors';
  SELECT id INTO pit_type_id FROM asset_types WHERE name = 'PIT';
  SELECT id INTO maxx_reach_type_id FROM asset_types WHERE name = 'MAXX Reach';
  SELECT id INTO yard_gate_type_id FROM asset_types WHERE name = 'Yard Gates';

  -- Create 45 Dock Doors
  FOR i IN 1..45 LOOP
    INSERT INTO assets (asset_type_id, asset_number, location, status)
    VALUES (
      dock_door_type_id,
      'DD-' || i,
      'North Dock Zone ' || CEIL(i::numeric / 15),
      'Active'
    );
  END LOOP;

  -- Create 25 PIT units
  FOR i IN 1..25 LOOP
    INSERT INTO assets (asset_type_id, asset_number, location, status)
    VALUES (
      pit_type_id,
      'PIT-' || i,
      'Warehouse Floor ' || CASE WHEN i <= 13 THEN 'A' ELSE 'B' END,
      'Active'
    );
  END LOOP;

  -- Create 20 MAXX Reach units
  FOR i IN 1..20 LOOP
    INSERT INTO assets (asset_type_id, asset_number, location, status)
    VALUES (
      maxx_reach_type_id,
      'MR-' || i,
      'High Bay Section ' || CEIL(i::numeric / 5),
      'Active'
    );
  END LOOP;

  -- Create 4 Yard Gates
  FOR i IN 1..4 LOOP
    INSERT INTO assets (asset_type_id, asset_number, location, status)
    VALUES (
      yard_gate_type_id,
      'YG-' || i,
      'Yard Entrance ' || CASE i WHEN 1 THEN 'North' WHEN 2 THEN 'South' WHEN 3 THEN 'East' ELSE 'West' END,
      'Active'
    );
  END LOOP;
END $$;
