load data
 infile 'db_postes_nuevos.csv'
 into table postes_nuevos
 fields terminated by "," optionally enclosed by '"'
(ALIMENTADO, ATERRAMIEN, CANTON, CASERIO,CODIGOELEM, CODIGOEMPR, CODIGOESTR, COMENTARIO,COORD_X "to_number(:COORD_X, '999999990.99999999999990','NLS_NUMERIC_CHARACTERS = ''.,''')", COORD_Y "to_number(:COORD_Y, '999999990.99999999999990','NLS_NUMERIC_CHARACTERS = ''.,''')", ESTADO,ESTRUCTURA,EXISTENOVE, FECHAACTIV "to_date(:FECHAACTIV, 'YY-MM-DD')", FECHACONST "to_date(:FECHACONST, 'YY-MM-DD')", FECHAMOD_1 "to_date(:FECHAMOD_1, 'YY-MM-DD')", FECHAMODIF "to_date(:FECHAMODIF, 'YY-MM-DD')", FECHAREGIS "to_date(:FECHAREGIS, 'YY-MM-DD')", GLOBALID, HIPERVINCU, MIESTADO, MIGUID, MIOID, MISUBTIPO, OBJECTID, OBSERVACIO,PARROQUIA,PROPIEDAD,PROVINCIA,PROYECTOCO,PROYECTOMO,PUESTOATIE, ROTACIONSI "to_number(:ROTACIONSI, '999999990.99999999999990','NLS_NUMERIC_CHARACTERS = ''.,''')", SUBTIPO,TEXTOETIQU,TIPOCIMIEN, TIPOUSOPOS,USUARIOMOD, USUARIOREG)
