CREATE OR REPLACE TRIGGER insert_tag_virtual
BEFORE INSERT ON cabequip
for each row
BEGIN
	IF :new.tag = '0'
	THEN
		select tags_virtuales_seq .nextval
		into :new.tag from dual;
		:new.tag :=  TO_CHAR ('SN')||'_'||:new.tag;
	END IF;
END;
/

CREATE OR REPLACE TRIGGER insert_location_poles
BEFORE INSERT ON POSTES
for each row

DECLARE
src_code number;
dst_code number;
sdp mdsys.SDO_GEOMETRY;

BEGIN
	src_code := 32717;
	dst_code := 8307;
	sdp := sdo_cs.transform(sdo_geometry(2001,src_code,SDO_POINT_TYPE(:new.coord_x, :new.coord_y,NULL),null, null),dst_code);
	:new.LNG := sdp.sdo_point.x;
	:new.LAT := sdp.sdo_point.y;
END;
/
show errors;