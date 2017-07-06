CREATE or REPLACE PROCEDURE select_poles_with_tags
(user_id_in VARCHAR2,src_code NUMBER, dst_code NUMBER , sw_lng NUMBER, sw_lat NUMBER,ne_lng NUMBER,ne_lat NUMBER,results OUT SYS_REFCURSOR)
AS
operadora NUMBER;
BEGIN
	SELECT OPERADORA_ID INTO operadora FROM auth WHERE USER_ID = user_id_in;
	
	OPEN results FOR
	SELECT DISTINCT poles.objectid object_id,poles.observacio code ,poles.lat,poles.lng 
	FROM postes poles,poste_extras poles_ex, cabequip c 
	WHERE 
	(poles.lng between sw_lng and ne_lng ) AND (poles.lat between sw_lat and ne_lat) 
	AND 
	(poles.objectid = poles_ex.poste_objectid 
	and poles_ex.poste_id = c.poste_id and c.operadora_id = operadora);
END;
/
show errors;

CREATE or REPLACE PROCEDURE select_poles
(src_code NUMBER, dst_code NUMBER , sw_lng NUMBER, sw_lat NUMBER,ne_lng NUMBER,ne_lat NUMBER,results OUT SYS_REFCURSOR)
AS
BEGIN
	OPEN results FOR
	SELECT  p.lat,p.lng, p.observacio code, p.objectid object_id
	FROM POSTES p
	WHERE (p.lng between sw_lng and ne_lng ) AND (p.lat between sw_lat and ne_lat);
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
(objectid IN NUMBER, poste_id_out OUT VARCHAR2, poste_codigo_out OUT VARCHAR2, n_cables_out OUT NUMBER)
AS
BEGIN
	SELECT POSTE_ID, POSTE_CODIGO,NCABLES INTO poste_id_out,poste_codigo_out,n_cables_out FROM poste_extras WHERE POSTE_OBJECTID = objectid;
	EXCEPTION
	WHEN NO_DATA_FOUND THEN
		poste_id_out := 'NA';
		poste_codigo_out := 'NA';
		n_cables_out := -1;
END;
/

CREATE OR REPLACE PROCEDURE select_tags
(poste_id_in IN VARCHAR2, usuario_id_in IN VARCHAR2, results OUT SYS_REFCURSOR)
AS
operadora_id_in NUMBER;
BEGIN
	SELECT OPERADORA_ID INTO operadora_id_in FROM auth WHERE USER_ID = usuario_id_in;
	OPEN results FOR
	SELECT TAG, OPERADORA_ID FROM cabequip WHERE (OPERADORA_ID = -1 or OPERADORA_ID = operadora_id_in) and POSTE_ID = poste_id_in and CABLE_O_EQUIPO = 'CABLE';
END;
/

CREATE OR REPLACE PROCEDURE is_there_pole
(poste_objectid_in IN NUMBER, poste_codigo IN VARCHAR2,op_code OUT VARCHAR2)
AS
poste_objectid_out NUMBER;
BEGIN
	SELECT OBJECTID INTO poste_objectid_out FROM POSTES WHERE OBJECTID = poste_objectid_in and OBSERVACIO = poste_codigo;
	op_code := 'OK';
	EXCEPTION
	WHEN NO_DATA_FOUND THEN
		op_code := 'POLE_NOT_EXISTS';
	WHEN OTHERS THEN
		op_code := 'FAIL';
END;
/
show errors

CREATE OR REPLACE PROCEDURE insert_poste_extras
(poste_id_in IN VARCHAR2, poste_objectid_in IN NUMBER, poste_codigo IN VARCHAR2, 
ncables IN NUMBER, coord_x IN NUMBER, coord_y IN NUMBER, mangas_count IN NUMBER, 
cajas_dispersion_count IN NUMBER, taps_count IN NUMBER,op_code OUT VARCHAR2,poste_id_out OUT VARCHAR2)
AS
poste_codigo_out VARCHAR2(254);
op_code_pole VARCHAR2(16);
BEGIN
	SELECT POSTE_ID INTO poste_id_out FROM poste_extras WHERE POSTE_OBJECTID = poste_objectid_in;
	op_code := 'POLE_REPEATED';
	EXCEPTION
	WHEN NO_DATA_FOUND THEN
		poste_id_out := poste_id_in;
		IF poste_codigo = '-1' THEN
			SELECT OBSERVACIO INTO poste_codigo_out FROM POSTES WHERE OBJECTID = poste_objectid_in;
			INSERT INTO poste_extras 
			(poste_id, poste_objectid, poste_codigo, ncables, coord_x, coord_y, mangas_count, cajas_dispersion_count, taps_count) 
			VALUES (poste_id_in, poste_objectid_in, poste_codigo_out, ncables, coord_x, coord_y, mangas_count, cajas_dispersion_count, taps_count);
			op_code := 'OK';
		ELSE
			is_there_pole(poste_objectid_in, poste_codigo,op_code_pole);
			IF op_code_pole = 'OK' THEN
				INSERT INTO poste_extras 
				(poste_id, poste_objectid, poste_codigo, ncables, coord_x, coord_y, 
				mangas_count, cajas_dispersion_count, taps_count) 
				VALUES (poste_id_in, poste_objectid_in, poste_codigo, ncables, coord_x, coord_y, 
				mangas_count, cajas_dispersion_count,taps_count);
				op_code := 'OK';
			ELSE
				op_code := 'POLE_NOT_EXISTS';
			END IF;			
		END IF;
	WHEN OTHERS THEN
		poste_id_out := 'NULL';
		op_code := 'FAIL';
END;
/
show errors

CREATE OR REPLACE PROCEDURE update_poste_extras
(poste_id_in IN VARCHAR2, ncables_in IN NUMBER, coord_x_in IN NUMBER, coord_y_in IN NUMBER, mangas_count_in IN NUMBER, 
cajas_dispersion_count_in IN NUMBER, taps_count_in IN NUMBER,op_code OUT VARCHAR2)
AS
BEGIN
	UPDATE POSTE_EXTRAS 
	SET ncables = ncables_in, 
	coord_x = coord_x_in , coord_y = coord_y_in , 
	mangas_count = mangas_count_in , cajas_dispersion_count = cajas_dispersion_count_in , 
	taps_count = taps_count_in
	WHERE POSTE_ID = poste_id_in;
 	op_code := 'OK';
	EXCEPTION
	WHEN OTHERS THEN
		op_code := 'FAIL';
END;
/

CREATE OR REPLACE PROCEDURE delete_tags
(poste_id_in IN VARCHAR2,op_code OUT VARCHAR2)
AS
BEGIN
	DELETE cabequip WHERE POSTE_ID = poste_id_in AND TIPO != 'VIRTUAL';
	op_code := 'OK';
	EXCEPTION
	WHEN OTHERS THEN
		op_code := 'FAIL';
END;
/


CREATE OR REPLACE PROCEDURE insert_cabequip
(tag_in IN VARCHAR2, rfid IN VARCHAR2, poste_id_in IN VARCHAR2, 
operadora_id_in IN NUMBER, tipo IN VARCHAR2, cable_o_equipo IN VARCHAR2, 
capacidad IN NUMBER, uso IN VARCHAR2, dimensiones IN VARCHAR2,op_code OUT VARCHAR2)
AS
tag_out VARCHAR2(254);
BEGIN
	SELECT TAG INTO tag_out FROM cabequip WHERE TAG = tag_in;
	op_code := 'DATA_REPEATED';	
	EXCEPTION
	WHEN NO_DATA_FOUND THEN
		INSERT INTO cabequip ( TAG, RFID, POSTE_ID, OPERADORA_ID, TIPO, CABLE_O_EQUIPO, CAPACIDAD, USO, DIMENSIONES) 
		VALUES (tag_in, rfid, poste_id_in, operadora_id_in, tipo, cable_o_equipo, capacidad, uso, dimensiones);
		op_code := 'OK';	
	WHEN OTHERS THEN
		op_code := 'FAIL';
END;
/

show errors;

CREATE OR REPLACE PROCEDURE select_users
(results OUT SYS_REFCURSOR)
AS
BEGIN
	OPEN results FOR
		SELECT user_id,access_key FROM auth;
END;
/

CREATE OR REPLACE PROCEDURE update_tag
(user_id_in IN VARCHAR2,poste_id_in IN VARCHAR2, tag_id_in IN varchar2,op_code OUT varchar2)
AS
operadora NUMBER;
new_poste_id_in NUMBER;
insert_cabequip_code VARCHAR2(16);
BEGIN
	IF tag_id_in = '0' THEN
		IF user_id_in != 'null' THEN
			SELECT OPERADORA_ID INTO operadora FROM auth WHERE USER_ID = user_id_in;
			insert_cabequip(tag_id_in ,'0000000000',poste_id_in,operadora,'VIRTUAL','CABLE',0,'ACOMETIDA',0,insert_cabequip_code);
			op_code := 'OK';
			COMMIT;
		END IF;
	ELSE
		IF user_id_in != 'null' THEN
			SELECT OPERADORA_ID INTO operadora FROM auth WHERE USER_ID = user_id_in;
			UPDATE cabequip SET operadora_id = operadora WHERE poste_id = poste_id_in and tag = tag_id_in;
			COMMIT;
			op_code := 'OK';
		ELSE
			UPDATE cabequip SET operadora_id = -1 WHERE poste_id = poste_id_in and tag = tag_id_in;
			COMMIT;
			op_code := 'OK';
		END IF;
	END IF;
	EXCEPTION
		WHEN OTHERS THEN 
			op_code := 'FAIL';
			ROLLBACK;
END;
/
show errors;




CREATE OR REPLACE PROCEDURE delete_virtual_tag
(user_id_in IN VARCHAR2,poste_id_in IN VARCHAR2, tag_id_in IN VARCHAR2, op_code OUT VARCHAR2)
AS
results SYS_REFCURSOR;
operadora NUMBER;
tag_id_out VARCHAR2(16);
BEGIN
	SELECT OPERADORA_ID INTO operadora FROM auth WHERE USER_ID = user_id_in;
	DELETE cabequip WHERE POSTE_ID = poste_id_in and TAG = tag_id_in and operadora_id = operadora;
	
	OPEN results FOR
	SELECT TAG FROM CABEQUIP WHERE POSTE_ID = poste_id_in;

	fetch results into tag_id_out;
	IF results%NOTFOUND THEN
		DELETE poste_extras WHERE POSTE_ID = poste_id_in;
	END IF;

	COMMIT;
	op_code := 'OK';

	EXCEPTION
	WHEN OTHERS THEN
		op_code := 'FAIL';		
END;
/


CREATE OR REPLACE PROCEDURE select_all_poles
(results OUT SYS_REFCURSOR)
AS
BEGIN
	OPEN results FOR
		SELECT * FROM postes;
END;
/

CREATE OR REPLACE PROCEDURE select_poles_of_users
(user_id_in IN VARCHAR2,results OUT SYS_REFCURSOR)
AS
operadora NUMBER;
BEGIN
	SELECT OPERADORA_ID INTO operadora FROM auth WHERE USER_ID = user_id_in;
	OPEN results FOR
		SELECT p.poste_objectid OBJECT_ID,p.poste_codigo CODE,count(*) AS "NUM_TAGS" 
		FROM POSTE_EXTRAS p, CABEQUIP c
		WHERE c.operadora_id = operadora AND p.poste_id = c.poste_id group by p.poste_objectid ,p.poste_codigo;
END;
/

CREATE OR REPLACE PROCEDURE insert_pole_auto
(poste_id_in IN VARCHAR2,user_id_in IN VARCHAR2,op_code_out OUT VARCHAR2)
AS
operadora_id_in NUMBER;
tag_id_in VARCHAR2(256);
results SYS_REFCURSOR;
results_no_virtual SYS_REFCURSOR;
op_code VARCHAR2(256);
BEGIN
	OPEN results FOR
	SELECT TAG FROM CABEQUIP WHERE POSTE_ID = poste_id_in and TIPO != 'VIRTUAL' and OPERADORA_ID = -1;
	fetch results into tag_id_in;
	IF results%NOTFOUND THEN
		SELECT OPERADORA_ID INTO operadora_id_in FROM auth WHERE USER_ID = user_id_in;

		OPEN results_no_virtual FOR 
		SELECT TAG FROM CABEQUIP WHERE POSTE_ID = poste_id_in and TIPO = 'VIRTUAL' and OPERADORA_ID = operadora_id_in;
		fetch results_no_virtual into tag_id_in;
		
		IF results_no_virtual%NOTFOUND THEN
			tag_id_in := '0';
			update_tag(user_id_in,poste_id_in,'0',op_code);
		ELSE
			op_code := 'OK';
		END IF;
	ELSE
		update_tag(user_id_in,poste_id_in,tag_id_in,op_code);
		close results;
	END IF;	

	IF op_code = 'OK' THEN
		op_code_out := 'OK';
	ELSE
		op_code_out := 'FAIL';
	END IF;
END;
/

show errors;

CREATE OR REPLACE PROCEDURE sincronize_new_poles
(results OUT SYS_REFCURSOR)
AS
BEGIN
	OPEN results FOR
		SELECT OBJECTID,COMENTARIO,GLOBALID,OBSERVACIO FROM postes_nuevos MINUS SELECT OBJECTID,COMENTARIO,GLOBALID,OBSERVACIO FROM postes;
END;
/

CREATE OR REPLACE PROCEDURE sincronize_erased_poles
(results OUT SYS_REFCURSOR)
AS
BEGIN
	OPEN results FOR
		SELECT OBJECTID,COMENTARIO,GLOBALID,OBSERVACIO FROM postes MINUS SELECT OBJECTID,COMENTARIO,GLOBALID,OBSERVACIO FROM postes_nuevos;
END;
/


CREATE OR REPLACE PROCEDURE get_all_poles_extras
(results OUT SYS_REFCURSOR,sw_lng NUMBER, sw_lat NUMBER,ne_lng NUMBER,ne_lat NUMBER)
AS
BEGIN
	OPEN results FOR
	SELECT DISTINCT poles.objectid object_id,poles.observacio code ,poles.lat,poles.lng 
	FROM postes poles,poste_extras poles_ex, cabequip c 
	WHERE 
	(poles.lng between sw_lng and ne_lng ) AND (poles.lat between sw_lat and ne_lat) 
	AND 
	(poles.objectid = poles_ex.poste_objectid 
	and poles_ex.poste_id = c.poste_id);

END;
/

show errors;