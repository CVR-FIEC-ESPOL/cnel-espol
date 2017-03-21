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



CREATE OR REPLACE PROCEDURE select_cabequip
(pole_id IN NUMBER,tag OUT NUMBER,rfid OUT NUMBER,operadora_id OUT NUMBER)
AS
BEGIN
	SELECT TAG, RFID, OPERADORA_ID  INTO tag, rfid, operadora_id  FROM cabequip WHERE poste_id = pole_id;
END;
/

CREATE OR REPLACE PROCEDURE select_user
(user_id_in IN varchar2,access_key_out OUT varchar2)
AS
BEGIN
	SELECT ACCESS_KEY INTO access_key_out FROM auth WHERE user_id = user_id_in ;
END;
/