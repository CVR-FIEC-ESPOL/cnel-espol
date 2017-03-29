CREATE or REPLACE PROCEDURE select_poles_with_tags
(src_code NUMBER, dst_code NUMBER , sw_lng NUMBER, sw_lat NUMBER,ne_lng NUMBER,ne_lat NUMBER,results OUT SYS_REFCURSOR)
AS
BEGIN
	OPEN results FOR
	SELECT v.sdp.sdo_point.y lat, v.sdp.sdo_point.x lng, v.observacio, v.objectid object_id 
	FROM
	(SELECT 
	sdo_cs.transform(sdo_geometry(2001,src_code,SDO_POINT_TYPE(p.coord_x, p.coord_y,NULL),null, null),dst_code) sdp, p.observacio, p.objectid 
	FROM 
	(select poles.objectid,poles.observacio,poles.coord_x,poles.coord_y  from postes poles,poste_extras poles_ex where poles.objectid = poles_ex.poste_objectid ) p, 
	(select sdo_cs.transform(sdo_geometry(2001,dst_code,SDO_POINT_TYPE(sw_lng,sw_lat,NULL),null, null),src_code) as sdo from dual) t,
	(select sdo_cs.transform(sdo_geometry(2001,dst_code,SDO_POINT_TYPE(ne_lng,ne_lat,NULL),null, null),src_code) as sdo from dual) u 
	WHERE p.coord_x between t.sdo.sdo_point.x and u.sdo.sdo_point.x AND p.coord_y between t.sdo.sdo_point.y and u.sdo.sdo_point.y ) v;
END;
/


CREATE or REPLACE PROCEDURE select_poles
(src_code NUMBER, dst_code NUMBER , sw_lng NUMBER, sw_lat NUMBER,ne_lng NUMBER,ne_lat NUMBER,results OUT SYS_REFCURSOR)
AS
BEGIN
	OPEN results FOR
	SELECT v.sdp.sdo_point.y lat, v.sdp.sdo_point.x lng, v.observacio, v.objectid object_id 
	FROM
	(SELECT 
	sdo_cs.transform(sdo_geometry(2001,src_code,SDO_POINT_TYPE(p.coord_x, p.coord_y,NULL),null, null),dst_code) sdp, p.observacio, p.objectid 
	FROM 
	postes p, 
	(select sdo_cs.transform(sdo_geometry(2001,dst_code,SDO_POINT_TYPE(sw_lng,sw_lat,NULL),null, null),src_code) as sdo from dual) t,
	(select sdo_cs.transform(sdo_geometry(2001,dst_code,SDO_POINT_TYPE(ne_lng,ne_lat,NULL),null, null),src_code) as sdo from dual) u 
	WHERE p.coord_x between t.sdo.sdo_point.x and u.sdo.sdo_point.x AND p.coord_y between t.sdo.sdo_point.y and u.sdo.sdo_point.y ) v;
END;
/

 

CREATE or REPLACE PROCEDURE select_pole_extras
(results OUT SYS_REFCURSOR)
AS
BEGIN
	OPEN results FOR
	SELECT * FROM poste_extras;
END;
/

CREATE or REPLACE PROCEDURE select_pole_extras_by_poste_id
(poste_id IN NUMBER,result OUT poste_extras%rowtype)
AS
BEGIN
	SELECT * INTO result FROM poste_extras WHERE poste_id = poste_id;
END;
/

CREATE OR REPLACE PROCEDURE select_user
(user_id_in IN varchar2,access_key_out OUT varchar2)
AS
BEGIN
	SELECT ACCESS_KEY INTO access_key_out FROM auth WHERE user_id = user_id_in ;
END;
/

CREATE or REPLACE PROCEDURE select_pole_extras_by_objectid
(objectid IN NUMBER, poste_id OUT VARCHAR2, poste_codigo OUT VARCHAR2)
AS
BEGIN
	SELECT POSTE_ID, POSTE_CODIGO INTO poste_id,poste_codigo FROM poste_extras WHERE POSTE_OBJECTID = objectid;
	EXCEPTION
		WHEN NO_DATA_FOUND THEN
			poste_id := -1;
			poste_codigo := -1;
END;
/

CREATE OR REPLACE PROCEDURE select_tags
(poste_id_in IN VARCHAR2, usuario_id_in IN VARCHAR2, results OUT SYS_REFCURSOR)
AS
operadora_id_in NUMBER;
BEGIN
	SELECT OPERADORA_ID INTO operadora_id_in FROM auth WHERE USER_ID = usuario_id_in;
	OPEN results FOR
	SELECT TAG, OPERADORA_ID FROM cabequip WHERE (OPERADORA_ID = -1 or OPERADORA_ID = operadora_id_in) and poste_id = poste_id_in;
END;
/


CREATE OR REPLACE PROCEDURE insert_poste_extras
(poste_id IN VARCHAR2, poste_objectid IN NUMBER, poste_codigo IN VARCHAR2, ncables IN NUMBER, coord_x IN NUMBER, coord_y IN NUMBER, mangas_count IN NUMBER, 
cajas_dispersion_count IN NUMBER, taps_count IN NUMBER)
AS
BEGIN
	INSERT INTO poste_extras (poste_id, poste_objectid, poste_codigo, ncables, coord_x, coord_y, mangas_count, cajas_dispersion_count, taps_count) VALUES (poste_id, poste_objectid, poste_codigo, ncables, coord_x, coord_y, mangas_count, cajas_dispersion_count, taps_count);
END;
/

CREATE OR REPLACE PROCEDURE insert_cabequip
(tag IN VARCHAR2, rfid IN VARCHAR2, poste_id IN VARCHAR2, operadora_id IN NUMBER, tipo IN VARCHAR2, cable_o_equipo IN VARCHAR2, 
capacidad IN NUMBER, uso IN VARCHAR2, dimensiones IN VARCHAR2)
AS
BEGIN
	INSERT INTO cabequip ( TAG, RFID, POSTE_ID, OPERADORA_ID, TIPO, CABLE_O_EQUIPO, CAPACIDAD, USO, DIMENSIONES) VALUES (tag, rfid, poste_id, operadora_id, tipo, cable_o_equipo, capacidad, uso, dimensiones);
END;
/

CREATE OR REPLACE PROCEDURE select_users
(results OUT SYS_REFCURSOR)
AS
BEGIN
	OPEN results FOR
		SELECT user_id,access_key FROM auth;
END;
/

CREATE OR REPLACE PROCEDURE update_tag
(user_id_in IN VARCHAR2,poste_id_in IN VARCHAR2, tag_id_in IN varchar2)
AS
operadora NUMBER;
BEGIN
	IF user_id_in != 'null' THEN
		SELECT OPERADORA_ID INTO operadora FROM auth WHERE USER_ID = user_id_in;
		UPDATE cabequip SET operadora_id = operadora WHERE poste_id = poste_id_in and tag = tag_id_in;
		COMMIT;
	ELSE
		UPDATE cabequip SET operadora_id = -1 WHERE poste_id = poste_id_in and tag = tag_id_in;
		COMMIT;
	END IF;
END;
/

show errors;

CREATE OR REPLACE PROCEDURE select_all_poles
(results OUT SYS_REFCURSOR)
AS
BEGIN
	OPEN results FOR
		SELECT * FROM postes;
END;
/