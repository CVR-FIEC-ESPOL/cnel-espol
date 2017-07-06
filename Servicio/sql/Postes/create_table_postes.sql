create table postes
(
	ALIMENTADO   varchar2(10),
	ATERRAMIEN   varchar2(1),
	CANTON   varchar2(4),
	CASERIO   varchar2(15),
	CODIGOELEM   number(10),
	CODIGOEMPR   varchar2(10),
	CODIGOESTR   varchar2(10),
	COMENTARIO   varchar2(254),
	COORD_X   number(19,8),
	COORD_Y   number(19,8),
	ESTADO   number(5),
	ESTRUCTURA   varchar2(254),
	EXISTENOVE   number(5),
	FECHAACTIV   date,
	FECHACONST   date,
	FECHAMOD_1   date,
	FECHAMODIF   date,
	FECHAREGIS   date,
	GLOBALID   varchar2(38),
	HIPERVINCU   varchar2(254),
	MIESTADO   varchar2(20),
	MIGUID   varchar2(38),
	MIOID   number(10),
	MISUBTIPO   number(5),
	OBJECTID   number(10),
	OBSERVACIO   varchar2(254),
	PARROQUIA   varchar2(6),
	PROPIEDAD   varchar2(10),
	PROVINCIA   varchar2(2),
	PROYECTOCO   varchar2(32),
	PROYECTOMO   varchar2(32),
	PUESTOATIE   number(5),
	ROTACIONSI   number(19,8),
	SUBTIPO   number(10),
	TEXTOETIQU   varchar2(254),
	TIPOCIMIEN   varchar2(15),
	TIPOUSOPOS   number(5),
	USUARIOMOD   varchar2(50),
	USUARIOREG   varchar2(50))
/

CREATE INDEX OBJECTID_IDX ON POSTES(OBJECTID)
/
CREATE INDEX POSTES_COORD_X_IDX ON POSTES(COORD_X)
/
CREATE INDEX POSTES_COORD_Y_IDX ON POSTES(COORD_Y)
/
CREATE INDEX POSTES_OBSERVACIO_IDX ON POSTES(OBSERVACIO)
/
ALTER TABLE postes ADD constraint postes_pk primary key (globalid)
/
ALTER TABLE POSTES ADD (LAT number(19,8),LNG number(19,8))
/
