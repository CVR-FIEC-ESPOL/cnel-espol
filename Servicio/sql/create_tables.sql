declare
    table_does_not_exist exception;
    PRAGMA EXCEPTION_INIT(table_does_not_exist, -942); -- ORA-00942

    seq_does_not_exist exception;
    PRAGMA EXCEPTION_INIT(seq_does_not_exist, -2289); -- ORA-02289

    poste_extras_tab_name varchar2(64) := 'poste_extras';
    cabequip_tab_name varchar2(64) := 'cabequip';
    auth_tab_name varchar2(64) := 'auth';
    operadoras_seq_name varchar2(64) := 'operadoras_seq';
    operadoras_tab_name varchar2(64) := 'operadoras';
    tipo_cabequip_tab_name varchar2(64) := 'tipo_cabequip';
    na_operador varchar2(64) := 'NA';
begin
    begin
        execute immediate 'drop table ' || cabequip_tab_name;
    exception
        when table_does_not_exist then null;
    end;

    begin
        execute immediate 'drop table ' || poste_extras_tab_name;
    exception
        when table_does_not_exist then null;
    end;

    begin
        execute immediate 'drop table ' || tipo_cabequip_tab_name;
    exception
        when table_does_not_exist then null;
    end;

    begin
        execute immediate 'drop table ' || auth_tab_name;
    exception
        when table_does_not_exist then null;
    end;

    begin
        execute immediate 'drop table ' || operadoras_tab_name;
    exception
        when table_does_not_exist then null;
    end;

    begin
        execute immediate 'drop sequence ' || operadoras_seq_name;
    exception
        when seq_does_not_exist then null;
    end;

    execute immediate
        'create sequence ' || operadoras_seq_name || ' start with 1';

    execute immediate
        'create table ' || operadoras_tab_name || '(
            id                 number(4) not null,
            nombre             varchar2(128),
            desc2              varchar2(64),
            constraint operadoras_pk primary key (id))';

    execute immediate
        'create or replace trigger operadoras_bir
         before insert on ' || operadoras_tab_name || '
         for each row

         begin

            if :new.nombre = ''' || na_operador ||''' 
            then
                select -1 into :new.id from dual;
            else
                select ' || operadoras_seq_name || '.nextval
                into :new.id
                from dual;
            end if;
         end;
         ';

    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'NA';

    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'TELCONET';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'MEGADATOS (NETLIFE)';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'GRUPO TV CABLE';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'TELMEX';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'CONECEL';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'LEVEL 3';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'ETAPA TELECOM';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'PUNTONET';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'CABLEUNIÓN';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'CABLEFUTURO';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'TC TELEVISIÓN';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'GILAUCO';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'BROADBAND COMUNICACIONES';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'TECCIAL S.A.';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'TELEFONICA (MOVISTAR)';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'CNT';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'ASEGLOP';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'TRANS-TELCO';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'COMTEK S.A.';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'TECHSOFTNET   (Global Internet communication)';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'GLOBAL SECURITY S.A.';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'CORPORACIÓN PARA LA SEGURIDAD CIUDADANA DE GUAYAQUIL (CSCG)';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'LINKOTEL S.A.';
    execute immediate
        'insert into ' || operadoras_tab_name || ' (nombre) values (:n)' using
            'PEROBELI S.A.';

    execute immediate
        'create table ' || auth_tab_name || '(
             user_id            varchar2(16) not null,
             access_key         varchar2(64) not null,
             operadora_id       number(4),
             constraint auth_pk primary key (user_id),
             constraint auth_operadoras_fk foreign key (operadora_id)
                 references ' || operadoras_tab_name || '(id))';

    execute immediate
        'create table ' || tipo_cabequip_tab_name || '(
             tipo               varchar2(64) not null,
             cable_o_equipo     varchar2(16) not null,
             constraint tipo_cabequip_pk primary key (tipo, cable_o_equipo),
             constraint tipo_cabequip_coe_ck
                 check (cable_o_equipo in (''CABLE'', ''EQUIPO'')))';

    execute immediate
        'insert into ' || tipo_cabequip_tab_name || ' (tipo, cable_o_equipo) values (:t, :coe)'
             using 'FIBRA', 'CABLE';
    execute immediate
        'insert into ' || tipo_cabequip_tab_name || ' (tipo, cable_o_equipo) values (:t, :coe)'
             using 'RG500', 'CABLE';
    execute immediate
        'insert into ' || tipo_cabequip_tab_name || ' (tipo, cable_o_equipo) values (:t, :coe)'
             using 'MULTIPAR', 'CABLE';
    execute immediate
        'insert into ' || tipo_cabequip_tab_name || ' (tipo, cable_o_equipo) values (:t, :coe)'
             using 'MANGA', 'EQUIPO';
    execute immediate
        'insert into ' || tipo_cabequip_tab_name || ' (tipo, cable_o_equipo) values (:t, :coe)'
             using 'VDT', 'EQUIPO';
    execute immediate
        'insert into ' || tipo_cabequip_tab_name || ' (tipo, cable_o_equipo) values (:t, :coe)'
             using 'CAJA FUENTE', 'EQUIPO';
    execute immediate
        'insert into ' || tipo_cabequip_tab_name || ' (tipo, cable_o_equipo) values (:t, :coe)'
             using 'CAJA DE DISPERSION', 'EQUIPO';
    execute immediate
        'insert into ' || tipo_cabequip_tab_name || ' (tipo, cable_o_equipo) values (:t, :coe)'
             using 'TAP', 'EQUIPO';
    execute immediate
        'create table ' || poste_extras_tab_name || '(
             poste_id               varchar2(38) not null,
             poste_objectid         number(10) not null,
             poste_codigo           varchar2(254),
             ncables                number(4),
             coord_x                number(19,8),
             coord_y                number(19,8),
             mangas_count           number(4),
             cajas_dispersion_count number(4),
             taps_count             number(4),
             constraint poste_extras_pk primary key (poste_id),
             constraint poste_extras_ncables_ck check (ncables >= 0))';

    execute immediate
        'create table ' || cabequip_tab_name || '(
             TAG            varchar2(16) not null,
             RFID           varchar2(32),
             POSTE_ID       varchar2(38),
             OPERADORA_ID   number(4),
             TIPO           varchar2(64) not null,
             CABLE_O_EQUIPO varchar2(16) not null,
             CAPACIDAD      number(4),
             USO            varchar2(32) default ''DISTRIBUCION'' not null,
             DIMENSIONES    varchar2(64),
             constraint cabequip_pk primary key (tag),
             constraint cabequip_poste_extras_fk foreign key (poste_id)
                 references ' || poste_extras_tab_name || '(poste_id),
             constraint cabequip_operadoras_fk foreign key (operadora_id)
                 references ' || operadoras_tab_name || '(id),
             constraint cabequip_tipo_fk foreign key (tipo, cable_o_equipo)
                 references ' || tipo_cabequip_tab_name || '(tipo, cable_o_equipo),
             constraint cabequip_uso_ck check (uso in (''ACOMETIDA'', ''DISTRIBUCION'')))';
end;
/

