insert into auth (user_id, access_key,operadora_id)
          values ('user1', 'elpassword',7);
insert into auth (user_id, access_key,operadora_id)
          values ('jonathan', 'mendieta',20);
insert into auth (user_id, access_key,operadora_id)
          values ('rodrigo', 'castro',3);
insert into auth (user_id, access_key, operadora_id)
          values ('claro', 'oscuro', 1);
insert into auth (user_id, access_key, operadora_id)
          values ('movi', 'estrellita', 5);
insert into auth (user_id, access_key)
          values ('cnel', '123')

INSERT INTO poste_extras (poste_id, poste_objectid, poste_codigo, ncables, coord_x, coord_y) VALUES  ('{28EF9808-A009-4529-87CE-0C53D0848B38}', 97482, 'P052893', 20, 620499.67, 9763270.31);

INSERT INTO poste_extras (poste_id, poste_objectid, poste_codigo, ncables, coord_x, coord_y) VALUES  ('{66666666-1182-4D2C-8DC9-16B236C6131A}', 98606, 'P116615', 100, 617830.35, 9763482.72)

INSERT INTO cabequip (tag, rfid, poste_id, operadora_id, tipo, cable_o_equipo, uso) VALUES  ('101', 'RFID:PIRATA101', '{28EF9808-A009-4529-87CE-0C53D0848B38}', 5, 'FIBRA', 'CABLE', 'ACOMETIDA');

INSERT INTO cabequip (tag, rfid, poste_id, operadora_id, tipo, cable_o_equipo, uso)VALUES  ('102', 'RFID:PIRATA102', '{28EF9808-A009-4529-87CE-0C53D0848B38}', 15, 'RG500', 'CABLE', 'ACOMETIDA');

INSERT INTO cabequip (tag, rfid, poste_id, operadora_id, tipo, cable_o_equipo, uso)
VALUES  ('103', 'RFID:PIRATA103', '{28EF9808-A009-4529-87CE-0C53D0848B38}', 8, 'MULTIPAR', 'CABLE', 'DISTRIBUCION');

INSERT INTO cabequip (tag, rfid, poste_id, operadora_id, tipo, cable_o_equipo, uso)
VALUES  ('104', 'RFID:PIRATA104', '{28EF9808-A009-4529-87CE-0C53D0848B38}', 15, 'RG500', 'CABLE', 'ACOMETIDA');

INSERT INTO cabequip (tag, rfid, poste_id, operadora_id, tipo, cable_o_equipo, uso)
VALUES  ('105', 'RFID:PIRATA105', '{28EF9808-A009-4529-87CE-0C53D0848B38}', 5, 'RG500', 'CABLE', 'DISTRIBUCION');

INSERT INTO cabequip (tag, rfid, poste_id, operadora_id, tipo, cable_o_equipo, uso) VALUES  ('106', 'RFID:PIRATA106', '{66666666-1182-4D2C-8DC9-16B236C6131A}', 16, 'FIBRA', 'CABLE', 'ACOMETIDA')

INSERT INTO cabequip (tag, rfid, poste_id, operadora_id, tipo, cable_o_equipo, uso)
VALUES  ('107', 'RFID:PIRATA105', '{66666666-1182-4D2C-8DC9-16B236C6131A}', 5, 'RG500', 'CABLE', 'DISTRIBUCION');

INSERT INTO cabequip (tag, rfid, poste_id, operadora_id, tipo, cable_o_equipo, uso)
VALUES  ('108', 'RFID:PIRATA105', '{66666666-1182-4D2C-8DC9-16B236C6131A}', 5, 'RG500', 'CABLE', 'DISTRIBUCION');

/
