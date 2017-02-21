load data
 infile 'postes.csv'
 into table postes
 fields terminated by "," optionally enclosed by '"'		  
 ( OBJECTID, USUARIOREG, FECHAREGIS "to_date(:FECHAREGIS, 'MM/DD/YY')", FECHAMODIF "to_date(:FECHAMODIF, 'MM/DD/YY')", USUARIOMOD, PROYECTOCO, FECHACONST "to_date(:FECHACONST, 'MM/DD/YY')", FECHAACTIV "to_date(:FECHAACTIV, 'MM/DD/YY')", PROYECTOMO, FECHAMOD_1 "to_date(:FECHAMOD_1, 'MM/DD/YY')", CODIGOEMPR, PROVINCIA, CANTON, PARROQUIA, CASERIO, CODIGOELEM, SUBTIPO, PROPIEDAD, HIPERVINCU, TIPOCIMIEN, ATERRAMIEN, CODIGOESTR, ROTACIONSI, MISUBTIPO, ESTRUCTURA, ESTADO, MIOID, GLOBALID, PUESTOATIE, COMENTARIO, TEXTOETIQU, MIGUID, MIESTADO, EXISTENOVE, OBSERVACIO, COORD_X, COORD_Y, ALIMENTADO, TIPOUSOPOS )